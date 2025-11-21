'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
	Activity,
	BarChart3,
	TrendingUp,
	CreditCard,
	AlertTriangle,
	Package,
	User as UserIcon,
	Layers,
	RefreshCcw,
} from 'lucide-react';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	Legend,
} from 'recharts';
import { Box, Button, Typography, Fade, Slide, Zoom, CircularProgress } from '@mui/material';

import { DashboardSurface, DashboardHeader, DashboardPanel, DashboardGrid } from '@/components/dashboard/DashboardSurface';

interface SummaryRow {
	totalShipments: number;
	activeShipments: number;
	adminUsers: number;
	totalRevenue: number;
	overdueInvoices: number;
	activeContainers: number;
}

interface StatusDatum {
	status: string;
	count: number;
}

interface MonthDatum {
	month: string;
	count?: number;
	totalUSD?: number;
}

interface InvoiceStatusDatum {
	status: string;
	count: number;
	totalUSD: number;
}

interface OutstandingInvoice {
	id: string;
	invoiceNumber: string;
	status: string;
	totalUSD: number;
	dueDate: string | null;
}

interface TopCustomer {
	userId: string;
	name: string;
	email: string;
	shipmentCount: number;
	revenue: number;
	lastShipmentAt: string | null;
}

interface AnalyticsPayload {
	summary: SummaryRow;
	shipmentsByStatus: StatusDatum[];
	shipmentsByMonth: Array<Required<Pick<MonthDatum, 'month' | 'count'>>>;
	revenueByMonth: Array<Required<Pick<MonthDatum, 'month' | 'totalUSD'>>>;
	invoiceStatusDistribution: InvoiceStatusDatum[];
	outstandingInvoices: OutstandingInvoice[];
	topCustomers: TopCustomer[];
	lastUpdated: string;
}

const COLORS = ['#22d3ee', '#818cf8', '#f472b6', '#f97316', '#34d399', '#facc15', '#38bdf8'];

const formatCurrency = (value: number) =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
		Number.isFinite(value) ? value : 0,
	);

const formatDate = (value: string | null) => {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleDateString();
};

