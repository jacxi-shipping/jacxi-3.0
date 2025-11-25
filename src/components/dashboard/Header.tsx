"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
	AppBar,
	Toolbar,
	Box,
	Typography,
	IconButton,
	Avatar,
	Menu,
	MenuItem,
	Divider,
	Badge,
	Tooltip,
} from '@mui/material';
import {
	Notifications,
	Settings,
	Logout,
	Person,
	Menu as MenuIcon,
} from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
	onMenuClick?: () => void;
	pageTitle?: string;
}

export default function Header({ onMenuClick, pageTitle }: HeaderProps) {
	const { data: session } = useSession();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleSignOut = async () => {
		handleMenuClose();
		await signOut({ callbackUrl: '/' });
	};

	return (
		<AppBar
			position="sticky"
			elevation={0}
			color="inherit"
			sx={{
				bgcolor: 'var(--panel)',
				borderBottom: '1px solid var(--border)',
				boxShadow: '0 8px 16px rgba(var(--text-primary-rgb),0.06)',
			}}
		>
			<Toolbar
				sx={{
					minHeight: 48,
					px: 2,
					color: 'var(--text-primary)',
				}}
			>
				{/* Mobile Menu Button */}
				<IconButton
					edge="start"
					color="inherit"
					onClick={onMenuClick}
					sx={{
						mr: 2,
						display: { xs: 'flex', lg: 'none' },
						color: 'var(--text-primary)',
					}}
				>
					<MenuIcon />
				</IconButton>

				{/* Logo/Title */}
				<Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
					<Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
					<Box
						sx={{
							width: 28,
							height: 28,
							borderRadius: 1.5,
							backgroundColor: 'var(--accent-gold)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontWeight: 800,
							fontSize: '0.9375rem',
							color: 'var(--background)',
						}}
					>
						J
					</Box>
					<Typography
						sx={{
							display: { xs: 'none', sm: 'block' },
							fontWeight: 700,
							fontSize: '0.95rem',
							color: 'var(--text-primary)',
						}}
					>
						JACXI
					</Typography>
					</Link>

					{/* Page Title (if provided) */}
					{pageTitle && (
						<>
							<Divider
								orientation="vertical"
								flexItem
								sx={{
									mx: 2,
									borderColor: 'var(--border)',
									display: { xs: 'none', md: 'block' },
								}}
							/>
							<Typography
								sx={{
									display: { xs: 'none', md: 'block' },
									fontSize: '0.75rem',
									color: 'var(--text-secondary)',
									fontWeight: 500,
								}}
							>
								{pageTitle}
							</Typography>
						</>
					)}
				</Box>

				{/* Right Actions */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					{/* Notifications */}
					<Tooltip title="Notifications">
						<IconButton
							size="small"
							sx={{
								color: 'var(--text-secondary)',
								'&:hover': {
									bgcolor: 'rgba(var(--border-rgb), 0.4)',
									color: 'var(--text-primary)',
								},
							}}
						>
							<Badge badgeContent={3} color="error">
								<Notifications sx={{ fontSize: 18 }} />
							</Badge>
						</IconButton>
					</Tooltip>

					{/* Settings */}
					<Tooltip title="Settings">
						<Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
							<IconButton
								size="small"
								sx={{
									color: 'var(--text-secondary)',
									'&:hover': {
										bgcolor: 'rgba(var(--border-rgb), 0.4)',
										color: 'var(--text-primary)',
									},
								}}
							>
								<Settings sx={{ fontSize: 18 }} />
							</IconButton>
						</Link>
					</Tooltip>

					{/* Profile Menu */}
					<Tooltip title="Account">
						<IconButton
							onClick={handleProfileMenuOpen}
							size="small"
							sx={{
								ml: 1,
							}}
						>
						<Avatar
							sx={{
								width: 28,
								height: 28,
								bgcolor: 'var(--accent-gold)',
								fontSize: '0.75rem',
								fontWeight: 600,
								color: 'var(--background)',
							}}
						>
								{session?.user?.name?.charAt(0).toUpperCase() || 'U'}
							</Avatar>
						</IconButton>
					</Tooltip>
				</Box>

				{/* Profile Dropdown Menu */}
				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
					PaperProps={{
						sx: {
							mt: 1.5,
							minWidth: 200,
							bgcolor: 'var(--panel)',
							backdropFilter: 'blur(10px)',
							border: '1px solid var(--border)',
							borderRadius: 2,
							boxShadow: '0 8px 32px rgba(var(--text-primary-rgb),0.12)',
						},
					}}
					transformOrigin={{ horizontal: 'right', vertical: 'top' }}
					anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
				>
					{/* User Info */}
					<Box sx={{ px: 2, py: 1.5 }}>
						<Typography
							sx={{
								fontSize: '0.875rem',
								fontWeight: 600,
								color: 'var(--text-primary)',
								mb: 0.25,
							}}
						>
							{session?.user?.name || 'User'}
						</Typography>
						<Typography
							sx={{
								fontSize: '0.75rem',
								color: 'var(--text-secondary)',
							}}
						>
							{session?.user?.email}
						</Typography>
						<Typography
							sx={{
								fontSize: '0.6875rem',
								color: 'var(--accent-gold)',
								mt: 0.5,
								textTransform: 'uppercase',
								fontWeight: 600,
							}}
						>
							{session?.user?.role || 'user'}
						</Typography>
					</Box>

					<Divider sx={{ borderColor: 'var(--border)' }} />

					{/* Menu Items */}
					<Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
						<MenuItem
							onClick={handleMenuClose}
							sx={{
								color: 'var(--text-primary)',
								fontSize: '0.875rem',
								py: 1.25,
								'&:hover': {
									bgcolor: 'rgba(var(--border-rgb), 0.4)',
								},
							}}
						>
							<Person sx={{ mr: 1.5, fontSize: 20 }} />
							Profile
						</MenuItem>
					</Link>

					<Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
						<MenuItem
							onClick={handleMenuClose}
							sx={{
								color: 'var(--text-primary)',
								fontSize: '0.875rem',
								py: 1.25,
								'&:hover': {
									bgcolor: 'rgba(var(--border-rgb), 0.4)',
								},
							}}
						>
							<Settings sx={{ mr: 1.5, fontSize: 20 }} />
							Settings
						</MenuItem>
					</Link>

					<Divider sx={{ borderColor: 'var(--border)' }} />

					<MenuItem
						onClick={handleSignOut}
						sx={{
							color: 'var(--error)',
							fontSize: '0.875rem',
							py: 1.25,
							'&:hover': {
								bgcolor: 'rgba(var(--error-rgb), 0.1)',
								color: 'var(--error)',
							},
						}}
					>
						<Logout sx={{ mr: 1.5, fontSize: 20 }} />
						Sign Out
					</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
}
