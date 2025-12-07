"use client";

import { Box, Typography, Fade } from '@mui/material';
import { ReactNode, useState, useEffect } from 'react';

interface StatsCardProps {
	icon: ReactNode;
	title: string;
	value: string | number;
	subtitle?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	delay?: number;
	iconColor?: string;
	iconBg?: string;
}

export default function StatsCard({
	icon,
	title,
	value,
	subtitle,
	trend,
	delay = 0,
	iconColor = 'var(--accent-gold)',
	iconBg = 'rgba(var(--accent-gold-rgb), 0.15)',
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
					padding: { xs: 1.5, sm: 1.75, md: 2 },
					display: 'flex',
					alignItems: 'center',
					gap: { xs: 1.25, sm: 1.5 },
					position: 'relative',
					overflow: 'hidden',
					minWidth: 0,
					width: '100%',
					boxSizing: 'border-box',
					transition: 'transform 0.2s ease, box-shadow 0.2s ease',
					'&:hover': {
						transform: 'translateY(-4px)',
						boxShadow: '0 20px 40px rgba(var(--text-primary-rgb), 0.12)',
					},
				}}
			>
				<Box
					sx={{
						width: { xs: 40, sm: 44, md: 48 },
						height: { xs: 40, sm: 44, md: 48 },
						borderRadius: 2,
						border: '1px solid var(--border)',
						background: iconBg,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
						color: iconColor,
					}}
				>
					{icon}
				</Box>
				<Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
					<Typography
						sx={{
							fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
							textTransform: 'uppercase',
							letterSpacing: '0.15em',
							color: 'var(--text-secondary)',
							marginBottom: 0.5,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{title}
					</Typography>
					<Typography
						sx={{
							fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' },
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
								fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
								color: 'var(--text-secondary)',
								marginTop: 0.25,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{subtitle}
						</Typography>
					)}
				</Box>
				{trend && (
					<Box
						sx={{
							fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
							fontWeight: 600,
							px: 1,
							py: 0.5,
							borderRadius: 1,
							color: trend.isPositive ? 'var(--text-primary)' : 'var(--error)',
							border: `1px solid ${trend.isPositive ? 'var(--border)' : 'var(--error)'}`,
							background: trend.isPositive ? 'var(--background)' : 'rgba(var(--error-rgb), 0.12)',
							flexShrink: 0,
						}}
					>
						{trend.isPositive ? '+' : '−'}
						{Math.abs(trend.value)}%
					</Box>
				)}
			</Box>
		</Fade>
	);
}
