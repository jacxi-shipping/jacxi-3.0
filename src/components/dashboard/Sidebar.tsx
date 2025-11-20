"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import type { SvgIconComponent } from '@mui/icons-material';
import {
	Dashboard,
	Inventory2,
	Description,
	Settings,
	Person,
	Menu,
	Close,
	Add,
	Search,
	Analytics,
	Group,
	AllInbox,
	Receipt,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import {
	Drawer,
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	Divider,
	IconButton,
} from '@mui/material';

type NavigationItem = {
	name: string;
	href: string;
	icon: SvgIconComponent;
	adminOnly?: boolean;
};

const mainNavigation: NavigationItem[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
		icon: Dashboard,
	},
];

const shipmentNavigation: NavigationItem[] = [
	{
		name: 'Shipments',
		href: '/dashboard/shipments',
		icon: Inventory2,
	},
	{
		name: 'New Shipment',
		href: '/dashboard/shipments/new',
		icon: Add,
		adminOnly: true,
	},
];

const adminNavigation: NavigationItem[] = [
	{
		name: 'Analytics',
		href: '/dashboard/analytics',
		icon: Analytics,
	},
	{
		name: 'Users',
		href: '/dashboard/users',
		icon: Group,
	},
	{
		name: 'Create User',
		href: '/dashboard/users/new',
		icon: Person,
	},
	{
		name: 'Containers',
		href: '/dashboard/containers',
		icon: AllInbox,
	},
	{
		name: 'Invoices',
		href: '/dashboard/invoices',
		icon: Receipt,
	},
];

const otherNavigation: NavigationItem[] = [
	{
		name: 'Track Shipments',
		href: '/dashboard/tracking',
		icon: Search,
	},
	{
		name: 'Documents',
		href: '/dashboard/documents',
		icon: Description,
	},
];

const settingsNavigation: NavigationItem[] = [
	{
		name: 'Profile',
		href: '/dashboard/profile',
		icon: Person,
	},
	{
		name: 'Settings',
		href: '/dashboard/settings',
		icon: Settings,
	},
];

interface SidebarProps {
	mobileOpen?: boolean;
	onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
	const pathname = usePathname();
	const { data: session } = useSession();

	const drawerWidth = 260;

	return (
		<>
			{/* Mobile Drawer */}
			<Drawer
				variant="temporary"
				open={mobileOpen}
				onClose={onMobileClose}
				ModalProps={{
					keepMounted: true,
				}}
				sx={{
					display: { xs: 'block', lg: 'none' },
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box',
						bgcolor: 'rgba(10, 22, 40, 0.95)',
						backdropFilter: 'blur(20px)',
						borderRight: '1px solid rgba(6, 182, 212, 0.1)',
						mt: '64px',
					},
				}}
			>
			<SidebarContent
				pathname={pathname}
				session={session}
				onNavClick={onMobileClose}
			/>
			</Drawer>

			{/* Desktop Drawer */}
			<Drawer
				variant="permanent"
				sx={{
					display: { xs: 'none', lg: 'block' },
					width: drawerWidth,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box',
						bgcolor: 'rgba(10, 22, 40, 0.5)',
						backdropFilter: 'blur(20px)',
						borderRight: '1px solid rgba(6, 182, 212, 0.1)',
						position: 'relative',
					},
				}}
			>
				<SidebarContent
					pathname={pathname}
					session={session}
				/>
			</Drawer>
		</>
	);
}

type NavItemProps = {
	item: NavigationItem;
	isActive: (href: string) => boolean;
	onNavClick?: () => void;
};

