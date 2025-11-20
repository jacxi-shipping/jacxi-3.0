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
			sx={{
				bgcolor: 'rgba(10, 22, 40, 0.8)',
				backdropFilter: 'blur(20px)',
				borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
				boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
			}}
		>
			<Toolbar
				sx={{
					minHeight: 48,
					px: 2,
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
						color: 'white',
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
							background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontWeight: 800,
							fontSize: '0.9375rem',
							color: 'white',
						}}
					>
						J
					</Box>
					<Typography
						sx={{
							display: { xs: 'none', sm: 'block' },
							fontWeight: 700,
							fontSize: '0.9375rem',
							color: 'white',
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
									borderColor: 'rgba(255, 255, 255, 0.1)',
									display: { xs: 'none', md: 'block' },
								}}
							/>
							<Typography
								sx={{
									display: { xs: 'none', md: 'block' },
									fontSize: '0.75rem',
									color: 'rgba(255, 255, 255, 0.6)',
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
								color: 'rgba(255, 255, 255, 0.7)',
								'&:hover': {
									bgcolor: 'rgba(6, 182, 212, 0.1)',
									color: 'white',
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
									color: 'rgba(255, 255, 255, 0.7)',
									'&:hover': {
										bgcolor: 'rgba(6, 182, 212, 0.1)',
										color: 'white',
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
								bgcolor: 'rgb(34, 211, 238)',
								fontSize: '0.75rem',
								fontWeight: 600,
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
							bgcolor: 'rgba(10, 22, 40, 0.95)',
							backdropFilter: 'blur(20px)',
							border: '1px solid rgba(6, 182, 212, 0.2)',
							borderRadius: 2,
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
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
								color: 'white',
								mb: 0.25,
							}}
						>
							{session?.user?.name || 'User'}
						</Typography>
						<Typography
							sx={{
								fontSize: '0.75rem',
								color: 'rgba(255, 255, 255, 0.6)',
							}}
						>
							{session?.user?.email}
						</Typography>
						<Typography
							sx={{
								fontSize: '0.6875rem',
								color: 'rgb(34, 211, 238)',
								mt: 0.5,
								textTransform: 'uppercase',
								fontWeight: 600,
							}}
						>
							{session?.user?.role || 'user'}
						</Typography>
					</Box>

					<Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

					{/* Menu Items */}
					<Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
						<MenuItem
							onClick={handleMenuClose}
							sx={{
								color: 'rgba(255, 255, 255, 0.8)',
								fontSize: '0.875rem',
								py: 1.25,
								'&:hover': {
									bgcolor: 'rgba(6, 182, 212, 0.1)',
									color: 'white',
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
								color: 'rgba(255, 255, 255, 0.8)',
								fontSize: '0.875rem',
								py: 1.25,
								'&:hover': {
									bgcolor: 'rgba(6, 182, 212, 0.1)',
									color: 'white',
								},
							}}
						>
							<Settings sx={{ mr: 1.5, fontSize: 20 }} />
							Settings
						</MenuItem>
					</Link>

					<Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

					<MenuItem
						onClick={handleSignOut}
						sx={{
							color: 'rgba(239, 68, 68, 0.9)',
							fontSize: '0.875rem',
							py: 1.25,
							'&:hover': {
								bgcolor: 'rgba(239, 68, 68, 0.1)',
								color: 'rgb(248, 113, 113)',
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
