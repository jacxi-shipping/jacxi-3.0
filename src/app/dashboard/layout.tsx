'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Box } from '@mui/material';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<ProtectedRoute>
			<Box
				className="dashboard-theme-light"
				sx={{
					minHeight: '100vh',
					bgcolor: 'var(--background)',
					display: 'flex',
					flexDirection: 'column',
					color: 'var(--text-primary)',
				}}
			>
				{/* Header */}
				<Header onMenuClick={() => setMobileOpen(!mobileOpen)} />

				{/* Content Area with Sidebar */}
				<Box
					sx={{
						display: 'flex',
						flexGrow: 1,
						overflow: 'hidden',
					}}
				>
					{/* Sidebar */}
					<Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

					{/* Main Content */}
					<Box
						component="main"
						sx={{
							flexGrow: 1,
							minWidth: 0,
							height: 'calc(100vh - 48px)',
							bgcolor: 'var(--background)',
							backgroundImage: 'none',
						}}
					>
						<Box
							sx={{
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
								overflow: 'hidden',
							}}
						>
							<div className="dashboard-scroll">{children}</div>
						</Box>
					</Box>
				</Box>
			</Box>
		</ProtectedRoute>
	);
}

