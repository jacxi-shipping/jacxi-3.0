'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Section from '@/components/layout/Section';

type ContainerItem = {
	id: string;
	vin: string;
	lotNumber: string;
	auctionCity: string;
	freightCost?: number | null;
	towingCost?: number | null;
	clearanceCost?: number | null;
	vatCost?: number | null;
	customsCost?: number | null;
	otherCost?: number | null;
};

type ContainerInvoice = {
	id: string;
	invoiceNumber: string;
	status: string;
	totalUSD: number;
	totalAED: number;
};

type ContainerShipment = {
	id: string;
	trackingNumber: string;
	vehicleType: string;
	vehicleMake: string | null;
	vehicleModel: string | null;
	vehicleYear: number | null;
	status: string;
	user: {
		id: string;
		name: string | null;
		email: string;
	};
	createdAt: string;
};

type ContainerDetail = {
	id: string;
	containerNumber: string;
	items: ContainerItem[];
	invoices: ContainerInvoice[];
};

export default function ContainerDetailPage() {
	const { data: session, status } = useSession();
	const params = useParams();
	const router = useRouter();
	const [container, setContainer] = useState<ContainerDetail | null>(null);
	const [shipments, setShipments] = useState<ContainerShipment[]>([]);
	const [loading, setLoading] = useState(true);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const containerIdRaw = params?.id;
	const containerId = Array.isArray(containerIdRaw) ? containerIdRaw[0] : containerIdRaw;

	const isAdmin = session?.user?.role === 'admin';

	const fetchContainer = useCallback(async () => {
		if (!containerId) return;

		try {
			setLoading(true);
			const response = await fetch(`/api/containers/${containerId}`);
			if (!response.ok) {
				setContainer(null);
				setShipments([]);
				return;
			}

			const data = (await response.json()) as { container?: ContainerDetail; shipments?: ContainerShipment[] };
			setContainer(data.container ?? null);
			setShipments(data.shipments ?? []);
		} catch (error) {
			console.error('Error fetching container:', error);
			setContainer(null);
			setShipments([]);
		} finally {
			setLoading(false);
		}
	}, [containerId]);

	useEffect(() => {
		if (status === 'loading') return;
		if (!session || !isAdmin) {
			router.replace('/dashboard');
			return;
		}
		void fetchContainer();
	}, [fetchContainer, isAdmin, router, session, status]);

	const handleDelete = async () => {
		if (!containerId) return;
		
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/containers/${containerId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				router.push('/dashboard/containers');
			} else {
				const result = await response.json();
				alert(result.message || 'Failed to delete container');
			}
		} catch (error) {
			console.error('Error deleting container:', error);
			alert('An error occurred while deleting the container');
		} finally {
			setIsDeleting(false);
			setShowDeleteModal(false);
		}
	};

	const items = container?.items ?? [];
	const invoices = container?.invoices ?? [];

	if (loading) {
		return (
			<div className="min-h-screen bg-[var(--text-primary)] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400"></div>
			</div>
		);
	}

	if (!container) {
		return (
			<div className="min-h-screen bg-[var(--text-primary)] flex items-center justify-center">
				<div className="text-center">
					<p className="text-white/70 mb-4">Container not found</p>
					<Link href="/dashboard/containers">
						<Button>Back to Containers</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<>
			<Section className="relative bg-[var(--text-primary)] py-8 sm:py-12 lg:py-16 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-primary)]" />
				<div className="absolute inset-0 opacity-[0.03]">
					<svg className="w-full h-full" preserveAspectRatio="none">
						<defs>
							<pattern id="grid-container-detail" width="40" height="40" patternUnits="userSpaceOnUse">
								<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid-container-detail)" className="text-cyan-400" />
					</svg>
				</div>

				<div className="relative z-10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<Link href="/dashboard/containers">
								<Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back
								</Button>
							</Link>
							<div>
								<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
									{container.containerNumber}
								</h1>
								<p className="text-lg sm:text-xl text-white/70 mt-2">Container Details</p>
							</div>
						</div>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => setShowDeleteModal(true)}
							className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete
						</Button>
					</div>
				</div>
			</Section>

			<Section className="bg-[var(--text-primary)] py-8 sm:py-12">
				<div className="max-w-7xl mx-auto space-y-8">
					{/* Items Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl sm:text-2xl font-bold text-white">Items ({items.length})</h2>
							<Button
								onClick={() => router.push(`/dashboard/containers/${container?.id}/items/new`)}
								className="bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold)]"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Item
							</Button>
						</div>

						{items.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-cyan-500/20">
											<th className="text-left py-3 px-4 text-sm font-medium text-white/70">VIN</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-white/70">Lot #</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-white/70">Auction City</th>
											<th className="text-right py-3 px-4 text-sm font-medium text-white/70">Total Cost</th>
										</tr>
									</thead>
									<tbody>
										{items.map((item) => {
											const totalCost =
												(item.freightCost ?? 0) +
												(item.towingCost ?? 0) +
												(item.clearanceCost ?? 0) +
												(item.vatCost ?? 0) +
												(item.customsCost ?? 0) +
												(item.otherCost ?? 0);
											return (
												<tr key={item.id} className="border-b border-cyan-500/10 hover:bg-[var(--text-primary)]/50">
													<td className="py-3 px-4 text-sm text-white font-mono">{item.vin}</td>
													<td className="py-3 px-4 text-sm text-white">{item.lotNumber}</td>
													<td className="py-3 px-4 text-sm text-white">{item.auctionCity}</td>
													<td className="py-3 px-4 text-sm text-white text-right">${totalCost.toFixed(2)}</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-center text-white/70 py-8">No items yet. Add items to this container.</p>
						)}
					</motion.div>

					{/* Related Shipments Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
					>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-xl sm:text-2xl font-bold text-white">Related Shipments ({shipments.length})</h2>
								<p className="text-sm text-white/60 mt-1">
									Shipments with tracking number: <span className="font-mono text-cyan-400">{container?.containerNumber}</span>
								</p>
							</div>
						</div>

						{shipments.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{shipments.map((shipment) => (
									<Link key={shipment.id} href={`/dashboard/shipments/${shipment.id}`}>
										<div className="p-5 rounded-lg bg-[var(--text-primary)]/50 border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer group">
											<div className="flex items-start justify-between mb-3">
												<div>
													<span className="text-sm font-medium text-white/70">Tracking Number</span>
													<p className="font-mono text-white font-semibold">{shipment.trackingNumber}</p>
												</div>
												<span
													className={`px-2.5 py-1 rounded-full text-xs font-medium ${
														shipment.status === 'DELIVERED'
															? 'bg-green-500/20 text-green-400'
															: shipment.status === 'IN_TRANSIT'
															? 'bg-blue-500/20 text-blue-400'
														: shipment.status === 'PENDING'
														? 'bg-sky-500/20 text-sky-300'
														: 'bg-gray-500/20 text-gray-400'
													}`}
												>
													{shipment.status.replace(/_/g, ' ')}
												</span>
											</div>

											<div className="space-y-2 text-sm">
												<div className="flex items-center justify-between">
													<span className="text-white/60">Vehicle</span>
													<span className="text-white font-medium">
														{shipment.vehicleYear ? `${shipment.vehicleYear} ` : ''}
														{shipment.vehicleMake || 'N/A'}
														{shipment.vehicleModel ? ` ${shipment.vehicleModel}` : ''}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-white/60">Type</span>
													<span className="text-white capitalize">{shipment.vehicleType}</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-white/60">User</span>
													<span className="text-white">{shipment.user.name || shipment.user.email}</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-white/60">Created</span>
													<span className="text-white">
														{new Date(shipment.createdAt).toLocaleDateString()}
													</span>
												</div>
											</div>

											<div className="mt-3 pt-3 border-t border-cyan-500/10">
												<span className="text-xs text-cyan-400 group-hover:text-cyan-300 flex items-center">
													View Shipment Details
													<svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
													</svg>
												</span>
											</div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
									<svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
									</svg>
								</div>
								<p className="text-white/70">No shipments found with tracking number matching this container.</p>
								<p className="text-white/50 text-sm mt-2">
									Shipments with tracking number <span className="font-mono text-cyan-400">{container?.containerNumber}</span> will appear here.
								</p>
							</div>
						)}
					</motion.div>

					{/* Invoices Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="relative rounded-xl bg-[var(--text-primary)]/50 backdrop-blur-sm border border-cyan-500/30 p-6 sm:p-8"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl sm:text-2xl font-bold text-white">Invoices ({invoices.length})</h2>
							{items.length > 0 && (
								<Button
									onClick={() => router.push(`/dashboard/invoices/new?containerId=${container?.id}`)}
									className="bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold)]"
								>
									<Plus className="w-4 h-4 mr-2" />
									Create Invoice
								</Button>
							)}
						</div>

						{invoices.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{invoices.map((invoice) => (
									<Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
										<div className="p-4 rounded-lg bg-[var(--text-primary)]/50 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-white">{invoice.invoiceNumber}</span>
												<span
													className={`px-2 py-1 text-xs rounded-full ${
														invoice.status === 'PAID'
															? 'bg-green-500/20 text-green-400'
															: invoice.status === 'OVERDUE'
															? 'bg-red-500/20 text-red-400'
															: 'bg-sky-500/20 text-sky-300'
													}`}
												>
													{invoice.status}
												</span>
											</div>
											<div className="flex items-center justify-between text-sm">
												<span className="text-white/60">Total</span>
												<span className="text-white font-semibold">
													${invoice.totalUSD.toFixed(2)} / {invoice.totalAED.toFixed(2)} AED
												</span>
											</div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<p className="text-center text-white/70 py-8">No invoices yet. Create an invoice from items.</p>
						)}
					</motion.div>
				</div>
			</Section>

			{/* Delete Confirmation Modal */}
			<AnimatePresence>
				{showDeleteModal && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => !isDeleting && setShowDeleteModal(false)}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
						/>
						
						{/* Modal */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
						>
							<div className="bg-[var(--text-primary)] border border-red-500/30 rounded-2xl p-6 shadow-2xl">
								<div className="flex items-center gap-4 mb-4">
									<div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
										<AlertTriangle className="w-6 h-6 text-red-400" />
									</div>
									<div>
										<h3 className="text-xl font-bold text-white">Delete Container</h3>
										<p className="text-sm text-white/60">This action cannot be undone</p>
									</div>
								</div>
								
								<p className="text-white/80 mb-6">
									Are you sure you want to delete container <span className="font-semibold text-cyan-400">{container.containerNumber}</span>?
									{items.length > 0 && (
										<span className="block mt-2 text-red-400 text-sm">
											⚠️ This container has {items.length} item(s) that will also be deleted.
										</span>
									)}
								</p>

								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() => setShowDeleteModal(false)}
										disabled={isDeleting}
										className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
									>
										Cancel
									</Button>
									<Button
										onClick={handleDelete}
										disabled={isDeleting}
										className="flex-1 bg-red-600 hover:bg-red-700 text-white"
									>
										{isDeleting ? (
											<>
												<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
												Deleting...
											</>
										) : (
											<>
												<Trash2 className="w-4 h-4 mr-2" />
												Delete
											</>
										)}
									</Button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

