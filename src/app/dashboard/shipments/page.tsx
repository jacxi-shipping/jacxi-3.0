'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Add, ChevronLeft, ChevronRight, Inventory2 } from '@mui/icons-material';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import ShipmentRow from '@/components/dashboard/ShipmentRow';
import Section from '@/components/layout/Section';
import SmartSearch, { SearchFilters } from '@/components/dashboard/SmartSearch';

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
		<>
			{/* Main Content */}
			<Section className="bg-[#020817] py-4 sm:py-6">
				{/* Smart Search & Filters */}
				<div className="mb-6 sm:mb-8">
					<SmartSearch
						onSearch={handleSearch}
						placeholder="Search shipments by tracking number, VIN, origin, destination..."
						showTypeFilter={false}
						showStatusFilter={true}
						showDateFilter={true}
						showPriceFilter={true}
						showUserFilter={isAdmin}
						defaultType="shipments"
					/>
				</div>

				{/* Shipments List */}
				{loading ? (
					<Box
						sx={{
							position: 'relative',
							borderRadius: { xs: 2, sm: 3 },
							background: 'rgba(10, 22, 40, 0.5)',
							backdropFilter: 'blur(8px)',
							border: '1px solid rgba(6, 182, 212, 0.3)',
							p: { xs: 4, sm: 6 },
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
								fontSize: { xs: '0.875rem', sm: '1rem' },
								color: 'rgba(255, 255, 255, 0.7)',
							}}
						>
							Loading shipments...
						</Typography>
					</Box>
				) : shipments.length === 0 ? (
					<Box
						sx={{
							position: 'relative',
							borderRadius: { xs: 2, sm: 3 },
							background: 'rgba(10, 22, 40, 0.5)',
							backdropFilter: 'blur(8px)',
							border: '1px solid rgba(6, 182, 212, 0.3)',
							p: { xs: 4, sm: 6 },
							textAlign: 'center',
						}}
					>
						<Inventory2
							sx={{
								fontSize: { xs: 48, sm: 64 },
								color: 'rgba(255, 255, 255, 0.3)',
								mb: 2,
							}}
						/>
						<Typography
							sx={{
								fontSize: { xs: '0.875rem', sm: '1rem' },
								color: 'rgba(255, 255, 255, 0.7)',
								mb: { xs: 2, sm: 3 },
							}}
						>
							No shipments found
						</Typography>
						<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
							<Button
								variant="contained"
								startIcon={<Add />}
								sx={{
									fontSize: { xs: '0.875rem', sm: '1rem' },
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
					<>
						{/* Results Count */}
						<div className="mb-4 sm:mb-6">
							<p className="text-xs sm:text-sm md:text-base text-white/70">
								Showing <span className="text-cyan-400 font-semibold">{shipments.length}</span> shipment{shipments.length !== 1 ? 's' : ''}
							</p>
						</div>

						{/* Shipments Grid */}
						<div className="space-y-3 sm:space-y-4 md:space-y-6">
							{shipments.map((shipment, index) => (
								<ShipmentRow
									key={shipment.id}
									{...shipment}
									showCustomer={isAdmin}
									isAdmin={isAdmin}
									onStatusUpdated={fetchShipments}
									delay={index * 0.1}
								/>
							))}
						</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<Box
									sx={{
										mt: { xs: 3, sm: 4 },
										display: 'flex',
										flexDirection: { xs: 'column', sm: 'row' },
										justifyContent: 'center',
										alignItems: 'center',
										gap: { xs: 1.5, sm: 2 },
									}}
								>
									<Button
										variant="outlined"
										size="small"
										startIcon={<ChevronLeft sx={{ fontSize: { xs: 12, sm: 16 } }} />}
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage === 1}
										sx={{
											fontSize: { xs: '0.75rem', sm: '0.875rem' },
											borderColor: 'rgba(6, 182, 212, 0.3)',
											color: 'rgb(34, 211, 238)',
											width: { xs: '100%', sm: 'auto' },
											'&:hover': {
												bgcolor: 'rgba(6, 182, 212, 0.1)',
												borderColor: 'rgba(6, 182, 212, 0.5)',
											},
											'&:disabled': {
												opacity: 0.5,
												cursor: 'not-allowed',
												borderColor: 'rgba(6, 182, 212, 0.2)',
												color: 'rgba(34, 211, 238, 0.5)',
											},
										}}
									>
										Previous
									</Button>
									<Typography
										sx={{
											fontSize: { xs: '0.75rem', sm: '0.875rem' },
											color: 'rgba(255, 255, 255, 0.7)',
											px: 2,
										}}
									>
										Page {currentPage} of {totalPages}
									</Typography>
									<Button
										variant="outlined"
										size="small"
										endIcon={<ChevronRight sx={{ fontSize: { xs: 12, sm: 16 } }} />}
										onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
										disabled={currentPage === totalPages}
										sx={{
											fontSize: { xs: '0.75rem', sm: '0.875rem' },
											borderColor: 'rgba(6, 182, 212, 0.3)',
											color: 'rgb(34, 211, 238)',
											width: { xs: '100%', sm: 'auto' },
											'&:hover': {
												bgcolor: 'rgba(6, 182, 212, 0.1)',
												borderColor: 'rgba(6, 182, 212, 0.5)',
											},
											'&:disabled': {
												opacity: 0.5,
												cursor: 'not-allowed',
												borderColor: 'rgba(6, 182, 212, 0.2)',
												color: 'rgba(34, 211, 238, 0.5)',
											},
										}}
									>
										Next
									</Button>
								</Box>
						)}
					</>
				)}
			</Section>
		</>
	);
}
