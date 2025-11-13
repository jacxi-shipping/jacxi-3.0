'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-background flex">
				{/* Sidebar */}
				<Sidebar />

				{/* Main Content */}
				<div className="flex-1 lg:pl-72">
					{children}
				</div>
			</div>
		</ProtectedRoute>
	);
}

