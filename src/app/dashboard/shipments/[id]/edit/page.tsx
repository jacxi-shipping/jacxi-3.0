'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
	Box,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormLabel,
	CircularProgress,
	InputAdornment,
} from '@mui/material';
import {
	ArrowLeft,
	Upload,
	X,
	Package,
	Ship,
	MapPin,
	DollarSign,
	Image as ImageIcon,
	FileText,
	AlertCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DashboardSurface, DashboardPanel, DashboardGrid } from '@/components/dashboard/DashboardSurface';
import {
	PageHeader,
	Button,
	Breadcrumbs,
	toast,
	LoadingState,
	EmptyState,
 DashboardPageSkeleton, DetailPageSkeleton, FormPageSkeleton} from '@/components/design-system';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type PhotoSection = 'container' | 'arrival';

export default function EditShipmentPage() {
	const params = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);
	const [uploading, setUploading] = useState<{ section: PhotoSection | null; state: boolean }>({
		section: null,
		state: false,
	});
	const [containerPhotos, setContainerPhotos] = useState<string[]>([]);
	const [arrivalPhotos, setArrivalPhotos] = useState<string[]>([]);
	const [trackingFetching, setTrackingFetching] = useState(false);
	const [trackingNumber, setTrackingNumber] = useState('');

	const [formData, setFormData] = useState({
		userId: '',
		vehicleType: '',
		vehicleMake: '',
		vehicleModel: '',
		vehicleYear: '',
		vehicleVIN: '',
		vehicleColor: '',
		lotNumber: '',
		auctionName: '',
		origin: '',
		destination: '',
		status: '',
		currentLocation: '',
		estimatedDelivery: '',
		progress: '0',
		weight: '',
		dimensions: '',
		specialInstructions: '',
		insuranceValue: '',
		price: '',
		hasKey: null as boolean | null,
		hasTitle: null as boolean | null,
		titleStatus: '',
	});

	const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string }>>([]);

	const isAdmin = useMemo(() => session?.user?.role === 'admin', [session]);

	const fetchUsers = useCallback(async () => {
		try {
			const response = await fetch('/api/users');
			if (response.ok) {
				const data = await response.json();
				setUsers(data.users || []);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	}, []);

	const fetchShipmentData = useCallback(async () => {
		try {
			setLoadingData(true);
			const response = await fetch(`/api/shipments/${params.id}`);
			const data = await response.json();

			if (response.ok) {
				const shipment = data.shipment;
				setFormData({
					userId: shipment.userId || '',
					vehicleType: shipment.vehicleType,
					vehicleMake: shipment.vehicleMake || '',
					vehicleModel: shipment.vehicleModel || '',
					vehicleYear: shipment.vehicleYear?.toString() || '',
					vehicleVIN: shipment.vehicleVIN || '',
					vehicleColor: shipment.vehicleColor || '',
					lotNumber: shipment.lotNumber || '',
					auctionName: shipment.auctionName || '',
					origin: shipment.origin,
					destination: shipment.destination,
					status: shipment.status,
					currentLocation: shipment.currentLocation || '',
					estimatedDelivery: shipment.estimatedDelivery
						? new Date(shipment.estimatedDelivery).toISOString().split('T')[0]
						: '',
					progress: shipment.progress?.toString() || '0',
					weight: shipment.weight?.toString() || '',
					dimensions: shipment.dimensions || '',
					specialInstructions: shipment.specialInstructions || '',
					insuranceValue: shipment.insuranceValue?.toString() || '',
					price: shipment.price?.toString() || '',
					hasKey: shipment.hasKey ?? null,
					hasTitle: shipment.hasTitle ?? null,
					titleStatus: shipment.titleStatus || '',
				});
				setContainerPhotos(shipment.vehiclePhotos || shipment.containerPhotos || []);
				setArrivalPhotos(shipment.arrivalPhotos || []);
			} else {
				toast.error(data.message || 'Failed to load shipment');
			}
		} catch (error) {
			console.error('Error fetching shipment:', error);
			toast.error('An error occurred while loading the shipment');
		} finally {
			setLoadingData(false);
		}
	}, [params.id]);

	useEffect(() => {
		if (!isAdmin || status === 'loading') return;
		fetchShipmentData();
		fetchUsers();
	}, [fetchShipmentData, fetchUsers, isAdmin, status]);

	useEffect(() => {
		if (status !== 'loading' && session && !isAdmin) {
			router.replace(`/dashboard/shipments/${params.id}`);
		}
	}, [status, session, isAdmin, params.id, router]);

	const handleFetchTrackingDetails = async () => {
		const tracking = trackingNumber.trim();

		if (!tracking) {
			toast.warning('Tracking number is required');
			return;
		}

		setTrackingFetching(true);

		try {
			const response = await fetch('/api/tracking', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ trackNumber: tracking, needRoute: true }),
			});

			const payload = await response.json();

			if (!response.ok) {
				toast.error(payload?.message || 'Failed to fetch tracking information');
				return;
			}

			const details = payload?.tracking;
			if (!details) {
				toast.error('No tracking data returned from carrier');
				return;
			}

			setFormData((prev) => ({
				...prev,
				origin: details.origin || prev.origin,
				destination: details.destination || prev.destination,
				currentLocation: details.currentLocation || prev.currentLocation,
				status: details.shipmentStatus || prev.status,
				progress: details.progress?.toString() || prev.progress,
			}));

			toast.success('Shipping details updated from carrier');
		} catch (error) {
			console.error('Error fetching tracking details:', error);
			toast.error('Failed to fetch tracking details');
		} finally {
			setTrackingFetching(false);
		}
	};

	if (!isAdmin && status !== 'loading') {
		return (
			<ProtectedRoute>
				<DashboardSurface>
					<EmptyState
						icon={<AlertCircle className="w-12 h-12" />}
						title="Access Restricted"
						description="Only administrators can modify shipment details"
						action={
							<Link href={`/dashboard/shipments/${params.id}`} style={{ textDecoration: 'none' }}>
								<Button variant="primary">Back to Shipment</Button>
							</Link>
						}
					/>
				</DashboardSurface>
			</ProtectedRoute>
		);
	}

	if (loadingData) {
		return (
			<ProtectedRoute>
				<FormPageSkeleton />
			</ProtectedRoute>
		);
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name: string) => (e: any) => {
		setFormData((prev) => ({ ...prev, [name]: e.target.value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.userId) {
			toast.warning('User assignment is required');
			return;
		}

		if (!formData.vehicleType) {
			toast.warning('Vehicle type is required');
			return;
		}

		if (formData.vehicleYear) {
			const year = parseInt(formData.vehicleYear);
			if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
				toast.warning(`Please enter a valid year between 1900 and ${new Date().getFullYear() + 1}`);
				return;
			}
		}

		if (formData.vehicleVIN && formData.vehicleVIN.length > 0 && formData.vehicleVIN.length < 17) {
			toast.warning('VIN must be at least 17 characters');
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(`/api/shipments/${params.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					vehiclePhotos: containerPhotos,
					arrivalPhotos,
					replaceArrivalPhotos: true,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success('Shipment updated successfully!');
				setTimeout(() => {
					router.push(`/dashboard/shipments/${params.id}`);
				}, 800);
			} else {
				toast.error(data.message || 'Failed to update shipment');
			}
		} catch (error) {
			console.error('Error updating shipment:', error);
			toast.error('An error occurred while updating the shipment');
		} finally {
			setLoading(false);
		}
	};

	const handlePhotoUpload = async (section: PhotoSection, file: File) => {
		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be less than 5MB');
			return;
		}

		const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!validTypes.includes(file.type)) {
			toast.error('Invalid file type. Please upload JPG, PNG, or WEBP images');
			return;
		}

		setUploading({ section, state: true });
		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Upload failed');
			}

			const result = await response.json();

			if (section === 'container') {
				setContainerPhotos((prev) => [...prev, result.url]);
				toast.success('Container photo uploaded successfully');
			} else {
				setArrivalPhotos((prev) => [...prev, result.url]);
				toast.success('Arrival photo uploaded successfully');
			}
		} catch (error) {
			console.error('Error uploading photo:', error);
			toast.error('Failed to upload photo');
		} finally {
			setUploading({ section: null, state: false });
		}
	};

	const handlePhotoSelect = (section: PhotoSection) => async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files?.length) return;

		for (let i = 0; i < files.length; i += 1) {
			await handlePhotoUpload(section, files[i]);
		}

		event.target.value = '';
	};

	const removePhoto = (section: PhotoSection, index: number) => {
		if (section === 'container') {
			setContainerPhotos((prev) => prev.filter((_, idx) => idx !== index));
		} else {
			setArrivalPhotos((prev) => prev.filter((_, idx) => idx !== index));
		}
	};

	return (
		<ProtectedRoute>
			<DashboardSurface>
				<Box sx={{ px: 2, pt: 2 }}>
					<Breadcrumbs />
				</Box>

				<PageHeader
					title="Edit Shipment"
					description="Update shipment information, photos, and status"
					actions={
						<Link href={`/dashboard/shipments/${params.id}`} style={{ textDecoration: 'none' }}>
							<Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
								Back
							</Button>
						</Link>
					}
				/>

				<Box component="form" onSubmit={handleSubmit} sx={{ px: 2, pb: 4 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						{/* User Assignment */}
						<DashboardPanel title="User Assignment" description="Assign this shipment to a customer">
							<FormControl fullWidth size="small" required>
								<InputLabel>Assign to User</InputLabel>
								<Select
									value={formData.userId}
									onChange={handleSelectChange('userId')}
									label="Assign to User"
								>
									<MenuItem value="">
										<em>Select a user...</em>
									</MenuItem>
									{users.map((user) => (
										<MenuItem key={user.id} value={user.id}>
											{user.name || user.email} ({user.email})
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</DashboardPanel>

						{/* Vehicle Information */}
						<DashboardPanel title="Vehicle Information" description="Enter vehicle details and specifications">
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
								<FormControl fullWidth size="small">
									<InputLabel>Vehicle Type</InputLabel>
									<Select
										value={formData.vehicleType}
										onChange={handleSelectChange('vehicleType')}
										label="Vehicle Type"
									>
										<MenuItem value="sedan">Sedan</MenuItem>
										<MenuItem value="suv">SUV</MenuItem>
										<MenuItem value="truck">Truck</MenuItem>
										<MenuItem value="motorcycle">Motorcycle</MenuItem>
										<MenuItem value="van">Van</MenuItem>
										<MenuItem value="pickup">Pickup Truck</MenuItem>
										<MenuItem value="luxury">Luxury Vehicle</MenuItem>
										<MenuItem value="commercial">Commercial Vehicle</MenuItem>
									</Select>
								</FormControl>

								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
									<TextField
										size="small"
										label="Make"
										name="vehicleMake"
										value={formData.vehicleMake}
										onChange={handleChange}
										placeholder="e.g., Toyota"
									/>
									<TextField
										size="small"
										label="Model"
										name="vehicleModel"
										value={formData.vehicleModel}
										onChange={handleChange}
										placeholder="e.g., Camry"
									/>
								</Box>

								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
									<TextField
										size="small"
										type="number"
										label="Year"
										name="vehicleYear"
										value={formData.vehicleYear}
										onChange={handleChange}
										inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
									/>
									<TextField
										size="small"
										label="VIN Number"
										name="vehicleVIN"
										value={formData.vehicleVIN}
										onChange={handleChange}
										placeholder="17 characters"
									/>
								</Box>

								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
									<TextField
										size="small"
										label="Color"
										name="vehicleColor"
										value={formData.vehicleColor}
										onChange={handleChange}
										placeholder="e.g., Blue"
									/>
									<TextField
										size="small"
										label="Lot Number"
										name="lotNumber"
										value={formData.lotNumber}
										onChange={handleChange}
										placeholder="e.g., LOT12345"
									/>
									<TextField
										size="small"
										label="Auction"
										name="auctionName"
										value={formData.auctionName}
										onChange={handleChange}
										placeholder="e.g., Copart"
									/>
								</Box>

								{/* Has Key & Has Title */}
								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 1 }}>
									<FormControl component="fieldset">
										<FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 1 }}>
											Has Key?
										</FormLabel>
										<RadioGroup
											row
											value={
												formData.hasKey === null ? 'null' : formData.hasKey === true ? 'yes' : 'no'
											}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													hasKey:
														e.target.value === 'null'
															? null
															: e.target.value === 'yes'
															? true
															: false,
												}))
											}
										>
											<FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
											<FormControlLabel value="no" control={<Radio size="small" />} label="No" />
											<FormControlLabel
												value="null"
												control={<Radio size="small" />}
												label="Unknown"
											/>
										</RadioGroup>
									</FormControl>

									<FormControl component="fieldset">
										<FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 1 }}>
											Has Title?
										</FormLabel>
										<RadioGroup
											row
											value={
												formData.hasTitle === null
													? 'null'
													: formData.hasTitle === true
													? 'yes'
													: 'no'
											}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													hasTitle:
														e.target.value === 'null'
															? null
															: e.target.value === 'yes'
															? true
															: false,
													titleStatus: e.target.value === 'yes' ? prev.titleStatus : '',
												}))
											}
										>
											<FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
											<FormControlLabel value="no" control={<Radio size="small" />} label="No" />
											<FormControlLabel
												value="null"
												control={<Radio size="small" />}
												label="Unknown"
											/>
										</RadioGroup>
									</FormControl>
								</Box>

								{formData.hasTitle === true && (
									<FormControl fullWidth size="small">
										<InputLabel>Title Status</InputLabel>
										<Select
											value={formData.titleStatus}
											onChange={handleSelectChange('titleStatus')}
											label="Title Status"
										>
											<MenuItem value="">
												<em>Select title status</em>
											</MenuItem>
											<MenuItem value="PENDING">Pending</MenuItem>
											<MenuItem value="DELIVERED">Delivered</MenuItem>
										</Select>
									</FormControl>
								)}
							</Box>
						</DashboardPanel>

						{/* Shipping Information */}
						<DashboardPanel title="Shipping Information" description="Origin, destination, and tracking details">
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<TextField
										fullWidth
										size="small"
										label="Tracking / Container Number"
										value={trackingNumber}
										onChange={(e) => setTrackingNumber(e.target.value)}
										placeholder="e.g., UETU6059142"
									/>
									<Button
										variant="outline"
										onClick={handleFetchTrackingDetails}
										disabled={trackingFetching}
										sx={{ whiteSpace: 'nowrap' }}
									>
										{trackingFetching ? <CircularProgress size={16} /> : 'Fetch Details'}
									</Button>
								</Box>

								<TextField
									fullWidth
									size="small"
									label="Origin"
									name="origin"
									value={formData.origin}
									onChange={handleChange}
									placeholder="Starting location"
								/>

								<TextField
									fullWidth
									size="small"
									label="Destination"
									name="destination"
									value={formData.destination}
									onChange={handleChange}
									placeholder="Delivery location"
								/>

								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
									<TextField
										size="small"
										type="number"
										label="Weight (lbs)"
										name="weight"
										value={formData.weight}
										onChange={handleChange}
										placeholder="Vehicle weight"
									/>
									<TextField
										size="small"
										label="Dimensions (L x W x H)"
										name="dimensions"
										value={formData.dimensions}
										onChange={handleChange}
										placeholder="e.g., 180 x 72 x 56"
									/>
								</Box>

								<TextField
									fullWidth
									size="small"
									label="Special Instructions"
									name="specialInstructions"
									value={formData.specialInstructions}
									onChange={handleChange}
									multiline
									rows={3}
									placeholder="Any special handling requirements..."
								/>
							</Box>
						</DashboardPanel>

						{/* Status Information */}
						<DashboardPanel title="Status Information" description="Current status and progress tracking">
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
								<FormControl fullWidth size="small">
									<InputLabel>Status</InputLabel>
									<Select value={formData.status} onChange={handleSelectChange('status')} label="Status">
										<MenuItem value="ON_HAND">On Hand</MenuItem>
										<MenuItem value="IN_TRANSIT">In Transit</MenuItem>
									</Select>
								</FormControl>

								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
									<TextField
										size="small"
										label="Current Location"
										name="currentLocation"
										value={formData.currentLocation}
										onChange={handleChange}
										placeholder="e.g., Los Angeles Port"
									/>
									<TextField
										size="small"
										type="number"
										label="Progress (%)"
										name="progress"
										value={formData.progress}
										onChange={handleChange}
										inputProps={{ min: 0, max: 100 }}
									/>
								</Box>

								<TextField
									fullWidth
									size="small"
									type="date"
									label="Estimated Delivery"
									name="estimatedDelivery"
									value={formData.estimatedDelivery}
									onChange={handleChange}
									InputLabelProps={{ shrink: true }}
								/>
							</Box>
						</DashboardPanel>

						{/* Vehicle Photos */}
						<DashboardPanel title="Vehicle Photos" description="Upload photos of the vehicle">
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								<Box
									component="label"
									htmlFor="vehicle-photo-input"
									sx={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										height: 120,
										border: '2px dashed',
										borderColor: 'divider',
										borderRadius: 2,
										cursor: uploading.state ? 'not-allowed' : 'pointer',
										bgcolor: 'action.hover',
										'&:hover': {
											bgcolor: 'action.selected',
											borderColor: 'primary.main',
										},
									}}
								>
									<input
										id="vehicle-photo-input"
										type="file"
										multiple
										accept="image/jpeg,image/jpg,image/png,image/webp"
										onChange={handlePhotoSelect('container')}
										style={{ display: 'none' }}
										disabled={uploading.state}
									/>
									{uploading.state && uploading.section === 'container' ? (
										<CircularProgress size={32} />
									) : (
										<>
											<Upload style={{ fontSize: 32, marginBottom: 8 }} />
											<Box sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
												Click to upload vehicle photos
											</Box>
											<Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
												PNG, JPG, WEBP (MAX. 5MB)
											</Box>
										</>
									)}
								</Box>

								{containerPhotos.length > 0 ? (
									<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
										{containerPhotos.map((photo, index) => (
											<Box
												key={index}
												sx={{
													position: 'relative',
													aspectRatio: '1',
													borderRadius: 1,
													overflow: 'hidden',
													'&:hover .delete-btn': { opacity: 1 },
												}}
											>
												<Image src={photo} alt={`Vehicle ${index + 1}`} fill className="object-cover" unoptimized />
												<Box
													className="delete-btn"
													onClick={() => removePhoto('container', index)}
													sx={{
														position: 'absolute',
														top: 8,
														right: 8,
														width: 28,
														height: 28,
														borderRadius: '50%',
														bgcolor: 'error.main',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														cursor: 'pointer',
														opacity: 0,
														transition: 'opacity 0.2s',
														'&:hover': { bgcolor: 'error.dark' },
													}}
												>
													<X style={{ fontSize: 16, color: 'white' }} />
												</Box>
											</Box>
										))}
									</Box>
								) : (
									<Box sx={{ fontSize: '0.875rem', color: 'text.secondary', textAlign: 'center', py: 2 }}>
										No photos uploaded yet
									</Box>
								)}
							</Box>
						</DashboardPanel>

						{/* Arrival Photos */}
						<DashboardPanel title="Arrival Photos" description="Photos taken upon delivery">
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								<Box
									component="label"
									htmlFor="arrival-photo-input"
									sx={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										height: 120,
										border: '2px dashed',
										borderColor: 'divider',
										borderRadius: 2,
										cursor: uploading.state ? 'not-allowed' : 'pointer',
										bgcolor: 'action.hover',
										'&:hover': {
											bgcolor: 'action.selected',
											borderColor: 'primary.main',
										},
									}}
								>
									<input
										id="arrival-photo-input"
										type="file"
										multiple
										accept="image/jpeg,image/jpg,image/png,image/webp"
										onChange={handlePhotoSelect('arrival')}
										style={{ display: 'none' }}
										disabled={uploading.state}
									/>
									{uploading.state && uploading.section === 'arrival' ? (
										<CircularProgress size={32} />
									) : (
										<>
											<Upload style={{ fontSize: 32, marginBottom: 8 }} />
											<Box sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
												Click to upload arrival photos
											</Box>
											<Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
												PNG, JPG, WEBP (MAX. 5MB)
											</Box>
										</>
									)}
								</Box>

								{arrivalPhotos.length > 0 ? (
									<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
										{arrivalPhotos.map((photo, index) => (
											<Box
												key={index}
												sx={{
													position: 'relative',
													aspectRatio: '1',
													borderRadius: 1,
													overflow: 'hidden',
													'&:hover .delete-btn': { opacity: 1 },
												}}
											>
												<Image src={photo} alt={`Arrival ${index + 1}`} fill className="object-cover" unoptimized />
												<Box
													className="delete-btn"
													onClick={() => removePhoto('arrival', index)}
													sx={{
														position: 'absolute',
														top: 8,
														right: 8,
														width: 28,
														height: 28,
														borderRadius: '50%',
														bgcolor: 'error.main',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														cursor: 'pointer',
														opacity: 0,
														transition: 'opacity 0.2s',
														'&:hover': { bgcolor: 'error.dark' },
													}}
												>
													<X style={{ fontSize: 16, color: 'white' }} />
												</Box>
											</Box>
										))}
									</Box>
								) : (
									<Box sx={{ fontSize: '0.875rem', color: 'text.secondary', textAlign: 'center', py: 2 }}>
										No arrival photos yet
									</Box>
								)}
							</Box>
						</DashboardPanel>

						{/* Financial Information */}
						<DashboardPanel title="Financial Information" description="Pricing and insurance details">
							<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
								<TextField
									size="small"
									type="number"
									label="Price (USD)"
									name="price"
									value={formData.price}
									onChange={handleChange}
									inputProps={{ step: '0.01' }}
									InputProps={{
										startAdornment: <InputAdornment position="start">$</InputAdornment>,
									}}
								/>
								<TextField
									size="small"
									type="number"
									label="Insurance Value (USD)"
									name="insuranceValue"
									value={formData.insuranceValue}
									onChange={handleChange}
									inputProps={{ step: '0.01' }}
									InputProps={{
										startAdornment: <InputAdornment position="start">$</InputAdornment>,
									}}
								/>
							</Box>
						</DashboardPanel>

						{/* Action Buttons */}
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
							<Link href={`/dashboard/shipments/${params.id}`} style={{ textDecoration: 'none' }}>
								<Button variant="outline" disabled={loading}>
									Cancel
								</Button>
							</Link>
							<Button type="submit" variant="primary" disabled={loading}>
								{loading ? 'Updating...' : 'Update Shipment'}
							</Button>
						</Box>
					</Box>
				</Box>
			</DashboardSurface>
		</ProtectedRoute>
	);
}
