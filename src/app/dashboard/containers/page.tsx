'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Package, FileText, Eye } from 'lucide-react';
import { Button, Box, CircularProgress, Typography, Fade, Slide, Zoom, Chip } from '@mui/material';
import Section from '@/components/layout/Section';
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
		<>
			{/* Main Content */}
			<Section className="bg-[#020817] py-4 sm:py-6">
				{/* Smart Search */}
				<Slide in={show} direction="up" timeout={800} style={{ transitionDelay: '300ms' }}>
					<Box sx={{ mb: { xs: 4, sm: 6 } }}>
						<SmartSearch
							onSearch={handleSearch}
							placeholder="Search containers by number or tracking number..."
							showTypeFilter={false}
							showStatusFilter={false}
							showDateFilter={true}
							showPriceFilter={false}
							showUserFilter={false}
							defaultType="items"
						/>
					</Box>
				</Slide>

				{/* Containers List */}
				<Fade in={show} timeout={1000} style={{ transitionDelay: '400ms' }}>
					<Box>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 3, sm: 4 } }}>
							<Typography
								variant="h2"
								sx={{
									fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' },
									fontWeight: 700,
									color: 'white',
								}}
							>
								All Containers ({filteredContainers.length})
							</Typography>
						</Box>

						{filteredContainers.length === 0 ? (
							<Zoom in timeout={800}>
								<Box
									sx={{
										borderRadius: { xs: 3, sm: 4 },
										background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.8) 0%, rgba(10, 22, 40, 0.4) 100%)',
										backdropFilter: 'blur(20px)',
										border: '1px solid rgba(6, 182, 212, 0.2)',
										p: { xs: 6, sm: 10 },
										textAlign: 'center',
									}}
								>
									<Package
										style={{
											width: '64px',
											height: '64px',
											color: 'rgba(255, 255, 255, 0.2)',
											filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))',
											marginBottom: '16px',
											marginLeft: 'auto',
											marginRight: 'auto',
										}}
									/>
									<Typography
										sx={{
											fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
											color: 'rgba(255, 255, 255, 0.7)',
											mb: { xs: 3, sm: 4 },
										}}
									>
										No containers found
									</Typography>
									<Link href="/dashboard/containers/new" style={{ textDecoration: 'none' }}>
										<Button
											variant="contained"
											startIcon={<Plus />}
											sx={{
												fontSize: { xs: '0.9375rem', sm: '1rem' },
												bgcolor: '#00bfff',
												color: 'white',
												fontWeight: 600,
												'&:hover': {
													bgcolor: '#00a8e6',
												},
											}}
										>
											Create Your First Container
										</Button>
									</Link>
								</Box>
							</Zoom>
						) : (
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
									gap: { xs: 3, sm: 4, md: 5 },
								}}
							>
								{filteredContainers.map((container, index) => (
									<Zoom key={container.id} in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
										<Box
											sx={{
												position: 'relative',
												borderRadius: { xs: 3, sm: 4 },
												background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.9) 0%, rgba(10, 22, 40, 0.6) 100%)',
												backdropFilter: 'blur(20px)',
												border: '1px solid rgba(6, 182, 212, 0.2)',
												p: { xs: 3, sm: 4 },
												transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
												'&:hover': {
													borderColor: 'rgba(6, 182, 212, 0.5)',
													boxShadow: '0 20px 40px rgba(6, 182, 212, 0.25)',
													transform: 'translateY(-4px)',
												},
											}}
										>
											<Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 3, gap: 2 }}>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
													<Box
														sx={{
															width: 48,
															height: 48,
															borderRadius: 3,
															background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)',
															border: '1px solid rgba(6, 182, 212, 0.3)',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															flexShrink: 0,
														}}
													>
														<Package style={{ width: 24, height: 24, color: 'rgb(34, 211, 238)' }} />
													</Box>
													<Box sx={{ flex: 1, minWidth: 0 }}>
														<Typography
															sx={{
																fontSize: { xs: '1rem', sm: '1.125rem' },
																fontWeight: 700,
																color: 'white',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
															}}
														>
															{container.containerNumber}
														</Typography>
														<Typography
															sx={{
																fontSize: { xs: '0.75rem', sm: '0.8125rem' },
																color: 'rgba(255, 255, 255, 0.6)',
															}}
														>
															{container.items.length} {container.items.length === 1 ? 'item' : 'items'}
														</Typography>
													</Box>
												</Box>
												<Chip
													label={container.status}
													size="small"
													sx={{
														fontSize: '0.6875rem',
														fontWeight: 600,
														height: 'auto',
														py: 0.75,
														px: 1.5,
														bgcolor: container.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
														color: container.status === 'ACTIVE' ? 'rgb(74, 222, 128)' : 'rgb(156, 163, 175)',
														border: `1px solid ${container.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(107, 114, 128, 0.4)'}`,
														flexShrink: 0,
													}}
												/>
											</Box>

											{container.shipment && container.shipment.trackingNumber && (
												<Box
													sx={{
														mb: 3,
														p: 2.5,
														borderRadius: 2.5,
														background: 'rgba(6, 182, 212, 0.05)',
														border: '1px solid rgba(6, 182, 212, 0.2)',
													}}
												>
													<Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
														Shipment
													</Typography>
													<Typography
														sx={{
															fontSize: '0.8125rem',
															fontWeight: 600,
															color: 'rgb(34, 211, 238)',
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															whiteSpace: 'nowrap',
														}}
													>
														{container.shipment.trackingNumber}
													</Typography>
												</Box>
											)}

											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													pt: 3,
													borderTop: '1px solid rgba(6, 182, 212, 0.1)',
													gap: 2,
												}}
											>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
													<FileText style={{ width: 16, height: 16, flexShrink: 0, color: 'rgba(255, 255, 255, 0.6)' }} />
													<Typography
														sx={{
															fontSize: '0.8125rem',
															color: 'rgba(255, 255, 255, 0.6)',
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															whiteSpace: 'nowrap',
														}}
													>
														{container.invoices.length} {container.invoices.length === 1 ? 'invoice' : 'invoices'}
													</Typography>
												</Box>
												<Link href={`/dashboard/containers/${container.id}`} style={{ textDecoration: 'none' }}>
													<Button
														variant="outlined"
														size="small"
														startIcon={<Eye style={{ width: 16, height: 16 }} />}
														sx={{
															fontSize: '0.8125rem',
															fontWeight: 600,
															borderColor: 'rgba(6, 182, 212, 0.4)',
															background: 'rgba(6, 182, 212, 0.05)',
															color: 'rgb(34, 211, 238)',
															px: 2,
															py: 0.75,
															transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
															'&:hover': {
																background: 'rgba(6, 182, 212, 0.15)',
																borderColor: 'rgba(6, 182, 212, 0.6)',
																boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
															},
														}}
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
					</Box>
				</Fade>
			</Section>
		</>
	);
}
