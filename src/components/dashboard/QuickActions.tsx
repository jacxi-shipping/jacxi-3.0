"use client";

import Link from 'next/link';
import { Add, Search, Inventory2, Description } from '@mui/icons-material';
import { Box, Typography, Fade } from '@mui/material';
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

type QuickActionsProps = {
	showHeading?: boolean;
};

export default function QuickActions({ showHeading = false }: QuickActionsProps = {}) {
	return (
		<Fade in timeout={600}>
			<Box>
				{showHeading && (
					<Box sx={{ mb: 1 }}>
					<Typography
						sx={{
							fontSize: '0.8rem',
							textTransform: 'uppercase',
							letterSpacing: '0.2em',
							color: '#94a3b8',
						}}
					>
							Action Center
						</Typography>
					<Typography sx={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
							Start a workflow
						</Typography>
					</Box>
				)}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: 'repeat(2, minmax(0, 1fr))',
							sm: 'repeat(2, minmax(0, 1fr))',
							md: 'repeat(2, minmax(0, 1fr))',
						},
						gap: 1,
					}}
				>
					{actions.map((action) => (
						<ActionCard key={action.title} {...action} />
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
}

function ActionCard({ icon: Icon, title, description, href, colorValues }: ActionCardProps) {
	return (
		<Link href={href} style={{ textDecoration: 'none' }}>
			<Box
				sx={{
					borderRadius: 2,
					border: `1px solid ${colorValues.border}`,
					background: 'white',
					boxShadow: `0 12px 24px rgba(15,23,42,0.08)`,
					padding: 1,
					display: 'flex',
					flexDirection: 'column',
					gap: 0.5,
					minHeight: 92,
					transition: 'border-color 0.2s ease, transform 0.2s ease',
					'&:hover': {
						borderColor: colorValues.borderHover,
						transform: 'translateY(-2px)',
					},
				}}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.75,
					}}
				>
					<Box
						sx={{
							width: 28,
							height: 28,
							borderRadius: 1,
							border: `1px solid ${colorValues.border}`,
							background: 'rgba(148,163,184,0.15)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Icon sx={{ fontSize: 16, color: colorValues.text }} />
					</Box>
					<Typography
						sx={{
							fontSize: '0.78rem',
							fontWeight: 600,
							color: '#0f172a',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{title}
					</Typography>
				</Box>
				<Typography
					sx={{
						fontSize: '0.68rem',
							color: '#64748b',
						lineHeight: 1.4,
						flex: 1,
					}}
				>
					{description}
				</Typography>
			</Box>
		</Link>
	);
}
