"use client";

import { SvgIconComponent } from '@mui/icons-material';
import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';

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
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, delay }}
			whileHover={{ y: -4 }}
			style={{ height: '100%' }}
		>
			<Card
				sx={{
					height: '100%',
					background: 'rgba(10, 22, 40, 0.5)',
					backdropFilter: 'blur(8px)',
					border: '1px solid rgba(6, 182, 212, 0.3)',
					borderRadius: { xs: 2, sm: 3 },
					p: { xs: 1.5, sm: 3, md: 4 },
					position: 'relative',
					overflow: 'hidden',
					transition: 'all 0.3s ease',
					'&:hover': {
						borderColor: 'rgba(6, 182, 212, 0.6)',
						boxShadow: '0 8px 16px rgba(6, 182, 212, 0.2)',
						'&::before': {
							opacity: 1,
						},
					},
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: 0,
						background: 'linear-gradient(90deg, rgba(6, 182, 212, 0) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(6, 182, 212, 0) 100%)',
						opacity: 0,
						transition: 'opacity 0.3s ease',
					},
				}}
			>
				<CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, position: 'relative', zIndex: 1 }}>
					{/* Icon and Trend */}
					<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 1, sm: 2, md: 3 } }}>
						<Box
							sx={{
								position: 'relative',
								width: { xs: 40, sm: 48, md: 56 },
								height: { xs: 40, sm: 48, md: 56 },
								borderRadius: { xs: 2, sm: 3 },
								bgcolor: '#020817',
								border: '1px solid rgba(6, 182, 212, 0.4)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transition: 'all 0.3s ease',
								'&:hover': {
									borderColor: 'rgba(6, 182, 212, 0.8)',
								},
								'&::before': {
									content: '""',
									position: 'absolute',
									inset: 0,
									borderRadius: { xs: 2, sm: 3 },
									background: 'rgba(6, 182, 212, 0.1)',
									filter: 'blur(8px)',
									transition: 'all 0.3s ease',
								},
								'&:hover::before': {
									background: 'rgba(6, 182, 212, 0.2)',
								},
							}}
						>
							<Icon
								sx={{
									fontSize: { xs: 20, sm: 24, md: 28 },
									color: 'rgb(34, 211, 238)',
									position: 'relative',
									transition: 'color 0.3s ease',
								}}
							/>
						</Box>
						{trend && (
							<Chip
								label={`${trend.isPositive ? '↑' : '↓'} ${Math.abs(trend.value)}%`}
								size="small"
								sx={{
									fontSize: { xs: '0.7rem', sm: '0.75rem' },
									fontWeight: 500,
									px: { xs: 0.5, sm: 1 },
									py: { xs: 0.25, sm: 0.5 },
									height: 'auto',
									bgcolor: trend.isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
									color: trend.isPositive ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)',
									border: 'none',
								}}
							/>
						)}
					</Box>

					{/* Value */}
					<Typography
						variant="h3"
						sx={{
							fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.25rem' },
							fontWeight: 700,
							color: 'white',
							mb: { xs: 0.5, sm: 1 },
							lineHeight: 1.2,
						}}
					>
						{value}
					</Typography>

					{/* Title */}
					<Typography
						variant="body2"
						sx={{
							fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
							fontWeight: 500,
							color: 'rgba(255, 255, 255, 0.8)',
							mb: { xs: 0.25, sm: 0.5 },
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{title}
					</Typography>

					{/* Subtitle */}
					{subtitle && (
						<Typography
							variant="caption"
							sx={{
								fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
								color: 'rgba(255, 255, 255, 0.6)',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								display: 'block',
							}}
						>
							{subtitle}
						</Typography>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