function NavItem({ item, isActive, onNavClick }: NavItemProps) {
	const Icon = item.icon;
	const active = isActive(item.href);

	return (
		<Link href={item.href} onClick={onNavClick} style={{ textDecoration: 'none' }}>
			<ListItemButton
					selected={active}
					sx={{
						position: 'relative',
						borderRadius: 1.5,
						mx: 1,
						my: 0.25,
						py: 0.75,
						minHeight: 0,
						transition: 'all 0.2s ease',
						transform: 'translateX(0)',
						color: active ? 'rgb(34, 211, 238)' : 'rgba(255, 255, 255, 0.65)',
						bgcolor: active ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
						'&:hover': {
							bgcolor: active ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.05)',
							color: 'white',
							transform: 'translateX(2px)',
						},
						'&::before': active
							? {
									content: '""',
									position: 'absolute',
									left: 0,
									top: 2,
									bottom: 2,
									width: 3,
									bgcolor: 'rgb(34, 211, 238)',
									borderRadius: '0 2px 2px 0',
							  }
							: {},
					}}
				>
					<ListItemIcon
						sx={{
							minWidth: 32,
							color: 'inherit',
						}}
					>
						<Icon sx={{ fontSize: 18 }} />
					</ListItemIcon>
					<ListItemText
						primary={item.name}
						primaryTypographyProps={{
							fontSize: '0.8125rem',
							fontWeight: 500,
							lineHeight: 1.2,
						}}
					/>
				</ListItemButton>
		</Link>
	);
}

type NavSectionProps = {
	title?: string;
	items: NavigationItem[];
	isAdmin: boolean;
	isActive: (href: string) => boolean;
	onNavClick?: () => void;
};

function NavSection({ title, items, isAdmin, isActive, onNavClick }: NavSectionProps) {
	return (
		<Box sx={{ mb: 0.5 }}>
			{title && (
				<Box sx={{ px: 2, py: 0.5, mt: 1 }}>
					<Typography
						variant="caption"
						sx={{
							fontSize: '0.6875rem',
							fontWeight: 600,
							color: 'rgba(255, 255, 255, 0.4)',
							textTransform: 'uppercase',
							letterSpacing: 0.5,
						}}
					>
						{title}
					</Typography>
				</Box>
			)}
			<List sx={{ py: 0 }}>
				{items
					.filter((item) => !item.adminOnly || isAdmin)
				.map((item) => (
					<NavItem key={item.name} item={item} isActive={isActive} onNavClick={onNavClick} />
				))}
			</List>
		</Box>
	);
}

function SidebarContent({
	pathname,
	session,
	onNavClick,
}: {
	pathname: string;
	session: Session | null;
	onNavClick?: () => void;
}) {
	type AppUser = Session['user'] & { role?: string };
	const appUser = session?.user as AppUser | undefined;
	const isAdmin = appUser?.role === 'admin';

	const isActive = (href: string) => {
		if (href === '/dashboard') {
			return pathname === '/dashboard';
		}
		return pathname.startsWith(href);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			{/* Logo/Header - Compact */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1.25,
					px: 2,
					py: 1.25,
					borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
					flexShrink: 0,
				}}
			>
				<Box
					sx={{
						width: 32,
						height: 32,
						borderRadius: 1.5,
						background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: 'white' }}>
						J
					</Typography>
				</Box>
				<Box>
					<Typography
						sx={{
							fontSize: '0.9375rem',
							fontWeight: 700,
							color: 'white',
							lineHeight: 1,
						}}
					>
						JACXI
					</Typography>
				</Box>
			</Box>

			{/* Navigation - Fixed height, no scroll */}
			<Box
				sx={{
					flex: 1,
					px: 0.5,
					py: 1.5,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{/* Main */}
				<NavSection items={mainNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />

				{/* Shipments */}
				<NavSection title="Shipments" items={shipmentNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />

				{/* Admin Section */}
				{isAdmin && (
					<NavSection title="Admin" items={adminNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />
				)}

				{/* Other */}
				<NavSection items={otherNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />

				{/* Settings */}
				<Box sx={{ mt: 'auto', pt: 1 }}>
					<Divider
						sx={{
							mb: 0.5,
							background: 'rgba(255, 255, 255, 0.08)',
							border: 'none',
							height: 1,
						}}
					/>
					<NavSection items={settingsNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />
				</Box>
			</Box>
		</Box>
	);
}
