'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, AlertCircle, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { shipmentSchema, type ShipmentFormData } from '@/lib/validations/shipment';
import Section from '@/components/layout/Section';

interface UserOption {
	id: string;
	name: string | null;
	email: string;
}

interface TrackingEventEntry {
	id: string;
	status: string;
	statusCode?: string;
	location?: string;
	terminal?: string;
	timestamp?: string;
	actual: boolean;
	vessel?: string;
	voyage?: string;
	description?: string;
}

interface TrackingDetails {
	containerNumber: string;
	containerType?: string;
	shipmentStatus?: string;
	origin?: string;
	destination?: string;
	estimatedDeparture?: string;
	estimatedArrival?: string;
	company?: {
		name?: string;
		url?: string | null;
		scacs?: string[];
	};
	currentLocation?: string;
	progress?: number | null;
	events: TrackingEventEntry[];
}

type DecodeResult = {
	Variable?: string;
	Value?: string | null;
};

type ShipmentCreatePayload = ShipmentFormData & {
	trackingEvents?: TrackingEventEntry[];
	trackingCompany?: string;
	progress?: number;
	estimatedDelivery?: string;
	currentLocation?: string;
	status?: string;
};

export default function NewShipmentPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [users, setUsers] = useState<UserOption[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(true);
	const [containerPhotos, setContainerPhotos] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const [decodingVin, setDecodingVin] = useState(false);
	const [vinDecodeMessage, setVinDecodeMessage] = useState<string | null>(null);
	const [vinDecodeError, setVinDecodeError] = useState<string | null>(null);
	const [trackingDetails, setTrackingDetails] = useState<TrackingDetails | null>(null);
	const [trackingFetching, setTrackingFetching] = useState(false);
	const [trackingMessage, setTrackingMessage] = useState<string | null>(null);
	const [trackingError, setTrackingError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
		setValue,
		watch,
		clearErrors,
	} = useForm<ShipmentFormData>({
		resolver: zodResolver(shipmentSchema),
		mode: 'onBlur',
		defaultValues: {
			containerPhotos: [],
			trackingNumber: '',
		},
	});

	const [shipmentStatus, setShipmentStatus] = useState<'ON_HAND' | 'READY_FOR_SHIPMENT'>('ON_HAND');
	const vehicleVINValue = watch('vehicleVIN');
	const trackingNumberValue = watch('trackingNumber');

	const formatDisplayDate = (value?: string) => {
		if (!value) return null;
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return null;
		return date.toLocaleString(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short',
		});
	};

	// Check if user is admin
	useEffect(() => {
		if (status === 'loading') return;

		const role = session?.user?.role;
		if (!session || role !== 'admin') {
			router.replace('/dashboard');
		}
	}, [session, status, router]);

	// Fetch users for assignment
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await fetch('/api/users');
				if (response.ok) {
					const data = await response.json();
					setUsers(data.users || []);
				}
			} catch (error) {
				console.error('Error fetching users:', error);
			} finally {
				setLoadingUsers(false);
			}
		};

		if (session && session.user?.role === 'admin') {
			fetchUsers();
		}
	}, [session]);

	const cleanDecodedValue = (value?: string | null) => {
		if (!value) return '';
		const trimmed = value.trim();
		if (!trimmed || trimmed.toLowerCase() === 'not applicable' || trimmed.toLowerCase() === 'null' || trimmed === '0') {
			return '';
		}
		return trimmed;
	};

	const mapVehicleType = (vehicleType: string, bodyClass: string) => {
		const combined = `${vehicleType} ${bodyClass}`.toLowerCase();
		if (combined.includes('motorcycle')) return 'motorcycle';
		if (combined.includes('pickup')) return 'pickup';
		if (combined.includes('truck')) return 'truck';
		if (combined.includes('van')) return 'van';
		if (combined.includes('suv') || combined.includes('utility')) return 'suv';
		if (combined.includes('luxury')) return 'luxury';
		if (combined.includes('bus') || combined.includes('commercial')) return 'commercial';
		if (combined.includes('passenger car') || combined.includes('sedan') || combined.includes('coupe')) return 'sedan';
		return null;
	};

	const handleDecodeVin = async () => {
		const vin = (vehicleVINValue || '').trim();
		setVinDecodeMessage(null);
		setVinDecodeError(null);

		if (!vin || vin.length !== 17) {
			setVinDecodeError('VIN must be exactly 17 characters long.');
			setError('vehicleVIN', { type: 'manual', message: 'VIN must be exactly 17 characters long.' });
			return;
		}

		setDecodingVin(true);

		try {
			const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
			if (!response.ok) {
				throw new Error('Failed to decode VIN. Please try again.');
			}

			const data = await response.json();
			const results: DecodeResult[] = Array.isArray(data?.Results) ? data.Results : [];

			if (!results.length) {
				setVinDecodeError('No vehicle information found for this VIN.');
				return;
			}

			const getValue = (variable: string) => {
				const entry = results.find((item) => item?.Variable === variable);
				return cleanDecodedValue(entry?.Value);
			};

			const errorCode = getValue('Error Code');
			if (errorCode && errorCode !== '0') {
				const message = getValue('Error Text') || 'Unable to decode VIN. Please verify and try again.';
				setVinDecodeError(message);
				return;
			}

			const make = getValue('Make');
			const model = getValue('Model');
			const modelYear = getValue('Model Year');
			const vehicleType = getValue('Vehicle Type');
			const bodyClass = getValue('Body Class');
			const curbWeight = getValue('Curb Weight (pounds)');
			const overallLength = getValue('Overall Length');
			const overallWidth = getValue('Overall Width');
			const overallHeight = getValue('Overall Height');
			const color = getValue('Color');

			if (make) {
				setValue('vehicleMake', make, { shouldDirty: true, shouldValidate: true });
			}
			if (model) {
				setValue('vehicleModel', model, { shouldDirty: true, shouldValidate: true });
			}
			if (modelYear) {
				const yearNum = parseInt(modelYear, 10);
				if (!Number.isNaN(yearNum)) {
					setValue('vehicleYear', yearNum.toString(), { shouldDirty: true, shouldValidate: true });
				}
			}
			if (color) {
				setValue('vehicleColor', color, { shouldDirty: true, shouldValidate: true });
			}

			const mappedType = mapVehicleType(vehicleType, bodyClass || '');
			if (mappedType) {
				setValue('vehicleType', mappedType, { shouldDirty: true, shouldValidate: true });
			}

			if (curbWeight) {
				const weightNum = parseFloat(curbWeight.replace(/[^\d.]/g, ''));
				if (!Number.isNaN(weightNum)) {
					setValue('weight', weightNum.toString(), { shouldDirty: true, shouldValidate: true });
				}
			}

			if (overallLength || overallWidth || overallHeight) {
				const dimensionsParts = [overallLength, overallWidth, overallHeight].filter(Boolean);
				if (dimensionsParts.length) {
					setValue('dimensions', dimensionsParts.join(' x '), { shouldDirty: true, shouldValidate: true });
				}
			}

			clearErrors('vehicleVIN');
			setVinDecodeMessage('Vehicle details have been populated from the VIN.');
		} catch (error) {
			console.error('Error decoding VIN:', error);
			const message = error instanceof Error ? error.message : 'Failed to decode VIN. Please try again later.';
			setVinDecodeError(message);
		} finally {
			setDecodingVin(false);
		}
	};

	const handleFetchTrackingDetails = async () => {
		const tracking = (trackingNumberValue || '').trim();
		setTrackingMessage(null);
		setTrackingError(null);

		if (!tracking) {
			setTrackingError('Tracking number is required.');
			setError('trackingNumber', { type: 'manual', message: 'Tracking number is required.' });
			return;
		}

		setTrackingFetching(true);

		try {
			const response = await fetch('/api/tracking', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ trackNumber: tracking, needRoute: true }),
			});

			const payload = await response.json();

			if (!response.ok) {
				setTrackingDetails(null);
				setTrackingError(payload?.message || 'Failed to fetch tracking information.');
				return;
			}

			const details: TrackingDetails | undefined = payload?.tracking;
			if (!details) {
				setTrackingDetails(null);
				setTrackingError('No tracking data returned from carrier.');
				return;
			}

			setTrackingDetails(details);
			setValue('trackingNumber', details.containerNumber, { shouldDirty: true, shouldValidate: true });
			if (details.origin) {
				setValue('origin', details.origin, { shouldDirty: true, shouldValidate: true });
			}
			if (details.destination) {
				setValue('destination', details.destination, { shouldDirty: true, shouldValidate: true });
			}

			clearErrors('trackingNumber');
			setTrackingMessage('Shipping details retrieved from carrier.');
		} catch (error) {
			console.error('Error fetching tracking details:', error);
			setTrackingDetails(null);
			const message = error instanceof Error ? error.message : 'Failed to fetch tracking details.';
			setTrackingError(message);
		} finally {
			setTrackingFetching(false);
		}
	};

	const handleFileUpload = async (file: File) => {
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorPayload = await response.json();
				throw new Error(errorPayload.message || 'Upload failed');
			}

			const result = (await response.json()) as { url: string };
			setContainerPhotos((prev) => {
				const next = [...prev, result.url];
				setValue('containerPhotos', next, { shouldDirty: true, shouldTouch: true });
				return next;
			});
			return result.url;
		} catch (error) {
			console.error('Error uploading file:', error);
			const message = error instanceof Error ? error.message : 'Failed to upload image';
			setError('root', { message });
			return null;
		} finally {
			setUploading(false);
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		for (let i = 0; i < files.length; i++) {
			await handleFileUpload(files[i]);
		}

		// Reset input
		e.target.value = '';
	};

	const removePhoto = (index: number) => {
		const newPhotos = containerPhotos.filter((_, i) => i !== index);
		setContainerPhotos(newPhotos);
		setValue('containerPhotos', newPhotos);
	};

	const onSubmit = async (data: ShipmentFormData) => {
		try {
			// Validate required fields for READY_FOR_SHIPMENT
			if (shipmentStatus === 'READY_FOR_SHIPMENT') {
				if (!data.origin || data.origin.trim().length < 3) {
					setError('origin', { type: 'manual', message: 'Origin is required for ready-to-ship items (min 3 characters)' });
					return;
				}
				if (!data.destination || data.destination.trim().length < 3) {
					setError('destination', { type: 'manual', message: 'Destination is required for ready-to-ship items (min 3 characters)' });
					return;
				}
			}

			const payload: ShipmentCreatePayload = { ...data, containerPhotos };

			// Add shipment status to payload (use uppercase enum values)
			payload.status = shipmentStatus === 'ON_HAND' ? 'PENDING' : 'IN_TRANSIT';

			if (trackingDetails) {
				payload.trackingNumber = trackingDetails.containerNumber;
				if (trackingDetails.shipmentStatus) {
					payload.status = trackingDetails.shipmentStatus;
				}
				if (trackingDetails.currentLocation) {
					payload.currentLocation = trackingDetails.currentLocation;
				}
				if (trackingDetails.estimatedArrival) {
					payload.estimatedDelivery = trackingDetails.estimatedArrival;
				}
				if (typeof trackingDetails.progress === 'number') {
					payload.progress = trackingDetails.progress;
				}
				if (trackingDetails.events?.length) {
					payload.trackingEvents = trackingDetails.events;
				}
				if (trackingDetails.company?.name) {
					payload.trackingCompany = trackingDetails.company.name;
				}
			}

			const response = await fetch('/api/shipments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			const result = await response.json();

			if (response.ok) {
				router.push(`/dashboard/shipments/${result.shipment.id}`);
			} else {
				setError('root', { message: result.message || 'Failed to create shipment' });
			}
		} catch (error) {
			console.error('Error creating shipment:', error);
			setError('root', { message: 'An error occurred while creating the shipment' });
		}
	};

	if (status === 'loading' || loadingUsers) {
		return (
			<div className="min-h-screen bg-[var(--text-primary)] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400"></div>
			</div>
		);
	}

	const role = session?.user?.role;
	if (!session || role !== 'admin') {
		return (
			<div className="min-h-screen bg-[var(--text-primary)] flex items-center justify-center py-12 px-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="max-w-md w-full"
				>
					<div className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-red-500/30 p-8 text-center">
						<AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
						<h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
						<p className="text-white/70 mb-6">
							Only administrators can create and assign shipments to users.
						</p>
						<Link href="/dashboard">
							<Button className="bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold)]">
								Go to Dashboard
							</Button>
						</Link>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<>
			{/* Header */}
			<Section className="relative bg-[var(--text-primary)] py-6 sm:py-12 lg:py-16 overflow-hidden">
				{/* Background gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-primary)]" />

				{/* Subtle geometric grid pattern */}
				<div className="absolute inset-0 opacity-[0.03]">
					<svg className="w-full h-full" preserveAspectRatio="none">
						<defs>
							<pattern id="grid-new-shipment" width="40" height="40" patternUnits="userSpaceOnUse">
								<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid-new-shipment)" className="text-cyan-400" />
					</svg>
				</div>

				<div className="relative z-10">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
						<Link href="/dashboard/shipments">
							<Button
								variant="outline"
								size="sm"
								className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 flex-shrink-0 text-xs sm:text-sm"
							>
								<ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
								Back
							</Button>
						</Link>
						<div className="min-w-0 flex-1">
							<h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
								Create New Shipment
							</h1>
							<p className="text-sm sm:text-lg md:text-xl text-white/70 mt-1 sm:mt-2 line-clamp-2">
								Add a new vehicle shipment and assign it to a user
							</p>
						</div>
					</div>
				</div>
			</Section>

			{/* Form */}
			<Section className="bg-[var(--text-primary)] py-6 sm:py-12">
				<div className="max-w-4xl mx-auto px-4 sm:px-0">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 md:space-y-8">
						{/* User Assignment - Admin Only */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="relative rounded-lg sm:rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-4 sm:p-6 md:p-8"
						>
							<div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--text-primary)] border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
									<User className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
								</div>
								<div className="min-w-0 flex-1">
									<h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Assign to User</h2>
									<p className="text-xs sm:text-sm text-white/70 line-clamp-1">Select the user for this shipment</p>
								</div>
							</div>

							<div>
								<label htmlFor="userId" className="block text-sm font-medium text-white/90 mb-2">
									User <span className="text-red-400">*</span>
								</label>
								<select
									id="userId"
									{...register('userId')}
									className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all ${
										errors.userId ? 'border-red-500/50' : 'border-cyan-500/30'
									}`}
								>
									<option value="" className="bg-[var(--text-primary)]">Select a user...</option>
									{users.map((user) => (
										<option key={user.id} value={user.id} className="bg-[var(--text-primary)]">
											{user.name || user.email} {user.email !== user.name ? `(${user.email})` : ''}
										</option>
									))}
								</select>
								{errors.userId && (
									<p className="mt-2 text-sm text-red-400">{errors.userId.message}</p>
								)}
							</div>
						</motion.div>

						{/* Shipment Status Selection */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.05 }}
							className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
						>
							<h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Shipment Status</h2>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<label 
										className={`relative flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-cyan-500/50 ${
											shipmentStatus === 'ON_HAND' ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyan-500/30'
										}`}
									>
										<input
											type="radio"
											name="shipmentStatus"
											value="ON_HAND"
											checked={shipmentStatus === 'ON_HAND'}
											onChange={() => setShipmentStatus('ON_HAND')}
											className="mt-1 mr-3 w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
										/>
										<div>
											<div className="text-white font-semibold text-lg mb-1">On Hand</div>
											<div className="text-white/60 text-sm">
												Vehicle is in inventory. Shipping details not needed yet.
											</div>
										</div>
									</label>
									<label 
										className={`relative flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-cyan-500/50 ${
											shipmentStatus === 'READY_FOR_SHIPMENT' ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyan-500/30'
										}`}
									>
										<input
											type="radio"
											name="shipmentStatus"
											value="READY_FOR_SHIPMENT"
											checked={shipmentStatus === 'READY_FOR_SHIPMENT'}
											onChange={() => setShipmentStatus('READY_FOR_SHIPMENT')}
											className="mt-1 mr-3 w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
										/>
										<div>
											<div className="text-white font-semibold text-lg mb-1">Ready for Shipment</div>
											<div className="text-white/60 text-sm">
												Vehicle is ready to ship. Shipping details required.
											</div>
										</div>
									</label>
								</div>
							</div>
						</motion.div>

						{/* Vehicle Information */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
						>
							<h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Vehicle Information</h2>
							<div className="space-y-4">
								<div>
									<label htmlFor="vehicleType" className="block text-sm font-medium text-white/90 mb-2">
										Vehicle Type <span className="text-red-400">*</span>
									</label>
									<select
										id="vehicleType"
										{...register('vehicleType')}
										className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all ${
											errors.vehicleType ? 'border-red-500/50' : 'border-cyan-500/30'
										}`}
									>
										<option value="" className="bg-[var(--text-primary)]">Select vehicle type</option>
										<option value="sedan" className="bg-[var(--text-primary)]">Sedan</option>
										<option value="suv" className="bg-[var(--text-primary)]">SUV</option>
										<option value="truck" className="bg-[var(--text-primary)]">Truck</option>
										<option value="motorcycle" className="bg-[var(--text-primary)]">Motorcycle</option>
										<option value="van" className="bg-[var(--text-primary)]">Van</option>
										<option value="pickup" className="bg-[var(--text-primary)]">Pickup Truck</option>
										<option value="luxury" className="bg-[var(--text-primary)]">Luxury Vehicle</option>
										<option value="commercial" className="bg-[var(--text-primary)]">Commercial Vehicle</option>
									</select>
									{errors.vehicleType && (
										<p className="mt-2 text-sm text-red-400">{errors.vehicleType.message}</p>
									)}
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label htmlFor="vehicleMake" className="block text-sm font-medium text-white/90 mb-2">
											Make
										</label>
										<input
											type="text"
											id="vehicleMake"
											{...register('vehicleMake')}
											placeholder="e.g., Toyota, Honda"
											className="w-full px-4 py-3 bg-[var(--text-primary)] border border-cyan-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
										/>
									</div>
									<div>
										<label htmlFor="vehicleModel" className="block text-sm font-medium text-white/90 mb-2">
											Model
										</label>
										<input
											type="text"
											id="vehicleModel"
											{...register('vehicleModel')}
											placeholder="e.g., Camry, Accord"
											className="w-full px-4 py-3 bg-[var(--text-primary)] border border-cyan-500/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label htmlFor="vehicleYear" className="block text-sm font-medium text-white/90 mb-2">
											Year
										</label>
										<input
											type="number"
											id="vehicleYear"
											{...register('vehicleYear')}
											placeholder="e.g., 2020"
											min="1900"
											max={new Date().getFullYear() + 1}
											className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
												errors.vehicleYear ? 'border-red-500/50' : 'border-cyan-500/30'
											}`}
										/>
										{errors.vehicleYear && (
											<p className="mt-2 text-sm text-red-400">{errors.vehicleYear.message}</p>
										)}
									</div>
									<div>
										<label htmlFor="vehicleVIN" className="block text-sm font-medium text-white/90 mb-2">
											VIN Number
										</label>
										<div className="flex flex-col sm:flex-row gap-3">
											<input
												type="text"
												id="vehicleVIN"
												{...register('vehicleVIN')}
												placeholder="Vehicle Identification Number"
												maxLength={17}
												className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
													errors.vehicleVIN ? 'border-red-500/50' : 'border-cyan-500/30'
												}`}
											/>
											<Button
												type="button"
												variant="outline"
												className="sm:w-auto w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
												onClick={handleDecodeVin}
												disabled={decodingVin}
											>
												{decodingVin ? (
													<>
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														Decoding...
													</>
												) : (
													'Decode VIN'
												)}
											</Button>
										</div>
										{errors.vehicleVIN && (
											<p className="mt-2 text-sm text-red-400">{errors.vehicleVIN.message}</p>
										)}
										{vinDecodeMessage && (
											<p className="mt-2 text-sm text-green-400">{vinDecodeMessage}</p>
										)}
										{vinDecodeError && (
											<p className="mt-2 text-sm text-red-400">{vinDecodeError}</p>
										)}
									</div>
								</div>

								{/* Color, Lot Number, Auction Name */}
								<div className={`grid grid-cols-1 gap-4 mt-4 ${role === 'admin' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
									<div>
										<label htmlFor="vehicleColor" className="block text-sm font-medium text-white/90 mb-2">
											Color
										</label>
										<input
											type="text"
											id="vehicleColor"
											{...register('vehicleColor')}
											placeholder="e.g., Blue, Red"
											className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
												errors.vehicleColor ? 'border-red-500/50' : 'border-cyan-500/30'
											}`}
										/>
										{errors.vehicleColor && (
											<p className="mt-2 text-sm text-red-400">{errors.vehicleColor.message}</p>
										)}
									</div>
									<div>
										<label htmlFor="lotNumber" className="block text-sm font-medium text-white/90 mb-2">
											Lot Number
										</label>
										<input
											type="text"
											id="lotNumber"
											{...register('lotNumber')}
											placeholder="e.g., LOT12345"
											className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
												errors.lotNumber ? 'border-red-500/50' : 'border-cyan-500/30'
											}`}
										/>
										{errors.lotNumber && (
											<p className="mt-2 text-sm text-red-400">{errors.lotNumber.message}</p>
										)}
									</div>
									{role === 'admin' && (
										<div>
											<label htmlFor="auctionName" className="block text-sm font-medium text-white/90 mb-2">
												Auction
											</label>
											<input
												type="text"
												id="auctionName"
												{...register('auctionName')}
												placeholder="e.g., Copart, IAA"
												className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
													errors.auctionName ? 'border-red-500/50' : 'border-cyan-500/30'
												}`}
											/>
											{errors.auctionName && (
												<p className="mt-2 text-sm text-red-400">{errors.auctionName.message}</p>
											)}
										</div>
									)}
								</div>
							</div>
						</motion.div>

						{/* Vehicle Details */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.15 }}
							className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
						>
							<h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Vehicle Details</h2>
							<div className="space-y-6">
								{/* Has Key */}
								<div>
									<label className="block text-sm font-medium text-white/90 mb-3">
										Does the vehicle have a key?
									</label>
									<div className="flex items-center gap-6">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="hasKey"
												value="yes"
												checked={watch('hasKey') === true}
												onChange={() => setValue('hasKey', true)}
												className="w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
											/>
											<span className="text-white">Yes</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="hasKey"
												value="no"
												checked={watch('hasKey') === false}
												onChange={() => setValue('hasKey', false)}
												className="w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
											/>
											<span className="text-white">No</span>
										</label>
									</div>
								</div>

								{/* Has Title */}
								<div>
									<label className="block text-sm font-medium text-white/90 mb-3">
										Does the vehicle have a title?
									</label>
									<div className="flex items-center gap-6">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="hasTitle"
												value="yes"
												checked={watch('hasTitle') === true}
												onChange={() => {
													setValue('hasTitle', true);
													clearErrors('titleStatus');
												}}
												className="w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
											/>
											<span className="text-white">Yes</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="hasTitle"
												value="no"
												checked={watch('hasTitle') === false}
												onChange={() => {
													setValue('hasTitle', false);
													setValue('titleStatus', undefined);
													clearErrors('titleStatus');
												}}
												className="w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
											/>
											<span className="text-white">No</span>
										</label>
									</div>
								</div>

								{/* Title Status - Only show if hasTitle is true */}
								{watch('hasTitle') === true && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.3 }}
									>
										<label htmlFor="titleStatus" className="block text-sm font-medium text-white/90 mb-2">
											Title Status
										</label>
										<select
											id="titleStatus"
											{...register('titleStatus')}
											className="w-full px-4 py-3 bg-[var(--text-primary)] border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
										>
											<option value="">Select title status</option>
											<option value="PENDING">Pending</option>
											<option value="DELIVERED">Delivered</option>
										</select>
									</motion.div>
								)}

								{/* Vehicle Age - Auto calculated and displayed */}
								{watch('vehicleYear') && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
									>
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-white/90">Vehicle Age:</span>
											<span className="text-lg font-bold text-cyan-400">
												{new Date().getFullYear() - parseInt(watch('vehicleYear') || '0')} years
											</span>
										</div>
									</motion.div>
								)}
							</div>
						</motion.div>

						{/* Shipping Information - Only for READY_FOR_SHIPMENT */}
						{shipmentStatus === 'READY_FOR_SHIPMENT' && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
							>
								<h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Shipping Information <span className="text-red-400">*</span></h2>
							<div className="space-y-4">
								<div>
									<label htmlFor="trackingNumber" className="block text-sm font-medium text-white/90 mb-2">
										Tracking / Container Number
									</label>
									<div className="flex flex-col sm:flex-row gap-3">
										<input
											type="text"
											id="trackingNumber"
											{...register('trackingNumber')}
											placeholder="e.g., UETU6059142"
											className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
												errors.trackingNumber ? 'border-red-500/50' : 'border-cyan-500/30'
											}`}
										/>
										<Button
											type="button"
											variant="outline"
											className="sm:w-auto w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
											onClick={handleFetchTrackingDetails}
											disabled={trackingFetching}
										>
											{trackingFetching ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Fetching...
												</>
											) : (
												'Fetch Shipping Details'
											)}
										</Button>
									</div>
									{errors.trackingNumber && (
										<p className="mt-2 text-sm text-red-400">{errors.trackingNumber.message}</p>
									)}
									{trackingMessage && (
										<p className="mt-2 text-sm text-green-400">{trackingMessage}</p>
									)}
									{trackingError && (
										<p className="mt-2 text-sm text-red-400">{trackingError}</p>
									)}
								</div>

								{trackingDetails && (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="rounded-lg border border-cyan-500/30 bg-[var(--text-primary)]/60 p-4">
											<h3 className="text-lg font-semibold text-white mb-3">Carrier Summary</h3>
											<dl className="space-y-2 text-sm text-white/70">
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-white">Carrier</dt>
													<dd className="text-right">{trackingDetails.company?.name || 'Not available'}</dd>
												</div>
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-white">Status</dt>
													<dd className="text-right">{trackingDetails.shipmentStatus || 'Unknown'}</dd>
												</div>
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-white">Current Location</dt>
													<dd className="text-right">{trackingDetails.currentLocation || 'Not available'}</dd>
												</div>
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-white">Est. Arrival</dt>
													<dd className="text-right">{formatDisplayDate(trackingDetails.estimatedArrival) || 'Not available'}</dd>
												</div>
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-white">Progress</dt>
													<dd className="text-right">{typeof trackingDetails.progress === 'number' ? `${trackingDetails.progress}%` : 'Not available'}</dd>
												</div>
											</dl>
										</div>
										<div className="rounded-lg border border-cyan-500/30 bg-[var(--text-primary)]/60 p-4">
											<h3 className="text-lg font-semibold text-white mb-3">Latest Milestones</h3>
											<div className="space-y-3">
												{trackingDetails.events.slice(0, 3).map((event) => (
													<div key={event.id} className="rounded-md border border-cyan-500/20 bg-[var(--text-primary)]/70 px-3 py-2">
														<p className="text-sm font-semibold text-white">{event.status}</p>
														<p className="text-xs text-white/60">{event.location || 'Unknown location'}</p>
														{event.timestamp && (
															<p className="text-xs text-white/50">
																{formatDisplayDate(event.timestamp) || event.timestamp}
															</p>
														)}
														{event.description && (
															<p className="text-xs text-white/50">{event.description}</p>
														)}
													</div>
												))}
												{trackingDetails.events.length === 0 && (
													<p className="text-sm text-white/60">No carrier events available yet.</p>
												)}
											</div>
										</div>
									</div>
								)}

								<div>
									<label htmlFor="origin" className="block text-sm font-medium text-white/90 mb-2">
										Origin <span className="text-red-400">*</span>
									</label>
									<input
										type="text"
										id="origin"
										{...register('origin')}
										placeholder="e.g., Los Angeles, CA, USA"
										className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
											errors.origin ? 'border-red-500/50' : 'border-cyan-500/30'
										}`}
									/>
									{errors.origin && (
										<p className="mt-2 text-sm text-red-400">{errors.origin.message}</p>
									)}
								</div>

								<div>
									<label htmlFor="destination" className="block text-sm font-medium text-white/90 mb-2">
										Destination <span className="text-red-400">*</span>
									</label>
									<input
										type="text"
										id="destination"
										{...register('destination')}
										placeholder="e.g., Kabul, Afghanistan"
										className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
											errors.destination ? 'border-red-500/50' : 'border-cyan-500/30'
										}`}
									/>
									{errors.destination && (
										<p className="mt-2 text-sm text-red-400">{errors.destination.message}</p>
									)}
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label htmlFor="weight" className="block text-sm font-medium text-white/90 mb-2">
											Weight (lbs)
										</label>
										<input
											type="number"
											step="0.01"
											id="weight"
											{...register('weight')}
											placeholder="e.g., 3500"
											className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
												errors.weight ? 'border-red-500/50' : 'border-cyan-500/30'
											}`}
										/>
										{errors.weight && (
											<p className="mt-2 text-sm text-red-400">{errors.weight.message}</p>
										)}
									</div>
									<div>
										<label htmlFor="dimensions" className="block text-sm font-medium text-white/90 mb-2">
											Dimensions (L x W x H)
										</label>
										<input
											type="text"
											id="dimensions"
											{...register('dimensions')}
											placeholder="e.g., 180 x 70 x 60 inches"
											maxLength={100}
											className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
												errors.dimensions ? 'border-red-500/50' : 'border-cyan-500/30'
											}`}
										/>
										{errors.dimensions && (
											<p className="mt-2 text-sm text-red-400">{errors.dimensions.message}</p>
										)}
									</div>
								</div>

								<div>
									<label htmlFor="specialInstructions" className="block text-sm font-medium text-white/90 mb-2">
										Special Instructions
									</label>
									<textarea
										id="specialInstructions"
										{...register('specialInstructions')}
										rows={4}
										placeholder="Any special handling or delivery instructions..."
										maxLength={1000}
										className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none ${
											errors.specialInstructions ? 'border-red-500/50' : 'border-cyan-500/30'
										}`}
									/>
									{errors.specialInstructions && (
										<p className="mt-2 text-sm text-red-400">{errors.specialInstructions.message}</p>
									)}
								</div>
							</div>
							</motion.div>
						)}

						{/* Container Photos */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
						>
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 rounded-xl bg-[var(--text-primary)] border border-cyan-500/40 flex items-center justify-center">
									<ImageIcon className="w-5 h-5 text-cyan-400" />
								</div>
								<div>
									<h2 className="text-xl sm:text-2xl font-bold text-white">Container Photos</h2>
									<p className="text-sm text-white/70">Upload photos of the container</p>
								</div>
							</div>

							{/* Upload Area */}
							<div className="space-y-4">
								<label
									htmlFor="container-photos"
									className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cyan-500/30 rounded-lg bg-[var(--text-primary)]/50 hover:border-cyan-500/50 hover:bg-[var(--text-primary)]/70 transition-all cursor-pointer group"
								>
									<input
										id="container-photos"
										type="file"
										multiple
										accept="image/jpeg,image/jpg,image/png,image/webp"
										onChange={handleFileSelect}
										className="hidden"
										disabled={uploading}
									/>
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										{uploading ? (
											<>
												<div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500/30 border-t-cyan-400 mb-3"></div>
												<p className="text-sm text-white/70">Uploading...</p>
											</>
										) : (
											<>
												<Upload className="w-10 h-10 text-cyan-400/70 group-hover:text-cyan-400 mb-3 transition-colors" />
												<p className="mb-2 text-sm text-white/70">
													<span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
												</p>
												<p className="text-xs text-white/50">PNG, JPG, JPEG, WEBP (MAX. 5MB per file)</p>
											</>
										)}
									</div>
								</label>

								{/* Photo Grid */}
								{containerPhotos.length > 0 && (
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
										{containerPhotos.map((photo, index) => (
											<motion.div
												key={index}
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												className="relative group aspect-square rounded-lg overflow-hidden border border-cyan-500/30 bg-[var(--text-primary)]"
											>
												<Image
													src={photo}
													alt={`Container photo ${index + 1}`}
													fill
													className="object-cover"
													unoptimized
												/>
												<button
													type="button"
													onClick={() => removePhoto(index)}
													className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
												>
													<X className="w-4 h-4 text-white" />
												</button>
											</motion.div>
										))}
									</div>
								)}
							</div>
						</motion.div>

						{/* Financial Information */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
						>
							<h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Financial Information</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="price" className="block text-sm font-medium text-white/90 mb-2">
										Price (USD)
									</label>
									<input
										type="number"
										step="0.01"
										id="price"
										{...register('price')}
										placeholder="e.g., 1500.00"
										className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
											errors.price ? 'border-red-500/50' : 'border-cyan-500/30'
										}`}
									/>
									{errors.price && (
										<p className="mt-2 text-sm text-red-400">{errors.price.message}</p>
									)}
								</div>
								<div>
									<label htmlFor="insuranceValue" className="block text-sm font-medium text-white/90 mb-2">
										Insurance Value (USD)
									</label>
									<input
										type="number"
										step="0.01"
										id="insuranceValue"
										{...register('insuranceValue')}
										placeholder="e.g., 30000.00"
										className={`w-full px-4 py-3 bg-[var(--text-primary)] border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 ${
											errors.insuranceValue ? 'border-red-500/50' : 'border-cyan-500/30'
										}`}
									/>
									{errors.insuranceValue && (
										<p className="mt-2 text-sm text-red-400">{errors.insuranceValue.message}</p>
									)}
								</div>
							</div>
						</motion.div>

						{/* Error Message */}
						{errors.root && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="relative rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/30 p-6"
							>
								<p className="text-sm text-red-400 flex items-center gap-2">
									<AlertCircle className="w-4 h-4" />
									{errors.root.message}
								</p>
							</motion.div>
						)}

						{/* Submit Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5 }}
							className="flex flex-col sm:flex-row justify-end gap-4 pt-4"
						>
							<Link href="/dashboard/shipments" className="sm:w-auto w-full">
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting}
									className="w-full sm:w-auto border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
								>
									Cancel
								</Button>
							</Link>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full sm:w-auto bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold)] shadow-lg shadow-cyan-500/30"
							>
								{isSubmitting ? 'Creating...' : 'Create Shipment'}
							</Button>
						</motion.div>
					</form>
				</div>
			</Section>
		</>
	);
}
