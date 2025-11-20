"use client";

import Link from 'next/link';
import { Add, Search, Inventory2, Description } from '@mui/icons-material';
import { Box, Card, CardContent, Typography, Fade, Zoom } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

const actions = [
	{
		icon: Add,
		title: 'New Shipment',
		description: 'Create a new shipping request',
		href: '/dashboard/shipments/new',
		color: 'cyan',
		colorValues: {
			border: 'rgba(6, 182, 212, 0.4)',
			borderHover: 'rgba(6, 182, 212, 0.8)',
			text: 'rgb(34, 211, 238)',
			bgHover: 'rgba(6, 182, 212, 0.15)',
			glow: 'rgba(6, 182, 212, 0.3)',
		},
	},
	{
		icon: Search,
		title: 'Track Shipment',
		description: 'Track an existing shipment',
		href: '/dashboard/tracking',
		color: 'blue',
		colorValues: {
			border: 'rgba(59, 130, 246, 0.4)',
			borderHover: 'rgba(59, 130, 246, 0.8)',
			text: 'rgb(96, 165, 250)',
			bgHover: 'rgba(59, 130, 246, 0.15)',
			glow: 'rgba(59, 130, 246, 0.3)',
		},
	},
	{
		icon: Inventory2,
		title: 'All Shipments',
		description: 'View all your shipments',
		href: '/dashboard/shipments',
		color: 'purple',
		colorValues: {
			border: 'rgba(139, 92, 246, 0.4)',
			borderHover: 'rgba(139, 92, 246, 0.8)',
			text: 'rgb(167, 139, 250)',
			bgHover: 'rgba(139, 92, 246, 0.15)',
			glow: 'rgba(139, 92, 246, 0.3)',
		},
	},
	{
		icon: Description,
		title: 'Documents',
		description: 'Manage shipping documents',
		href: '/dashboard/documents',
		color: 'green',
		colorValues: {
			border: 'rgba(34, 197, 94, 0.4)',
			borderHover: 'rgba(34, 197, 94, 0.8)',
			text: 'rgb(74, 222, 128)',
			bgHover: 'rgba(34, 197, 94, 0.15)',
			glow: 'rgba(34, 197, 94, 0.3)',
		},
	},
];

export default function QuickActions() {
	const show = true;

	return (
		<Fade in={show} timeout={600}>
			<Box>
				<Box sx={{ mb: 1.5 }}>
					<Typography
						variant="h6"
						sx={{
							fontSize: '1rem',
							fontWeight: 700,
							color: 'white',
							mb: 0.25,
						}}
					>
						Quick Actions
					</Typography>
					<Typography
						variant="body2"
						sx={{
							fontSize: '0.75rem',
							color: 'rgba(255, 255, 255, 0.6)',
						}}
					>
						Common tasks
					</Typography>
				</Box>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							sm: 'repeat(2, 1fr)',
							lg: 'repeat(4, 1fr)',
						},
						gap: 1.5,
					}}
				>
					{actions.map((action, index) => (
						<ActionCard key={action.title} {...action} delay={index * 0.1} />
					))}
				</Box>
			</Box>
		</Fade>
	);
}

interface ActionCardProps {
	icon: SvgIconComponent;
	title: string;
	description: string;
	href: string;
	color: string;
	colorValues: {
		border: string;
		borderHover: string;
		text: string;
		bgHover: string;
		glow: string;
	};
	delay: number;
}

function ActionCard({ icon: Icon, title, description, href, colorValues, delay }: ActionCardProps) {
	return (
		<Zoom in timeout={400} style={{ transitionDelay: `${delay * 1000}ms` }}>
			<Link href={href} style={{ textDecoration: 'none' }}>
				<Card
					sx={{
						height: '100%',
						background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.8) 0%, rgba(10, 22, 40, 0.4) 100%)',
						backdropFilter: 'blur(20px)',
						border: `1px solid ${colorValues.border}`,
						borderRadius: 2,
						p: 1.5,
						cursor: 'pointer',
						transition: 'all 0.3s ease',
						'&:hover': {
							borderColor: colorValues.borderHover,
							boxShadow: `0 8px 20px ${colorValues.glow}`,
							transform: 'translateY(-2px)',
							'& .icon-box': {
								transform: 'scale(1.05)',
							},
						},
					}}
				>
					<CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
						<Fade in timeout={400} style={{ transitionDelay: `${delay * 1000 + 200}ms` }}>
							<Box
								className="icon-box"
								sx={{
									width: 36,
									height: 36,
									borderRadius: 1.5,
									background: `linear-gradient(135deg, ${colorValues.bgHover}, transparent)`,
									border: `1px solid ${colorValues.border}`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									mb: 1,
									transition: 'transform 0.3s ease',
								}}
							>
								<Icon sx={{ fontSize: 18, color: colorValues.text }} />
							</Box>
						</Fade>

						<Fade in timeout={400} style={{ transitionDelay: `${delay * 1000 + 300}ms` }}>
							<Typography
								variant="subtitle1"
								sx={{
									fontSize: '0.875rem',
									fontWeight: 600,
									color: 'white',
									mb: 0.25,
								}}
							>
								{title}
							</Typography>
						</Fade>

						<Fade in timeout={400} style={{ transitionDelay: `${delay * 1000 + 400}ms` }}>
							<Typography
								variant="body2"
								sx={{
									fontSize: '0.6875rem',
									color: 'rgba(255, 255, 255, 0.5)',
									lineHeight: 1.4,
								}}
							>
								{description}
							</Typography>
						</Fade>
					</CardContent>
				</Card>
			</Link>
		</Zoom>
	);
}
