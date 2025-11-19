"use client";

import Link from 'next/link';
import { Add, Search, Inventory2, Description } from '@mui/icons-material';
import { Box, Card, CardContent, Typography, SvgIcon, Fade } from '@mui/material';
import { useState, useEffect } from 'react';

const actions = [
	{
		icon: Add,
		title: 'New Shipment',
		description: 'Create a new shipping request',
		href: '/dashboard/shipments/new',
		color: 'cyan',
		colorValues: {
			border: 'rgba(6, 182, 212, 0.3)',
			borderHover: 'rgba(6, 182, 212, 0.6)',
			text: 'rgb(34, 211, 238)',
			bgHover: 'rgba(6, 182, 212, 0.1)',
		},
	},
	{
		icon: Search,
		title: 'Track Shipment',
		description: 'Track an existing shipment',
		href: '/dashboard/tracking',
		color: 'blue',
		colorValues: {
			border: 'rgba(59, 130, 246, 0.3)',
			borderHover: 'rgba(59, 130, 246, 0.6)',
			text: 'rgb(96, 165, 250)',
			bgHover: 'rgba(59, 130, 246, 0.1)',
		},
	},
	{
		icon: Inventory2,
		title: 'All Shipments',
		description: 'View all your shipments',
		href: '/dashboard/shipments',
		color: 'purple',
		colorValues: {
			border: 'rgba(139, 92, 246, 0.3)',
			borderHover: 'rgba(139, 92, 246, 0.6)',
			text: 'rgb(167, 139, 250)',
			bgHover: 'rgba(139, 92, 246, 0.1)',
		},
	},
	{
		icon: Description,
		title: 'Documents',
		description: 'Manage shipping documents',
		href: '/dashboard/documents',
		color: 'green',
		colorValues: {
			border: 'rgba(34, 197, 94, 0.3)',
			borderHover: 'rgba(34, 197, 94, 0.6)',
			text: 'rgb(74, 222, 128)',
			bgHover: 'rgba(34, 197, 94, 0.1)',
		},
	},
];

export default function QuickActions() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<Fade in={isVisible} timeout={600}>
			<Box>
				<Box sx={{ mb: { xs: 1.5, sm: 2, md: 2.5 } }}>
					<Typography
						variant="h5"
						sx={{
							fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.875rem' },
							fontWeight: 700,
							color: 'white',
							mb: { xs: 0.5, sm: 1 },
						}}
					>
						Quick Actions
					</Typography>
					<Typography
						variant="body2"
						sx={{
							fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
							color: 'rgba(255, 255, 255, 0.7)',
						}}
					>
						Common tasks
					</Typography>
				</Box>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: '1fr' },
						gap: { xs: 1, sm: 1.5, md: 2 },
					}}
				>
				{actions.map((action, index) => {
					const Icon = action.icon;
					const { border, borderHover, text, bgHover } = action.colorValues;

					return (
						<ActionCard
							key={action.title}
							action={action}
							index={index}
							Icon={Icon}
							border={border}
							borderHover={borderHover}
							text={text}
							bgHover={bgHover}
						/>
					);
				})}
				</Box>
			</Box>
		</Fade>
	);
}

function ActionCard({ action, index, Icon, border, borderHover, text, bgHover }: any) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), index * 100);
		return () => clearTimeout(timer);
	}, [index]);

	return (
		<Link href={action.href} style={{ textDecoration: 'none' }}>
			<Fade in={isVisible} timeout={500}>
				<Card
									sx={{
										position: 'relative',
										background: 'rgba(10, 22, 40, 0.6)',
										backdropFilter: 'blur(8px)',
										border: `1px solid ${border}`,
										borderRadius: 2,
										p: { xs: 1.5, sm: 2, md: 2.5 },
										height: { xs: '100px', sm: '120px', lg: 'auto' },
										minHeight: { lg: '140px' },
										cursor: 'pointer',
										transition: 'all 0.3s ease',
										overflow: 'hidden',
										transform: 'translateY(0) scale(1)',
										'&:hover': {
											borderColor: borderHover,
											bgcolor: bgHover,
											boxShadow: `0 8px 16px ${border}`,
											transform: 'translateY(-4px) scale(1.02)',
											'&::before': {
												opacity: 1,
											},
										},
										'&::before': {
											content: '""',
											position: 'absolute',
											inset: 0,
											background: `linear-gradient(90deg, ${border}00 0%, ${border} 50%, ${border}00 100%)`,
											opacity: 0,
											transition: 'opacity 0.3s ease',
										},
									}}
								>
									<CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
										<Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
											<Box
												sx={{
													position: 'relative',
													width: { xs: 32, sm: 40, md: 48 },
													height: { xs: 32, sm: 40, md: 48 },
													borderRadius: 2,
													bgcolor: '#020817',
													border: `1px solid ${border}`,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													transition: 'all 0.3s ease',
													'&:hover': {
														borderColor: borderHover,
													},
													'&::before': {
														content: '""',
														position: 'absolute',
														inset: 0,
														borderRadius: 2,
														bgcolor: text,
														opacity: 0.1,
														filter: 'blur(8px)',
														transition: 'all 0.3s ease',
													},
													'&:hover::before': {
														opacity: 0.2,
													},
												}}
											>
												<SvgIcon
													component={Icon}
													sx={{
														position: 'relative',
														fontSize: { xs: 16, sm: 20, md: 24 },
														color: text,
														transition: 'transform 0.3s ease',
														'&:hover': {
															transform: 'scale(1.1)',
														},
													}}
												/>
											</Box>
										</Box>
										<Box sx={{ flex: 1 }}>
											<Typography
												variant="h6"
												sx={{
													fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
													fontWeight: 600,
													color: 'white',
													mb: { xs: 0.25, sm: 0.5 },
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													display: '-webkit-box',
													WebkitLineClamp: 1,
													WebkitBoxOrient: 'vertical',
												}}
											>
												{action.title}
											</Typography>
											<Typography
												variant="body2"
												sx={{
													fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
													color: 'rgba(255, 255, 255, 0.7)',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
												}}
											>
												{action.description}
											</Typography>
										</Box>
									</CardContent>
								</Card>
			</Fade>
		</Link>
	);
}
