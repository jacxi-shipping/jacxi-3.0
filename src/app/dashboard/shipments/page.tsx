'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
			{/* Header */}
			<Section className="relative bg-[#020817] py-6 sm:py-12 lg:py-16 overflow-hidden">
				{/* Background gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0a1628] to-[#020817]" />

				{/* Subtle geometric grid pattern */}
				<div className="absolute inset-0 opacity-[0.03]">
					<svg className="w-full h-full" preserveAspectRatio="none">
						<defs>
							<pattern id="grid-shipments" width="40" height="40" patternUnits="userSpaceOnUse">
								<path
									d="M 40 0 L 0 0 0 40"
									fill="none"
									stroke="currentColor"
									strokeWidth="1"
								/>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid-shipments)" className="text-cyan-400" />
					</svg>
				</div>

				<div className="relative z-10">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-1 sm:space-y-2 max-w-full"
						>
							<h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight break-words">
								Shipments Management
							</h1>
							<p className="text-sm sm:text-lg md:text-xl text-white/70">
								Manage and track all shipments
							</p>
						</motion.div>
						{isAdmin && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="w-full sm:w-auto"
							>
								<Link href="/dashboard/shipments/new" style={{ textDecoration: 'none' }}>
									<Button
										variant="contained"
										size="large"
										startIcon={<Add />}
										sx={{
											bgcolor: '#00bfff',
											color: 'white',
											fontWeight: 600,
											fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
											px: { xs: 2, sm: 3 },
											py: { xs: 1.25, sm: 1.5 },
											width: { xs: '100%', sm: 'auto' },
											boxShadow: '0 8px 16px rgba(0, 191, 255, 0.3)',
											'&:hover': {
												bgcolor: '#00a8e6',
												boxShadow: '0 12px 24px rgba(0, 191, 255, 0.5)',
											},
											transition: 'all 0.3s ease',
										}}
									>
										New Shipment
									</Button>
								</Link>
							</motion.div>
						)}
					</div>
				</div>
			</Section>

			{/* Main Content */}
			<Section className="bg-[#020817] py-6 sm:py-12">
				{/* Smart Search & Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="mb-6 sm:mb-8"
				>
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
				</motion.div>

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
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.5 }}
							>
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
							</motion.div>
						)}
					</>
				)}
			</Section>
		</>
	);
}
