'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, AlertCircle, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
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
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({ 
		open: false, 
		message: '', 
		severity: 'success' 
	});

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

	const [shipmentStatus, setShipmentStatus] = useState<'ON_HAND' | 'IN_TRANSIT'>('ON_HAND');
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
			const errorMsg = 'VIN must be exactly 17 characters long.';
			setVinDecodeError(errorMsg);
			setError('vehicleVIN', { type: 'manual', message: errorMsg });
			setSnackbar({ open: true, message: errorMsg, severity: 'warning' });
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
			setSnackbar({ open: true, message: 'Vehicle details have been populated from the VIN.', severity: 'success' });
		} catch (error) {
			console.error('Error decoding VIN:', error);
			const message = error instanceof Error ? error.message : 'Failed to decode VIN. Please try again later.';
			setVinDecodeError(message);
			setSnackbar({ open: true, message, severity: 'error' });
		} finally {
			setDecodingVin(false);
		}
	};

	const handleFetchTrackingDetails = async () => {
		const tracking = (trackingNumberValue || '').trim();
		setTrackingMessage(null);
		setTrackingError(null);

		if (!tracking) {
			const errorMsg = 'Tracking number is required.';
			setTrackingError(errorMsg);
			setError('trackingNumber', { type: 'manual', message: errorMsg });
			setSnackbar({ open: true, message: errorMsg, severity: 'warning' });
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
			setSnackbar({ open: true, message: 'Shipping details retrieved from carrier.', severity: 'success' });
		} catch (error) {
			console.error('Error fetching tracking details:', error);
			setTrackingDetails(null);
			const message = error instanceof Error ? error.message : 'Failed to fetch tracking details.';
			setTrackingError(message);
			setSnackbar({ open: true, message, severity: 'error' });
		} finally {
			setTrackingFetching(false);
		}
	};

	const handleFileUpload = async (file: File) => {
		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			setSnackbar({ open: true, message: 'File size must be less than 5MB', severity: 'error' });
			return null;
		}

		// Validate file type
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!validTypes.includes(file.type)) {
			setSnackbar({ open: true, message: 'Invalid file type. Please upload JPG, PNG, or WEBP images', severity: 'error' });
			return null;
		}

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
			setSnackbar({ open: true, message: 'Photo uploaded successfully', severity: 'success' });
			return result.url;
		} catch (error) {
			console.error('Error uploading file:', error);
			const message = error instanceof Error ? error.message : 'Failed to upload image';
			setError('root', { message });
			setSnackbar({ open: true, message, severity: 'error' });
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
			// Validate required fields for IN_TRANSIT
			if (shipmentStatus === 'IN_TRANSIT') {
				if (!data.origin || data.origin.trim().length < 3) {
					setError('origin', { type: 'manual', message: 'Origin is required for ready-to-ship items (min 3 characters)' });
					setSnackbar({ open: true, message: 'Origin is required for ready-to-ship items (min 3 characters)', severity: 'warning' });
					return;
				}
				if (!data.destination || data.destination.trim().length < 3) {
					setError('destination', { type: 'manual', message: 'Destination is required for ready-to-ship items (min 3 characters)' });
					setSnackbar({ open: true, message: 'Destination is required for ready-to-ship items (min 3 characters)', severity: 'warning' });
					return;
				}
			}

			// Additional validation warnings
			if (!data.vehicleMake && !data.vehicleModel) {
				setSnackbar({ open: true, message: 'Warning: Vehicle make and model are recommended for better tracking', severity: 'warning' });
			}

			if (!data.vehicleVIN && shipmentStatus === 'IN_TRANSIT') {
				setSnackbar({ open: true, message: 'Warning: VIN number is recommended for shipments', severity: 'warning' });
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
				setSnackbar({ open: true, message: 'Shipment created successfully!', severity: 'success' });
				setTimeout(() => {
					router.push(`/dashboard/shipments/${result.shipment.id}`);
				}, 800);
			} else {
				const errorMessage = result.message || 'Failed to create shipment';
				setError('root', { message: errorMessage });
				setSnackbar({ open: true, message: errorMessage, severity: 'error' });
			}
		} catch (error) {
			console.error('Error creating shipment:', error);
			const errorMessage = 'An error occurred while creating the shipment';
			setError('root', { message: errorMessage });
			setSnackbar({ open: true, message: errorMessage, severity: 'error' });
		}
	};

	const role = session?.user?.role;
	const isAdmin = role === 'admin';

	if (status === 'loading' || loadingUsers) {
		return (
			<ProtectedRoute>
				<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
					<div className="text-center space-y-4 text-[var(--text-secondary)]">
						<div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border)] border-t-[var(--accent-gold)]" />
						<p>Loading...</p>
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	if (!session || !isAdmin) {
		return (
			<ProtectedRoute>
				<Section className="min-h-screen bg-[var(--background)] flex items-center justify-center">
					<div className="max-w-md text-center space-y-4">
						<AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
						<h2 className="text-xl font-semibold text-[var(--text-primary)]">Access Restricted</h2>
						<p className="text-[var(--text-secondary)]">Only administrators can create and assign shipments to users.</p>
						<Link href="/dashboard">
							<Button className="bg-[var(--accent-gold)] text-[var(--background)] hover:bg-[var(--accent-gold)]">
								Go to Dashboard
							</Button>
						</Link>
					</div>
				</Section>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div className="light-surface min-h-screen bg-[var(--background)]">
				<Section className="pt-6 pb-6">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-start gap-3 min-w-0 flex-1">
							<Link href="/dashboard/shipments">
								<Button variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 flex-shrink-0 text-xs sm:text-sm">
									<ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
									Back
								</Button>
							</Link>
							<div className="min-w-0 flex-1">
								<h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] truncate">Create New Shipment</h1>
								<p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-1">Add a new vehicle shipment and assign it to a user.</p>
							</div>
						</div>
					</div>
				</Section>

				<Section className="pb-16">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						{/* User Assignment */}
						<Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
							<CardHeader className="p-4 sm:p-6 border-b border-white/5">
								<CardTitle className="text-base sm:text-lg font-bold text-[var(--text-primary)]">User Assignment</CardTitle>
							</CardHeader>
							<CardContent className="p-4 sm:p-6 space-y-4">
								<div>
									<label htmlFor="userId" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
										Assign to User <span className="text-red-400">*</span>
									</label>
									<select
										id="userId"
										{...register('userId')}
										className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
											errors.userId ? 'border-red-500/50' : 'border-white/10'
										}`}
									>
										<option value="">Select a user...</option>
										{users.map((user) => (
											<option key={user.id} value={user.id}>
												{user.name || user.email} {user.email !== user.name ? `(${user.email})` : ''}
											</option>
										))}
									</select>
									{errors.userId && (
										<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.userId.message}</p>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Shipment Status Selection */}
						<Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
							<CardHeader className="p-4 sm:p-6 border-b border-white/5">
								<CardTitle className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Shipment Status</CardTitle>
							</CardHeader>
							<CardContent className="p-4 sm:p-6 space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<label 
										className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-cyan-500/50 ${
											shipmentStatus === 'ON_HAND' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10'
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
											<div className="text-[var(--text-primary)] font-semibold text-sm mb-1">On Hand</div>
											<div className="text-[var(--text-secondary)] text-xs">
												Vehicle is in inventory. Shipping details not needed yet.
											</div>
										</div>
									</label>
								<label 
									className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-cyan-500/50 ${
										shipmentStatus === 'IN_TRANSIT' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10'
									}`}
								>
									<input
										type="radio"
										name="shipmentStatus"
										value="IN_TRANSIT"
										checked={shipmentStatus === 'IN_TRANSIT'}
										onChange={() => setShipmentStatus('IN_TRANSIT')}
										className="mt-1 mr-3 w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
									/>
										<div>
											<div className="text-[var(--text-primary)] font-semibold text-sm mb-1">Ready for Shipment</div>
											<div className="text-[var(--text-secondary)] text-xs">
												Vehicle is ready to ship. Shipping details required.
											</div>
										</div>
									</label>
								</div>
							</CardContent>
						</Card>

						{/* Vehicle Information */}
						<Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
							<CardHeader className="p-4 sm:p-6 border-b border-white/5">
								<CardTitle className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Vehicle Information</CardTitle>
							</CardHeader>
							<CardContent className="p-4 sm:p-6 space-y-4">
								<div>
									<label htmlFor="vehicleType" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
										Vehicle Type <span className="text-red-400">*</span>
									</label>
									<select
										id="vehicleType"
										{...register('vehicleType')}
										className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
											errors.vehicleType ? 'border-red-500/50' : 'border-white/10'
										}`}
									>
										<option value="">Select vehicle type</option>
										<option value="sedan">Sedan</option>
										<option value="suv">SUV</option>
										<option value="truck">Truck</option>
										<option value="motorcycle">Motorcycle</option>
										<option value="van">Van</option>
										<option value="pickup">Pickup Truck</option>
										<option value="luxury">Luxury Vehicle</option>
										<option value="commercial">Commercial Vehicle</option>
									</select>
									{errors.vehicleType && (
										<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.vehicleType.message}</p>
									)}
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
									<label htmlFor="vehicleMake" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
										Make
									</label>
									<input
										type="text"
										id="vehicleMake"
										{...register('vehicleMake')}
										placeholder="e.g., Toyota, Honda"
										className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent"
									/>
									</div>
									<div>
									<label htmlFor="vehicleModel" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
										Model
									</label>
									<input
										type="text"
										id="vehicleModel"
										{...register('vehicleModel')}
										placeholder="e.g., Camry, Accord"
										className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent"
									/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
									<label htmlFor="vehicleYear" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
										Year
									</label>
									<input
										type="number"
										id="vehicleYear"
										{...register('vehicleYear')}
										placeholder="e.g., 2020"
										min="1900"
										max={new Date().getFullYear() + 1}
										className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
											errors.vehicleYear ? 'border-red-500/50' : 'border-white/10'
										}`}
									/>
									{errors.vehicleYear && (
										<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.vehicleYear.message}</p>
									)}
									</div>
									<div>
									<label htmlFor="vehicleVIN" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
										VIN Number
									</label>
									<div className="flex flex-col sm:flex-row gap-3">
										<input
											type="text"
											id="vehicleVIN"
											{...register('vehicleVIN')}
											placeholder="Vehicle Identification Number"
											maxLength={17}
											className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
												errors.vehicleVIN ? 'border-red-500/50' : 'border-white/10'
											}`}
										/>
										<Button
											type="button"
											variant="outline"
											className="sm:w-auto w-full border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
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
										<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.vehicleVIN.message}</p>
									)}
									{vinDecodeMessage && (
										<p className="mt-1 text-xs sm:text-sm text-green-400">{vinDecodeMessage}</p>
									)}
									{vinDecodeError && (
										<p className="mt-1 text-xs sm:text-sm text-red-400">{vinDecodeError}</p>
									)}
									</div>
								</div>

								{/* Color, Lot Number, Auction Name */}
								<div className={`grid grid-cols-1 gap-4 mt-4 ${role === 'admin' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
									<div>
										<label htmlFor="vehicleColor" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
											Color
										</label>
										<input
											type="text"
											id="vehicleColor"
											{...register('vehicleColor')}
											placeholder="e.g., Blue, Red"
											className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
												errors.vehicleColor ? 'border-red-500/50' : 'border-white/10'
											}`}
										/>
										{errors.vehicleColor && (
											<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.vehicleColor.message}</p>
										)}
									</div>
									<div>
										<label htmlFor="lotNumber" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
											Lot Number
										</label>
										<input
											type="text"
											id="lotNumber"
											{...register('lotNumber')}
											placeholder="e.g., LOT12345"
											className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
												errors.lotNumber ? 'border-red-500/50' : 'border-white/10'
											}`}
										/>
										{errors.lotNumber && (
											<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.lotNumber.message}</p>
										)}
									</div>
									{isAdmin && (
										<div>
											<label htmlFor="auctionName" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
												Auction
											</label>
											<input
												type="text"
												id="auctionName"
												{...register('auctionName')}
												placeholder="e.g., Copart, IAA"
												className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
													errors.auctionName ? 'border-red-500/50' : 'border-white/10'
												}`}
											/>
											{errors.auctionName && (
												<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.auctionName.message}</p>
											)}
										</div>
									)}
								</div>

								{/* Vehicle Details */}
								<div className="pt-4 border-t border-white/5">
									<h3 className="text-[var(--text-primary)] font-bold mb-4">Additional Vehicle Details</h3>
									
									<div className="space-y-4">
										{/* Has Key */}
										<div>
											<label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
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
													<span className="text-[var(--text-primary)]">Yes</span>
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
													<span className="text-[var(--text-primary)]">No</span>
												</label>
											</div>
										</div>

										{/* Has Title */}
										<div>
											<label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
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
													<span className="text-[var(--text-primary)]">Yes</span>
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
													<span className="text-[var(--text-primary)]">No</span>
												</label>
											</div>
										</div>

										{/* Title Status - Only show if hasTitle is true */}
										{watch('hasTitle') === true && (
											<div>
												<label htmlFor="titleStatus" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
													Title Status
												</label>
												<select
													id="titleStatus"
													{...register('titleStatus')}
													className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/3 text-[var(--text-primary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent"
												>
													<option value="">Select title status</option>
													<option value="PENDING">Pending</option>
													<option value="DELIVERED">Delivered</option>
												</select>
											</div>
										)}

										{/* Vehicle Age - Auto calculated and displayed */}
										{watch('vehicleYear') && (
											<div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
												<div className="flex items-center justify-between">
													<span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">Vehicle Age:</span>
													<span className="text-lg font-bold text-cyan-400">
														{new Date().getFullYear() - parseInt(watch('vehicleYear') || '0')} years
													</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Shipping Information - Only for IN_TRANSIT */}
						{shipmentStatus === 'IN_TRANSIT' && (
							<Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
								<CardHeader className="p-4 sm:p-6 border-b border-white/5">
									<CardTitle className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Shipping Information <span className="text-red-400">*</span></CardTitle>
								</CardHeader>
								<CardContent className="p-4 sm:p-6 space-y-4">
									<div>
										<label htmlFor="trackingNumber" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
											Tracking / Container Number
										</label>
										<div className="flex flex-col sm:flex-row gap-3">
											<input
												type="text"
												id="trackingNumber"
												{...register('trackingNumber')}
												placeholder="e.g., UETU6059142"
												className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
													errors.trackingNumber ? 'border-red-500/50' : 'border-white/10'
												}`}
											/>
											<Button
												type="button"
												variant="outline"
												className="sm:w-auto w-full border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 whitespace-nowrap"
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
											<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.trackingNumber.message}</p>
										)}
										{trackingMessage && (
											<p className="mt-1 text-xs sm:text-sm text-green-400">{trackingMessage}</p>
										)}
										{trackingError && (
											<p className="mt-1 text-xs sm:text-sm text-red-400">{trackingError}</p>
										)}
									</div>

								{trackingDetails && (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="rounded-lg border border-white/10 bg-white/3 p-4">
											<h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">Carrier Summary</h3>
											<dl className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-[var(--text-primary)]">Carrier</dt>
													<dd className="text-right">{trackingDetails.company?.name || 'Not available'}</dd>
												</div>
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-[var(--text-primary)]">Status</dt>
													<dd className="text-right">{trackingDetails.shipmentStatus || 'Unknown'}</dd>
												</div>
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-[var(--text-primary)]">Current Location</dt>
													<dd className="text-right">{trackingDetails.currentLocation || 'Not available'}</dd>
												</div>
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-[var(--text-primary)]">Est. Arrival</dt>
													<dd className="text-right">{formatDisplayDate(trackingDetails.estimatedArrival) || 'Not available'}</dd>
												</div>
												<div className="flex items-start justify-between gap-4">
													<dt className="font-medium text-[var(--text-primary)]">Progress</dt>
													<dd className="text-right">{typeof trackingDetails.progress === 'number' ? `${trackingDetails.progress}%` : 'Not available'}</dd>
												</div>
											</dl>
										</div>
										<div className="rounded-lg border border-white/10 bg-white/3 p-4">
											<h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">Latest Milestones</h3>
											<div className="space-y-3">
												{trackingDetails.events.slice(0, 3).map((event) => (
													<div key={event.id} className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
														<p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">{event.status}</p>
														<p className="text-xs text-[var(--text-secondary)]">{event.location || 'Unknown location'}</p>
														{event.timestamp && (
															<p className="text-xs text-[var(--text-secondary)]">
																{formatDisplayDate(event.timestamp) || event.timestamp}
															</p>
														)}
														{event.description && (
															<p className="text-xs text-[var(--text-secondary)]">{event.description}</p>
														)}
													</div>
												))}
												{trackingDetails.events.length === 0 && (
													<p className="text-xs sm:text-sm text-[var(--text-secondary)]">No carrier events available yet.</p>
												)}
											</div>
										</div>
									</div>
								)}

									<div>
										<label htmlFor="origin" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
											Origin <span className="text-red-400">*</span>
										</label>
										<input
											type="text"
											id="origin"
											{...register('origin')}
											placeholder="e.g., Los Angeles, CA, USA"
											className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
												errors.origin ? 'border-red-500/50' : 'border-white/10'
											}`}
										/>
										{errors.origin && (
											<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.origin.message}</p>
										)}
									</div>

									<div>
										<label htmlFor="destination" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
											Destination <span className="text-red-400">*</span>
										</label>
										<input
											type="text"
											id="destination"
											{...register('destination')}
											placeholder="e.g., Kabul, Afghanistan"
											className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
												errors.destination ? 'border-red-500/50' : 'border-white/10'
											}`}
										/>
										{errors.destination && (
											<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.destination.message}</p>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label htmlFor="weight" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
												Weight (lbs)
											</label>
											<input
												type="number"
												step="0.01"
												id="weight"
												{...register('weight')}
												placeholder="e.g., 3500"
												className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
													errors.weight ? 'border-red-500/50' : 'border-white/10'
												}`}
											/>
											{errors.weight && (
												<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.weight.message}</p>
											)}
										</div>
										<div>
											<label htmlFor="dimensions" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
												Dimensions (L x W x H)
											</label>
											<input
												type="text"
												id="dimensions"
												{...register('dimensions')}
												placeholder="e.g., 180 x 70 x 60 inches"
												maxLength={100}
												className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
													errors.dimensions ? 'border-red-500/50' : 'border-white/10'
												}`}
											/>
											{errors.dimensions && (
												<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.dimensions.message}</p>
											)}
										</div>
									</div>

									<div>
										<label htmlFor="specialInstructions" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
											Special Instructions
										</label>
										<textarea
											id="specialInstructions"
											{...register('specialInstructions')}
											rows={4}
											placeholder="Any special handling or delivery instructions..."
											maxLength={1000}
											className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent resize-none ${
												errors.specialInstructions ? 'border-red-500/50' : 'border-white/10'
											}`}
										/>
										{errors.specialInstructions && (
											<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.specialInstructions.message}</p>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Container Photos */}
						<Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-[var(--text-primary)]">
									<ImageIcon className="h-5 w-5 text-cyan-300" />
									Container Photos
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4 sm:p-6 space-y-4">
								<div>
									<label
										htmlFor="container-photos"
										className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-cyan-500/40 rounded-lg bg-white/3 hover:bg-white/5 hover:border-cyan-500/60 transition-all cursor-pointer group"
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
													<div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent mb-2" />
													<p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
												</>
											) : (
												<>
													<Upload className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 mb-2" />
													<p className="mb-1 text-sm text-[var(--text-primary)]">
														<span className="font-semibold text-cyan-400">Click to upload</span> container photos
													</p>
													<p className="text-xs text-[var(--text-secondary)]">PNG, JPG, JPEG, WEBP (MAX. 5MB per file)</p>
												</>
											)}
										</div>
									</label>
								</div>

								{containerPhotos.length > 0 ? (
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
										{containerPhotos.map((photo, index) => (
											<div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
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
													className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/70 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
													aria-label="Remove container photo"
												>
													<X className="w-4 h-4 text-[var(--text-primary)]" />
												</button>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-[var(--text-secondary)]">No container photos uploaded yet.</p>
								)}
							</CardContent>
						</Card>

						{/* Financial Information */}
						<Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
							<CardHeader className="p-4 sm:p-6 border-b border-white/5">
								<CardTitle className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Financial Information</CardTitle>
							</CardHeader>
							<CardContent className="p-4 sm:p-6 space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label htmlFor="price" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
											Price (USD)
										</label>
										<input
											type="number"
											step="0.01"
											id="price"
											{...register('price')}
											placeholder="e.g., 1500.00"
											className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
												errors.price ? 'border-red-500/50' : 'border-white/10'
											}`}
										/>
										{errors.price && (
											<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.price.message}</p>
										)}
									</div>
									<div>
										<label htmlFor="insuranceValue" className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
											Insurance Value (USD)
										</label>
										<input
											type="number"
											step="0.01"
											id="insuranceValue"
											{...register('insuranceValue')}
											placeholder="e.g., 30000.00"
											className={`w-full px-4 py-2 rounded-lg border bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent ${
												errors.insuranceValue ? 'border-red-500/50' : 'border-white/10'
											}`}
										/>
										{errors.insuranceValue && (
											<p className="mt-1 text-xs sm:text-sm text-red-400">{errors.insuranceValue.message}</p>
										)}
									</div>
								</div>

								{/* Payment Mode Selection */}
								<div className="pt-4 border-t border-white/5">
									<label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
										Payment Mode
									</label>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<label 
											className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-cyan-500/50 ${
												watch('paymentMode') === 'CASH' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10'
											}`}
										>
											<input
												type="radio"
												{...register('paymentMode')}
												value="CASH"
												className="mt-1 mr-3 w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
											/>
											<div>
												<div className="text-[var(--text-primary)] font-semibold text-sm mb-1">Cash Payment</div>
												<div className="text-[var(--text-secondary)] text-xs">
													Payment received immediately. Transaction will be marked as paid.
												</div>
											</div>
										</label>
										<label 
											className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-cyan-500/50 ${
												watch('paymentMode') === 'DUE' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10'
											}`}
										>
											<input
												type="radio"
												{...register('paymentMode')}
												value="DUE"
												className="mt-1 mr-3 w-5 h-5 text-cyan-500 border-cyan-500/30 focus:ring-cyan-500/50"
											/>
											<div>
												<div className="text-[var(--text-primary)] font-semibold text-sm mb-1">Due Payment</div>
												<div className="text-[var(--text-secondary)] text-xs">
													Payment to be collected later. Amount will be added to user&apos;s ledger as due.
												</div>
											</div>
										</label>
									</div>
									{watch('paymentMode') === 'CASH' && (
										<div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
											<p className="text-xs text-green-400">
												✓ Cash payment selected. A debit and credit entry will be created in the user&apos;s ledger (net zero balance).
											</p>
										</div>
									)}
									{watch('paymentMode') === 'DUE' && (
										<div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
											<p className="text-xs text-yellow-400">
												⚠ Due payment selected. Only a debit entry will be created, increasing the user&apos;s outstanding balance.
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Error Message */}
						{errors.root && (
							<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								<div className="flex items-center gap-2">
									<AlertCircle className="w-4 h-4" />
									{errors.root.message}
								</div>
							</div>
						)}

						{/* Submit Buttons */}
						<div className="flex justify-end gap-3">
							<Link href="/dashboard/shipments">
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting}
									className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
								>
									Cancel
								</Button>
							</Link>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)] shadow-cyan-500/30"
								style={{ color: 'white' }}
							>
								{isSubmitting ? 'Creating...' : 'Create Shipment'}
							</Button>
						</div>
					</form>
				</Section>

				{/* Snackbar for Toast Notifications */}
				<Snackbar 
					open={snackbar.open} 
					autoHideDuration={6000} 
					onClose={() => setSnackbar({ ...snackbar, open: false })} 
					anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				>
					<Alert 
						onClose={() => setSnackbar({ ...snackbar, open: false })} 
						severity={snackbar.severity} 
						sx={{ width: '100%' }}
					>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</div>
		</ProtectedRoute>
	);
}
