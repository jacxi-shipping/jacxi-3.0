"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Visibility, Edit, ArrowForward, CreditCard } from '@mui/icons-material';
import { Card, CardContent, Box, Typography, Chip, Button, LinearProgress } from '@mui/material';

interface ShipmentRowProps {
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
	user?: {
		name: string | null;
		email: string;
	};
	showCustomer?: boolean;
	isAdmin?: boolean;
	onStatusUpdated?: () => void;
	delay?: number;
}

type StatusColors = {
	bg: string;
	text: string;
	border: string;
};

const statusColors: Record<string, StatusColors> = {
	PENDING: { bg: 'rgba(107, 114, 128, 0.1)', text: 'rgb(156, 163, 175)', border: 'rgba(107, 114, 128, 0.3)' },
	QUOTE_REQUESTED: { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.3)' },
	QUOTE_APPROVED: { bg: 'rgba(34, 197, 94, 0.1)', text: 'rgb(74, 222, 128)', border: 'rgba(34, 197, 94, 0.3)' },
	PICKUP_SCHEDULED: { bg: 'rgba(234, 179, 8, 0.1)', text: 'rgb(250, 204, 21)', border: 'rgba(234, 179, 8, 0.3)' },
	PICKUP_COMPLETED: { bg: 'rgba(249, 115, 22, 0.1)', text: 'rgb(251, 146, 60)', border: 'rgba(249, 115, 22, 0.3)' },
	IN_TRANSIT: { bg: 'rgba(6, 182, 212, 0.1)', text: 'rgb(34, 211, 238)', border: 'rgba(6, 182, 212, 0.3)' },
	AT_PORT: { bg: 'rgba(139, 92, 246, 0.1)', text: 'rgb(167, 139, 250)', border: 'rgba(139, 92, 246, 0.3)' },
	LOADED_ON_VESSEL: { bg: 'rgba(99, 102, 241, 0.1)', text: 'rgb(129, 140, 248)', border: 'rgba(99, 102, 241, 0.3)' },
	IN_TRANSIT_OCEAN: { bg: 'rgba(236, 72, 153, 0.1)', text: 'rgb(244, 114, 182)', border: 'rgba(236, 72, 153, 0.3)' },
	ARRIVED_AT_DESTINATION: { bg: 'rgba(20, 184, 166, 0.1)', text: 'rgb(45, 212, 191)', border: 'rgba(20, 184, 166, 0.3)' },
	CUSTOMS_CLEARANCE: { bg: 'rgba(6, 182, 212, 0.1)', text: 'rgb(34, 211, 238)', border: 'rgba(6, 182, 212, 0.3)' },
	OUT_FOR_DELIVERY: { bg: 'rgba(132, 204, 22, 0.1)', text: 'rgb(163, 230, 53)', border: 'rgba(132, 204, 22, 0.3)' },
	DELIVERED: { bg: 'rgba(16, 185, 129, 0.1)', text: 'rgb(52, 211, 153)', border: 'rgba(16, 185, 129, 0.3)' },
	CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', text: 'rgb(248, 113, 113)', border: 'rgba(239, 68, 68, 0.3)' },
	ON_HOLD: { bg: 'rgba(245, 158, 11, 0.1)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.3)' },
};

