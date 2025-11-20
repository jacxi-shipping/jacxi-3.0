"use client";

import Link from 'next/link';
import { Visibility, Edit, ArrowForward, CreditCard } from '@mui/icons-material';
import { Card, CardContent, Box, Typography, Chip, Button, LinearProgress, Slide } from '@mui/material';
import { useState, useEffect } from 'react';

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
	glow: string;
};

const statusColors: Record<string, StatusColors> = {
	PENDING: { bg: 'rgba(107, 114, 128, 0.15)', text: 'rgb(156, 163, 175)', border: 'rgba(107, 114, 128, 0.4)', glow: 'rgba(107, 114, 128, 0.3)' },
	QUOTE_REQUESTED: { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.3)' },
	QUOTE_APPROVED: { bg: 'rgba(34, 197, 94, 0.15)', text: 'rgb(74, 222, 128)', border: 'rgba(34, 197, 94, 0.4)', glow: 'rgba(34, 197, 94, 0.3)' },
	PICKUP_SCHEDULED: { bg: 'rgba(234, 179, 8, 0.15)', text: 'rgb(250, 204, 21)', border: 'rgba(234, 179, 8, 0.4)', glow: 'rgba(234, 179, 8, 0.3)' },
	PICKUP_COMPLETED: { bg: 'rgba(249, 115, 22, 0.15)', text: 'rgb(251, 146, 60)', border: 'rgba(249, 115, 22, 0.4)', glow: 'rgba(249, 115, 22, 0.3)' },
	IN_TRANSIT: { bg: 'rgba(6, 182, 212, 0.15)', text: 'rgb(34, 211, 238)', border: 'rgba(6, 182, 212, 0.4)', glow: 'rgba(6, 182, 212, 0.3)' },
	AT_PORT: { bg: 'rgba(139, 92, 246, 0.15)', text: 'rgb(167, 139, 250)', border: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.3)' },
	LOADED_ON_VESSEL: { bg: 'rgba(99, 102, 241, 0.15)', text: 'rgb(129, 140, 248)', border: 'rgba(99, 102, 241, 0.4)', glow: 'rgba(99, 102, 241, 0.3)' },
	IN_TRANSIT_OCEAN: { bg: 'rgba(236, 72, 153, 0.15)', text: 'rgb(244, 114, 182)', border: 'rgba(236, 72, 153, 0.4)', glow: 'rgba(236, 72, 153, 0.3)' },
	ARRIVED_AT_DESTINATION: { bg: 'rgba(20, 184, 166, 0.15)', text: 'rgb(45, 212, 191)', border: 'rgba(20, 184, 166, 0.4)', glow: 'rgba(20, 184, 166, 0.3)' },
	CUSTOMS_CLEARANCE: { bg: 'rgba(6, 182, 212, 0.15)', text: 'rgb(34, 211, 238)', border: 'rgba(6, 182, 212, 0.4)', glow: 'rgba(6, 182, 212, 0.3)' },
	OUT_FOR_DELIVERY: { bg: 'rgba(132, 204, 22, 0.15)', text: 'rgb(163, 230, 53)', border: 'rgba(132, 204, 22, 0.4)', glow: 'rgba(132, 204, 22, 0.3)' },
	DELIVERED: { bg: 'rgba(16, 185, 129, 0.15)', text: 'rgb(52, 211, 153)', border: 'rgba(16, 185, 129, 0.4)', glow: 'rgba(16, 185, 129, 0.3)' },
	CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', text: 'rgb(248, 113, 113)', border: 'rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.3)' },
	ON_HOLD: { bg: 'rgba(245, 158, 11, 0.15)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' },
};

