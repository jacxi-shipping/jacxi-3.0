'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Add, ChevronLeft, ChevronRight, Inventory2 } from '@mui/icons-material';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import ShipmentRow from '@/components/dashboard/ShipmentRow';
import SmartSearch, { SearchFilters } from '@/components/dashboard/SmartSearch';
import { DashboardSurface, DashboardHeader, DashboardPanel } from '@/components/dashboard/DashboardSurface';

interface Shipment {
	id: string;
	trackingNumber: string;
	vehicleType: string;
	vehicleMake: string | null;
	vehicleModel: string | null;
	origin: string;
	destination: string;
	status: string;
	progress: number;
	estimatedDelivery: string | null;
	createdAt: string;
	paymentStatus?: string;
	user: {
		name: string | null;
		email: string;
	};
}

export default function ShipmentsListPage() {
	const { data: session } = useSession();
	const [shipments, setShipments] = useState<Shipment[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchFilters, setSearchFilters] = useState<SearchFilters>({
		query: '',
		type: 'shipments',
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const fetchShipments = useCallback(async () => {
		try {
			setLoading(true);
			
			// Build query params from search filters
			const params = new URLSearchParams();
			params.append('page', currentPage.toString());
			params.append('limit', '10');
			
			if (searchFilters.query) params.append('query', searchFilters.query);
			if (searchFilters.status) params.append('status', searchFilters.status);
			if (searchFilters.dateFrom) params.append('dateFrom', searchFilters.dateFrom);
			if (searchFilters.dateTo) params.append('dateTo', searchFilters.dateTo);
			if (searchFilters.minPrice) params.append('minPrice', searchFilters.minPrice);
			if (searchFilters.maxPrice) params.append('maxPrice', searchFilters.maxPrice);

			const response = await fetch(`/api/search?${params.toString()}&type=shipments&sortBy=createdAt&sortOrder=desc`);
			const data = await response.json();
			
			setShipments(data.shipments ?? []);
			setTotalPages(Math.ceil((data.totalShipments ?? 0) / 10) || 1);
		} catch (error) {
			console.error('Error fetching shipments:', error);
			setShipments([]);
		} finally {
			setLoading(false);
		}
	}, [searchFilters, currentPage]);

	useEffect(() => {
		fetchShipments();
	}, [fetchShipments]);

	const handleSearch = (filters: SearchFilters) => {
		setSearchFilters(filters);
		setCurrentPage(1); // Reset to first page on new search
	};

	const isAdmin = session?.user?.role === 'admin';

	return (
		<DashboardSurface>
			<DashboardHeader
				title="Shipments"
				description="Search, filter, and review every vehicle currently handled."
				meta={[
					{ label: 'Matches', value: shipments.length },
					{ label: 'Page', value: `${currentPage}/${totalPages}` },
				]}
				actions={
					isAdmin ? (
						<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
							<Button
								variant="contained"
								size="small"
								startIcon={<Add fontSize="small" />}
								sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600 }}
							>
								New shipment
							</Button>
						</Link>
					) : null
				}
			/>

			<DashboardPanel title="Search" description="Filter shipments instantly" noBodyPadding>
				<Box sx={{ px: 1.5, py: 1.5 }}>
					<SmartSearch
						onSearch={handleSearch}
						placeholder="Search shipments by tracking number, VIN, origin, destination..."
						showTypeFilter={false}
						showStatusFilter
						showDateFilter
						showPriceFilter
						showUserFilter={isAdmin}
						defaultType="shipments"
					/>
				</Box>
			</DashboardPanel>

			<DashboardPanel
				title="Results"
				description={
					shipments.length
						? `Showing ${shipments.length} shipment${shipments.length !== 1 ? 's' : ''}`
						: 'No shipments found'
				}
				fullHeight
			>
				{loading ? (
					<Box sx={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={30} sx={{ color: 'rgb(94,234,212)' }} />
					</Box>
				) : shipments.length === 0 ? (
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
						<Inventory2 sx={{ fontSize: 42, color: 'rgba(255,255,255,0.3)' }} />
						<Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
							No shipments found
						</Typography>
						{isAdmin && (
							<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
								<Button
									variant="contained"
									size="small"
									startIcon={<Add fontSize="small" />}
									sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
								>
									Create shipment
								</Button>
							</Link>
						)}
					</Box>
				) : (
					<>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
							{shipments.map((shipment, index) => (
								<ShipmentRow
									key={shipment.id}
									{...shipment}
									showCustomer={isAdmin}
									delay={index * 0.05}
								/>
							))}
						</Box>

						{totalPages > 1 && (
							<Box
								sx={{
									mt: 2,
									display: 'flex',
									flexDirection: { xs: 'column', sm: 'row' },
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 1,
								}}
							>
								<Button
									variant="outlined"
									size="small"
									startIcon={<ChevronLeft sx={{ fontSize: 14 }} />}
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									disabled={currentPage === 1}
									sx={{ textTransform: 'none', fontSize: '0.75rem' }}
								>
									Previous
								</Button>
								<Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>
									Page {currentPage} of {totalPages}
								</Typography>
								<Button
									variant="outlined"
									size="small"
									endIcon={<ChevronRight sx={{ fontSize: 14 }} />}
									onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
									disabled={currentPage === totalPages}
									sx={{ textTransform: 'none', fontSize: '0.75rem' }}
								>
									Next
								</Button>
							</Box>
						)}
					</>
				)}
			</DashboardPanel>
		</DashboardSurface>
	);
}