export default function AnalyticsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [data, setData] = useState<AnalyticsPayload | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const show = true;

	const isAdmin = session?.user?.role === 'admin';

	useEffect(() => {
		if (status === 'loading') return;
		if (!session || !isAdmin) {
			router.replace('/dashboard');
			return;
		}

		const fetchAnalytics = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/analytics');
				if (!response.ok) throw new Error('Failed to load analytics payload.');
				const payload: AnalyticsPayload = await response.json();
				setData(payload);
				setError(null);
			} catch (err: unknown) {
				console.error(err);
				setError(err instanceof Error ? err.message : 'Unexpected analytics error.');
			} finally {
				setLoading(false);
			}
		};

		fetchAnalytics();
	}, [session, status, isAdmin, router]);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			const response = await fetch('/api/analytics', { cache: 'no-store' });
			if (!response.ok) throw new Error('Unable to refresh analytics.');
			const payload: AnalyticsPayload = await response.json();
			setData(payload);
			setError(null);
		} catch (err: unknown) {
			console.error(err);
			setError(err instanceof Error ? err.message : 'Unexpected analytics error.');
		} finally {
			setRefreshing(false);
		}
	};

	const summaryCards = useMemo(() => {
		if (!data) return [];
		const summary = data.summary;
		return [
			{
				label: 'Total Shipments',
				value: summary.totalShipments,
				icon: Package,
				description: 'All shipments recorded in Jacxi.',
				accent: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
				glow: 'rgba(6, 182, 212, 0.3)',
			},
			{
				label: 'Active Shipments',
				value: summary.activeShipments,
				icon: Activity,
				description: 'Currently moving through the network.',
				accent: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
				glow: 'rgba(16, 185, 129, 0.3)',
			},
			{
				label: 'Total Revenue',
				value: formatCurrency(summary.totalRevenue),
				icon: TrendingUp,
				description: 'Paid invoices converted to USD.',
				accent: 'border-purple-500/40 bg-purple-500/15 text-purple-200',
				glow: 'rgba(168, 85, 247, 0.3)',
			},
			{
				label: 'Team Admins',
				value: summary.adminUsers,
				icon: UserIcon,
				description: 'Administrators with dashboard access.',
				accent: 'border-blue-500/40 bg-blue-500/15 text-blue-200',
				glow: 'rgba(59, 130, 246, 0.3)',
			},
			{
				label: 'Overdue Invoices',
				value: summary.overdueInvoices,
				icon: AlertTriangle,
				description: 'Invoices past due date & unpaid.',
				accent: 'border-sky-500/30 bg-sky-50 text-sky-700',
				glow: 'rgba(14,165,233,0.25)',
			},
			{
				label: 'Active Containers',
				value: summary.activeContainers,
				icon: Layers,
				description: 'Containers currently assigned & active.',
				accent: 'border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200',
				glow: 'rgba(217, 70, 239, 0.3)',
			},
		];
	}, [data]);

	if (status === 'loading' || loading) {
		return (
			<Box
				sx={{
					minHeight: '100vh',
					background: '#020817',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<CircularProgress
					size={60}
					sx={{
						color: 'rgb(34, 211, 238)',
						filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.5))',
					}}
				/>
			</Box>
		);
	}

	if (!session || !isAdmin || !data) {
		return null;
	}

	return (
		<DashboardSurface>
			<DashboardHeader
				title="Analytics"
				description="Financial and operational intelligence updated in real time."
				meta={[
					{ label: 'Shipments', value: data.summary.totalShipments },
					{ label: 'Revenue', value: formatCurrency(data.summary.totalRevenue), intent: 'positive' },
					{ label: 'Admins', value: data.summary.adminUsers },
				]}
				actions={
					<Button
						variant="outlined"
						size="small"
						startIcon={<RefreshCcw size={14} />}
						onClick={handleRefresh}
						disabled={refreshing}
						sx={{ textTransform: 'none', fontSize: '0.75rem' }}
					>
						Refresh
					</Button>
				}
			/>

			{error && (
				<Box
					sx={{
						borderRadius: 2,
						border: '1px solid rgba(239,68,68,0.3)',
						background: 'rgba(239,68,68,0.08)',
						px: 2.5,
						py: 1.5,
						color: 'rgb(248,113,113)',
					}}
				>
					{error}
				</Box>
			)}

			<DashboardGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{summaryCards.map((card, index) => {
					const Icon = card.icon;
					return (
						<Zoom key={card.label} in={show} timeout={600} style={{ transitionDelay: `${(index + 2) * 80}ms` }}>
							<Box
								className={`rounded-xl border ${card.accent} backdrop-blur-md p-4 shadow-lg`}
								sx={{
									background: 'rgba(4,10,22,0.85)',
									minHeight: 140,
									display: 'flex',
									flexDirection: 'column',
									gap: 1.5,
								}}
							>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
									<Box>
										<Typography sx={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
											{card.label}
										</Typography>
										<Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{card.value}</Typography>
									</Box>
									<Box sx={{ p: 1, borderRadius: 2, background: 'rgba(0,0,0,0.2)' }}>
										<Icon style={{ width: 22, height: 22, color: 'white' }} />
									</Box>
								</Box>
								<Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{card.description}</Typography>
							</Box>
						</Zoom>
					);
				})}
			</DashboardGrid>

			<DashboardGrid className="lg:grid-cols-2">
				<DashboardPanel title="Shipment volume" description="Six month rolling window" fullHeight>
					<Box sx={{ height: 300 }}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={data.shipmentsByMonth}>
								<CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
								<XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
								<YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} />
								<Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
								<Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
							</LineChart>
						</ResponsiveContainer>
					</Box>
				</DashboardPanel>

				<DashboardPanel title="Revenue (USD)" description="Paid invoices (six months)" fullHeight>
					<Box sx={{ height: 300 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data.revenueByMonth}>
								<CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
								<XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
								<YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} stroke="#94a3b8" tickLine={false} axisLine={false} />
								<Tooltip
									contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #312e81', borderRadius: 8 }}
									formatter={(value: number) => formatCurrency(value)}
								/>
								<Bar dataKey="totalUSD" fill="#a855f7" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</Box>
				</DashboardPanel>
			</DashboardGrid>
		</DashboardSurface>
	);
}
