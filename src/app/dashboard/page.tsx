'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Add, Inventory2, TrendingUp, LocalShipping, LocationOn } from '@mui/icons-material';
import { Button, Box, CircularProgress, Typography, Fade, Slide, Zoom } from '@mui/material';
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
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		setShowContent(true);
	}, []);

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

			{/* Main Content */}
			<Section className="bg-[#020817] py-4 sm:py-6">
				{/* Stats Grid */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
						gap: { xs: 2, sm: 3, md: 4 },
						mb: { xs: 6, sm: 8, md: 10 },
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
						gap: { xs: 4, sm: 5, md: 6 },
					}}
				>
					{/* Recent Shipments */}
					<Box
						sx={{
							gridColumn: { xs: '1', lg: 'span 2' },
							display: 'flex',
							flexDirection: 'column',
							gap: { xs: 3, sm: 4 },
						}}
					>
						<Fade in={showContent} timeout={800} style={{ transitionDelay: '600ms' }}>
							<Box
								sx={{
									display: 'flex',
									flexDirection: { xs: 'column', sm: 'row' },
									alignItems: { xs: 'flex-start', sm: 'center' },
									justifyContent: 'space-between',
									gap: { xs: 2, sm: 2.5 },
								}}
							>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										variant="h5"
										sx={{
											fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
											fontWeight: 800,
											background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(200, 220, 255) 100%)',
											WebkitBackgroundClip: 'text',
											WebkitTextFillColor: 'transparent',
											backgroundClip: 'text',
											mb: { xs: 0.75, sm: 1 },
											letterSpacing: '-0.02em',
										}}
									>
										Recent Shipments
									</Typography>
									<Typography
										variant="body2"
										sx={{
											fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
											color: 'rgba(255, 255, 255, 0.7)',
											fontWeight: 500,
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
												size="medium"
												sx={{
													fontSize: { xs: '0.875rem', sm: '1rem' },
													fontWeight: 600,
													borderColor: 'rgba(6, 182, 212, 0.4)',
													background: 'rgba(6, 182, 212, 0.05)',
													color: 'rgb(34, 211, 238)',
													width: { xs: '100%', sm: 'auto' },
													px: { xs: 3, sm: 4 },
													py: { xs: 1.25, sm: 1.5 },
													borderRadius: 2.5,
													transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
													'&:hover': {
														background: 'rgba(6, 182, 212, 0.15)',
														borderColor: 'rgba(6, 182, 212, 0.6)',
														boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)',
														transform: 'translateY(-2px)',
													},
												}}
											>
												View All
											</Button>
										</Link>
									</Box>
								)}
							</Box>
						</Fade>

						{loading ? (
							<Fade in timeout={600}>
								<Box
									sx={{
										position: 'relative',
										borderRadius: 4,
										background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.8) 0%, rgba(10, 22, 40, 0.4) 100%)',
										backdropFilter: 'blur(20px)',
										border: '1px solid rgba(6, 182, 212, 0.2)',
										p: 8,
										textAlign: 'center',
									}}
								>
									<CircularProgress
										size={60}
										thickness={4}
										sx={{
											color: 'rgb(34, 211, 238)',
											filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.5))',
										}}
									/>
									<Typography
										sx={{
											mt: 3,
											color: 'rgba(255, 255, 255, 0.7)',
											fontSize: '1.125rem',
											fontWeight: 600,
										}}
									>
										Loading shipments...
									</Typography>
								</Box>
							</Fade>
						) : recentShipments.length === 0 ? (
							<Zoom in timeout={800}>
								<Box
									sx={{
										position: 'relative',
										borderRadius: 4,
										background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.8) 0%, rgba(10, 22, 40, 0.4) 100%)',
										backdropFilter: 'blur(20px)',
										border: '1px solid rgba(6, 182, 212, 0.2)',
										p: 8,
										textAlign: 'center',
									}}
								>
									<Inventory2
										sx={{
											fontSize: 80,
											color: 'rgba(255, 255, 255, 0.2)',
											mb: 3,
											filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))',
										}}
									/>
									<Typography
										sx={{
											color: 'rgba(255, 255, 255, 0.8)',
											fontSize: '1.25rem',
											fontWeight: 600,
											mb: 4,
										}}
									>
										No shipments yet
									</Typography>
									<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
										<Button
											variant="contained"
											startIcon={<Add />}
											sx={{
												background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
												color: 'white',
												fontWeight: 600,
												fontSize: '1rem',
												px: 4,
												py: 1.5,
												borderRadius: 2.5,
												'&:hover': {
													background: 'linear-gradient(135deg, #00d4ff 0%, #00bfff 100%)',
													boxShadow: '0 10px 30px rgba(0, 191, 255, 0.4)',
													transform: 'translateY(-2px)',
												},
											}}
										>
											Create Your First Shipment
										</Button>
									</Link>
								</Box>
							</Zoom>
						) : (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 3.5 } }}>
								{recentShipments.map((shipment, index) => (
									<ShipmentCard
										key={shipment.id}
										{...shipment}
										delay={0.7 + index * 0.1}
									/>
								))}
							</Box>
						)}
					</Box>

					{/* Quick Actions */}
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
