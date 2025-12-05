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
	PENDING: { bg: 'rgba(var(--text-secondary-rgb), 0.15)', text: 'var(--text-secondary)', border: 'rgba(var(--text-secondary-rgb), 0.4)', glow: 'rgba(var(--text-secondary-rgb), 0.3)' },
	QUOTE_REQUESTED: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	QUOTE_APPROVED: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	PICKUP_SCHEDULED: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	PICKUP_COMPLETED: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	IN_TRANSIT: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	AT_PORT: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	LOADED_ON_VESSEL: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	IN_TRANSIT_OCEAN: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	ARRIVED_AT_DESTINATION: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	CUSTOMS_CLEARANCE: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	OUT_FOR_DELIVERY: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	DELIVERED: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	CANCELLED: { bg: 'rgba(var(--error-rgb), 0.15)', text: 'var(--error)', border: 'rgba(var(--error-rgb), 0.4)', glow: 'rgba(var(--error-rgb), 0.3)' },
	ON_HOLD: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
};

const formatStatus = (status: string) => {
	return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

const paymentStatusColors: Record<string, StatusColors> = {
	PENDING: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	COMPLETED: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	FAILED: { bg: 'rgba(var(--error-rgb), 0.15)', text: 'var(--error)', border: 'rgba(var(--error-rgb), 0.4)', glow: 'rgba(var(--error-rgb), 0.3)' },
	REFUNDED: { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)', glow: 'rgba(var(--accent-gold-rgb), 0.3)' },
	CANCELLED: { bg: 'rgba(var(--text-secondary-rgb), 0.15)', text: 'var(--text-secondary)', border: 'rgba(var(--text-secondary-rgb), 0.4)', glow: 'rgba(var(--text-secondary-rgb), 0.3)' },
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
					background: 'var(--panel)',
					border: '1px solid rgba(var(--panel-rgb), 0.9)',
					borderRadius: 2,
					boxShadow: '0 18px 32px rgba(var(--text-primary-rgb), 0.08)',
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
							color: 'var(--text-primary)',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{trackingNumber}
					</Typography>
					<Typography sx={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
						Created: {new Date(createdAt).toLocaleDateString()}
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
					<Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-secondary)', mb: 0.3 }}>
						Vehicle
					</Typography>
					<Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{vehicleType}</Typography>
					{(vehicleMake || vehicleModel) && (
						<Typography sx={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
							{vehicleMake || ''} {vehicleModel || ''}
						</Typography>
					)}
					{showCustomer && user && (
						<Typography sx={{ fontSize: '0.68rem', color: 'var(--text-secondary)', mt: 0.3 }}>
							{user.name || user.email}
						</Typography>
					)}
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-secondary)', mb: 0.3 }}>
						Route
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden' }}>
						<Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{origin}</Typography>
						<ArrowForward sx={{ fontSize: 14, color: 'var(--accent-gold)' }} />
						<Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{destination}</Typography>
					</Box>
					<Typography sx={{ fontSize: '0.68rem', color: 'var(--text-secondary)', mt: 0.2 }}>
						ETA {estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : 'Pending'}
					</Typography>
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-secondary)', mb: 0.3 }}>
						Progress
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
						<Typography sx={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pipeline</Typography>
						<Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: statusConfig.text }}>{progress}%</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={progress}
						aria-label={`Shipment ${trackingNumber} pipeline progress`}
						sx={{
							height: 4,
							borderRadius: 2,
							bgcolor: 'rgba(var(--panel-rgb), 0.8)',
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
								borderColor: 'rgba(var(--accent-gold-rgb), 0.4)',
								color: 'var(--accent-gold)',
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
								color: 'var(--text-secondary)',
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
