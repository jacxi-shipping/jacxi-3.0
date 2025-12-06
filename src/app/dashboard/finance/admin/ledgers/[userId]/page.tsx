'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Section from '@/components/layout/Section';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Snackbar, Alert } from '@mui/material';

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
    vehicleMake?: string;
    vehicleModel?: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface LedgerSummary {
  totalDebit: number;
  totalCredit: number;
  currentBalance: number;
}

export default function UserLedgerManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
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
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    description: '',
    type: 'DEBIT' as 'DEBIT' | 'CREDIT',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/signin');
      return;
    }
    if (session.user?.role !== 'admin') {
      router.replace('/dashboard/finance/ledger');
      return;
    }
    fetchUser();
    fetchLedgerEntries();
  }, [session, status, router, userId, page, filters]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchLedgerEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
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
      setSnackbar({ open: true, message: 'Failed to load ledger', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          description: formData.description,
          type: formData.type,
          amount: parseFloat(formData.amount),
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Transaction added successfully', severity: 'success' });
        setShowAddModal(false);
        setFormData({ description: '', type: 'DEBIT', amount: '', notes: '' });
        fetchLedgerEntries();
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Failed to add transaction', severity: 'error' });
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
    }
  };

  const handleEditEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    try {
      const response = await fetch(`/api/ledger/${selectedEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Transaction updated successfully', severity: 'success' });
        setShowEditModal(false);
        setSelectedEntry(null);
        setFormData({ description: '', type: 'DEBIT', amount: '', notes: '' });
        fetchLedgerEntries();
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Failed to update transaction', severity: 'error' });
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/ledger/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Transaction deleted successfully', severity: 'success' });
        fetchLedgerEntries();
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Failed to delete transaction', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
    }
  };

  const openEditModal = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setFormData({
      description: entry.description,
      type: entry.type,
      amount: entry.amount.toString(),
      notes: entry.notes || '',
    });
    setShowEditModal(true);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        userId,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const endpoint = format === 'pdf' ? '/api/ledger/export-pdf' : '/api/ledger/export';
      const response = await fetch(`${endpoint}?${params}`);
      
      if (!response.ok) throw new Error('Failed to export ledger');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger-${user?.name || 'user'}-${Date.now()}.${format === 'pdf' ? 'html' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({ open: true, message: 'Ledger exported successfully', severity: 'success' });
    } catch (error) {
      console.error('Error exporting ledger:', error);
      setSnackbar({ open: true, message: 'Failed to export ledger', severity: 'error' });
    }
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

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-400';
    if (balance < 0) return 'text-green-400';
    return 'text-gray-400';
  };

  if (status === 'loading' || loading || !user) {
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
        <Section>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/dashboard/finance/admin/ledgers">
                <Button variant="outline" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Ledgers
                </Button>
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                    {user.name || user.email}'s Ledger
                  </h1>
                  <p className="text-[var(--text-secondary)] mt-2">
                    Manage financial transactions for {user.email}
                  </p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-[var(--border)] bg-[var(--panel)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Current Balance</p>
                      <p className={`text-2xl font-bold mt-1 ${getBalanceColor(summary.currentBalance)}`}>
                        {formatCurrency(summary.currentBalance)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {summary.currentBalance > 0 ? 'Amount Owed' : summary.currentBalance < 0 ? 'Credit Balance' : 'Settled'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${summary.currentBalance > 0 ? 'bg-red-500/10' : summary.currentBalance < 0 ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                      {summary.currentBalance > 0 ? <TrendingUp className="w-6 h-6 text-red-400" /> : 
                       summary.currentBalance < 0 ? <TrendingDown className="w-6 h-6 text-green-400" /> :
                       <DollarSign className="w-6 h-6 text-gray-400" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--panel)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Debits</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                        {formatCurrency(summary.totalDebit)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Amount charged</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--panel)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Credits</p>
                      <p className="text-2xl font-bold text-green-400 mt-1">
                        {formatCurrency(summary.totalCredit)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Amount paid</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="border-[var(--border)] bg-[var(--panel)] mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="border-white/10"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-2">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      >
                        <option value="">All Types</option>
                        <option value="DEBIT">Debit Only</option>
                        <option value="CREDIT">Credit Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-2">Start Date</label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-2">End Date</label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="border-[var(--border)] bg-[var(--panel)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/10">
                      <tr className="text-left">
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Description</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Balance</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                            {formatDate(entry.transactionDate)}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-[var(--text-primary)]">{entry.description}</p>
                              {entry.notes && (
                                <p className="text-xs text-[var(--text-secondary)] mt-1">{entry.notes}</p>
                              )}
                              {entry.shipment && (
                                <p className="text-xs text-cyan-400 mt-1">
                                  {entry.shipment.vehicleMake} {entry.shipment.vehicleModel}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entry.type === 'DEBIT' 
                                ? 'bg-red-500/10 text-red-400' 
                                : 'bg-green-500/10 text-green-400'
                            }`}>
                              {entry.type === 'DEBIT' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {entry.type}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm font-semibold text-right ${
                            entry.type === 'DEBIT' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {entry.type === 'DEBIT' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </td>
                          <td className={`px-6 py-4 text-sm font-semibold text-right ${getBalanceColor(entry.balance)}`}>
                            {formatCurrency(entry.balance)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(entry)}
                                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {entries.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[var(--text-secondary)]">No transactions found</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                    <div className="text-sm text-[var(--text-secondary)]">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="w-full max-w-md border-[var(--border)] bg-[var(--panel)] shadow-2xl">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[var(--text-primary)]">Add Transaction</CardTitle>
                  <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddEntry} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'DEBIT' | 'CREDIT' })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      required
                    >
                      <option value="DEBIT">Debit (User Owes)</option>
                      <option value="CREDIT">Credit (Payment Received)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      placeholder="Enter transaction description"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Amount * (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      rows={3}
                      placeholder="Add any additional notes"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                      <Check className="w-4 h-4 mr-2" />
                      Add Transaction
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Transaction Modal */}
        {showEditModal && selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="w-full max-w-md border-[var(--border)] bg-[var(--panel)] shadow-2xl">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[var(--text-primary)]">Edit Transaction</CardTitle>
                  <button onClick={() => setShowEditModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleEditEntry} className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-400">
                      Note: Type and amount cannot be edited to maintain ledger integrity. Only description and notes can be updated.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Type (Read-only)
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/20 text-[var(--text-secondary)] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Amount (Read-only)
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(parseFloat(formData.amount))}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/20 text-[var(--text-secondary)] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                      <Check className="w-4 h-4 mr-2" />
                      Update Transaction
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </ProtectedRoute>
  );
}
