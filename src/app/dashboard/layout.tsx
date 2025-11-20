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
				sx={{
					minHeight: '100vh',
					bgcolor: '#020817',
					display: 'flex',
					flexDirection: 'column',
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
							overflow: 'auto',
							height: 'calc(100vh - 64px)',
						}}
					>
						{children}
					</Box>
				</Box>
			</Box>
		</ProtectedRoute>
	);
}

