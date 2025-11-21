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

const statusColors: Record<string, StatusColors> = {
	'IN_TRANSIT': { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.3)' },
	'IN_TRANSIT_OCEAN': { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.3)' },
	'AT_PORT': { bg: 'rgba(139, 92, 246, 0.15)', text: 'rgb(167, 139, 250)', border: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.3)' },
	'DELIVERED': { bg: 'rgba(34, 197, 94, 0.15)', text: 'rgb(74, 222, 128)', border: 'rgba(34, 197, 94, 0.4)', glow: 'rgba(34, 197, 94, 0.3)' },
	'PICKUP_SCHEDULED': { bg: 'rgba(245, 158, 11, 0.15)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' },
	'PICKUP_COMPLETED': { bg: 'rgba(245, 158, 11, 0.15)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' },
	'PENDING': { bg: 'rgba(245, 158, 11, 0.15)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' },
	'QUOTE_REQUESTED': { bg: 'rgba(245, 158, 11, 0.15)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' },
	'QUOTE_APPROVED': { bg: 'rgba(245, 158, 11, 0.15)', text: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' },
	'LOADED_ON_VESSEL': { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(96, 165, 250)', border: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.3)' },
	'ARRIVED_AT_DESTINATION': { bg: 'rgba(139, 92, 246, 0.15)', text: 'rgb(167, 139, 250)', border: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.3)' },
	'CUSTOMS_CLEARANCE': { bg: 'rgba(139, 92, 246, 0.15)', text: 'rgb(167, 139, 250)', border: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.3)' },
	'OUT_FOR_DELIVERY': { bg: 'rgba(6, 182, 212, 0.15)', text: 'rgb(34, 211, 238)', border: 'rgba(6, 182, 212, 0.4)', glow: 'rgba(6, 182, 212, 0.3)' },
	'DELAYED': { bg: 'rgba(239, 68, 68, 0.15)', text: 'rgb(248, 113, 113)', border: 'rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.3)' },
	'CANCELLED': { bg: 'rgba(239, 68, 68, 0.15)', text: 'rgb(248, 113, 113)', border: 'rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.3)' },
};

const defaultColors: StatusColors = { 
	bg: 'rgba(245, 158, 11, 0.15)', 
	text: 'rgb(251, 191, 36)', 
	border: 'rgba(245, 158, 11, 0.4)',
	glow: 'rgba(245, 158, 11, 0.3)'
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
					border: '1px solid rgba(226, 232, 240, 0.9)',
					background: 'white',
					boxShadow: '0 16px 32px rgba(15,23,42,0.08)',
					padding: 1.25,
					display: 'flex',
					flexDirection: 'column',
					gap: 1.1,
				}}
			>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
					<Box sx={{ minWidth: 0 }}>
						<Typography
							sx={{
								fontSize: '0.8rem',
								fontWeight: 600,
								color: '#0f172a',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{trackingNumber}
						</Typography>
						<Typography
							sx={{
								fontSize: '0.65rem',
								color: 'rgba(255,255,255,0.55)',
								marginTop: 0.2,
							}}
						>
							ID: {id.slice(0, 8)}
						</Typography>
					</Box>
					<Chip
						label={status.replace(/_/g, ' ')}
						size="small"
						sx={{
							height: 20,
							fontSize: '0.65rem',
							fontWeight: 600,
							borderColor: colors.border,
							color: colors.text,
							backgroundColor: colors.bg,
						}}
						variant="outlined"
					/>
				</Box>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
						gap: 1,
					}}
				>
					<Box>
						<Typography
							sx={{
								fontSize: '0.65rem',
								textTransform: 'uppercase',
								letterSpacing: '0.18em',
								color: '#94a3b8',
								marginBottom: 0.35,
							}}
						>
							Origin
						</Typography>
						<Typography
							sx={{
								fontSize: '0.78rem',
								fontWeight: 500,
								color: '#0f172a',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{origin}
						</Typography>
					</Box>
					<Box>
						<Typography
							sx={{
								fontSize: '0.65rem',
								textTransform: 'uppercase',
								letterSpacing: '0.18em',
								color: '#94a3b8',
								marginBottom: 0.35,
							}}
						>
							Destination
						</Typography>
						<Typography
							sx={{
								fontSize: '0.78rem',
								fontWeight: 500,
								color: '#0f172a',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{destination}
						</Typography>
					</Box>
				</Box>

				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>Progress</Typography>
						<Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: colors.text }}>{progress}%</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={progress}
						sx={{
							height: 4,
							borderRadius: 2,
							backgroundColor: 'rgba(226, 232, 240, 0.8)',
							'& .MuiLinearProgress-bar': {
								backgroundColor: colors.text,
								borderRadius: 2,
							},
						}}
					/>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
						{estimatedDelivery ? `ETA ${new Date(estimatedDelivery).toLocaleDateString()}` : 'ETA pending'}
					</Typography>
					<Link href={`/dashboard/tracking/${id}`} style={{ textDecoration: 'none' }}>
						<Button
							variant="text"
							size="small"
							endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
							sx={{
								fontSize: '0.7rem',
								fontWeight: 600,
								textTransform: 'none',
								color: '#0f62fe',
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
