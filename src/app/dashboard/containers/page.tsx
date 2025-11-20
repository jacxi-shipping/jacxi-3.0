'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Package, FileText, Eye } from 'lucide-react';
import { Button, Box, CircularProgress, Typography, Fade, Slide, Zoom, Chip } from '@mui/material';
import { DashboardSurface, DashboardHeader, DashboardPanel } from '@/components/dashboard/DashboardSurface';
import SmartSearch, { SearchFilters } from '@/components/dashboard/SmartSearch';

interface ContainerItem {
	id: string;
}

interface ContainerInvoice {
	id: string;
}

interface Container {
	id: string;
	containerNumber: string;
	status: string;
	createdAt: string;
	items: ContainerItem[];
	invoices: ContainerInvoice[];
	shipment?: {
		trackingNumber: string;
		status: string;
	};
}

export default function ContainersPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [containers, setContainers] = useState<Container[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchFilters, setSearchFilters] = useState<SearchFilters>({
		query: '',
		type: 'items',
	});
	const show = true;

	useEffect(() => {
		if (status === 'loading') return;

		const role = session?.user?.role;
		if (!session || role !== 'admin') {
			router.replace('/dashboard');
			return;
		}

		fetchContainers();
	}, [session, status, router]);

	const fetchContainers = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/containers');
			if (response.ok) {
				const data = (await response.json()) as { containers?: Container[] };
				setContainers(data.containers ?? []);
			}
		} catch (error) {
			console.error('Error fetching containers:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (filters: SearchFilters) => {
		setSearchFilters(filters);
	};

	const filteredContainers = containers.filter((container) => {
		const query = searchFilters.query.toLowerCase();
		if (!query) return true;
		
		return (
			container.containerNumber.toLowerCase().includes(query) ||
			(container.shipment?.trackingNumber && container.shipment.trackingNumber.toLowerCase().includes(query))
		);
	});

	if (status === 'loading' || loading) {
		return (
			<Box
				sx={{
					minHeight: '100vh',
					background: '#020817',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<CircularProgress
					size={60}
					sx={{
						color: 'rgb(34, 211, 238)',
						filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.5))',
					}}
				/>
			</Box>
		);
	}

	const role = session?.user?.role;
	if (!session || role !== 'admin') {
		return null;
	}

	return (
		<DashboardSurface>
			<DashboardHeader
				title="Containers"
				description="Monitor every container, linked shipments, and billing artifacts."
				meta={[
					{ label: 'Visible', value: filteredContainers.length },
					{ label: 'Total', value: containers.length },
				]}
				actions={
					<Link href="/dashboard/containers/new" style={{ textDecoration: 'none' }}>
						<Button
							variant="contained"
							size="small"
							startIcon={<Plus fontSize="small" />}
							sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600 }}
						>
							New container
						</Button>
					</Link>
				}
			/>

			<DashboardPanel title="Search" description="Filter containers by tracking metadata" noBodyPadding>
				<Box sx={{ px: 1.5, py: 1.5 }}>
					<SmartSearch
						onSearch={handleSearch}
						placeholder="Search containers by number or tracking number..."
						showTypeFilter={false}
						showStatusFilter={false}
						showDateFilter
						showPriceFilter={false}
						showUserFilter={false}
						defaultType="items"
					/>
				</Box>
			</DashboardPanel>

			<DashboardPanel title="Container library" description="Tap a card to view manifest and invoices" fullHeight>
				{filteredContainers.length === 0 ? (
					<Box
						sx={{
							minHeight: 240,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 1,
							textAlign: 'center',
						}}
					>
						<Package sx={{ fontSize: 40, color: 'rgba(255,255,255,0.25)' }} />
						<Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
							No containers match this filter
						</Typography>
					</Box>
				) : (
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
							gap: 1.5,
						}}
					>
						{filteredContainers.map((container, index) => (
							<Zoom key={container.id} in timeout={400} style={{ transitionDelay: `${index * 80}ms` }}>
								<Box
									sx={{
										borderRadius: 2,
										border: '1px solid rgba(148,163,184,0.25)',
										background: 'rgba(4,12,24,0.9)',
										boxShadow: '0 18px 30px rgba(0,0,0,0.35)',
										padding: 1.5,
										display: 'flex',
										flexDirection: 'column',
										gap: 1.5,
									}}
								>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
										<Box sx={{ minWidth: 0 }}>
											<Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{container.containerNumber}
											</Typography>
											<Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>
												{container.items.length} {container.items.length === 1 ? 'item' : 'items'}
											</Typography>
										</Box>
										<Chip
											label={container.status}
											size="small"
											sx={{
												height: 20,
												fontSize: '0.65rem',
												fontWeight: 600,
												bgcolor: container.status === 'ACTIVE' ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.15)',
												color: container.status === 'ACTIVE' ? 'rgb(74,222,128)' : 'rgba(226,232,240,0.8)',
												borderColor: container.status === 'ACTIVE' ? 'rgba(34,197,94,0.35)' : 'rgba(148,163,184,0.35)',
											}}
											variant="outlined"
										/>
									</Box>

									{container.shipment?.trackingNumber && (
										<Box sx={{ borderRadius: 2, border: '1px solid rgba(94,234,212,0.25)', background: 'rgba(94,234,212,0.06)', px: 1.2, py: 0.8 }}>
											<Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', mb: 0.3 }}>
												Linked shipment
											</Typography>
											<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgb(94,234,212)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{container.shipment.trackingNumber}
											</Typography>
										</Box>
									)}

									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
										<Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
											{container.invoices.length} invoice{container.invoices.length === 1 ? '' : 's'}
										</Typography>
										<Link href={`/dashboard/containers/${container.id}`} style={{ textDecoration: 'none' }}>
											<Button
												variant="outlined"
												size="small"
												startIcon={<Eye sx={{ fontSize: 14 }} />}
												sx={{ textTransform: 'none', fontSize: '0.72rem' }}
											>
												View
											</Button>
										</Link>
									</Box>
								</Box>
							</Zoom>
						))}
					</Box>
				)}
			</DashboardPanel>
		</DashboardSurface>
	);
}
