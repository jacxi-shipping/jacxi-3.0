'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Add, Inventory2, TrendingUp, LocalShipping, LocationOn } from '@mui/icons-material';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import StatsCard from '@/components/dashboard/StatsCard';
import ShipmentCard from '@/components/dashboard/ShipmentCard';
import { DashboardSurface, DashboardPanel, DashboardGrid } from '@/components/dashboard/DashboardSurface';

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

	const recentShipments = useMemo(() => shipments.slice(0, 2), [shipments]);

	return (
		<DashboardSurface className="flex-1 min-h-0">

			<DashboardGrid className="grid-cols-2 md:grid-cols-4 flex-shrink-0 gap-2">
				<StatsCard icon={LocalShipping} title="Active shipments" value={stats.active} />
				<StatsCard icon={Inventory2} title="In transit" value={stats.inTransit} />
				<StatsCard icon={LocationOn} title="Total shipments" value={stats.total} />
				<StatsCard icon={TrendingUp} title="Delivered" value={stats.delivered} />
			</DashboardGrid>

			<DashboardGrid className="grid-cols-1 flex-1 min-h-0 gap-2">
				<DashboardPanel
					title="Recent shipments"
					description="The latest files updated in the last sync."
					fullHeight
					className="flex-1 min-h-0"
					bodyClassName="flex flex-col gap-1 min-h-0"
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
						<Box
							sx={{
								flex: 1,
								minHeight: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<CircularProgress size={28} sx={{ color: 'var(--accent-gold)' }} />
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
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minHeight: 0 }}>
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
