'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Add, Inventory2 } from '@mui/icons-material';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
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

	const recentShipments = useMemo(() => shipments.slice(0, 2), [shipments]);

	const inlineStats = useMemo(
		() => [
			{ label: 'Active', value: stats.active, helper: 'moving now' },
			{ label: 'In transit', value: stats.inTransit, helper: 'on the move' },
			{ label: 'Delivered', value: stats.delivered, helper: 'completed' },
			{ label: 'Total', value: stats.total, helper: 'all time' },
		],
		[stats.active, stats.delivered, stats.inTransit, stats.total],
	);

	return (
		<DashboardSurface className="h-full min-h-0">
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

			<DashboardGrid className="grid-cols-1 flex-1">
				<DashboardPanel
					title="Recent shipments"
					description="Latest shipments synced from operations."
					fullHeight
					bodyClassName="flex flex-col gap-3"
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
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
							gap: 1.5,
						}}
					>
						{inlineStats.map((item) => (
							<Box
								key={item.label}
								sx={{
									borderRadius: 2,
									border: '1px solid rgba(226, 232, 240, 0.9)',
									backgroundColor: '#f8fafc',
									padding: 1.25,
								}}
							>
								<Typography sx={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
									{item.label}
								</Typography>
								<Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
									{item.value}
								</Typography>
								<Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.helper}</Typography>
							</Box>
						))}
					</Box>
					{loading ? (
						<Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<CircularProgress size={24} sx={{ color: '#0f62fe' }} />
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
								py: 4,
							}}
						>
							<Inventory2 sx={{ fontSize: 40, color: '#cbd5f5' }} />
							<Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>No shipments yet</Typography>
							<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
								<Button
									variant="contained"
									size="small"
									startIcon={<Add fontSize="small" />}
									sx={{
										textTransform: 'none',
										backgroundColor: '#0f62fe',
										fontSize: '0.78rem',
										fontWeight: 600,
										mt: 0.5,
										color: '#fff',
										'&:hover': { backgroundColor: '#0b4ed8' },
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
