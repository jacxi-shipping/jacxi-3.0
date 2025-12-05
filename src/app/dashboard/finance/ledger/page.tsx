'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Printer,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Section from '@/components/layout/Section';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface LedgerEntry {
  id: string;
  transactionDate: string;
  description: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  balance: number;
  notes?: string;
  shipment?: {
    id: string;
    trackingNumber: string;
    vehicleMake?: string;
    vehicleModel?: string;
  };
  user: {
    id: string;
    name?: string;
    email: string;
  };
}

interface LedgerSummary {
  totalDebit: number;
  totalCredit: number;
  currentBalance: number;
}

export default function LedgerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>({
    totalDebit: 0,
    totalCredit: 0,
    currentBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    startDate: '',
    endDate: '',
    shipmentId: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/signin');
      return;
    }
    fetchLedgerEntries();
  }, [session, status, page, filters]);

  const fetchLedgerEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.shipmentId && { shipmentId: filters.shipmentId }),
      });

      const response = await fetch(`/api/ledger?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ledger entries');
      }

      const data = await response.json();
      setEntries(data.entries);
      setSummary(data.summary);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      let endpoint = '/api/ledger/export';
      if (format === 'pdf') {
        endpoint = '/api/ledger/export-pdf';
      } else if (format === 'excel') {
        endpoint = '/api/ledger/export-excel';
      }

      const response = await fetch(`${endpoint}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to export ledger');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set appropriate filename based on format
      if (format === 'pdf') {
        a.download = `ledger-${Date.now()}.html`; // HTML can be opened in browser and printed to PDF
      } else if (format === 'excel') {
        a.download = `ledger-${Date.now()}.csv`;
      } else {
        a.download = `ledger-${Date.now()}.csv`;
      }
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // For PDF, open in new tab for printing
      if (format === 'pdf') {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting ledger:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center space-y-4 text-[var(--text-secondary)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border)] border-t-[var(--accent-gold)] mx-auto" />
            <p>Loading ledger...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Section className="pt-6 pb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Link href="/dashboard/finance">
                <Button variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-semibold text-[var(--text-primary)]">User Ledger</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  View all your financial transactions and balance
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </Section>

        {/* Summary Cards */}
        <Section className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide">Total Debit</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                      {formatCurrency(summary.totalDebit)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide">Total Credit</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                      {formatCurrency(summary.totalCredit)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide">Current Balance</p>
                    <p className={`text-2xl font-bold mt-2 ${summary.currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(Math.abs(summary.currentBalance))}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {summary.currentBalance >= 0 ? 'In your favor' : 'Amount due'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    summary.currentBalance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <DollarSign className={`w-6 h-6 ${summary.currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Filters */}
        {showFilters && (
          <Section className="pb-6">
            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardHeader className="p-4 border-b border-white/5">
                <CardTitle className="text-lg font-bold text-[var(--text-primary)]">Filters</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        placeholder="Description or notes..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-cyan-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/3 text-[var(--text-primary)] focus:ring-2 focus:ring-cyan-500/40"
                    >
                      <option value="">All Types</option>
                      <option value="DEBIT">Debit</option>
                      <option value="CREDIT">Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/3 text-[var(--text-primary)] focus:ring-2 focus:ring-cyan-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/3 text-[var(--text-primary)] focus:ring-2 focus:ring-cyan-500/40"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({
                        search: '',
                        type: '',
                        startDate: '',
                        endDate: '',
                        shipmentId: '',
                      });
                      setPage(1);
                    }}
                    className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPage(1);
                      fetchLedgerEntries();
                    }}
                    className="bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]"
                    style={{ color: 'white' }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Section>
        )}

        {/* Ledger Table */}
        <Section className="pb-16">
          <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-lg font-bold text-[var(--text-primary)]">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                        Shipment
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                        Debit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                        Credit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No ledger entries found</p>
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                            {formatDate(entry.transactionDate)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-[var(--text-primary)]">{entry.description}</div>
                            {entry.notes && (
                              <div className="text-xs text-[var(--text-secondary)] mt-1">{entry.notes}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                            {entry.shipment ? (
                              <Link
                                href={`/dashboard/shipments/${entry.shipment.id}`}
                                className="text-cyan-400 hover:text-cyan-300 hover:underline"
                              >
                                {entry.shipment.trackingNumber}
                              </Link>
                            ) : (
                              <span className="text-[var(--text-secondary)]">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {entry.type === 'DEBIT' && (
                              <span className="text-red-400 font-semibold">
                                {formatCurrency(entry.amount)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {entry.type === 'CREDIT' && (
                              <span className="text-green-400 font-semibold">
                                {formatCurrency(entry.amount)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-semibold ${entry.balance >= 0 ? 'text-[var(--text-primary)]' : 'text-red-400'}`}>
                              {formatCurrency(Math.abs(entry.balance))}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-[var(--text-secondary)]">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </Section>
      </div>
    </ProtectedRoute>
  );
}
