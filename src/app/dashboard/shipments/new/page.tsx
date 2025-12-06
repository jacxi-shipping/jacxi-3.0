'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, AlertCircle, Upload, X, Loader2, Package, User, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { shipmentSchema, type ShipmentFormData } from '@/lib/validations/shipment';
import Section from '@/components/layout/Section';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Snackbar, Alert } from '@mui/material';

interface UserOption {
	id: string;
	name: string | null;
	email: string;
}

interface ContainerOption {
	id: string;
	containerNumber: string;
	status: string;
	currentCount: number;
	maxCapacity: number;
	destinationPort: string | null;
}

export default function NewShipmentPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const [users, setUsers] = useState<UserOption[]>([]);
	const [containers, setContainers] = useState<ContainerOption[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(true);
	const [loadingContainers, setLoadingContainers] = useState(false);
	const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const [decodingVin, setDecodingVin] = useState(false);
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({ 
		open: false, 
		message: '', 
		severity: 'success' 
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		watch,
	} = useForm<ShipmentFormData>({
		resolver: zodResolver(shipmentSchema),
		mode: 'onBlur',
		defaultValues: {
			vehiclePhotos: [],
			status: 'ON_HAND',
		},
	});

	const statusValue = watch('status');
	const vinValue = watch('vehicleVIN');

	// Fetch users
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await fetch('/api/users');
				if (response.ok) {
					const data = await response.json();
					setUsers(data.users);
				}
			} catch (error) {
				console.error('Error fetching users:', error);
			} finally {
				setLoadingUsers(false);
			}
		};

		void fetchUsers();
	}, []);

	// Fetch containers when status changes to IN_TRANSIT
	useEffect(() => {
		if (statusValue === 'IN_TRANSIT') {
			const fetchContainers = async () => {
				setLoadingContainers(true);
				try {
					const response = await fetch('/api/containers?status=active');
					if (response.ok) {
						const data = await response.json();
						setContainers(data.containers);
					}
				} catch (error) {
					console.error('Error fetching containers:', error);
				} finally {
					setLoadingContainers(false);
				}
			};

			void fetchContainers();
		}
	}, [statusValue]);

	// VIN Decoder
	const decodeVIN = async (vin: string) => {
		if (vin.length !== 17) return;

		setDecodingVin(true);
		try {
			const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
			const data = await response.json();

			if (data.Results) {
				const makeResult = data.Results.find((r: { Variable: string }) => r.Variable === 'Make');
				const modelResult = data.Results.find((r: { Variable: string }) => r.Variable === 'Model');
				const yearResult = data.Results.find((r: { Variable: string }) => r.Variable === 'Model Year');

				if (makeResult?.Value) setValue('vehicleMake', makeResult.Value);
				if (modelResult?.Value) setValue('vehicleModel', modelResult.Value);
				if (yearResult?.Value) setValue('vehicleYear', yearResult.Value);

				setSnackbar({ open: true, message: 'VIN decoded successfully!', severity: 'success' });
			}
		} catch (error) {
			console.error('Error decoding VIN:', error);
			setSnackbar({ open: true, message: 'Failed to decode VIN', severity: 'error' });
		} finally {
			setDecodingVin(false);
		}
	};

	// Photo upload
	const handlePhotoUpload = async (file: File) => {
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				const result = await response.json();
				const newPhotos = [...vehiclePhotos, result.url];
				setVehiclePhotos(newPhotos);
				setValue('vehiclePhotos', newPhotos);
				return result.url;
			} else {
				throw new Error('Upload failed');
			}
		} catch (error) {
			console.error('Error uploading photo:', error);
			setSnackbar({ open: true, message: 'Failed to upload photo', severity: 'error' });
		} finally {
			setUploading(false);
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		for (let i = 0; i < files.length; i++) {
			await handlePhotoUpload(files[i]);
		}

		e.target.value = '';
	};

	const removePhoto = (index: number) => {
		const newPhotos = vehiclePhotos.filter((_, i) => i !== index);
		setVehiclePhotos(newPhotos);
		setValue('vehiclePhotos', newPhotos);
	};

	// Form submission
	const onSubmit = async (data: ShipmentFormData) => {
		try {
			const response = await fetch('/api/shipments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (response.ok) {
				setSnackbar({ open: true, message: 'Shipment created successfully!', severity: 'success' });
				setTimeout(() => {
					router.push('/dashboard/shipments');
				}, 1500);
			} else {
				setSnackbar({ open: true, message: result.message || 'Failed to create shipment', severity: 'error' });
			}
		} catch (error) {
			console.error('Error creating shipment:', error);
			setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
		}
	};

	if (session?.user?.role !== 'admin') {
		return (
			<ProtectedRoute>
				<Section>
					<div className="text-center py-12">
						<h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Denied</h2>
						<p className="text-[var(--text-secondary)] mt-2">Only administrators can create shipments.</p>
					</div>
				</Section>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-[var(--background)]">
				<Section>
					<div className="max-w-5xl mx-auto">
						{/* Header */}
						<div className="mb-8">
							<Link href="/dashboard/shipments">
								<Button variant="outline" size="sm" className="mb-4">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Shipments
								</Button>
							</Link>
							<h1 className="text-3xl font-bold text-[var(--text-primary)]">Add New Shipment</h1>
							<p className="text-[var(--text-secondary)] mt-2">
								Enter vehicle information and assign status. Shipping data is managed at the container level.
							</p>
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* Vehicle Information */}
							<Card className="border-[var(--border)] bg-[var(--panel)]">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
										<Package className="w-5 h-5" />
										Vehicle Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* VIN */}
									<div>
										<label htmlFor="vehicleVIN" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
											VIN (Vehicle Identification Number)
										</label>
										<div className="flex gap-2">
											<input
												id="vehicleVIN"
												{...register('vehicleVIN')}
												className={`flex-1 rounded-lg border ${errors.vehicleVIN ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]`}
												placeholder="17-character VIN"
												maxLength={17}
											/>
											<Button
												type="button"
												onClick={() => vinValue && decodeVIN(vinValue)}
												disabled={!vinValue || vinValue.length !== 17 || decodingVin}
												variant="outline"
											>
												{decodingVin ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Decode'}
											</Button>
										</div>
										{errors.vehicleVIN && <p className="mt-1 text-sm text-red-400">{errors.vehicleVIN.message}</p>}
									</div>

									{/* Vehicle Type */}
									<div>
										<label htmlFor="vehicleType" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
											Vehicle Type *
										</label>
										<select
											id="vehicleType"
											{...register('vehicleType')}
											className={`w-full rounded-lg border ${errors.vehicleType ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
										>
											<option value="">Select type</option>
											<option value="sedan">Sedan</option>
											<option value="suv">SUV</option>
											<option value="truck">Truck</option>
											<option value="motorcycle">Motorcycle</option>
											<option value="van">Van</option>
											<option value="coupe">Coupe</option>
											<option value="convertible">Convertible</option>
											<option value="wagon">Wagon</option>
											<option value="other">Other</option>
										</select>
										{errors.vehicleType && <p className="mt-1 text-sm text-red-400">{errors.vehicleType.message}</p>}
									</div>

									{/* Make, Model, Year */}
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
										<div>
											<label htmlFor="vehicleMake" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Make
											</label>
											<input
												id="vehicleMake"
												{...register('vehicleMake')}
												className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-[var(--text-primary)]"
												placeholder="e.g., Toyota"
											/>
										</div>
										<div>
											<label htmlFor="vehicleModel" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Model
											</label>
											<input
												id="vehicleModel"
												{...register('vehicleModel')}
												className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-[var(--text-primary)]"
												placeholder="e.g., Camry"
											/>
										</div>
										<div>
											<label htmlFor="vehicleYear" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Year
											</label>
											<input
												id="vehicleYear"
												{...register('vehicleYear')}
												type="number"
												className={`w-full rounded-lg border ${errors.vehicleYear ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
												placeholder="e.g., 2022"
											/>
											{errors.vehicleYear && <p className="mt-1 text-sm text-red-400">{errors.vehicleYear.message}</p>}
										</div>
									</div>

									{/* Color, Lot Number, Auction */}
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
										<div>
											<label htmlFor="vehicleColor" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Color
											</label>
											<input
												id="vehicleColor"
												{...register('vehicleColor')}
												className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-[var(--text-primary)]"
												placeholder="e.g., Blue"
											/>
										</div>
										<div>
											<label htmlFor="lotNumber" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Lot Number
											</label>
											<input
												id="lotNumber"
												{...register('lotNumber')}
												className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-[var(--text-primary)]"
												placeholder="Auction lot #"
											/>
										</div>
										<div>
											<label htmlFor="auctionName" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Auction Name
											</label>
											<input
												id="auctionName"
												{...register('auctionName')}
												className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-[var(--text-primary)]"
												placeholder="e.g., Copart"
											/>
										</div>
									</div>

									{/* Weight, Dimensions */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label htmlFor="weight" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Weight (lbs)
											</label>
											<input
												id="weight"
												{...register('weight')}
												type="number"
												className={`w-full rounded-lg border ${errors.weight ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
												placeholder="Vehicle weight"
											/>
											{errors.weight && <p className="mt-1 text-sm text-red-400">{errors.weight.message}</p>}
										</div>
										<div>
											<label htmlFor="dimensions" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Dimensions
											</label>
											<input
												id="dimensions"
												{...register('dimensions')}
												className={`w-full rounded-lg border ${errors.dimensions ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
												placeholder="L x W x H"
											/>
											{errors.dimensions && <p className="mt-1 text-sm text-red-400">{errors.dimensions.message}</p>}
										</div>
									</div>

									{/* Has Key, Has Title */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="flex items-center gap-3">
											<input
												id="hasKey"
												type="checkbox"
												{...register('hasKey')}
												className="w-5 h-5 rounded border-white/10 bg-black/40"
											/>
											<label htmlFor="hasKey" className="text-sm font-semibold text-[var(--text-secondary)]">
												Has Key
											</label>
										</div>
										<div className="flex items-center gap-3">
											<input
												id="hasTitle"
												type="checkbox"
												{...register('hasTitle')}
												className="w-5 h-5 rounded border-white/10 bg-black/40"
											/>
											<label htmlFor="hasTitle" className="text-sm font-semibold text-[var(--text-secondary)]">
												Has Title
											</label>
										</div>
									</div>

									{/* Title Status */}
									{watch('hasTitle') && (
										<div>
											<label htmlFor="titleStatus" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Title Status
											</label>
											<select
												id="titleStatus"
												{...register('titleStatus')}
												className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-[var(--text-primary)]"
											>
												<option value="">Select status</option>
												<option value="PENDING">Pending</option>
												<option value="DELIVERED">Delivered</option>
											</select>
										</div>
									)}

									{/* Vehicle Photos */}
									<div>
										<label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
											Vehicle Photos
										</label>
										<label
											htmlFor="photos"
											className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors"
										>
											<input
												id="photos"
												type="file"
												multiple
												accept="image/*"
												onChange={handleFileSelect}
												className="hidden"
												disabled={uploading}
											/>
											<div className="flex flex-col items-center justify-center pt-5 pb-6">
												{uploading ? (
													<Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
												) : (
													<>
														<Upload className="w-8 h-8 text-cyan-400 mb-2" />
														<p className="text-sm text-[var(--text-secondary)]">Click to upload vehicle photos</p>
													</>
												)}
											</div>
										</label>

										{vehiclePhotos.length > 0 && (
											<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
												{vehiclePhotos.map((photo, index) => (
													<div key={index} className="relative group aspect-square">
														<Image
															src={photo}
															alt={`Vehicle photo ${index + 1}`}
															fill
															className="object-cover rounded-lg"
															unoptimized
														/>
														<button
															type="button"
															onClick={() => removePhoto(index)}
															className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
														>
															<X className="w-4 h-4 text-white" />
														</button>
													</div>
												))}
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Status and Container Assignment */}
							<Card className="border-[var(--border)] bg-[var(--panel)]">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
										<Package className="w-5 h-5" />
										Status & Container Assignment
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Status */}
									<div>
										<label htmlFor="status" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
											Shipment Status *
										</label>
										<select
											id="status"
											{...register('status')}
											className={`w-full rounded-lg border ${errors.status ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
										>
											<option value="ON_HAND">On Hand</option>
											<option value="IN_TRANSIT">In Transit</option>
										</select>
										{errors.status && <p className="mt-1 text-sm text-red-400">{errors.status.message}</p>}
										<p className="mt-1 text-xs text-[var(--text-secondary)]">
											{statusValue === 'ON_HAND' 
												? 'Vehicle is currently on hand, not yet assigned to a container'
												: 'Vehicle is in transit - must be assigned to a container'}
										</p>
									</div>

									{/* Container Selection - Only shown when IN_TRANSIT */}
									{statusValue === 'IN_TRANSIT' && (
										<div>
											<label htmlFor="containerId" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Container *
											</label>
											{loadingContainers ? (
												<div className="flex items-center gap-2 text-[var(--text-secondary)]">
													<Loader2 className="w-4 h-4 animate-spin" />
													Loading containers...
												</div>
											) : (
												<>
													<select
														id="containerId"
														{...register('containerId')}
														className={`w-full rounded-lg border ${errors.containerId ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
													>
														<option value="">Select a container</option>
														{containers.map((container) => (
															<option key={container.id} value={container.id}>
																{container.containerNumber} - {container.destinationPort || 'No destination'} ({container.currentCount}/{container.maxCapacity}) - {container.status}
															</option>
														))}
													</select>
													{errors.containerId && <p className="mt-1 text-sm text-red-400">{errors.containerId.message}</p>}
													<div className="mt-2">
														<Link href="/dashboard/containers/new" target="_blank">
															<Button type="button" variant="outline" size="sm">
																Create New Container
															</Button>
														</Link>
													</div>
												</>
											)}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Owner/Customer */}
							<Card className="border-[var(--border)] bg-[var(--panel)]">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
										<User className="w-5 h-5" />
										Owner/Customer
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div>
										<label htmlFor="userId" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
											Select Customer *
										</label>
										{loadingUsers ? (
											<div className="flex items-center gap-2 text-[var(--text-secondary)]">
												<Loader2 className="w-4 h-4 animate-spin" />
												Loading customers...
											</div>
										) : (
											<>
												<select
													id="userId"
													{...register('userId')}
													className={`w-full rounded-lg border ${errors.userId ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
												>
													<option value="">Select customer</option>
													{users.map((user) => (
														<option key={user.id} value={user.id}>
															{user.name || user.email}
														</option>
													))}
												</select>
												{errors.userId && <p className="mt-1 text-sm text-red-400">{errors.userId.message}</p>}
											</>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Financial Information */}
							<Card className="border-[var(--border)] bg-[var(--panel)]">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
										<DollarSign className="w-5 h-5" />
										Financial Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label htmlFor="price" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Price ($)
											</label>
											<input
												id="price"
												{...register('price')}
												type="number"
												step="0.01"
												className={`w-full rounded-lg border ${errors.price ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
												placeholder="0.00"
											/>
											{errors.price && <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>}
										</div>
										<div>
											<label htmlFor="insuranceValue" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
												Insurance Value ($)
											</label>
											<input
												id="insuranceValue"
												{...register('insuranceValue')}
												type="number"
												step="0.01"
												className={`w-full rounded-lg border ${errors.insuranceValue ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)]`}
												placeholder="0.00"
											/>
											{errors.insuranceValue && <p className="mt-1 text-sm text-red-400">{errors.insuranceValue.message}</p>}
										</div>
									</div>

									<div>
										<label htmlFor="paymentMode" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
											Payment Mode
										</label>
										<div className="grid grid-cols-2 gap-4">
											<label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${watch('paymentMode') === 'CASH' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10'}`}>
												<input
													type="radio"
													value="CASH"
													{...register('paymentMode')}
													className="sr-only"
												/>
												<span className="text-sm font-semibold text-[var(--text-primary)]">Cash</span>
											</label>
											<label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${watch('paymentMode') === 'DUE' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10'}`}>
												<input
													type="radio"
													value="DUE"
													{...register('paymentMode')}
													className="sr-only"
												/>
												<span className="text-sm font-semibold text-[var(--text-primary)]">Due</span>
											</label>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Internal Notes */}
							<Card className="border-[var(--border)] bg-[var(--panel)]">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
										<FileText className="w-5 h-5" />
										Internal Notes
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div>
										<label htmlFor="internalNotes" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
											Notes (Internal Use Only)
										</label>
										<textarea
											id="internalNotes"
											{...register('internalNotes')}
											rows={4}
											className={`w-full rounded-lg border ${errors.internalNotes ? 'border-red-500' : 'border-white/10'} bg-black/40 px-4 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]`}
											placeholder="Add any internal notes about this shipment..."
										/>
										{errors.internalNotes && <p className="mt-1 text-sm text-red-400">{errors.internalNotes.message}</p>}
									</div>
								</CardContent>
							</Card>

							{/* Submit Button */}
							<div className="flex justify-end gap-4">
								<Link href="/dashboard/shipments">
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</Link>
								<Button type="submit" disabled={isSubmitting} className="bg-cyan-500 hover:bg-cyan-600">
									{isSubmitting ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Creating...
										</>
									) : (
										'Create Shipment'
									)}
								</Button>
							</div>
						</form>
					</div>
				</Section>
			</div>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</ProtectedRoute>
	);
}
