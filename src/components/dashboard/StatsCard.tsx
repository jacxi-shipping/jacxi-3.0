"use client";

import { SvgIconComponent } from '@mui/icons-material';
import { Box, Typography, Chip, Fade } from '@mui/material';
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
			<Box
				component="article"
				sx={{
					height: '100%',
					borderRadius: 2,
					border: '1px solid rgba(148, 163, 184, 0.2)',
					background:
						'linear-gradient(135deg, rgba(4, 10, 22, 0.95) 0%, rgba(6, 14, 28, 0.75) 100%)',
					boxShadow: '0 20px 40px rgba(2, 6, 23, 0.45)',
					padding: 1.5,
					display: 'flex',
					alignItems: 'center',
					gap: 1.5,
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				<Box
					sx={{
						width: 38,
						height: 38,
						borderRadius: 2,
						border: '1px solid rgba(59, 130, 246, 0.3)',
						background: 'rgba(59, 130, 246, 0.08)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<Icon sx={{ fontSize: 18, color: 'rgb(96, 165, 250)' }} />
				</Box>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						sx={{
							fontSize: '0.65rem',
							textTransform: 'uppercase',
							letterSpacing: '0.22em',
							color: 'rgba(255, 255, 255, 0.5)',
							marginBottom: 0.5,
						}}
					>
						{title}
					</Typography>
					<Typography
						sx={{
							fontSize: '1.25rem',
							fontWeight: 700,
							color: 'white',
							lineHeight: 1.15,
						}}
					>
						{value}
					</Typography>
					{subtitle && (
						<Typography
							sx={{
								fontSize: '0.72rem',
								color: 'rgba(255, 255, 255, 0.55)',
								marginTop: 0.25,
							}}
						>
							{subtitle}
						</Typography>
					)}
				</Box>
				{trend && (
					<Chip
						label={`${trend.isPositive ? '+' : '−'}${Math.abs(trend.value)}%`}
						size="small"
						sx={{
							fontSize: '0.65rem',
							fontWeight: 600,
							height: 20,
							px: 0.75,
							color: trend.isPositive ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)',
							borderColor: trend.isPositive
								? 'rgba(34, 197, 94, 0.4)'
								: 'rgba(239, 68, 68, 0.4)',
							background: trend.isPositive
								? 'rgba(34, 197, 94, 0.12)'
								: 'rgba(239, 68, 68, 0.12)',
						}}
						variant="outlined"
					/>
				)}
			</Box>
		</Fade>
	);
}
