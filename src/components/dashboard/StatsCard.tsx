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
					border: '1px solid var(--border)',
					background: 'var(--panel)',
					boxShadow: '0 12px 30px rgba(var(--text-primary-rgb), 0.08)',
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
						border: '1px solid var(--border)',
						background: 'rgba(var(--accent-gold-rgb), 0.15)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<Icon sx={{ fontSize: 18, color: 'var(--accent-gold)' }} />
				</Box>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						sx={{
							fontSize: '0.65rem',
							textTransform: 'uppercase',
							letterSpacing: '0.22em',
							color: 'var(--text-secondary)',
							marginBottom: 0.5,
						}}
					>
						{title}
					</Typography>
						<Typography
							sx={{
								fontSize: '1.25rem',
								fontWeight: 700,
								color: 'var(--text-primary)',
								lineHeight: 1.15,
							}}
						>
						{value}
					</Typography>
					{subtitle && (
						<Typography
							sx={{
								fontSize: '0.72rem',
								color: 'var(--text-secondary)',
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
							color: trend.isPositive ? 'var(--text-primary)' : 'var(--error)',
							borderColor: trend.isPositive ? 'var(--border)' : 'var(--error)',
							background: trend.isPositive ? 'var(--background)' : 'rgba(var(--error-rgb), 0.12)',
						}}
						variant="outlined"
					/>
				)}
			</Box>
		</Fade>
	);
}
