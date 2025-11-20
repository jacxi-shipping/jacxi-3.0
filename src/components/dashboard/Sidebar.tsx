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
	Logout,
	Menu,
	Close,
	Add,
	Search,
	Analytics,
	Group,
	AllInbox,
	Receipt,
} from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import {
	Drawer,
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Avatar,
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

	const handleSignOut = async () => {
		await signOut({ callbackUrl: '/' });
	};

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
					onSignOut={handleSignOut}
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
					onSignOut={handleSignOut}
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
						borderRadius: 2,
						mx: 1,
						my: 0.5,
						transition: 'all 0.2s ease',
						transform: 'translateX(0)',
						color: active ? 'rgb(34, 211, 238)' : 'rgba(255, 255, 255, 0.6)',
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
									top: 4,
									bottom: 4,
									width: 2,
									bgcolor: 'rgb(34, 211, 238)',
									borderRadius: '0 2px 2px 0',
							  }
							: {},
					}}
				>
					<ListItemIcon
						sx={{
							minWidth: 40,
							color: 'inherit',
						}}
					>
						<Icon sx={{ fontSize: 20 }} />
					</ListItemIcon>
					<ListItemText
						primary={item.name}
						primaryTypographyProps={{
							fontSize: '0.875rem',
							fontWeight: 500,
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
		<Box sx={{ mb: 2 }}>
			{title && (
				<Box sx={{ px: 2, py: 1 }}>
					<Typography
						variant="caption"
						sx={{
							fontSize: '0.75rem',
							fontWeight: 600,
							color: 'rgba(255, 255, 255, 0.5)',
							textTransform: 'uppercase',
							letterSpacing: 1,
						}}
					>
						{title}
					</Typography>
				</Box>
			)}
			<List sx={{ py: 0.5 }}>
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
	onSignOut,
	onNavClick,
}: {
	pathname: string;
	session: Session | null;
	onSignOut: () => Promise<void>;
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
				bgcolor: '#0A1F44',
				backdropFilter: 'blur(16px)',
				borderRight: '1px solid rgba(255, 255, 255, 0.1)',
			}}
		>
			{/* Logo/Header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1.5,
					px: 3,
					py: 2.5,
					borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
				}}
			>
				<Box
					sx={{
						position: 'relative',
						width: 36,
						height: 36,
						borderRadius: 2,
						bgcolor: '#020817',
						border: '1px solid rgba(6, 182, 212, 0.4)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						'&::before': {
							content: '""',
							position: 'absolute',
							inset: 0,
							borderRadius: 2,
							bgcolor: 'rgba(6, 182, 212, 0.1)',
							filter: 'blur(8px)',
						},
					}}
				>
					<Inventory2 sx={{ position: 'relative', fontSize: 20, color: 'rgb(34, 211, 238)' }} />
				</Box>
				<Box>
					<Typography
						variant="subtitle1"
						sx={{
							fontSize: '1rem',
							fontWeight: 700,
							color: 'white',
						}}
					>
						Jacxi
					</Typography>
					<Typography
						variant="caption"
						sx={{
							fontSize: '0.625rem',
							color: 'rgba(255, 255, 255, 0.6)',
							textTransform: 'uppercase',
							letterSpacing: 1,
						}}
					>
						Dashboard
					</Typography>
				</Box>
			</Box>

			{/* Navigation */}
			<Box
				sx={{
					flex: 1,
					px: 1.5,
					py: 2,
					overflowY: 'auto',
					'&::-webkit-scrollbar': {
						width: 6,
					},
					'&::-webkit-scrollbar-track': {
						bgcolor: 'transparent',
					},
					'&::-webkit-scrollbar-thumb': {
						bgcolor: 'rgba(255, 255, 255, 0.2)',
						borderRadius: 3,
						'&:hover': {
							bgcolor: 'rgba(255, 255, 255, 0.3)',
						},
					},
				}}
			>
				{/* Main */}
				<NavSection items={mainNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />

				{/* Shipments */}
				<NavSection title="Shipments" items={shipmentNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />

				{/* Admin Section */}
				{isAdmin && (
					<NavSection title="Administration" items={adminNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />
				)}

				{/* Other */}
				<NavSection items={otherNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />

				{/* Settings */}
				<Box sx={{ pt: 2 }}>
					<Divider
						sx={{
							mb: 2,
							background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
							border: 'none',
							height: 1,
						}}
					/>
					<NavSection items={settingsNavigation} isAdmin={isAdmin} isActive={isActive} onNavClick={onNavClick} />
				</Box>
			</Box>

			{/* User Section */}
			<Box
				sx={{
					px: 1.5,
					py: 2,
					borderTop: '1px solid rgba(255, 255, 255, 0.1)',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						px: 1.5,
						py: 1.25,
						borderRadius: 2,
						bgcolor: 'rgba(255, 255, 255, 0.05)',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						mb: 1,
					}}
				>
					<Avatar
						sx={{
							width: 32,
							height: 32,
							background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)',
							border: '1px solid rgba(6, 182, 212, 0.3)',
						}}
					>
						<Person sx={{ fontSize: 16, color: 'rgb(34, 211, 238)' }} />
					</Avatar>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							variant="caption"
							sx={{
								fontSize: '0.75rem',
								fontWeight: 500,
								color: 'white',
								display: 'block',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{session?.user?.name || 'User'}
						</Typography>
						<Typography
							variant="caption"
							sx={{
								fontSize: '0.625rem',
								color: 'rgba(255, 255, 255, 0.6)',
								display: 'block',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{session?.user?.email || ''}
						</Typography>
					</Box>
				</Box>

				<ListItemButton
					onClick={onSignOut}
					sx={{
						borderRadius: 2,
						border: '1px solid transparent',
						color: 'rgba(255, 255, 255, 0.6)',
						py: 1,
						px: 1.5,
						'&:hover': {
							bgcolor: 'rgba(239, 68, 68, 0.1)',
							borderColor: 'rgba(239, 68, 68, 0.2)',
							color: 'white',
						},
					}}
				>
					<ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
						<Logout sx={{ fontSize: 16 }} />
					</ListItemIcon>
					<ListItemText
						primary="Sign Out"
						primaryTypographyProps={{
							fontSize: '0.75rem',
							fontWeight: 500,
						}}
					/>
				</ListItemButton>
			</Box>
		</Box>
	);
}
