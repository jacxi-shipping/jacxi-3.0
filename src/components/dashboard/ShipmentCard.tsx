"use client";

import Link from 'next/link';
import { ArrowForward, LocalShipping } from '@mui/icons-material';
import { Box, Typography, Chip, Button, Slide } from '@mui/material';
import { useState, useEffect } from 'react';

type ShipmentCardProps = {
	id: string;
	vehicleType: string;
	vehicleMake?: string | null;
	vehicleModel?: string | null;
	vehicleYear?: number | null;
	vehicleVIN?: string | null;
	status: string;
	containerId?: string | null;
	container?: {
		containerNumber: string;
		trackingNumber?: string | null;
		status?: string;
	} | null;
	delay?: number;
};

type StatusColors = {
	bg: string;
	text: string;
	border: string;
};

const neutralStatus: StatusColors = {
	bg: 'rgba(var(--panel-rgb), 0.35)',
	text: 'var(--text-primary)',
	border: 'var(--border)',
};

const statusColors: Record<string, StatusColors> = {
	'ON_HAND': { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)' },
	'IN_TRANSIT': { bg: 'rgba(var(--accent-gold-rgb), 0.15)', text: 'var(--accent-gold)', border: 'rgba(var(--accent-gold-rgb), 0.4)' },
};

const defaultColors: StatusColors = neutralStatus;

export default function ShipmentCard({
	id,
	vehicleType,
	vehicleMake,
	vehicleModel,
	vehicleYear,
	vehicleVIN,
	status,
	containerId,
	container,
	delay = 0,
}: ShipmentCardProps) {
	const colors = statusColors[status] || defaultColors;
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay * 1000);
		return () => clearTimeout(timer);
	}, [delay]);

	const vehicleInfo = [vehicleMake, vehicleModel, vehicleYear].filter(Boolean).join(' ') || vehicleType;

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
				{/* Header: Vehicle Info & Status */}
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
							{vehicleInfo}
						</Typography>
						{vehicleVIN && (
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
								VIN: {vehicleVIN}
							</Typography>
						)}
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

				{/* Vehicle Details */}
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
					<Typography
						sx={{
							fontSize: { xs: '0.6rem', sm: '0.65rem' },
							textTransform: 'uppercase',
							letterSpacing: '0.18em',
							color: 'var(--text-secondary)',
						}}
					>
						Vehicle Type
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
						{vehicleType}
					</Typography>
				</Box>

				{/* Container Info (only for IN_TRANSIT) */}
				{status === 'IN_TRANSIT' && container && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
						<Typography
							sx={{
								fontSize: { xs: '0.6rem', sm: '0.65rem' },
								textTransform: 'uppercase',
								letterSpacing: '0.18em',
								color: 'var(--text-secondary)',
							}}
						>
							Container
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<LocalShipping sx={{ fontSize: { xs: 14, sm: 16 }, color: 'var(--accent-gold)' }} />
							<Link href={`/dashboard/containers/${containerId}`} style={{ textDecoration: 'none' }}>
								<Typography
									sx={{
										fontSize: { xs: '0.72rem', sm: '0.78rem' },
										fontWeight: 600,
										color: 'var(--accent-gold)',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
										'&:hover': { textDecoration: 'underline' },
									}}
								>
									{container.containerNumber}
								</Typography>
							</Link>
						</Box>
					</Box>
				)}

				{/* Footer: View Details Button */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, minWidth: 0, mt: 0.5 }}>
					<Link href={`/dashboard/shipments/${id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
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
							View Details
						</Button>
					</Link>
				</Box>
			</Box>
		</Slide>
	);
}
