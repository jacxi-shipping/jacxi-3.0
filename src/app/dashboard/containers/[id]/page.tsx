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
} from '@/components/design-system';
import { AdminRoute } from '@/components/auth/AdminRoute';

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
				setContainer(data.container);
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
				<LoadingState fullScreen message="Loading container details..." />
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
						<Box sx={{ display: 'flex', gap: 1 }}>
							<Chip 
								label={statusConfig[container.status]?.label || container.status}
								color={statusConfig[container.status]?.color || 'default'}
								sx={{ fontWeight: 600 }}
							/>
							<Link href="/dashboard/containers" style={{ textDecoration: 'none' }}>
								<Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
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
						<Tab label={`Tracking (${container.trackingEvents.length})`} />
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
														<Chip 
															label={shipment.status} 
															size="small"
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
												</TableRow>
											))}
											<TableRow>
												<TableCell colSpan={3} sx={{ fontWeight: 700 }}>Total Expenses</TableCell>
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
												</TableRow>
											))}
											<TableRow>
												<TableCell colSpan={3} sx={{ fontWeight: 700 }}>Total Revenue</TableCell>
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
							{container.trackingEvents.length === 0 ? (
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
													bgcolor: 'var(--accent-gold)',
													border: '2px solid var(--background)',
												}}
											/>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
												<Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
													{event.status}
												</Box>
												<Box sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
													{new Date(event.eventDate).toLocaleString()}
												</Box>
											</Box>
											{event.location && (
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', mb: 0.5 }}>
													📍 {event.location}
												</Box>
											)}
											{event.description && (
												<Box sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
													{event.description}
												</Box>
											)}
										</Box>
									))}
								</Box>
							)}
						</DashboardPanel>
					)}
				</Box>
			</DashboardSurface>
		</AdminRoute>
	);
}
