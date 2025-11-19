'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Add, Inventory2, TrendingUp, LocalShipping, LocationOn } from '@mui/icons-material';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import StatsCard from '@/components/dashboard/StatsCard';
import ShipmentCard from '@/components/dashboard/ShipmentCard';
import QuickActions from '@/components/dashboard/QuickActions';
import Section from '@/components/layout/Section';

interface Shipment {
	id: string;
	trackingNumber: string;
	status: string;
	origin: string;
	destination: string;
	progress: number;
	estimatedDelivery: string | null;
}

export default function DashboardPage() {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(true);
	const [shipments, setShipments] = useState<Shipment[]>([]);
	const [stats, setStats] = useState({
		active: 0,
		total: 0,
		inTransit: 0,
		delivered: 0,
	});

	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/shipments?limit=100');
			if (!response.ok) {
				setShipments([]);
				setStats({
					active: 0,
					total: 0,
					inTransit: 0,
					delivered: 0,
				});
				return;
			}

			const data = (await response.json()) as { shipments?: Shipment[] };
			const shipmentsList = data.shipments ?? [];
			setShipments(shipmentsList);

			const activeStatuses = new Set([
				'PENDING',
				'QUOTE_REQUESTED',
				'QUOTE_APPROVED',
				'PICKUP_SCHEDULED',
				'PICKUP_COMPLETED',
				'IN_TRANSIT',
				'AT_PORT',
				'LOADED_ON_VESSEL',
				'IN_TRANSIT_OCEAN',
				'ARRIVED_AT_DESTINATION',
				'CUSTOMS_CLEARANCE',
				'OUT_FOR_DELIVERY',
			]);

			const active = shipmentsList.filter((shipment) => activeStatuses.has(shipment.status)).length;
			const inTransit = shipmentsList.filter((shipment) =>
				['IN_TRANSIT', 'AT_PORT', 'LOADED_ON_VESSEL', 'IN_TRANSIT_OCEAN'].includes(shipment.status)
			).length;
			const delivered = shipmentsList.filter((shipment) => shipment.status === 'DELIVERED').length;

			setStats({
				active,
				total: shipmentsList.length,
				inTransit,
				delivered,
			});
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			setShipments([]);
			setStats({
				active: 0,
				total: 0,
				inTransit: 0,
				delivered: 0,
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchDashboardData();
	}, [fetchDashboardData]);

	const recentShipments = useMemo(() => shipments.slice(0, 3), [shipments]);

	return (
		<>
			{/* Hero Header */}
			<Section className="relative bg-[#020817] py-6 sm:py-12 lg:py-16 overflow-hidden">
					{/* Background gradient */}
					<div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0a1628] to-[#020817]" />

					{/* Subtle geometric grid pattern */}
					<div className="absolute inset-0 opacity-[0.03]">
						<svg className="w-full h-full" preserveAspectRatio="none">
							<defs>
								<pattern id="grid-dashboard" width="40" height="40" patternUnits="userSpaceOnUse">
									<path
										d="M 40 0 L 0 0 0 40"
										fill="none"
										stroke="currentColor"
										strokeWidth="1"
									/>
								</pattern>
							</defs>
							<rect width="100%" height="100%" fill="url(#grid-dashboard)" className="text-cyan-400" />
						</svg>
					</div>

					<div className="relative z-10">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
							<div className="space-y-1 sm:space-y-2 max-w-full">
								<h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight break-words">
									Welcome back{session?.user?.name && `, ${session.user.name}`}!
								</h1>
								<p className="text-sm sm:text-lg md:text-xl text-white/70">
									Here&apos;s your shipment overview
								</p>
							</div>
						{session?.user?.role === 'admin' && (
							<div className="w-full sm:w-auto">
								<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
									<Button
										variant="contained"
										size="large"
										startIcon={<Add />}
										sx={{
											bgcolor: '#00bfff',
											color: 'white',
											fontWeight: 600,
											fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
											px: { xs: 2, sm: 3 },
											py: { xs: 1.25, sm: 1.5 },
											width: { xs: '100%', sm: 'auto' },
											boxShadow: '0 8px 16px rgba(0, 191, 255, 0.3)',
											'&:hover': {
												bgcolor: '#00a8e6',
												boxShadow: '0 12px 24px rgba(0, 191, 255, 0.5)',
											},
											transition: 'all 0.3s ease',
										}}
									>
										New Shipment
									</Button>
								</Link>
							</div>
						)}
						</div>
					</div>
				</Section>

				{/* Main Content */}
				<Section className="bg-[#020817] py-6 sm:py-12 lg:py-16">
					{/* Stats Grid */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
							gap: { xs: 1.5, sm: 3, md: 4 },
							mb: { xs: 4, sm: 6, md: 8 },
						}}
					>
						<StatsCard
							icon={LocalShipping}
							title="Active Shipments"
							value={stats.active}
							subtitle="Currently in progress"
							delay={0}
						/>
						<StatsCard
							icon={Inventory2}
							title="In Transit"
							value={stats.inTransit}
							subtitle="On the way"
							delay={0.1}
						/>
						<StatsCard
							icon={LocationOn}
							title="Total Shipments"
							value={stats.total}
							subtitle="All time"
							delay={0.2}
						/>
						<StatsCard
							icon={TrendingUp}
							title="Delivered"
							value={stats.delivered}
							subtitle="Successfully completed"
							delay={0.3}
						/>
					</Box>

					{/* Content Grid */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
							gap: { xs: 3, sm: 4, md: 6 },
						}}
					>
						{/* Recent Shipments - Takes 2 columns */}
						<Box
							sx={{
								gridColumn: { xs: '1', lg: 'span 2' },
								display: 'flex',
								flexDirection: 'column',
								gap: { xs: 2, sm: 3 },
							}}
						>
							<Box
								sx={{
									display: 'flex',
									flexDirection: { xs: 'column', sm: 'row' },
									alignItems: { xs: 'flex-start', sm: 'center' },
									justifyContent: 'space-between',
									gap: { xs: 1.5, sm: 2 },
								}}
							>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										variant="h5"
										sx={{
											fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.875rem' },
											fontWeight: 700,
											color: 'white',
											mb: { xs: 0.5, sm: 1 },
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										Recent Shipments
									</Typography>
									<Typography
										variant="body2"
										sx={{
											fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
											color: 'rgba(255, 255, 255, 0.7)',
										}}
									>
										Your latest activity
									</Typography>
								</Box>
								{shipments.length > 0 && (
									<Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
										<Link href="/dashboard/shipments" style={{ textDecoration: 'none' }}>
											<Button
												variant="outlined"
												size="small"
												sx={{
													fontSize: { xs: '0.75rem', sm: '0.875rem' },
													borderColor: 'rgba(6, 182, 212, 0.3)',
													color: 'rgb(34, 211, 238)',
													width: { xs: '100%', sm: 'auto' },
													'&:hover': {
														bgcolor: 'rgba(6, 182, 212, 0.1)',
														borderColor: 'rgba(6, 182, 212, 0.5)',
													},
												}}
											>
												View All
											</Button>
										</Link>
									</Box>
								)}
							</Box>

							{loading ? (
								<Box
									sx={{
										position: 'relative',
										borderRadius: 3,
										background: 'rgba(10, 22, 40, 0.5)',
										backdropFilter: 'blur(8px)',
										border: '1px solid rgba(6, 182, 212, 0.3)',
										p: 6,
										textAlign: 'center',
									}}
								>
									<CircularProgress
										size={48}
										sx={{
											color: 'rgb(34, 211, 238)',
										}}
									/>
									<Typography
										sx={{
											mt: 2,
											color: 'rgba(255, 255, 255, 0.7)',
										}}
									>
										Loading shipments...
									</Typography>
								</Box>
							) : recentShipments.length === 0 ? (
								<Box
									sx={{
										position: 'relative',
										borderRadius: 3,
										background: 'rgba(10, 22, 40, 0.5)',
										backdropFilter: 'blur(8px)',
										border: '1px solid rgba(6, 182, 212, 0.3)',
										p: 6,
										textAlign: 'center',
									}}
								>
									<Inventory2
										sx={{
											fontSize: 64,
											color: 'rgba(255, 255, 255, 0.3)',
											mb: 2,
										}}
									/>
									<Typography
										sx={{
											color: 'rgba(255, 255, 255, 0.7)',
											mb: 3,
										}}
									>
										No shipments yet
									</Typography>
									<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
										<Button
											variant="contained"
											startIcon={<Add />}
											sx={{
												bgcolor: '#00bfff',
												color: 'white',
												'&:hover': {
													bgcolor: '#00a8e6',
												},
											}}
										>
											Create Your First Shipment
										</Button>
									</Link>
								</Box>
							) : (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
									{recentShipments.map((shipment, index) => (
										<ShipmentCard
											key={shipment.id}
											{...shipment}
											delay={0.5 + index * 0.1}
										/>
									))}
								</Box>
							)}
						</Box>

						{/* Quick Actions - Takes 1 column */}
						<Box
							sx={{
								gridColumn: { xs: '1', lg: 'span 1' },
							}}
						>
							<QuickActions />
						</Box>
					</Box>
				</Section>
		</>
	);
}