const formatStatus = (status: string) => {
	return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

const paymentStatusColors: Record<string, StatusColors> = {
	PENDING: { bg: 'rgba(234, 179, 8, 0.1)', text: 'rgb(250, 204, 21)', border: 'rgba(234, 179, 8, 0.3)' },
	COMPLETED: { bg: 'rgba(34, 197, 94, 0.1)', text: 'rgb(74, 222, 128)', border: 'rgba(34, 197, 94, 0.3)' },
	FAILED: { bg: 'rgba(239, 68, 68, 0.1)', text: 'rgb(248, 113, 113)', border: 'rgba(239, 68, 68, 0.3)' },
	REFUNDED: { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.3)' },
	CANCELLED: { bg: 'rgba(107, 114, 128, 0.1)', text: 'rgb(156, 163, 175)', border: 'rgba(107, 114, 128, 0.3)' },
};

export default function ShipmentRow({
	id,
	trackingNumber,
	vehicleType,
	vehicleMake,
	vehicleModel,
	origin,
	destination,
	status,
	progress,
	estimatedDelivery,
	createdAt,
	paymentStatus,
	user,
	showCustomer = false,
	delay = 0,
}: ShipmentRowProps) {
	const statusConfig = statusColors[status] || statusColors.PENDING;
	const paymentConfig = paymentStatus ? (paymentStatusColors[paymentStatus] || paymentStatusColors.PENDING) : null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			whileHover={{ y: -2 }}
		>
			<Card
				sx={{
					background: 'rgba(10, 22, 40, 0.5)',
					backdropFilter: 'blur(8px)',
					border: '1px solid rgba(6, 182, 212, 0.3)',
					borderRadius: { xs: 2, sm: 3 },
					p: { xs: 2, sm: 3, md: 4 },
					position: 'relative',
					overflow: 'hidden',
					transition: 'all 0.3s ease',
					'&:hover': {
						borderColor: 'rgba(6, 182, 212, 0.6)',
						boxShadow: '0 8px 16px rgba(6, 182, 212, 0.2)',
						'&::before': {
							opacity: 1,
						},
					},
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: 0,
						background: 'linear-gradient(90deg, rgba(6, 182, 212, 0) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(6, 182, 212, 0) 100%)',
						opacity: 0,
						transition: 'opacity 0.3s ease',
					},
				}}
			>
				<CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, position: 'relative', zIndex: 1 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
						{/* Header Row */}
						<Box
							sx={{
								display: 'flex',
								flexDirection: { xs: 'column', sm: 'row' },
								alignItems: { xs: 'flex-start', sm: 'flex-start' },
								justifyContent: 'space-between',
								gap: { xs: 1.5, sm: 2 },
							}}
						>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
									<Typography
										variant="h6"
										sx={{
											fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
											fontWeight: 700,
											color: 'white',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											maxWidth: { xs: '200px', sm: 'none' },
										}}
									>
										{trackingNumber}
									</Typography>
									<Chip
										label={formatStatus(status)}
										size="small"
										sx={{
											fontSize: { xs: '0.625rem', sm: '0.75rem' },
											fontWeight: 500,
											height: 'auto',
											py: { xs: 0.25, sm: 0.5 },
											bgcolor: statusConfig.bg,
											color: statusConfig.text,
											border: `1px solid ${statusConfig.border}`,
											flexShrink: 0,
										}}
									/>
									{paymentStatus && paymentConfig && (
										<Chip
											icon={<CreditCard sx={{ fontSize: 12, color: paymentConfig.text }} />}
											label={formatStatus(paymentStatus)}
											size="small"
											sx={{
												fontSize: { xs: '0.625rem', sm: '0.75rem' },
												fontWeight: 500,
												height: 'auto',
												py: { xs: 0.25, sm: 0.5 },
												bgcolor: paymentConfig.bg,
												color: paymentConfig.text,
												border: `1px solid ${paymentConfig.border}`,
												flexShrink: 0,
											}}
										/>
									)}
								</Box>
								<Typography
									variant="caption"
									sx={{
										fontSize: { xs: '0.75rem', sm: '0.875rem' },
										color: 'rgba(255, 255, 255, 0.6)',
									}}
								>
									Created: {new Date(createdAt).toLocaleDateString()}
								</Typography>
							</Box>

							{/* Actions */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
								<Box sx={{ flex: { xs: 1, sm: 'none' }, minWidth: 0 }}>
									<Link href={`/dashboard/shipments/${id}`} style={{ textDecoration: 'none' }}>
										<Button
											variant="outlined"
											size="small"
											startIcon={<Visibility sx={{ fontSize: { xs: 12, sm: 16 } }} />}
											sx={{
												fontSize: { xs: '0.75rem', sm: '0.875rem' },
												borderColor: 'rgba(6, 182, 212, 0.3)',
												color: 'rgb(34, 211, 238)',
												width: '100%',
												'&:hover': {
													bgcolor: 'rgba(6, 182, 212, 0.1)',
													borderColor: 'rgba(6, 182, 212, 0.5)',
												},
											}}
										>
											View
										</Button>
									</Link>
								</Box>
								<Box sx={{ flex: { xs: 1, sm: 'none' }, minWidth: 0 }}>
									<Link href={`/dashboard/shipments/${id}/edit`} style={{ textDecoration: 'none' }}>
										<Button
											variant="outlined"
											size="small"
											startIcon={<Edit sx={{ fontSize: { xs: 12, sm: 16 } }} />}
											sx={{
												fontSize: { xs: '0.75rem', sm: '0.875rem' },
												borderColor: 'rgba(6, 182, 212, 0.3)',
												color: 'rgb(34, 211, 238)',
												width: '100%',
												'&:hover': {
													bgcolor: 'rgba(6, 182, 212, 0.1)',
													borderColor: 'rgba(6, 182, 212, 0.5)',
												},
											}}
										>
											Edit
										</Button>
									</Link>
								</Box>
							</Box>
						</Box>

						{/* Vehicle Info */}
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
								gap: { xs: 1.5, sm: 2 },
							}}
						>
							<Box sx={{ minWidth: 0 }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
									Vehicle Type
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: '0.75rem', sm: '0.875rem' },
										fontWeight: 500,
										color: 'white',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{vehicleType}
								</Typography>
								{vehicleMake && vehicleModel && (
									<Typography
										variant="body2"
										sx={{
											fontSize: { xs: '0.75rem', sm: '0.875rem' },
											color: 'rgba(255, 255, 255, 0.7)',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{vehicleMake} {vehicleModel}
									</Typography>
								)}
							</Box>

							<Box sx={{ minWidth: 0 }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
									Route
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'white', minWidth: 0 }}>
									<Typography
										component="span"
										sx={{
											fontWeight: 500,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											fontSize: 'inherit',
										}}
									>
										{origin}
									</Typography>
									<ArrowForward sx={{ fontSize: { xs: 12, sm: 16 }, color: 'rgb(34, 211, 238)', flexShrink: 0 }} />
									<Typography
										component="span"
										sx={{
											fontWeight: 500,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											fontSize: 'inherit',
										}}
									>
										{destination}
									</Typography>
								</Box>
							</Box>

							<Box sx={{ minWidth: 0 }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
									Estimated Delivery
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: '0.75rem', sm: '0.875rem' },
										fontWeight: 500,
										color: 'white',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : 'TBD'}
								</Typography>
							</Box>
						</Box>

						{/* Customer Info (if admin) */}
						{showCustomer && user && (
							<Box sx={{ pt: { xs: 1.5, sm: 2 }, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
									Customer
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: '0.75rem', sm: '0.875rem' },
										fontWeight: 500,
										color: 'white',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{user.name || 'N/A'}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: '0.75rem', sm: '0.875rem' },
										color: 'rgba(255, 255, 255, 0.7)',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{user.email}
								</Typography>
							</Box>
						)}

						{/* Progress Bar */}
						<Box sx={{ pt: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
									Progress
								</Typography>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'rgb(34, 211, 238)', fontWeight: 600 }}>
									{progress}%
								</Typography>
							</Box>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: '100%' }}
								transition={{ duration: 1, delay: delay + 0.2 }}
							>
								<LinearProgress
									variant="determinate"
									value={progress}
									sx={{
										height: { xs: 6, sm: 8 },
										borderRadius: 1,
										bgcolor: '#020817',
										'& .MuiLinearProgress-bar': {
											background: 'linear-gradient(90deg, rgb(6, 182, 212) 0%, rgb(34, 211, 238) 100%)',
											borderRadius: 1,
										},
										position: 'relative',
										'&::after': {
											content: '""',
											position: 'absolute',
											inset: 0,
											background: 'rgba(6, 182, 212, 0.2)',
											filter: 'blur(4px)',
											borderRadius: 1,
										},
									}}
								/>
							</motion.div>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</motion.div>
	);
}
