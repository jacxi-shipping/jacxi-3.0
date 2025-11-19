"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Visibility, ArrowForward } from '@mui/icons-material';
import { Card, CardContent, Box, Typography, Chip, LinearProgress, Button } from '@mui/material';

type ShipmentCardProps = {
	id: string;
	trackingNumber: string;
	status: string;
	origin: string;
	destination: string;
	progress: number;
	estimatedDelivery: string | null;
	delay?: number;
};

type StatusColors = {
	bg: string;
	text: string;
	border: string;
};

const statusColors: Record<string, StatusColors> = {
	'IN_TRANSIT': { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.3)' },
	'IN_TRANSIT_OCEAN': { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.3)' },
	'AT_PORT': { bg: 'rgba(139, 92, 246, 0.1)', text: 'rgb(167, 139, 250)', border: 'rgba(139, 92, 246, 0.3)' },
	'DELIVERED': { bg: 'rgba(34, 197, 94, 0.1)', text: 'rgb(74, 222, 128)', border: 'rgba(34, 197, 94, 0.3)' },
	'PICKUP_SCHEDULED': { bg: 'rgba(245, 158, 11, 0.1)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.3)' },
	'PICKUP_COMPLETED': { bg: 'rgba(245, 158, 11, 0.1)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.3)' },
	'PENDING': { bg: 'rgba(245, 158, 11, 0.1)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.3)' },
	'QUOTE_REQUESTED': { bg: 'rgba(245, 158, 11, 0.1)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.3)' },
	'QUOTE_APPROVED': { bg: 'rgba(245, 158, 11, 0.1)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.3)' },
	'LOADED_ON_VESSEL': { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.3)' },
	'ARRIVED_AT_DESTINATION': { bg: 'rgba(139, 92, 246, 0.1)', text: 'rgb(167, 139, 250)', border: 'rgba(139, 92, 246, 0.3)' },
	'CUSTOMS_CLEARANCE': { bg: 'rgba(139, 92, 246, 0.1)', text: 'rgb(167, 139, 250)', border: 'rgba(139, 92, 246, 0.3)' },
	'OUT_FOR_DELIVERY': { bg: 'rgba(6, 182, 212, 0.1)', text: 'rgb(34, 211, 238)', border: 'rgba(6, 182, 212, 0.3)' },
	'DELAYED': { bg: 'rgba(239, 68, 68, 0.1)', text: 'rgb(248, 113, 113)', border: 'rgba(239, 68, 68, 0.3)' },
	'CANCELLED': { bg: 'rgba(239, 68, 68, 0.1)', text: 'rgb(248, 113, 113)', border: 'rgba(239, 68, 68, 0.3)' },
};

const defaultColors: StatusColors = { 
	bg: 'rgba(245, 158, 11, 0.1)', 
	text: 'rgb(251, 191, 36)', 
	border: 'rgba(245, 158, 11, 0.3)' 
};

export default function ShipmentCard({
	id,
	trackingNumber,
	status,
	origin,
	destination,
	progress,
	estimatedDelivery,
	delay = 0,
}: ShipmentCardProps) {
	const colors = statusColors[status] || defaultColors;

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true }}
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
						{/* Header */}
						<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: { xs: 1, sm: 1.5 } }}>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography
									variant="h6"
									sx={{
										fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
										fontWeight: 700,
										color: 'white',
										mb: { xs: 0.25, sm: 0.5 },
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{trackingNumber}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
										color: 'rgba(255, 255, 255, 0.7)',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{origin} → {destination}
								</Typography>
							</Box>
							<Chip
								label={status.replace(/_/g, ' ')}
								size="small"
								sx={{
									fontSize: { xs: '0.625rem', sm: '0.75rem' },
									fontWeight: 500,
									height: 'auto',
									py: 0.5,
									bgcolor: colors.bg,
									color: colors.text,
									border: `1px solid ${colors.border}`,
									flexShrink: 0,
								}}
							/>
						</Box>

						{/* Progress */}
						<Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
								<Typography
									variant="caption"
									sx={{
										fontSize: { xs: '0.625rem', sm: '0.75rem' },
										color: 'rgba(255, 255, 255, 0.6)',
										fontWeight: 500,
									}}
								>
									Progress
								</Typography>
								<Typography
									variant="caption"
									sx={{
										fontSize: { xs: '0.625rem', sm: '0.75rem' },
										color: 'rgb(34, 211, 238)',
										fontWeight: 600,
									}}
								>
									{progress}%
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={progress}
								sx={{
									height: { xs: 6, sm: 8 },
									borderRadius: 1,
									bgcolor: 'rgba(6, 182, 212, 0.1)',
									'& .MuiLinearProgress-bar': {
										bgcolor: 'rgb(34, 211, 238)',
										borderRadius: 1,
									},
								}}
							/>
						</Box>

						{/* Footer */}
						<Box
							sx={{
								display: 'flex',
								flexDirection: { xs: 'column', sm: 'row' },
								alignItems: { xs: 'flex-start', sm: 'center' },
								justifyContent: 'space-between',
								gap: { xs: 1, sm: 1.5 },
								pt: { xs: 1.5, sm: 2 },
								borderTop: '1px solid rgba(255, 255, 255, 0.1)',
							}}
						>
							<Typography
								variant="caption"
								sx={{
									fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
									color: 'rgba(255, 255, 255, 0.6)',
								}}
							>
								{estimatedDelivery ? (
									<>ETA: {new Date(estimatedDelivery).toLocaleDateString()}</>
								) : (
									<>ETA: TBD</>
								)}
							</Typography>
							<Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
								<Link href={`/dashboard/shipments/${id}`} style={{ textDecoration: 'none' }}>
									<Button
										variant="outlined"
										size="small"
										endIcon={<ArrowForward sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
										startIcon={<Visibility sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
										sx={{
											fontSize: { xs: '0.75rem', sm: '0.875rem' },
											borderColor: 'rgba(6, 182, 212, 0.3)',
											color: 'rgb(34, 211, 238)',
											width: { xs: '100%', sm: 'auto' },
											'&:hover': {
												bgcolor: 'rgba(6, 182, 212, 0.1)',
												borderColor: 'rgba(6, 182, 212, 0.5)',
											},
											'& .MuiButton-endIcon': {
												transition: 'transform 0.2s ease',
											},
											'&:hover .MuiButton-endIcon': {
												transform: 'translateX(4px)',
											},
										}}
									>
										<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
											View Details
										</Box>
										<Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
											Details
										</Box>
									</Button>
								</Link>
							</Box>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</motion.div>
	);
}
