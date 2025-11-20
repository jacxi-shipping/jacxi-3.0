"use client";

import Link from 'next/link';
import { Visibility, ArrowForward } from '@mui/icons-material';
import { Card, CardContent, Box, Typography, Chip, LinearProgress, Button, Fade, Slide } from '@mui/material';
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
			<Card
				sx={{
					background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.9) 0%, rgba(10, 22, 40, 0.6) 100%)',
					backdropFilter: 'blur(20px)',
					border: '1px solid rgba(6, 182, 212, 0.2)',
					borderRadius: 2,
					p: 1.5,
					position: 'relative',
					overflow: 'hidden',
					transition: 'all 0.3s ease',
					'&:hover': {
						borderColor: 'rgba(6, 182, 212, 0.4)',
						boxShadow: '0 8px 20px rgba(6, 182, 212, 0.15)',
						transform: 'translateY(-2px)',
					},
				}}
			>
				<CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
					{/* Header */}
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
						<Fade in={isVisible} timeout={400}>
							<Box>
								<Typography
									variant="h6"
									sx={{
										fontSize: '0.875rem',
										fontWeight: 600,
										color: 'white',
										mb: 0.25,
									}}
								>
									{trackingNumber}
								</Typography>
								<Typography
									variant="caption"
									sx={{
										fontSize: '0.6875rem',
										color: 'rgba(255, 255, 255, 0.5)',
									}}
								>
									ID: {id.slice(0, 8)}
								</Typography>
							</Box>
						</Fade>
						<Fade in={isVisible} timeout={400}>
							<Chip
								label={status.replace(/_/g, ' ')}
								size="small"
								sx={{
									fontSize: '0.6875rem',
									fontWeight: 600,
									height: 20,
									px: 0.75,
									bgcolor: colors.bg,
									color: colors.text,
									border: `1px solid ${colors.border}`,
								}}
							/>
						</Fade>
					</Box>

					{/* Route */}
					<Fade in={isVisible} timeout={400}>
						<Box sx={{ mb: 1.5 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
								<Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
									From:
								</Typography>
								<Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'white' }}>
									{origin}
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
									To:
								</Typography>
								<Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'white' }}>
									{destination}
								</Typography>
							</Box>
						</Box>
					</Fade>

					{/* Progress */}
					<Fade in={isVisible} timeout={400}>
						<Box sx={{ mb: 1 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
								<Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
									Progress
								</Typography>
								<Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: colors.text }}>
									{progress}%
								</Typography>
							</Box>
							<LinearProgress
								className="progress-bar"
								variant="determinate"
								value={progress}
								sx={{
									height: 4,
									borderRadius: 2,
									bgcolor: 'rgba(6, 182, 212, 0.1)',
									transition: 'transform 0.3s ease',
									'& .MuiLinearProgress-bar': {
										bgcolor: colors.text,
										borderRadius: 2,
									},
								}}
							/>
						</Box>
					</Fade>

					{/* Footer */}
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
						<Fade in={isVisible} timeout={400}>
							<Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
								{estimatedDelivery ? `ETA: ${estimatedDelivery}` : 'ETA: TBD'}
							</Typography>
						</Fade>
						<Fade in={isVisible} timeout={400}>
							<Link href={`/dashboard/tracking/${id}`} passHref style={{ textDecoration: 'none' }}>
								<Button
									className="view-button"
									variant="text"
									size="small"
									endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
									sx={{
										fontSize: '0.6875rem',
										fontWeight: 600,
										color: 'rgb(34, 211, 238)',
										textTransform: 'none',
										px: 1,
										py: 0.5,
										minWidth: 0,
										transition: 'all 0.3s ease',
										'&:hover': {
											bgcolor: 'rgba(6, 182, 212, 0.1)',
										},
									}}
								>
									View
								</Button>
							</Link>
						</Fade>
					</Box>
				</CardContent>
			</Card>
		</Slide>
	);
}
