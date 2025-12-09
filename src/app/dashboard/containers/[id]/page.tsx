'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
	Box, 
	Tabs, 
	Tab, 
	Table, 
	TableBody, 
	TableCell, 
	TableContainer, 
	TableHead, 
	TableRow,
	LinearProgress,
	Divider,
	Chip,
} from '@mui/material';
import {
	ArrowLeft,
	Package,
	Ship,
	Calendar,
	DollarSign,
	FileText,
	MapPin,
	TrendingUp,
	Download,
	Eye,
	Plus,
	Trash2,
	AlertTriangle,
	Copy,
	Printer,
} from 'lucide-react';
import { DashboardSurface, DashboardPanel, DashboardGrid } from '@/components/dashboard/DashboardSurface';
import { 
	PageHeader, 
	Button, 
	Breadcrumbs, 
	toast, 
	LoadingState, 
	EmptyState, 
	StatsCard,
	DashboardPageSkeleton, 
	DetailPageSkeleton, 
	FormPageSkeleton
} from '@/components/design-system';
import { AdminRoute } from '@/components/auth/AdminRoute';
import AddExpenseModal from '@/components/containers/AddExpenseModal';
import AddInvoiceModal from '@/components/containers/AddInvoiceModal';
import AddTrackingEventModal from '@/components/containers/AddTrackingEventModal';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface Shipment {
	id: string;
	vehicleMake: string | null;
	vehicleModel: string | null;
	vehicleVIN: string | null;
	status: string;
}

interface Expense {
	id: string;
	type: string;
	amount: number;
	currency: string;
	date: string;
	vendor: string | null;
}

interface Invoice {
	id: string;
	invoiceNumber: string;
	amount: number;
	currency: string;
	status: string;
	date: string;
}

interface Document {
	id: string;
	name: string;
	type: string;
	fileUrl: string;
	uploadedAt: string;
}

interface TrackingEvent {
	id: string;
	status: string;
	location: string | null;
	description: string | null;
	eventDate: string;
}

interface Container {
	id: string;
	containerNumber: string;
	trackingNumber: string | null;
	vesselName: string | null;
	voyageNumber: string | null;
	shippingLine: string | null;
	bookingNumber: string | null;
	loadingPort: string | null;
	destinationPort: string | null;
	transshipmentPorts: string[];
	loadingDate: string | null;
	departureDate: string | null;
	estimatedArrival: string | null;
	actualArrival: string | null;
	status: string;
	currentLocation: string | null;
	progress: number;
	maxCapacity: number;
	currentCount: number;
	notes: string | null;
	autoTrackingEnabled: boolean;
	createdAt: string;
	shipments: Shipment[];
	expenses: Expense[];
	invoices: Invoice[];
	documents: Document[];
	trackingEvents: TrackingEvent[];
	totals: {
		expenses: number;
		invoices: number;
	};
}

const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
	CREATED: { label: 'Created', color: 'default' },
	WAITING_FOR_LOADING: { label: 'Waiting for Loading', color: 'warning' },
	LOADED: { label: 'Loaded', color: 'info' },
	IN_TRANSIT: { label: 'In Transit', color: 'info' },
	ARRIVED_PORT: { label: 'Arrived at Port', color: 'success' },
	CUSTOMS_CLEARANCE: { label: 'Customs Clearance', color: 'warning' },
	RELEASED: { label: 'Released', color: 'success' },
	CLOSED: { label: 'Closed', color: 'default' },
};

