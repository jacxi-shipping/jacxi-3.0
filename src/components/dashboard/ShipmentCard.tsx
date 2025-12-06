"use client";

import Link from 'next/link';
import { ArrowForward, LocalShipping, LocationOn, CalendarToday } from '@mui/icons-material';
import { Box, Typography, Chip, Button, Slide, LinearProgress } from '@mui/material';
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
		currentLocation?: string | null;
		estimatedArrival?: string | null;
		vesselName?: string | null;
		shippingLine?: string | null;
		progress?: number;
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

const containerStatusColors: Record<string, StatusColors> = {
	'CREATED': { bg: 'rgba(107, 114, 128, 0.15)', text: 'rgb(107, 114, 128)', border: 'rgba(107, 114, 128, 0.4)' },
	'WAITING_FOR_LOADING': { bg: 'rgba(251, 191, 36, 0.15)', text: 'rgb(251, 191, 36)', border: 'rgba(251, 191, 36, 0.4)' },
	'LOADED': { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(59, 130, 246)', border: 'rgba(59, 130, 246, 0.4)' },
	'IN_TRANSIT': { bg: 'rgba(99, 102, 241, 0.15)', text: 'rgb(99, 102, 241)', border: 'rgba(99, 102, 241, 0.4)' },
	'ARRIVED_PORT': { bg: 'rgba(34, 197, 94, 0.15)', text: 'rgb(34, 197, 94)', border: 'rgba(34, 197, 94, 0.4)' },
	'CUSTOMS_CLEARANCE': { bg: 'rgba(249, 115, 22, 0.15)', text: 'rgb(249, 115, 22)', border: 'rgba(249, 115, 22, 0.4)' },
	'RELEASED': { bg: 'rgba(20, 184, 166, 0.15)', text: 'rgb(20, 184, 166)', border: 'rgba(20, 184, 166, 0.4)' },
	'CLOSED': { bg: 'rgba(75, 85, 99, 0.15)', text: 'rgb(75, 85, 99)', border: 'rgba(75, 85, 99, 0.4)' },
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

				{/* Container Shipping Info */}
				{container && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, mt: 0.5 }}>
						{/* Container Number and Status */}
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
								<LocalShipping sx={{ fontSize: { xs: 14, sm: 16 }, color: 'var(--accent-gold)', flexShrink: 0 }} />
								<Link href={`/dashboard/containers/${containerId}`} style={{ textDecoration: 'none', minWidth: 0, overflow: 'hidden' }}>
									<Typography
										sx={{
											fontSize: { xs: '0.7rem', sm: '0.75rem' },
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
							{container.status && (
								<Chip
									label={container.status.replace(/_/g, ' ')}
									size="small"
									sx={{
										height: { xs: 16, sm: 18 },
										fontSize: { xs: '0.55rem', sm: '0.6rem' },
										fontWeight: 600,
										borderColor: containerStatusColors[container.status]?.border || 'var(--border)',
										color: containerStatusColors[container.status]?.text || 'var(--text-primary)',
										backgroundColor: containerStatusColors[container.status]?.bg || 'rgba(var(--panel-rgb), 0.35)',
										flexShrink: 0,
										maxWidth: { xs: '80px', sm: 'none' },
										'& .MuiChip-label': {
											px: { xs: 0.4, sm: 0.8 },
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										},
									}}
									variant="outlined"
								/>
							)}
						</Box>

						{/* Shipping Progress */}
						{typeof container.progress === 'number' && (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, minWidth: 0 }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Typography
										sx={{
											fontSize: { xs: '0.6rem', sm: '0.65rem' },
											textTransform: 'uppercase',
											letterSpacing: '0.15em',
											color: 'var(--text-secondary)',
										}}
									>
										Shipping Progress
									</Typography>
									<Typography
										sx={{
											fontSize: { xs: '0.65rem', sm: '0.7rem' },
											fontWeight: 600,
											color: 'var(--accent-gold)',
										}}
									>
										{container.progress}%
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={container.progress}
									sx={{
										height: { xs: 4, sm: 5 },
										borderRadius: 1,
										backgroundColor: 'rgba(var(--border-rgb, 255, 255, 255), 0.1)',
										'& .MuiLinearProgress-bar': {
											backgroundColor: 'var(--accent-gold)',
											borderRadius: 1,
										},
									}}
								/>
							</Box>
						)}

						{/* Current Location */}
						{container.currentLocation && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
								<LocationOn sx={{ fontSize: { xs: 12, sm: 14 }, color: 'var(--text-secondary)', flexShrink: 0 }} />
								<Typography
									sx={{
										fontSize: { xs: '0.65rem', sm: '0.7rem' },
										color: 'var(--text-secondary)',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{container.currentLocation}
								</Typography>
							</Box>
						)}

						{/* Vessel and ETA */}
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
							{container.vesselName && (
								<Typography
									sx={{
										fontSize: { xs: '0.65rem', sm: '0.7rem' },
										color: 'var(--text-secondary)',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									<span style={{ fontWeight: 600 }}>Vessel:</span> {container.vesselName}
								</Typography>
							)}
							{container.estimatedArrival && (
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
									<CalendarToday sx={{ fontSize: { xs: 12, sm: 14 }, color: 'var(--text-secondary)', flexShrink: 0 }} />
									<Typography
										sx={{
											fontSize: { xs: '0.65rem', sm: '0.7rem' },
											color: 'var(--text-secondary)',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										ETA: {new Date(container.estimatedArrival).toLocaleDateString()}
									</Typography>
								</Box>
							)}
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
