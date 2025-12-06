"use client";

import Link from 'next/link';
import { ArrowForward } from '@mui/icons-material';
import { Box, Typography, Chip, LinearProgress, Button, Slide } from '@mui/material';
import { useState, useEffect } from 'react';

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
	glow: string;
};

const neutralStatus: StatusColors = {
	bg: 'rgba(var(--panel-rgb), 0.35)',
	text: 'var(--text-primary)',
	border: 'var(--border)',
	glow: 'rgba(var(--accent-gold-rgb), 0.2)',
};

const statusColors: Record<string, StatusColors> = {
	'IN_TRANSIT': neutralStatus,
	'IN_TRANSIT_OCEAN': neutralStatus,
	'AT_PORT': neutralStatus,
	'DELIVERED': neutralStatus,
	'PICKUP_SCHEDULED': neutralStatus,
	'PICKUP_COMPLETED': neutralStatus,
	'PENDING': neutralStatus,
	'QUOTE_REQUESTED': neutralStatus,
	'QUOTE_APPROVED': neutralStatus,
	'LOADED_ON_VESSEL': neutralStatus,
	'ARRIVED_AT_DESTINATION': neutralStatus,
	'CUSTOMS_CLEARANCE': neutralStatus,
	'OUT_FOR_DELIVERY': neutralStatus,
	'DELAYED': { bg: 'rgba(var(--error-rgb), 0.15)', text: 'var(--error)', border: 'var(--error)', glow: 'rgba(var(--error-rgb), 0.3)' },
	'CANCELLED': { bg: 'rgba(var(--error-rgb), 0.15)', text: 'var(--error)', border: 'var(--error)', glow: 'rgba(var(--error-rgb), 0.3)' },
};

const defaultColors: StatusColors = neutralStatus;

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
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay * 1000);
		return () => clearTimeout(timer);
	}, [delay]);

	return (
		<Slide in={isVisible} direction="up" timeout={400}>
			<Box
				component="article"
				sx={{
					borderRadius: 2,
					border: '1px solid var(--border)',
					background: 'var(--panel)',
					boxShadow: '0 16px 32px rgba(var(--text-primary-rgb),0.08)',
					padding: { xs: 1, sm: 1.25 },
					display: 'flex',
					flexDirection: 'column',
					gap: 1.1,
					color: 'var(--text-primary)',
					minWidth: 0,
					width: '100%',
					boxSizing: 'border-box',
				}}
			>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
					<Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
						<Typography
							sx={{
								fontSize: { xs: '0.75rem', sm: '0.8rem' },
								fontWeight: 600,
								color: 'var(--text-primary)',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{trackingNumber}
						</Typography>
						<Typography
							sx={{
								fontSize: { xs: '0.6rem', sm: '0.65rem' },
								color: 'var(--text-secondary)',
								marginTop: 0.2,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							ID: {id.slice(0, 8)}
						</Typography>
					</Box>
					<Chip
						label={status.replace(/_/g, ' ')}
						size="small"
						sx={{
							height: { xs: 18, sm: 20 },
							fontSize: { xs: '0.6rem', sm: '0.65rem' },
							fontWeight: 600,
							borderColor: colors.border,
							color: colors.text,
							backgroundColor: colors.bg,
							flexShrink: 0,
							maxWidth: { xs: '90px', sm: 'none' },
							'& .MuiChip-label': {
								px: { xs: 0.5, sm: 1 },
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							},
						}}
						variant="outlined"
					/>
				</Box>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: '1fr',
						gap: 1,
						minWidth: 0,
					}}
				>
					<Box sx={{ minWidth: 0 }}>
						<Typography
							sx={{
								fontSize: { xs: '0.6rem', sm: '0.65rem' },
								textTransform: 'uppercase',
								letterSpacing: '0.18em',
								color: 'var(--text-secondary)',
								marginBottom: 0.35,
							}}
						>
							Origin
						</Typography>
						<Typography
							sx={{
								fontSize: { xs: '0.72rem', sm: '0.78rem' },
								fontWeight: 500,
								color: 'var(--text-primary)',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{origin}
						</Typography>
					</Box>
					<Box sx={{ minWidth: 0 }}>
						<Typography
							sx={{
								fontSize: { xs: '0.6rem', sm: '0.65rem' },
								textTransform: 'uppercase',
								letterSpacing: '0.18em',
								color: 'var(--text-secondary)',
								marginBottom: 0.35,
							}}
						>
							Destination
						</Typography>
						<Typography
							sx={{
								fontSize: { xs: '0.72rem', sm: '0.78rem' },
								fontWeight: 500,
								color: 'var(--text-primary)',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{destination}
						</Typography>
					</Box>
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, color: 'var(--text-secondary)' }}>Progress</Typography>
						<Typography sx={{ fontSize: { xs: '0.64rem', sm: '0.68rem' }, fontWeight: 600, color: colors.text }}>{progress}%</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={progress}
						aria-label={`Shipment ${trackingNumber} progress`}
						sx={{
							height: 4,
							borderRadius: 2,
							backgroundColor: 'rgba(var(--panel-rgb), 0.8)',
							'& .MuiLinearProgress-bar': {
								backgroundColor: colors.text,
								borderRadius: 2,
							},
						}}
					/>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
					<Typography 
						sx={{ 
							fontSize: { xs: '0.6rem', sm: '0.65rem' }, 
							color: 'var(--text-secondary)',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							flex: 1,
						}}
					>
						{estimatedDelivery ? `ETA ${new Date(estimatedDelivery).toLocaleDateString()}` : 'ETA pending'}
					</Typography>
					<Link href={`/dashboard/tracking/${id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
						<Button
							variant="text"
							size="small"
							endIcon={<ArrowForward sx={{ fontSize: { xs: 12, sm: 14 } }} />}
							sx={{
								fontSize: { xs: '0.65rem', sm: '0.7rem' },
								fontWeight: 600,
								textTransform: 'none',
								color: 'var(--accent-gold)',
								minWidth: 0,
								padding: 0,
							}}
						>
							Track
						</Button>
					</Link>
				</Box>
			</Box>
		</Slide>
	);
}
