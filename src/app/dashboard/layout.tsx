'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { BottomNavigation } from '@/components/mobile/BottomNavigation';
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Box } from '@mui/material';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const shortcuts = useGlobalShortcuts();

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
						height: { xs: 'calc(100vh - 64px - 64px)', lg: 'calc(100vh - 64px)' },
						bgcolor: 'var(--background)',
						backgroundImage: 'none',
						overflow: 'auto',
						/* Hide scrollbar completely */
						'&::-webkit-scrollbar': {
							width: 0,
							height: 0,
						},
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
						pb: { xs: 2, lg: 0 },
					}}
				>
					{children}
				</Box>
				</Box>

				{/* Mobile Bottom Navigation */}
				<BottomNavigation />

				{/* Floating Action Button */}
				<FloatingActionButton />

				{/* Keyboard Shortcuts Modal */}
				<KeyboardShortcutsModal shortcuts={shortcuts} />
			</Box>
		</ProtectedRoute>
	);
}

