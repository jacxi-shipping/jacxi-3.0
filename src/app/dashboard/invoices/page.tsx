'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Receipt, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { DashboardSurface, DashboardHeader, DashboardPanel, DashboardGrid } from '@/components/dashboard/DashboardSurface';

interface Invoice {
	id: string;
	invoiceNumber: string;
	status: string;
	totalUSD: number;
	totalAED: number;
	dueDate: string | null;
	paidDate: string | null;
	overdue: boolean;
	createdAt: string;
	container: {
		containerNumber: string;
	};
}

export default function InvoicesPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	const fetchInvoices = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/invoices');
			if (!response.ok) {
				setInvoices([]);
				return;
			}
			const data = (await response.json()) as { invoices?: Invoice[] };
			setInvoices(data.invoices ?? []);
		} catch (error) {
			console.error('Error fetching invoices:', error);
			setInvoices([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (status === 'loading') return;
		const role = session?.user?.role;
		if (!session || role !== 'admin') {
			router.replace('/dashboard');
			return;
		}
		void fetchInvoices();
	}, [fetchInvoices, router, session, status]);

	const filteredInvoices = useMemo(
		() =>
			invoices.filter((invoice) => {
				const term = searchTerm.trim().toLowerCase();
				const matchesSearch =
					invoice.invoiceNumber.toLowerCase().includes(term) ||
					invoice.container.containerNumber.toLowerCase().includes(term);
				const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
				return matchesSearch && matchesStatus;
			}),
		[invoices, searchTerm, statusFilter]
	);

	const stats = useMemo(
		() => ({
			total: invoices.length,
			paid: invoices.filter((i) => i.status === 'PAID').length,
			overdue: invoices.filter((i) => i.overdue || i.status === 'OVERDUE').length,
			pending: invoices.filter((i) => i.status === 'SENT' || i.status === 'DRAFT').length,
		}),
		[invoices]
	);

	const getStatusColor = (status: string, overdue: boolean) => {
		if (status === 'PAID') return 'bg-green-500/20 text-green-400 border-green-500/30';
		if (overdue || status === 'OVERDUE') return 'bg-red-500/20 text-red-400 border-red-500/30';
		if (status === 'SENT') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
		return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
	};

	const getStatusIcon = (status: string) => {
		if (status === 'PAID') return <CheckCircle className="w-4 h-4" />;
		if (status === 'OVERDUE') return <AlertCircle className="w-4 h-4" />;
		return <Clock className="w-4 h-4" />;
	};

	if (status === 'loading' || loading) {
		return (
			<div className="min-h-screen bg-[#020817] flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-400"></div>
			</div>
		);
	}

	const role = session?.user?.role;
	if (!session || role !== 'admin') {
		return null;
	}

	return (
		<DashboardSurface>
			<DashboardHeader
				title="Invoices"
				description="Manage billing, payment status, and overdue balances."
				meta={[
					{ label: 'Total', value: stats.total },
					{ label: 'Paid', value: stats.paid, intent: 'positive' },
					{ label: 'Overdue', value: stats.overdue, intent: 'critical' },
				]}
				actions={
					<Link href="/dashboard/invoices/new" style={{ textDecoration: 'none' }}>
						<button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-400 transition">
							New invoice
						</button>
					</Link>
				}
			/>

			<DashboardGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{[
					{ label: 'Total invoices', value: stats.total, icon: Receipt },
					{ label: 'Paid', value: stats.paid, icon: CheckCircle },
					{ label: 'Overdue', value: stats.overdue, icon: AlertCircle },
					{ label: 'Pending', value: stats.pending, icon: Clock },
				].map((card, idx) => (
					<motion.div
						key={card.label}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: idx * 0.1 }}
						className="rounded-xl border border-white/10 bg-[#0a1628]/70 p-5 shadow-lg"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-white/70 mb-1">{card.label}</p>
								<p className="text-3xl font-bold text-white">{card.value}</p>
							</div>
							<div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
								<card.icon className="w-5 h-5" />
							</div>
						</div>
					</motion.div>
				))}
			</DashboardGrid>

			<DashboardPanel title="Filters" description="Narrow down invoices quickly">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400/70" />
						<Input
							type="text"
							placeholder="Search by invoice number or container..."
							className="w-full pl-10 pr-4 py-2 bg-[#020817] border border-cyan-500/30 rounded-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div className="relative">
						<Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400/70" />
						<select
							className="w-full pl-10 pr-4 py-2 bg-[#020817] border border-cyan-500/30 rounded-lg text-white appearance-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">All Status</option>
							<option value="DRAFT">Draft</option>
							<option value="SENT">Sent</option>
							<option value="PAID">Paid</option>
							<option value="OVERDUE">Overdue</option>
						</select>
					</div>
				</div>
			</DashboardPanel>

			<DashboardPanel
				title={`All invoices (${filteredInvoices.length})`}
				description="Click a row to open the invoice"
				fullHeight
			>
				{filteredInvoices.length === 0 ? (
					<div className="rounded-xl border border-cyan-500/30 bg-[#0a1628]/50 backdrop-blur-sm p-12 text-center">
						<Receipt className="w-16 h-16 text-white/30 mx-auto mb-4" />
						<p className="text-white/70">No invoices found</p>
					</div>
				) : (
					<div className="space-y-4 sm:space-y-5">
						{filteredInvoices.map((invoice, index) => (
							<Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: index * 0.05 }}
									className="group rounded-xl border border-cyan-500/30 bg-[#0a1628]/60 p-5 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition"
								>
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-3 mb-2 flex-wrap">
												<h3 className="text-lg font-bold text-white">{invoice.invoiceNumber}</h3>
												<span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(invoice.status, invoice.overdue)}`}>
													{getStatusIcon(invoice.status)}
													{invoice.status} {invoice.overdue && '(Overdue)'}
												</span>
											</div>
											<p className="text-sm text-white/60">Container: {invoice.container.containerNumber}</p>
											{invoice.dueDate && (
												<p className="text-sm text-white/60 mt-1">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
											)}
										</div>
										<div className="text-right">
											<p className="text-xl font-bold text-cyan-400">${invoice.totalUSD.toFixed(2)}</p>
											<p className="text-sm text-white/60">{invoice.totalAED.toFixed(2)} AED</p>
										</div>
									</div>
								</motion.div>
							</Link>
						))}
					</div>
				)}
			</DashboardPanel>
		</DashboardSurface>
	);
}

