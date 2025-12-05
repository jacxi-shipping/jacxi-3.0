'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Package,
  FileText,
  Download,
  PlusCircle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Section from '@/components/layout/Section';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface FinancialSummary {
  ledgerSummary: {
    totalDebit: number;
    totalCredit: number;
    netBalance: number;
    debitCount: number;
    creditCount: number;
  };
  shipmentSummary: {
    status: string;
    totalAmount: number;
    count: number;
  }[];
  userBalances: {
    userId: string;
    userName: string;
    currentBalance: number;
  }[];
}

export default function FinancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/signin');
      return;
    }
    fetchFinancialSummary();
  }, [session, status, router]);

  const fetchFinancialSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/financial?type=summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPaidShipments = () => {
    return summary?.shipmentSummary.find(s => s.status === 'COMPLETED') || { count: 0, totalAmount: 0 };
  };

  const getDueShipments = () => {
    return summary?.shipmentSummary.find(s => s.status === 'PENDING') || { count: 0, totalAmount: 0 };
  };

  const getUsersWithBalance = () => {
    return summary?.userBalances.filter(u => u.currentBalance !== 0).length || 0;
  };

  if (status === 'loading' || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center space-y-4 text-[var(--text-secondary)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border)] border-t-[var(--accent-gold)] mx-auto" />
            <p>Loading financial data...</p>
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
            <div>
              <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Accounting & Finance</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Manage ledgers, payments, and financial reports
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <Link href="/dashboard/finance/record-payment">
                  <Button
                    size="sm"
                    className="bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]"
                    style={{ color: 'white' }}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Section>

        {/* Summary Cards */}
        <Section className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Debit */}
            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Debit</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                      {formatCurrency(summary?.ledgerSummary.totalDebit || 0)}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {summary?.ledgerSummary.debitCount || 0} transactions
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Credit */}
            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Credit</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                      {formatCurrency(summary?.ledgerSummary.totalCredit || 0)}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {summary?.ledgerSummary.creditCount || 0} transactions
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Net Balance */}
            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Net Balance</p>
                    <p className={`text-2xl font-bold mt-2 ${
                      (summary?.ledgerSummary.netBalance || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(Math.abs(summary?.ledgerSummary.netBalance || 0))}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {(summary?.ledgerSummary.netBalance || 0) >= 0 ? 'Receivable' : 'Payable'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    (summary?.ledgerSummary.netBalance || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <DollarSign className={`w-6 h-6 ${
                      (summary?.ledgerSummary.netBalance || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users with Balance */}
            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Active Users</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                      {getUsersWithBalance()}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      With outstanding balance
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Shipment Payment Status */}
        <Section className="pb-6">
          <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
            <CardHeader className="p-4 sm:p-6 border-b border-white/5">
              <CardTitle className="text-lg font-bold text-[var(--text-primary)]">Shipment Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Paid Shipments */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Paid Shipments</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                      {getPaidShipments().count}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Total: {formatCurrency(getPaidShipments().totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Due Shipments */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Due Shipments</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">
                      {getDueShipments().count}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Total: {formatCurrency(getDueShipments().totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Quick Actions */}
        <Section className="pb-6">
          <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
            <CardHeader className="p-4 sm:p-6 border-b border-white/5">
              <CardTitle className="text-lg font-bold text-[var(--text-primary)]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* View Ledger */}
                <Link href="/dashboard/finance/ledger">
                  <div className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">View Ledger</p>
                        <p className="text-xs text-[var(--text-secondary)]">Check your transactions</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Record Payment */}
                {isAdmin && (
                  <Link href="/dashboard/finance/record-payment">
                    <div className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <PlusCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">Record Payment</p>
                          <p className="text-xs text-[var(--text-secondary)]">Log received payment</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* View Reports */}
                {isAdmin && (
                  <Link href="/dashboard/finance/reports">
                    <div className="p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Download className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">Financial Reports</p>
                          <p className="text-xs text-[var(--text-secondary)]">View detailed reports</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* User Balances (Admin only) */}
        {isAdmin && summary && summary.userBalances.length > 0 && (
          <Section className="pb-16">
            <Card className="border-0 bg-[var(--panel)] backdrop-blur-md shadow-lg">
              <CardHeader className="p-4 sm:p-6 border-b border-white/5">
                <CardTitle className="text-lg font-bold text-[var(--text-primary)]">User Balances</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          User
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Current Balance
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {summary.userBalances.slice(0, 10).map((user) => (
                        <tr key={user.userId} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                            {user.userName}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-semibold ${
                              user.currentBalance >= 0 ? 'text-[var(--text-primary)]' : 'text-red-400'
                            }`}>
                              {formatCurrency(Math.abs(user.currentBalance))}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {user.currentBalance === 0 ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-400">
                                Settled
                              </span>
                            ) : user.currentBalance > 0 ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400">
                                Due
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400">
                                Credit
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Section>
        )}
      </div>
    </ProtectedRoute>
  );
}