export default function ContainerDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [container, setContainer] = useState<Container | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState(0);
	const [updating, setUpdating] = useState(false);
	const [expenseModalOpen, setExpenseModalOpen] = useState(false);
	const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
	const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
	const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);
	const [trackingModalOpen, setTrackingModalOpen] = useState(false);
	const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
	const [duplicating, setDuplicating] = useState(false);
	const [newContainerNumber, setNewContainerNumber] = useState('');

	useEffect(() => {
		if (params.id) {
			fetchContainer();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.id]);

	const fetchContainer = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/containers/${params.id}`);
			const data = await response.json();

			if (response.ok) {
				const containerData = data.container;
				// Ensure trackingEvents is an array
				if (!containerData.trackingEvents) {
					containerData.trackingEvents = [];
				}
				// Ensure progress is a number
				if (typeof containerData.progress !== 'number') {
					containerData.progress = 0;
				}
				setContainer(containerData);
				console.log('Container loaded:', {
					id: containerData.id,
					trackingEvents: containerData.trackingEvents.length,
					progress: containerData.progress
				});
			} else {
				toast.error('Container not found');
				router.push('/dashboard/containers');
			}
		} catch (error) {
			console.error('Error fetching container:', error);
			toast.error('Failed to load container');
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (newStatus: string) => {
		if (!container) return;
		
		try {
			setUpdating(true);
			const response = await fetch(`/api/containers/${params.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			});

			if (response.ok) {
				toast.success('Status updated successfully');
				fetchContainer();
			} else {
				const data = await response.json();
				toast.error(data.error || 'Failed to update status');
			}
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('An error occurred');
		} finally {
			setUpdating(false);
		}
	};

	const handleDeleteExpense = async (expenseId: string) => {
		if (!confirm('Are you sure you want to delete this expense?')) return;

		setDeletingExpenseId(expenseId);
		try {
			const response = await fetch(`/api/containers/${params.id}/expenses?expenseId=${expenseId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('Expense deleted successfully');
				fetchContainer();
			} else {
				const data = await response.json();
				toast.error(data.error || 'Failed to delete expense');
			}
		} catch (error) {
			console.error('Error deleting expense:', error);
			toast.error('An error occurred');
		} finally {
			setDeletingExpenseId(null);
		}
	};

	const handleDeleteInvoice = async (invoiceId: string) => {
		if (!confirm('Are you sure you want to delete this invoice?')) return;

		setDeletingInvoiceId(invoiceId);
		try {
			const response = await fetch(`/api/containers/${params.id}/invoices?invoiceId=${invoiceId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('Invoice deleted successfully');
				fetchContainer();
			} else {
				const data = await response.json();
				toast.error(data.error || 'Failed to delete invoice');
			}
		} catch (error) {
			console.error('Error deleting invoice:', error);
			toast.error('An error occurred');
		} finally {
			setDeletingInvoiceId(null);
		}
	};

	const handleDeleteTrackingEvent = async (eventId: string) => {
		if (!confirm('Are you sure you want to delete this tracking event?')) return;

		setDeletingEventId(eventId);
		try {
			const response = await fetch(`/api/containers/${params.id}/tracking?eventId=${eventId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('Tracking event deleted successfully');
				fetchContainer();
			} else {
				const data = await response.json();
				toast.error(data.error || 'Failed to delete tracking event');
			}
		} catch (error) {
			console.error('Error deleting tracking event:', error);
			toast.error('An error occurred');
		} finally {
			setDeletingEventId(null);
		}
	};

	const handleDeleteContainer = async () => {
		if (!container) return;

		setDeleting(true);
		try {
			const response = await fetch(`/api/containers/${params.id}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (response.ok) {
				toast.success('Container deleted successfully', {
					description: 'Redirecting to containers list...'
				});
				setTimeout(() => {
					router.push('/dashboard/containers');
				}, 1000);
			} else {
				toast.error('Failed to delete container', {
					description: data.error || 'Please try again'
				});
			}
		} catch (error) {
			console.error('Error deleting container:', error);
			toast.error('An error occurred', {
				description: 'Please try again later'
			});
		} finally {
			setDeleting(false);
			setDeleteModalOpen(false);
		}
	};

	const handleDuplicateContainer = async () => {
		if (!container || !newContainerNumber.trim()) {
			toast.error('Please enter a container number');
			return;
		}

		setDuplicating(true);
		try {
			// Create new container with same details but new number
			const payload = {
				containerNumber: newContainerNumber.trim(),
				trackingNumber: container.trackingNumber,
				vesselName: container.vesselName,
				voyageNumber: container.voyageNumber,
				shippingLine: container.shippingLine,
				bookingNumber: '', // Don't copy booking number
				loadingPort: container.loadingPort,
				destinationPort: container.destinationPort,
				transshipmentPorts: container.transshipmentPorts,
				loadingDate: container.loadingDate,
				departureDate: container.departureDate,
				estimatedArrival: container.estimatedArrival,
				maxCapacity: container.maxCapacity,
				notes: container.notes,
				autoTrackingEnabled: container.autoTrackingEnabled,
			};

			const response = await fetch('/api/containers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success('Container duplicated successfully!', {
					description: 'Redirecting to new container...'
				});
				setTimeout(() => {
					router.push(`/dashboard/containers/${data.container.id}`);
				}, 1000);
			} else {
				toast.error('Failed to duplicate container', {
					description: data.error || 'Please try again'
				});
			}
		} catch (error) {
			console.error('Error duplicating container:', error);
			toast.error('An error occurred', {
				description: 'Please try again later'
			});
		} finally {
			setDuplicating(false);
			setDuplicateModalOpen(false);
		}
	};

	const handlePrint = () => {
		window.print();
	};

	const formatCurrency = (amount: number, currency: string = 'USD') => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
		}).format(amount);
	};

	const formatDate = (date: string | null) => {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	if (loading) {
		return (
			<AdminRoute>
				<DetailPageSkeleton />
			</AdminRoute>
		);
	}

	if (!container) {
		return (
			<AdminRoute>
				<DashboardSurface>
					<EmptyState
						icon={<Package className="w-12 h-12" />}
						title="Container Not Found"
						description="The container you're looking for doesn't exist"
						action={
							<Button 
								variant="primary" 
								onClick={() => router.push('/dashboard/containers')}
							>
								Back to Containers
							</Button>
						}
					/>
				</DashboardSurface>
			</AdminRoute>
		);
	}

	const capacityPercentage = (container.currentCount / container.maxCapacity) * 100;
	const netProfit = container.totals.invoices - container.totals.expenses;

	return (
		<AdminRoute>
			<DashboardSurface>
				{/* Breadcrumbs */}
				<Box sx={{ px: 2, pt: 2 }}>
					<Breadcrumbs />
				</Box>

				{/* Page Header */}
				<PageHeader
					title={container.containerNumber}
					description={container.trackingNumber ? `Tracking: ${container.trackingNumber}` : 'Container details and management'}
					actions={
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
							<Chip 
								label={statusConfig[container.status]?.label || container.status}
								color={statusConfig[container.status]?.color || 'default'}
								sx={{ fontWeight: 600 }}
								className="no-print"
							/>
							<Button 
								variant="outline" 
								size="sm" 
								icon={<Copy className="w-4 h-4" />}
								onClick={() => {
									setNewContainerNumber('');
									setDuplicateModalOpen(true);
								}}
								className="no-print"
							>
								Duplicate
							</Button>
							<Button 
								variant="outline" 
								size="sm" 
								icon={<Printer className="w-4 h-4" />}
								onClick={handlePrint}
								className="no-print"
							>
								Print
							</Button>
							<Button 
								variant="outline" 
								size="sm" 
								icon={<Trash2 className="w-4 h-4" />}
								onClick={() => setDeleteModalOpen(true)}
								sx={{
									borderColor: 'var(--error)',
									color: 'var(--error)',
									'&:hover': {
										bgcolor: 'rgba(var(--error-rgb), 0.1)',
										borderColor: 'var(--error)',
									}
								}}
								className="no-print"
							>
								Delete
							</Button>
							<Link href="/dashboard/containers" style={{ textDecoration: 'none' }}>
								<Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="no-print">
									Back
								</Button>
							</Link>
						</Box>
					}
				/>

				{/* Stats Overview */}
				<Box sx={{ px: 2, mb: 3 }}>
					<DashboardGrid className="grid-cols-1 md:grid-cols-4">
						<StatsCard
							icon={<Package style={{ fontSize: 18 }} />}
							title="Capacity"
							value={`${container.currentCount}/${container.maxCapacity}`}
							variant="info"
							size="md"
						/>
						<StatsCard
							icon={<DollarSign style={{ fontSize: 18 }} />}
							title="Net Profit"
							value={formatCurrency(netProfit)}
							variant={netProfit >= 0 ? 'success' : 'error'}
							size="md"
						/>
						<StatsCard
							icon={<TrendingUp style={{ fontSize: 18 }} />}
							title="Progress"
							value={`${container.progress}%`}
							variant="default"
							size="md"
						/>
						<StatsCard
							icon={<Ship style={{ fontSize: 18 }} />}
							title="Status"
							value={statusConfig[container.status]?.label || container.status}
							variant={statusConfig[container.status]?.color || 'default'}
							size="md"
						/>
					</DashboardGrid>
				</Box>

				{/* Progress Bar */}
				{container.progress > 0 && (
					<Box sx={{ px: 2, mb: 3 }}>
						<DashboardPanel noHeaderBorder>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
									Shipping Progress
								</Box>
								<Box sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
									{container.progress}%
								</Box>
							</Box>
							<LinearProgress 
								variant="determinate" 
								value={container.progress} 
								sx={{
									height: 8,
									borderRadius: 1,
									bgcolor: 'rgba(201, 155, 47, 0.1)',
									'& .MuiLinearProgress-bar': {
										bgcolor: 'var(--accent-gold)',
									},
								}}
							/>
						</DashboardPanel>
					</Box>
				)}

				{/* Tabs */}
				<Box sx={{ px: 2, mb: 2 }}>
					<Tabs 
						value={activeTab} 
						onChange={(_, newValue) => setActiveTab(newValue)}
						sx={{
							borderBottom: 1,
							borderColor: 'divider',
							'& .MuiTab-root': {
								textTransform: 'none',
								fontWeight: 600,
								fontSize: '0.875rem',
							},
						}}
					>
						<Tab label="Overview" />
						<Tab label={`Shipments (${container.shipments.length})`} />
						<Tab label={`Expenses (${container.expenses.length})`} />
						<Tab label={`Invoices (${container.invoices.length})`} />
						<Tab label={`Documents (${container.documents.length})`} />
						<Tab label={`Tracking (${container.trackingEvents?.length || 0})`} />
					</Tabs>
				</Box>

				{/* Tab Content */}
				<Box sx={{ px: 2, pb: 4 }}>
					{/* Overview Tab */}
					{activeTab === 0 && (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
							<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
								{/* Container Information */}
								<DashboardPanel 
									title="Container Information"
									description="Basic container details"
								>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Container Number</Box>
											<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
												{container.containerNumber}
											</Box>
										</Box>
										{container.trackingNumber && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tracking Number</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{container.trackingNumber}
												</Box>
											</Box>
										)}
										{container.bookingNumber && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Booking Number</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{container.bookingNumber}
												</Box>
											</Box>
										)}
										<Divider sx={{ borderColor: 'var(--border)' }} />
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Capacity</Box>
											<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
												{container.currentCount} / {container.maxCapacity} vehicles ({capacityPercentage.toFixed(0)}%)
											</Box>
										</Box>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Created</Box>
											<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
												{formatDate(container.createdAt)}
											</Box>
										</Box>
									</Box>
								</DashboardPanel>

								{/* Shipping Details */}
								<DashboardPanel 
									title="Shipping Details"
									description="Vessel and shipping information"
								>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
										{container.vesselName && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vessel Name</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{container.vesselName}
												</Box>
											</Box>
										)}
										{container.voyageNumber && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Voyage Number</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{container.voyageNumber}
												</Box>
											</Box>
										)}
										{container.shippingLine && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Shipping Line</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{container.shippingLine}
												</Box>
											</Box>
										)}
										<Divider sx={{ borderColor: 'var(--border)' }} />
										{container.loadingPort && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading Port</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{container.loadingPort}
												</Box>
											</Box>
										)}
										{container.destinationPort && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Destination Port</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{container.destinationPort}
												</Box>
											</Box>
										)}
										{container.currentLocation && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current Location</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{container.currentLocation}
												</Box>
											</Box>
										)}
									</Box>
								</DashboardPanel>

								{/* Important Dates */}
								<DashboardPanel 
									title="Important Dates"
									description="Shipping timeline"
								>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
										{container.loadingDate && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading Date</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{formatDate(container.loadingDate)}
												</Box>
											</Box>
										)}
										{container.departureDate && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Departure Date</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{formatDate(container.departureDate)}
												</Box>
											</Box>
										)}
										{container.estimatedArrival && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Estimated Arrival</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{formatDate(container.estimatedArrival)}
												</Box>
											</Box>
										)}
										{container.actualArrival && (
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Actual Arrival</Box>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{formatDate(container.actualArrival)}
												</Box>
											</Box>
										)}
									</Box>
								</DashboardPanel>

								{/* Financial Summary */}
								<DashboardPanel 
									title="Financial Summary"
									description="Revenue and expenses"
								>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Expenses</Box>
											<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--error)' }}>
												{formatCurrency(container.totals.expenses)}
											</Box>
										</Box>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Revenue</Box>
											<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
												{formatCurrency(container.totals.invoices)}
											</Box>
										</Box>
										<Divider sx={{ borderColor: 'var(--border)' }} />
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Box sx={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Net Profit</Box>
											<Box sx={{ 
												fontSize: '1rem', 
												fontWeight: 700, 
												color: netProfit >= 0 ? 'var(--success)' : 'var(--error)' 
											}}>
												{formatCurrency(netProfit)}
											</Box>
										</Box>
									</Box>
								</DashboardPanel>
							</Box>

							{/* Notes */}
							{container.notes && (
								<DashboardPanel title="Notes" description="Additional information">
									<Box sx={{ 
										fontSize: '0.875rem', 
										color: 'var(--text-secondary)', 
										lineHeight: 1.6,
										whiteSpace: 'pre-wrap',
									}}>
										{container.notes}
									</Box>
								</DashboardPanel>
							)}

							{/* Status Management */}
							<DashboardPanel 
								title="Update Container Status"
								description="Change the container's current status"
							>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
									{Object.entries(statusConfig).map(([status, config]) => (
										<Button
											key={status}
											variant={container.status === status ? 'primary' : 'outline'}
											size="sm"
											onClick={() => handleStatusUpdate(status)}
											disabled={updating || container.status === status}
										>
											{config.label}
										</Button>
									))}
								</Box>
							</DashboardPanel>
						</Box>
					)}

					{/* Shipments Tab */}
					{activeTab === 1 && (
						<DashboardPanel
							title={`Assigned Vehicles (${container.currentCount}/${container.maxCapacity})`}
							description="Vehicles currently loaded in this container"
						>
							{container.shipments.length === 0 ? (
								<EmptyState
									icon={<Package className="w-12 h-12" />}
									title="No Vehicles Assigned"
									description="This container doesn't have any vehicles assigned yet"
								/>
							) : (
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>VIN</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
												<TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
												<TableCell sx={{ fontWeight: 600 }} align="right">Insurance</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
												<TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{container.shipments.map((shipment) => (
												<TableRow 
													key={shipment.id}
													hover
													sx={{ cursor: 'pointer' }}
													onClick={() => router.push(`/dashboard/shipments/${shipment.id}`)}
												>
													<TableCell>
														{shipment.vehicleMake} {shipment.vehicleModel}
													</TableCell>
													<TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
														{shipment.vehicleVIN || 'N/A'}
													</TableCell>
													<TableCell>
														<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
															{(shipment as any).paymentMode && (
																<Chip 
																	label={(shipment as any).paymentMode} 
																	size="small"
																	color={(shipment as any).paymentMode === 'CASH' ? 'success' : 'warning'}
																	sx={{ fontSize: '0.7rem', width: 'fit-content' }}
																/>
															)}
															<Chip 
																label={(shipment as any).paymentStatus || 'PENDING'} 
																size="small"
																color={(shipment as any).paymentStatus === 'COMPLETED' ? 'success' : 'default'}
																sx={{ fontSize: '0.7rem', width: 'fit-content' }}
															/>
														</Box>
													</TableCell>
													<TableCell align="right" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
														{(shipment as any).price ? formatCurrency((shipment as any).price) : 'N/A'}
													</TableCell>
													<TableCell align="right" sx={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
														{(shipment as any).insuranceValue ? formatCurrency((shipment as any).insuranceValue) : 'N/A'}
													</TableCell>
													<TableCell>
														<Chip 
															label={shipment.status} 
															size="small"
															color="primary"
															sx={{ fontSize: '0.75rem' }}
														/>
													</TableCell>
													<TableCell align="right">
														<Button
															variant="outline"
															size="sm"
															icon={<Eye className="w-3 h-3" />}
															onClick={(e) => {
																e.stopPropagation();
																router.push(`/dashboard/shipments/${shipment.id}`);
															}}
														>
															View
														</Button>
													</TableCell>
												</TableRow>
											))}
											{/* Totals Row */}
											<TableRow sx={{ bgcolor: 'var(--surface)' }}>
												<TableCell colSpan={3} sx={{ fontWeight: 700, borderTop: '2px solid var(--border)' }}>
													Total Revenue from Shipments
												</TableCell>
												<TableCell align="right" sx={{ fontWeight: 700, borderTop: '2px solid var(--border)', color: 'var(--success)' }}>
													{formatCurrency(container.shipments.reduce((sum, s) => sum + ((s as any).price || 0), 0))}
												</TableCell>
												<TableCell align="right" sx={{ fontWeight: 700, borderTop: '2px solid var(--border)', color: 'var(--accent-gold)' }}>
													{formatCurrency(container.shipments.reduce((sum, s) => sum + ((s as any).insuranceValue || 0), 0))}
												</TableCell>
												<TableCell colSpan={2} sx={{ borderTop: '2px solid var(--border)' }}></TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</TableContainer>
							)}
						</DashboardPanel>
					)}

					{/* Expenses Tab */}
					{activeTab === 2 && (
						<DashboardPanel
							title="Container Expenses"
							description="All costs and expenses for this container"
						>
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
								<Button
									variant="primary"
									size="sm"
									icon={<Plus className="w-4 h-4" />}
									onClick={() => setExpenseModalOpen(true)}
								>
									Add Expense
								</Button>
							</Box>

							{container.expenses.length === 0 ? (
								<EmptyState
									icon={<DollarSign className="w-12 h-12" />}
									title="No Expenses Recorded"
									description="No expenses have been added to this container yet"
								/>
							) : (
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
												<TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
												<TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{container.expenses.map((expense) => (
												<TableRow key={expense.id} hover>
													<TableCell>{expense.type}</TableCell>
													<TableCell>{expense.vendor || 'N/A'}</TableCell>
													<TableCell>{formatDate(expense.date)}</TableCell>
													<TableCell align="right" sx={{ fontWeight: 600, color: 'var(--error)' }}>
														{formatCurrency(expense.amount, expense.currency)}
													</TableCell>
													<TableCell align="right">
														<Button
															variant="outline"
															size="sm"
															icon={<Trash2 className="w-3 h-3" />}
															onClick={() => handleDeleteExpense(expense.id)}
															disabled={deletingExpenseId === expense.id}
															sx={{ 
																color: 'var(--error)',
																borderColor: 'var(--error)',
																'&:hover': { bgcolor: 'rgba(var(--error-rgb), 0.1)' }
															}}
														>
															{deletingExpenseId === expense.id ? 'Deleting...' : 'Delete'}
														</Button>
													</TableCell>
												</TableRow>
											))}
											<TableRow>
												<TableCell colSpan={4} sx={{ fontWeight: 700 }}>Total Expenses</TableCell>
												<TableCell align="right" sx={{ fontWeight: 700, color: 'var(--error)' }}>
													{formatCurrency(container.totals.expenses)}
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</TableContainer>
							)}
						</DashboardPanel>
					)}

					{/* Invoices Tab */}
					{activeTab === 3 && (
						<DashboardPanel
							title="Container Invoices"
							description="Billing and revenue for this container"
						>
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
								<Button
									variant="primary"
									size="sm"
									icon={<Plus className="w-4 h-4" />}
									onClick={() => setInvoiceModalOpen(true)}
								>
									Create Invoice
								</Button>
							</Box>

							{container.invoices.length === 0 ? (
								<EmptyState
									icon={<FileText className="w-12 h-12" />}
									title="No Invoices"
									description="No invoices have been created for this container yet"
								/>
							) : (
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
												<TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
												<TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{container.invoices.map((invoice) => (
												<TableRow key={invoice.id} hover>
													<TableCell sx={{ fontFamily: 'monospace' }}>{invoice.invoiceNumber}</TableCell>
													<TableCell>{formatDate(invoice.date)}</TableCell>
													<TableCell>
														<Chip 
															label={invoice.status} 
															size="small"
															color={invoice.status === 'PAID' ? 'success' : 'default'}
															sx={{ fontSize: '0.75rem' }}
														/>
													</TableCell>
													<TableCell align="right" sx={{ fontWeight: 600, color: 'var(--success)' }}>
														{formatCurrency(invoice.amount, invoice.currency)}
													</TableCell>
													<TableCell align="right">
														<Button
															variant="outline"
															size="sm"
															icon={<Trash2 className="w-3 h-3" />}
															onClick={() => handleDeleteInvoice(invoice.id)}
															disabled={deletingInvoiceId === invoice.id}
															sx={{ 
																color: 'var(--error)',
																borderColor: 'var(--error)',
																'&:hover': { bgcolor: 'rgba(var(--error-rgb), 0.1)' }
															}}
														>
															{deletingInvoiceId === invoice.id ? 'Deleting...' : 'Delete'}
														</Button>
													</TableCell>
												</TableRow>
											))}
											<TableRow>
												<TableCell colSpan={4} sx={{ fontWeight: 700 }}>Total Revenue</TableCell>
												<TableCell align="right" sx={{ fontWeight: 700, color: 'var(--success)' }}>
													{formatCurrency(container.totals.invoices)}
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</TableContainer>
							)}
						</DashboardPanel>
					)}

					{/* Documents Tab */}
					{activeTab === 4 && (
						<DashboardPanel
							title="Container Documents"
							description="Files and documents related to this container"
						>
							{container.documents.length === 0 ? (
								<EmptyState
									icon={<FileText className="w-12 h-12" />}
									title="No Documents"
									description="No documents have been uploaded for this container yet"
								/>
							) : (
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
												<TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
												<TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{container.documents.map((doc) => (
												<TableRow key={doc.id} hover>
													<TableCell>{doc.name}</TableCell>
													<TableCell>
														<Chip label={doc.type} size="small" sx={{ fontSize: '0.75rem' }} />
													</TableCell>
													<TableCell>{formatDate(doc.uploadedAt)}</TableCell>
													<TableCell align="right">
														<Button
															variant="outline"
															size="sm"
															icon={<Download className="w-3 h-3" />}
															onClick={() => window.open(doc.fileUrl, '_blank')}
														>
															Download
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							)}
						</DashboardPanel>
					)}

					{/* Tracking Tab */}
					{activeTab === 5 && (
						<DashboardPanel
							title="Tracking History"
							description="Location updates and status changes"
						>
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
								<Button
									variant="primary"
									size="sm"
									icon={<Plus className="w-4 h-4" />}
									onClick={() => setTrackingModalOpen(true)}
								>
									Add Tracking Event
								</Button>
							</Box>

							{(!container.trackingEvents || container.trackingEvents.length === 0) ? (
								<EmptyState
									icon={<MapPin className="w-12 h-12" />}
									title="No Tracking Events"
									description="No tracking updates have been recorded yet"
								/>
							) : (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
									{container.trackingEvents.map((event, index) => (
										<Box 
											key={event.id}
											sx={{ 
												position: 'relative',
												pl: 4,
												borderLeft: index < container.trackingEvents.length - 1 ? '2px solid var(--border)' : 'none',
												pb: index < container.trackingEvents.length - 1 ? 3 : 0,
											}}
										>
											<Box
												sx={{
													position: 'absolute',
													left: -9,
													top: 0,
													width: 16,
													height: 16,
													borderRadius: '50%',
													bgcolor: (event as any).completed ? 'var(--success)' : 'var(--accent-gold)',
													border: '2px solid var(--background)',
												}}
											/>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'start' }}>
												<Box>
													<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
														{event.status}
													</Box>
													{(event as any).vesselName && (
														<Box sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)', mt: 0.5 }}>
															🚢 {(event as any).vesselName}
														</Box>
													)}
												</Box>
												<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
													<Box sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
														{new Date(event.eventDate).toLocaleString()}
													</Box>
													<Button
														variant="outline"
														size="sm"
														icon={<Trash2 className="w-3 h-3" />}
														onClick={() => handleDeleteTrackingEvent(event.id)}
														disabled={deletingEventId === event.id}
														sx={{ 
															color: 'var(--error)',
															borderColor: 'var(--error)',
															'&:hover': { bgcolor: 'rgba(var(--error-rgb), 0.1)' },
															minWidth: 'auto',
															px: 1,
														}}
													/>
												</Box>
											</Box>
											{event.location && (
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', mb: 0.5 }}>
													📍 {event.location}
												</Box>
											)}
											{event.description && (
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', mb: 0.5 }}>
													{event.description}
												</Box>
											)}
											{(event as any).source && (
												<Box sx={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
													Source: {(event as any).source}
												</Box>
											)}
										</Box>
									))}
								</Box>
							)}
						</DashboardPanel>
					)}
				</Box>

				{/* Add Expense Modal */}
				<AddExpenseModal
					open={expenseModalOpen}
					onClose={() => setExpenseModalOpen(false)}
					containerId={container.id}
					onSuccess={fetchContainer}
				/>

				{/* Add Invoice Modal */}
				<AddInvoiceModal
					open={invoiceModalOpen}
					onClose={() => setInvoiceModalOpen(false)}
					containerId={container.id}
					onSuccess={fetchContainer}
				/>

				{/* Add Tracking Event Modal */}
				<AddTrackingEventModal
					open={trackingModalOpen}
					onClose={() => setTrackingModalOpen(false)}
					containerId={container.id}
					onSuccess={fetchContainer}
				/>

				{/* Duplicate Container Modal */}
				<Dialog
					open={duplicateModalOpen}
					onClose={() => !duplicating && setDuplicateModalOpen(false)}
					maxWidth="sm"
					fullWidth
					PaperProps={{
						sx: {
							bgcolor: 'var(--panel)',
							backgroundImage: 'none',
							border: '1px solid var(--border)',
							borderRadius: 2,
						}
					}}
				>
					<DialogTitle
						sx={{
							color: 'var(--text-primary)',
							fontWeight: 700,
							fontSize: '1.25rem',
							borderBottom: '1px solid var(--border)',
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
						}}
					>
						<Box
							sx={{
								width: 40,
								height: 40,
								borderRadius: '50%',
								bgcolor: 'rgba(var(--accent-gold-rgb), 0.1)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Copy className="w-5 h-5" style={{ color: 'var(--accent-gold)' }} />
						</Box>
						Duplicate Container
					</DialogTitle>
					<DialogContent sx={{ py: 3 }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<Box sx={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
								Create a copy of container <strong>{container.containerNumber}</strong> with all settings.
							</Box>
							
							<Box
								sx={{
									p: 2,
									borderRadius: 1,
									bgcolor: 'rgba(99, 102, 241, 0.1)',
									border: '1px solid rgba(99, 102, 241, 0.3)',
								}}
							>
								<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
									<strong style={{ color: 'var(--text-primary)' }}>What will be copied:</strong>
								</Box>
								<Box component="ul" sx={{ mt: 1, pl: 2.5, fontSize: '0.875rem', color: 'var(--text-secondary)', '& li': { mb: 0.5 } }}>
									<li>Vessel and voyage information</li>
									<li>Shipping line and ports</li>
									<li>Dates and capacity settings</li>
									<li>Notes and preferences</li>
								</Box>
								<Box sx={{ mt: 1.5, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
									<strong style={{ color: 'var(--text-primary)' }}>What won't be copied:</strong>
								</Box>
								<Box component="ul" sx={{ mt: 0.5, pl: 2.5, fontSize: '0.875rem', color: 'var(--text-secondary)', '& li': { mb: 0.5 } }}>
									<li>Assigned shipments</li>
									<li>Expenses and invoices</li>
									<li>Documents and tracking events</li>
									<li>Booking number</li>
								</Box>
							</Box>

							<Box>
								<Box
									component="label"
									sx={{
										display: 'block',
										fontSize: '0.875rem',
										fontWeight: 600,
										color: 'var(--text-primary)',
										mb: 1,
									}}
								>
									New Container Number <span style={{ color: 'var(--error)' }}>*</span>
								</Box>
								<input
									type="text"
									value={newContainerNumber}
									onChange={(e) => setNewContainerNumber(e.target.value)}
									placeholder="e.g., ABCU9876543"
									disabled={duplicating}
									style={{
										width: '100%',
										padding: '10px 12px',
										borderRadius: '8px',
										border: '1px solid var(--border)',
										backgroundColor: 'var(--background)',
										color: 'var(--text-primary)',
										fontSize: '0.95rem',
									}}
									autoFocus
								/>
							</Box>
						</Box>
					</DialogContent>
					<DialogActions
						sx={{
							px: 3,
							py: 2,
							borderTop: '1px solid var(--border)',
							gap: 1,
						}}
					>
						<Button
							variant="outline"
							onClick={() => setDuplicateModalOpen(false)}
							disabled={duplicating}
							sx={{
								color: 'var(--text-secondary)',
								borderColor: 'var(--border)',
								'&:hover': {
									bgcolor: 'var(--background)',
								}
							}}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleDuplicateContainer}
							disabled={duplicating || !newContainerNumber.trim()}
							sx={{
								bgcolor: 'var(--accent-gold)',
								color: 'white',
								'&:hover': {
									bgcolor: 'var(--accent-gold)',
									opacity: 0.9,
								},
								'&:disabled': {
									opacity: 0.5,
									cursor: 'not-allowed',
								}
							}}
						>
							{duplicating ? (
								<>
									<Box
										component="span"
										sx={{
											display: 'inline-block',
											width: 16,
											height: 16,
											mr: 1,
											border: '2px solid white',
											borderTopColor: 'transparent',
											borderRadius: '50%',
											animation: 'spin 0.6s linear infinite',
											'@keyframes spin': {
												'0%': { transform: 'rotate(0deg)' },
												'100%': { transform: 'rotate(360deg)' },
											},
										}}
									/>
									Duplicating...
								</>
							) : (
								<>
									<Copy className="w-4 h-4 mr-2" />
									Duplicate Container
								</>
							)}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Delete Confirmation Modal */}
				<Dialog
					open={deleteModalOpen}
					onClose={() => !deleting && setDeleteModalOpen(false)}
					maxWidth="sm"
					fullWidth
					PaperProps={{
						sx: {
							bgcolor: 'var(--panel)',
							backgroundImage: 'none',
							border: '1px solid var(--border)',
							borderRadius: 2,
						}
					}}
				>
					<DialogTitle
						sx={{
							color: 'var(--text-primary)',
							fontWeight: 700,
							fontSize: '1.25rem',
							borderBottom: '1px solid var(--border)',
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
						}}
					>
						<Box
							sx={{
								width: 40,
								height: 40,
								borderRadius: '50%',
								bgcolor: 'rgba(var(--error-rgb), 0.1)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<AlertTriangle className="w-5 h-5" style={{ color: 'var(--error)' }} />
						</Box>
						Delete Container
					</DialogTitle>
					<DialogContent sx={{ py: 3 }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<Box sx={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
								Are you sure you want to delete container <strong>{container.containerNumber}</strong>?
							</Box>
							
							{container.shipments.length > 0 && (
								<Box
									sx={{
										p: 2,
										borderRadius: 1,
										bgcolor: 'rgba(var(--error-rgb), 0.1)',
										border: '1px solid rgba(var(--error-rgb), 0.3)',
									}}
								>
									<Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
										<AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
										<Box>
											<Box sx={{ fontWeight: 600, color: 'var(--error)', fontSize: '0.875rem', mb: 0.5 }}>
												Warning: Container has {container.shipments.length} assigned shipment{container.shipments.length !== 1 ? 's' : ''}
											</Box>
											<Box sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
												You must remove all shipments from this container before deleting it.
											</Box>
										</Box>
									</Box>
								</Box>
							)}

							{container.shipments.length === 0 && (
								<Box
									sx={{
										p: 2,
										borderRadius: 1,
										bgcolor: 'rgba(251, 191, 36, 0.1)',
										border: '1px solid rgba(251, 191, 36, 0.3)',
									}}
								>
									<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
										<strong style={{ color: 'var(--text-primary)' }}>This action cannot be undone.</strong> This will permanently delete:
									</Box>
									<Box component="ul" sx={{ mt: 1, pl: 2.5, fontSize: '0.875rem', color: 'var(--text-secondary)', '& li': { mb: 0.5 } }}>
										<li>Container details and tracking information</li>
										<li>All tracking events ({container.trackingEvents?.length || 0} events)</li>
										<li>All expenses ({container.expenses.length} expenses)</li>
										<li>All invoices ({container.invoices.length} invoices)</li>
										<li>All documents ({container.documents.length} documents)</li>
										<li>All audit logs</li>
									</Box>
								</Box>
							)}
						</Box>
					</DialogContent>
					<DialogActions
						sx={{
							px: 3,
							py: 2,
							borderTop: '1px solid var(--border)',
							gap: 1,
						}}
					>
						<Button
							variant="outline"
							onClick={() => setDeleteModalOpen(false)}
							disabled={deleting}
							sx={{
								color: 'var(--text-secondary)',
								borderColor: 'var(--border)',
								'&:hover': {
									bgcolor: 'var(--background)',
								}
							}}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleDeleteContainer}
							disabled={deleting || container.shipments.length > 0}
							sx={{
								bgcolor: 'var(--error)',
								color: 'white',
								'&:hover': {
									bgcolor: 'var(--error)',
									opacity: 0.9,
								},
								'&:disabled': {
									opacity: 0.5,
									cursor: 'not-allowed',
								}
							}}
						>
							{deleting ? (
								<>
									<Box
										component="span"
										sx={{
											display: 'inline-block',
											width: 16,
											height: 16,
											mr: 1,
											border: '2px solid white',
											borderTopColor: 'transparent',
											borderRadius: '50%',
											animation: 'spin 0.6s linear infinite',
											'@keyframes spin': {
												'0%': { transform: 'rotate(0deg)' },
												'100%': { transform: 'rotate(360deg)' },
											},
										}}
									/>
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete Container
								</>
							)}
						</Button>
					</DialogActions>
				</Dialog>
			</DashboardSurface>
		</AdminRoute>
	);
}
