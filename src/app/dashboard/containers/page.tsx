'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Package, Eye } from 'lucide-react';
import { Button, Box, CircularProgress, Typography, Zoom, Chip } from '@mui/material';
import { DashboardSurface, DashboardPanel } from '@/components/dashboard/DashboardSurface';
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
				className="light-surface"
				sx={{
					minHeight: '100vh',
					background: 'var(--background)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<CircularProgress size={60} sx={{ color: 'var(--accent-gold)' }} />
			</Box>
		);
	}

	const role = session?.user?.role;
	if (!session || role !== 'admin') {
		return null;
	}

	return (
		<DashboardSurface className="light-surface">
			<DashboardPanel
				title="Search"
				description="Filter containers by tracking metadata"
				noBodyPadding
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
			>
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
						<Package style={{ fontSize: 40, color: 'rgba(var(--text-secondary-rgb), 0.35)' }} />
						<Typography sx={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
										border: '1px solid var(--border)',
										background: 'var(--panel)',
										boxShadow: '0 18px 30px rgba(var(--text-primary-rgb), 0.08)',
										padding: 1.5,
										display: 'flex',
										flexDirection: 'column',
										gap: 1.5,
										color: 'var(--text-primary)',
									}}
								>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
										<Box sx={{ minWidth: 0 }}>
											<Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{container.containerNumber}
											</Typography>
											<Typography sx={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
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
												bgcolor: container.status === 'ACTIVE' ? 'rgba(var(--accent-gold-rgb), 0.12)' : 'rgba(var(--panel-rgb), 0.5)',
												color: container.status === 'ACTIVE' ? 'var(--accent-gold)' : 'var(--text-secondary)',
												borderColor: container.status === 'ACTIVE' ? 'rgba(var(--accent-gold-rgb), 0.35)' : 'var(--border)',
											}}
											variant="outlined"
										/>
									</Box>

									{container.shipment?.trackingNumber && (
										<Box sx={{ borderRadius: 2, border: '1px solid rgba(var(--accent-gold-rgb), 0.25)', background: 'rgba(var(--accent-gold-rgb), 0.06)', px: 1.2, py: 0.8 }}>
											<Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-secondary)', mb: 0.3 }}>
												Linked shipment
											</Typography>
											<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-gold)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{container.shipment.trackingNumber}
											</Typography>
										</Box>
									)}

									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
										<Typography sx={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
											{container.invoices.length} invoice{container.invoices.length === 1 ? '' : 's'}
										</Typography>
										<Link href={`/dashboard/containers/${container.id}`} style={{ textDecoration: 'none' }}>
											<Button
												variant="outlined"
												size="small"
												startIcon={<Eye style={{ fontSize: 14 }} />}
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
