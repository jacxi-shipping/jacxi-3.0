'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Add, Inventory2, TrendingUp, LocalShipping, LocationOn } from '@mui/icons-material';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import StatsCard from '@/components/dashboard/StatsCard';
import ShipmentCard from '@/components/dashboard/ShipmentCard';
import { DashboardSurface, DashboardHeader, DashboardPanel, DashboardGrid } from '@/components/dashboard/DashboardSurface';

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
		<DashboardSurface>
			<DashboardHeader
				title="Dashboard"
				description="Track shipment health, volume, and performance at a glance."
				meta={[
					{ label: 'Active', value: stats.active, helper: 'moving now', intent: 'positive' },
					{ label: 'In transit', value: stats.inTransit },
					{ label: 'Delivered', value: stats.delivered, intent: 'positive' },
					{ label: 'Total', value: stats.total },
				]}
				actions={
					<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
						<Button
							variant="contained"
							size="small"
							startIcon={<Add fontSize="small" />}
							sx={{
								textTransform: 'none',
								backgroundColor: '#00bcd4',
								fontSize: '0.8rem',
								fontWeight: 600,
								px: 2.5,
								py: 0.75,
								'&:hover': {
									backgroundColor: '#00a4bb',
								},
							}}
						>
							New shipment
						</Button>
					</Link>
				}
			/>

			<DashboardGrid className="grid-cols-2 md:grid-cols-4">
				<StatsCard icon={LocalShipping} title="Active shipments" value={stats.active} subtitle="In progress" />
				<StatsCard icon={Inventory2} title="In transit" value={stats.inTransit} subtitle="On the move" />
				<StatsCard icon={LocationOn} title="Total shipments" value={stats.total} subtitle="All-time" />
				<StatsCard icon={TrendingUp} title="Delivered" value={stats.delivered} subtitle="Completed" />
			</DashboardGrid>

			<DashboardGrid className="grid-cols-1">
				<DashboardPanel
					title="Recent shipments"
					description="The latest files updated in the last sync."
					fullHeight
					actions={
						shipments.length > 0 ? (
							<Link href="/dashboard/shipments" style={{ textDecoration: 'none' }}>
								<Button
									variant="outlined"
									size="small"
									sx={{
										textTransform: 'none',
										borderColor: 'rgba(59,130,246,0.4)',
										color: 'rgba(191,219,254,0.9)',
									}}
								>
									Open board
								</Button>
							</Link>
						) : null
					}
				>
					{loading ? (
						<Box sx={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<CircularProgress size={28} sx={{ color: 'rgb(94,234,212)' }} />
						</Box>
					) : recentShipments.length === 0 ? (
						<Box
							sx={{
								minHeight: 220,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 1,
								textAlign: 'center',
							}}
						>
							<Inventory2 sx={{ fontSize: 40, color: 'rgba(255,255,255,0.25)' }} />
							<Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
								No shipments yet
							</Typography>
							<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
								<Button
									variant="contained"
									size="small"
									startIcon={<Add fontSize="small" />}
									sx={{
										textTransform: 'none',
										backgroundColor: '#00bcd4',
										fontSize: '0.78rem',
										fontWeight: 600,
										mt: 0.5,
									}}
								>
									Create shipment
								</Button>
							</Link>
						</Box>
					) : (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
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
