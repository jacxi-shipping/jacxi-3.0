"use client";

import Link from 'next/link';
import { Visibility, Edit, ArrowForward, CreditCard } from '@mui/icons-material';
import { Box, Typography, Chip, Button, LinearProgress, Slide } from '@mui/material';
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
			<Box
				component="article"
				sx={{
					background: 'rgba(3, 7, 18, 0.85)',
					border: '1px solid rgba(148, 163, 184, 0.24)',
					borderRadius: 2,
					boxShadow: '0 18px 36px rgba(0, 0, 0, 0.4)',
					padding: { xs: 1.5, md: 1.75 },
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr',
						md: 'minmax(0, 1.5fr) minmax(0, 1.1fr) minmax(0, 1.2fr) minmax(0, 1fr) auto',
					},
					gap: { xs: 1.25, md: 1.5 },
					alignItems: 'center',
				}}
			>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
					<Typography
						sx={{
							fontSize: '0.9rem',
							fontWeight: 600,
							color: 'white',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{trackingNumber}
					</Typography>
					<Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)' }}>
						Created {new Date(createdAt).toLocaleDateString()}
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
						<Chip
							label={formatStatus(status)}
							size="small"
							sx={{
								height: 20,
								fontSize: '0.65rem',
								fontWeight: 600,
								bgcolor: statusConfig.bg,
								color: statusConfig.text,
								borderColor: statusConfig.border,
							}}
							variant="outlined"
						/>
						{paymentStatus && paymentConfig && (
							<Chip
								icon={<CreditCard sx={{ fontSize: 14, color: paymentConfig.text }} />}
								label={formatStatus(paymentStatus)}
								size="small"
								sx={{
									height: 20,
									fontSize: '0.62rem',
									fontWeight: 600,
									bgcolor: paymentConfig.bg,
									color: paymentConfig.text,
									borderColor: paymentConfig.border,
								}}
								variant="outlined"
							/>
						)}
					</Box>
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', mb: 0.3 }}>
						Vehicle
					</Typography>
					<Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>{vehicleType}</Typography>
					{(vehicleMake || vehicleModel) && (
						<Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
							{vehicleMake || ''} {vehicleModel || ''}
						</Typography>
					)}
					{showCustomer && user && (
						<Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.3 }}>
							{user.name || user.email}
						</Typography>
					)}
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', mb: 0.3 }}>
						Route
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', fontWeight: 600, color: 'white', overflow: 'hidden' }}>
						<Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{origin}</Typography>
						<ArrowForward sx={{ fontSize: 14, color: 'rgb(94,234,212)' }} />
						<Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{destination}</Typography>
					</Box>
					<Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', mt: 0.2 }}>
						ETA {estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : 'Pending'}
					</Typography>
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', mb: 0.3 }}>
						Progress
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
						<Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Pipeline</Typography>
						<Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: statusConfig.text }}>{progress}%</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={progress}
						sx={{
							height: 4,
							borderRadius: 2,
							bgcolor: 'rgba(255,255,255,0.08)',
							'& .MuiLinearProgress-bar': {
								background: statusConfig.text,
								borderRadius: 2,
							},
						}}
					/>
				</Box>

				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'row', md: 'column' },
						gap: 0.75,
						justifyContent: { xs: 'flex-end', md: 'center' },
						alignItems: { xs: 'center', md: 'flex-end' },
					}}
				>
					<Link href={`/dashboard/shipments/${id}`} style={{ textDecoration: 'none' }}>
						<Button
							variant="outlined"
							size="small"
							startIcon={<Visibility sx={{ fontSize: 14 }} />}
							sx={{
								fontSize: '0.7rem',
								fontWeight: 600,
								borderColor: 'rgba(59, 130, 246, 0.4)',
								color: 'rgb(144, 205, 244)',
								paddingX: 1.2,
								textTransform: 'none',
							}}
						>
							View
						</Button>
					</Link>
					<Link href={`/dashboard/shipments/${id}/edit`} style={{ textDecoration: 'none' }}>
						<Button
							variant="text"
							size="small"
							startIcon={<Edit sx={{ fontSize: 14 }} />}
							sx={{
								fontSize: '0.7rem',
								fontWeight: 600,
								color: 'rgba(255,255,255,0.8)',
								textTransform: 'none',
								paddingX: 0.5,
							}}
						>
							Edit
						</Button>
					</Link>
				</Box>
			</Box>
		</Slide>
	);
}
