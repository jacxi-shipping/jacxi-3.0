"use client";

import { SvgIconComponent } from '@mui/icons-material';
import { Card, CardContent, Box, Typography, Chip, Fade, Zoom } from '@mui/material';
import { useState, useEffect } from 'react';

type StatsCardProps = {
	icon: SvgIconComponent;
	title: string;
	value: string | number;
	subtitle?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	delay?: number;
};

export default function StatsCard({ 
	icon: Icon, 
	title, 
	value, 
	subtitle, 
	trend,
	delay = 0
}: StatsCardProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay * 1000);
		return () => clearTimeout(timer);
	}, [delay]);

	return (
		<Fade in={isVisible} timeout={600}>
			<Card
				sx={{
					height: '100%',
					background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.8) 0%, rgba(10, 22, 40, 0.4) 100%)',
					backdropFilter: 'blur(20px)',
					border: '1px solid rgba(6, 182, 212, 0.2)',
					borderRadius: 2,
					p: 1.5,
					position: 'relative',
					overflow: 'hidden',
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					'&:hover': {
						borderColor: 'rgba(6, 182, 212, 0.5)',
						boxShadow: '0 8px 20px rgba(6, 182, 212, 0.2)',
						transform: 'translateY(-2px)',
						'& .icon-container': {
							transform: 'scale(1.05)',
						},
					},
				}}
			>
				<CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, position: 'relative', zIndex: 1 }}>
					{/* Icon and Trend */}
					<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
						<Zoom in={isVisible} timeout={400}>
							<Box
								className="icon-container"
								sx={{
									position: 'relative',
									width: 40,
									height: 40,
									borderRadius: 2,
									background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.05) 100%)',
									border: '1px solid rgba(6, 182, 212, 0.3)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transition: 'all 0.3s ease',
								}}
							>
								<Icon
									sx={{
										fontSize: 20,
										color: 'rgb(34, 211, 238)',
									}}
								/>
							</Box>
						</Zoom>
						{trend && (
							<Fade in={isVisible} timeout={400}>
								<Chip
									label={`${trend.isPositive ? '↑' : '↓'} ${Math.abs(trend.value)}%`}
									size="small"
									sx={{
										fontSize: '0.6875rem',
										fontWeight: 600,
										px: 0.75,
										py: 0.25,
										height: 20,
										background: trend.isPositive 
											? 'rgba(34, 197, 94, 0.15)'
											: 'rgba(239, 68, 68, 0.15)',
										color: trend.isPositive ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)',
										border: `1px solid ${trend.isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
									}}
								/>
							</Fade>
						)}
					</Box>

					{/* Value */}
					<Fade in={isVisible} timeout={600}>
						<Typography
							className="value"
							variant="h3"
							sx={{
								fontSize: '1.5rem',
								fontWeight: 700,
								color: 'white',
								mb: 0.5,
								lineHeight: 1.2,
							}}
						>
							{value}
						</Typography>
					</Fade>

					{/* Title */}
					<Fade in={isVisible} timeout={600}>
						<Typography
							variant="body2"
							sx={{
								fontSize: '0.8125rem',
								fontWeight: 500,
								color: 'rgba(255, 255, 255, 0.8)',
								mb: subtitle ? 0.25 : 0,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{title}
						</Typography>
					</Fade>

					{/* Subtitle */}
					{subtitle && (
						<Fade in={isVisible} timeout={600}>
							<Typography
								variant="caption"
								sx={{
									fontSize: '0.6875rem',
									color: 'rgba(255, 255, 255, 0.5)',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									display: 'block',
								}}
							>
								{subtitle}
							</Typography>
						</Fade>
					)}
				</CardContent>
			</Card>
		</Fade>
	);
}
