'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Add, Inventory2, TrendingUp, LocalShipping, LocationOn } from '@mui/icons-material';
import { Button, Box, Typography } from '@mui/material';
import StatsCard from '@/components/dashboard/StatsCard';
import ShipmentCard from '@/components/dashboard/ShipmentCard';
import { DashboardSurface, DashboardPanel, DashboardGrid } from '@/components/dashboard/DashboardSurface';
import { SkeletonCard } from '@/components/ui/Skeleton';

interface Shipment {
	id: string;
	vehicleType: string;
	vehicleMake?: string | null;
	vehicleModel?: string | null;
	vehicleYear?: number | null;
	vehicleVIN?: string | null;
	status: string;
	containerId?: string | null;
	container?: {
		containerNumber: string;
		trackingNumber?: string | null;
		status?: string;
		currentLocation?: string | null;
		estimatedArrival?: string | null;
		vesselName?: string | null;
		shippingLine?: string | null;
		progress?: number;
	} | null;
}

export default function DashboardPage() {
	const [loading, setLoading] = useState(true);
	const [shipments, setShipments] = useState<Shipment[]>([]);
	const [stats, setStats] = useState({
		onHand: 0,
		total: 0,
		inTransit: 0,
		withContainer: 0,
	});

	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			
			// Add minimum loading time to ensure skeleton is visible
			const [response] = await Promise.all([
				fetch('/api/shipments?limit=100'),
				new Promise(resolve => setTimeout(resolve, 500)) // Minimum 500ms loading
			]);
			
			if (!response.ok) {
				setShipments([]);
				setStats({
					onHand: 0,
					total: 0,
					inTransit: 0,
					withContainer: 0,
				});
				return;
			}

			const data = (await response.json()) as { shipments?: Shipment[] };
			const shipmentsList = data.shipments ?? [];
			setShipments(shipmentsList);

			const onHand = shipmentsList.filter((shipment) => shipment.status === 'ON_HAND').length;
			const inTransit = shipmentsList.filter((shipment) => shipment.status === 'IN_TRANSIT').length;
			const withContainer = shipmentsList.filter((shipment) => shipment.containerId !== null).length;

			setStats({
				onHand,
				total: shipmentsList.length,
				inTransit,
				withContainer,
			});
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			setShipments([]);
			setStats({
				onHand: 0,
				total: 0,
				inTransit: 0,
				withContainer: 0,
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchDashboardData();
	}, [fetchDashboardData]);

	const recentShipments = useMemo(() => shipments.slice(0, 2), [shipments]);

	return (
		<DashboardSurface className="flex-1 min-h-0 overflow-hidden">

			<DashboardGrid className="grid-cols-2 md:grid-cols-4 flex-shrink-0 gap-2">
				<StatsCard icon={Inventory2} title="On Hand" value={stats.onHand} />
				<StatsCard icon={LocalShipping} title="In Transit" value={stats.inTransit} />
				<StatsCard icon={LocationOn} title="Total Shipments" value={stats.total} />
				<StatsCard icon={TrendingUp} title="With Container" value={stats.withContainer} />
			</DashboardGrid>

			<DashboardGrid className="grid-cols-1 flex-1 min-h-0 gap-2 overflow-hidden">
				<DashboardPanel
					title="Recent shipments"
					description="Most recently added vehicles"
					fullHeight
					className="flex-1 min-h-0 overflow-hidden"
					bodyClassName="flex flex-col gap-1 min-h-0 overflow-y-auto overflow-x-hidden"
					actions={
						shipments.length > 0 ? (
							<Link href="/dashboard/shipments" style={{ textDecoration: 'none' }}>
								<Button
									variant="outlined"
									size="small"
									sx={{
										textTransform: 'none',
										borderColor: 'var(--border)',
										color: 'var(--text-secondary)',
									}}
								>
									Open board
								</Button>
							</Link>
						) : null
					}
				>
					{loading ? (
						<Box sx={{ 
							display: 'flex', 
							flexDirection: 'column', 
							gap: 1, 
							flex: 1, 
							minHeight: 0,
							minWidth: 0,
							width: '100%',
						}}>
							<SkeletonCard />
							<SkeletonCard />
						</Box>
					) : recentShipments.length === 0 ? (
						<Box
							sx={{
								flex: 1,
								minHeight: 0,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 1,
								textAlign: 'center',
								py: 3,
							}}
						>
							<Inventory2 sx={{ fontSize: 36, color: 'var(--text-secondary)' }} />
							<Typography sx={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
								No shipments yet
							</Typography>
							<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
								<Button
									variant="contained"
									size="small"
									startIcon={<Add fontSize="small" />}
									sx={{
										textTransform: 'none',
										backgroundColor: 'var(--accent-gold)',
										fontSize: '0.78rem',
										fontWeight: 600,
										mt: 0.5,
										color: 'var(--background)',
										'&:hover': { backgroundColor: 'var(--accent-gold)' },
									}}
								>
									Create shipment
								</Button>
							</Link>
						</Box>
					) : (
						<Box sx={{ 
							display: 'flex', 
							flexDirection: 'column', 
							gap: 1, 
							flex: 1, 
							minHeight: 0,
							minWidth: 0,
							width: '100%',
							overflowY: 'auto',
							overflowX: 'hidden',
						}}>
							{recentShipments.map((shipment, index) => (
								<ShipmentCard key={shipment.id} {...shipment} delay={0.2 + index * 0.05} />
							))}
						</Box>
					)}
				</DashboardPanel>
			</DashboardGrid>
		</DashboardSurface>
	);
}