const formatStatus = (status: string) => {
	return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

const paymentStatusColors: Record<string, StatusColors> = {
	PENDING: { bg: 'rgba(234, 179, 8, 0.15)', text: 'rgb(250, 204, 21)', border: 'rgba(234, 179, 8, 0.4)', glow: 'rgba(234, 179, 8, 0.3)' },
	COMPLETED: { bg: 'rgba(34, 197, 94, 0.15)', text: 'rgb(74, 222, 128)', border: 'rgba(34, 197, 94, 0.4)', glow: 'rgba(34, 197, 94, 0.3)' },
	FAILED: { bg: 'rgba(239, 68, 68, 0.15)', text: 'rgb(248, 113, 113)', border: 'rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.3)' },
	REFUNDED: { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.3)' },
	CANCELLED: { bg: 'rgba(107, 114, 128, 0.15)', text: 'rgb(156, 163, 175)', border: 'rgba(107, 114, 128, 0.4)', glow: 'rgba(107, 114, 128, 0.3)' },
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
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay * 1000);
		return () => clearTimeout(timer);
	}, [delay]);

	return (
		<Slide in={isVisible} direction="up" timeout={600}>
			<Card
				sx={{
					background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.9) 0%, rgba(10, 22, 40, 0.6) 100%)',
					backdropFilter: 'blur(20px)',
					border: '1px solid rgba(6, 182, 212, 0.2)',
					borderRadius: { xs: 3, sm: 4 },
					p: { xs: 2.5, sm: 3.5, md: 4 },
					position: 'relative',
					overflow: 'hidden',
					transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
					transform: 'translateY(0)',
					'&:hover': {
						borderColor: 'rgba(6, 182, 212, 0.5)',
						boxShadow: '0 20px 40px rgba(6, 182, 212, 0.25)',
						transform: 'translateY(-4px)',
						'&::before': {
							opacity: 1,
						},
						'& .action-button': {
							transform: 'translateX(2px)',
						},
					},
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: 0,
						background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(6, 182, 212, 0) 100%)',
						opacity: 0,
						transition: 'opacity 0.4s ease',
					},
				}}
			>
				<CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, position: 'relative', zIndex: 1 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
						{/* Header Row */}
						<Box
							sx={{
								display: 'flex',
								flexDirection: { xs: 'column', sm: 'row' },
								alignItems: { xs: 'flex-start', sm: 'center' },
								justifyContent: 'space-between',
								gap: { xs: 2, sm: 2.5 },
							}}
						>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
									<Typography
										variant="h6"
										sx={{
											fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
											fontWeight: 700,
											background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(200, 220, 255) 100%)',
											WebkitBackgroundClip: 'text',
											WebkitTextFillColor: 'transparent',
											backgroundClip: 'text',
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
											fontSize: { xs: '0.6875rem', sm: '0.75rem' },
											fontWeight: 600,
											height: 'auto',
											py: 0.75,
											px: 1.5,
											bgcolor: statusConfig.bg,
											color: statusConfig.text,
											border: `1px solid ${statusConfig.border}`,
											boxShadow: `0 0 15px ${statusConfig.glow}`,
											flexShrink: 0,
											transition: 'all 0.3s ease',
											'&:hover': {
												transform: 'scale(1.05)',
											},
										}}
									/>
									{paymentStatus && paymentConfig && (
										<Chip
											icon={<CreditCard sx={{ fontSize: 14, color: paymentConfig.text }} />}
											label={formatStatus(paymentStatus)}
											size="small"
											sx={{
												fontSize: { xs: '0.6875rem', sm: '0.75rem' },
												fontWeight: 600,
												height: 'auto',
												py: 0.75,
												px: 1.5,
												bgcolor: paymentConfig.bg,
												color: paymentConfig.text,
												border: `1px solid ${paymentConfig.border}`,
												boxShadow: `0 0 15px ${paymentConfig.glow}`,
												flexShrink: 0,
												transition: 'all 0.3s ease',
												'&:hover': {
													transform: 'scale(1.05)',
												},
											}}
										/>
									)}
								</Box>
								<Typography
									variant="caption"
									sx={{
										fontSize: { xs: '0.75rem', sm: '0.8125rem' },
										color: 'rgba(255, 255, 255, 0.6)',
										fontWeight: 500,
									}}
								>
									Created: {new Date(createdAt).toLocaleDateString()}
								</Typography>
							</Box>

							{/* Actions */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
								<Box sx={{ flex: { xs: 1, sm: 'none' }, minWidth: 0 }}>
									<Link href={`/dashboard/shipments/${id}`} style={{ textDecoration: 'none' }}>
										<Button
											className="action-button"
											variant="outlined"
											size="small"
											startIcon={<Visibility sx={{ fontSize: { xs: 14, sm: 16 } }} />}
											sx={{
												fontSize: { xs: '0.75rem', sm: '0.875rem' },
												fontWeight: 600,
												borderColor: 'rgba(6, 182, 212, 0.4)',
												background: 'rgba(6, 182, 212, 0.05)',
												color: 'rgb(34, 211, 238)',
												width: '100%',
												px: 2,
												py: 1,
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
								<Box sx={{ flex: { xs: 1, sm: 'none' }, minWidth: 0 }}>
									<Link href={`/dashboard/shipments/${id}/edit`} style={{ textDecoration: 'none' }}>
										<Button
											className="action-button"
											variant="outlined"
											size="small"
											startIcon={<Edit sx={{ fontSize: { xs: 14, sm: 16 } }} />}
											sx={{
												fontSize: { xs: '0.75rem', sm: '0.875rem' },
												fontWeight: 600,
												borderColor: 'rgba(139, 92, 246, 0.4)',
												background: 'rgba(139, 92, 246, 0.05)',
												color: 'rgb(167, 139, 250)',
												width: '100%',
												px: 2,
												py: 1,
												transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
												'&:hover': {
													background: 'rgba(139, 92, 246, 0.15)',
													borderColor: 'rgba(139, 92, 246, 0.6)',
													boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
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
								gap: { xs: 2, sm: 2.5 },
								p: 2.5,
								borderRadius: 2.5,
								background: 'rgba(255, 255, 255, 0.03)',
								border: '1px solid rgba(255, 255, 255, 0.05)',
							}}
						>
							<Box sx={{ minWidth: 0 }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
									Vehicle Type
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: '0.875rem', sm: '0.9375rem' },
										fontWeight: 600,
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
											fontSize: { xs: '0.75rem', sm: '0.8125rem' },
											color: 'rgba(255, 255, 255, 0.7)',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											mt: 0.5,
										}}
									>
										{vehicleMake} {vehicleModel}
									</Typography>
								)}
							</Box>

							<Box sx={{ minWidth: 0 }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
									Route
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.875rem', sm: '0.9375rem' }, color: 'white', minWidth: 0 }}>
									<Typography
										component="span"
										sx={{
											fontWeight: 600,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											fontSize: 'inherit',
										}}
									>
										{origin}
									</Typography>
									<ArrowForward sx={{ fontSize: 16, color: 'rgb(34, 211, 238)', flexShrink: 0 }} />
									<Typography
										component="span"
										sx={{
											fontWeight: 600,
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
								<Typography variant="caption" sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
									Estimated Delivery
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: '0.875rem', sm: '0.9375rem' },
										fontWeight: 600,
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
							<Box sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
									Customer
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: '0.875rem', sm: '0.9375rem' },
										fontWeight: 600,
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
										fontSize: { xs: '0.75rem', sm: '0.8125rem' },
										color: 'rgba(255, 255, 255, 0.7)',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
										mt: 0.5,
									}}
								>
									{user.email}
								</Typography>
							</Box>
						)}

						{/* Progress Bar */}
						<Box sx={{ pt: 1.5 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' }, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									Progress
								</Typography>
								<Typography variant="caption" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, color: 'rgb(34, 211, 238)', fontWeight: 700, textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}>
									{progress}%
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={progress}
								sx={{
									height: { xs: 8, sm: 10 },
									borderRadius: 2,
									bgcolor: 'rgba(6, 182, 212, 0.1)',
									overflow: 'visible',
									'& .MuiLinearProgress-bar': {
										background: 'linear-gradient(90deg, rgb(34, 211, 238) 0%, rgb(6, 182, 212) 100%)',
										borderRadius: 2,
										boxShadow: '0 0 15px rgba(34, 211, 238, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
										position: 'relative',
										'&::after': {
											content: '""',
											position: 'absolute',
											inset: 0,
											background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent)',
											borderRadius: 2,
										},
									},
								}}
							/>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Slide>
	);
}
