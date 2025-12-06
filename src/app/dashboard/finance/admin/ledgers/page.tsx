'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Section from '@/components/layout/Section';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface UserLedgerSummary {
  userId: string;
  userName: string;
  email: string;
  currentBalance: number;
  totalDebit: number;
  totalCredit: number;
  transactionCount: number;
  lastTransaction?: string;
}

export default function AdminLedgersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserLedgerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBalance, setFilterBalance] = useState<'all' | 'positive' | 'zero' | 'negative'>('all');

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
    fetchAllUserLedgers();
  }, [session, status, router]);

  const fetchAllUserLedgers = async () => {
    try {
      setLoading(true);
      // Fetch all users with their ledger summary
      const usersResponse = await fetch('/api/users');
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      
      const usersData = await usersResponse.json();
      
      // Fetch ledger summary for each user
      const userSummaries = await Promise.all(
        usersData.users.map(async (user: { id: string; name: string | null; email: string }) => {
          try {
            const ledgerResponse = await fetch(`/api/ledger?userId=${user.id}&limit=1`);
            if (!ledgerResponse.ok) {
              return {
                userId: user.id,
                userName: user.name || user.email,
                email: user.email,
                currentBalance: 0,
                totalDebit: 0,
                totalCredit: 0,
                transactionCount: 0,
              };
            }

            const ledgerData = await ledgerResponse.json();
            return {
              userId: user.id,
              userName: user.name || user.email,
              email: user.email,
              currentBalance: ledgerData.summary?.currentBalance || 0,
              totalDebit: ledgerData.summary?.totalDebit || 0,
              totalCredit: ledgerData.summary?.totalCredit || 0,
              transactionCount: ledgerData.pagination?.totalCount || 0,
              lastTransaction: ledgerData.entries?.[0]?.transactionDate,
            };
          } catch (error) {
            console.error(`Error fetching ledger for user ${user.id}:`, error);
            return {
              userId: user.id,
              userName: user.name || user.email,
              email: user.email,
              currentBalance: 0,
              totalDebit: 0,
              totalCredit: 0,
              transactionCount: 0,
            };
          }
        })
      );

      setUsers(userSummaries);
    } catch (error) {
      console.error('Error fetching user ledgers:', error);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No transactions';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-400'; // User owes money
    if (balance < 0) return 'text-green-400'; // User has credit balance
    return 'text-gray-400'; // Zero balance
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (balance < 0) return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <DollarSign className="w-4 h-4 text-gray-400" />;
  };

  // Filter users based on search and balance filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBalance = 
      filterBalance === 'all' ||
      (filterBalance === 'positive' && user.currentBalance > 0) ||
      (filterBalance === 'zero' && user.currentBalance === 0) ||
      (filterBalance === 'negative' && user.currentBalance < 0);

    return matchesSearch && matchesBalance;
  });

  // Calculate totals
  const totalBalance = users.reduce((sum, user) => sum + user.currentBalance, 0);
  const totalDebit = users.reduce((sum, user) => sum + user.totalDebit, 0);
  const totalCredit = users.reduce((sum, user) => sum + user.totalCredit, 0);
  const usersWithBalance = users.filter(u => u.currentBalance > 0).length;

  if (status === 'loading' || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center space-y-4 text-[var(--text-secondary)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border)] border-t-[var(--accent-gold)] mx-auto" />
            <p>Loading ledgers...</p>
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                    <Users className="w-8 h-8 text-cyan-400" />
                    All User Ledgers
                  </h1>
                  <p className="text-[var(--text-secondary)] mt-2">
                    View and manage financial ledgers for all users
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/finance/record-payment">
                    <Button className="bg-green-500 hover:bg-green-600">
                      Record Payment
                    </Button>
                  </Link>
                  <Link href="/dashboard/finance/add-expense">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Add Expense
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-[var(--border)] bg-[var(--panel)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Outstanding</p>
                      <p className={`text-2xl font-bold mt-1 ${getBalanceColor(totalBalance)}`}>
                        {formatCurrency(totalBalance)}
                      </p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-red-400" />
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
                        {formatCurrency(totalDebit)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-400" />
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
                        {formatCurrency(totalCredit)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--panel)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Users With Balance</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                        {usersWithBalance} / {users.length}
                      </p>
                    </div>
                    <div className="p-3 bg-cyan-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="border-[var(--border)] bg-[var(--panel)] mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
                    <select
                      value={filterBalance}
                      onChange={(e) => setFilterBalance(e.target.value as typeof filterBalance)}
                      className="px-4 py-2 rounded-lg border border-white/10 bg-black/40 text-[var(--text-primary)]"
                    >
                      <option value="all">All Balances</option>
                      <option value="positive">Owes Money (Positive)</option>
                      <option value="zero">Zero Balance</option>
                      <option value="negative">Credit Balance (Negative)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-[var(--border)] bg-[var(--panel)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">
                  User Ledgers ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/10">
                      <tr className="text-left">
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          User
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Balance
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Total Debit
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Total Credit
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Transactions
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Last Activity
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.map((user) => (
                        <tr key={user.userId} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                {user.userName}
                              </p>
                              <p className="text-xs text-[var(--text-secondary)]">
                                {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getBalanceIcon(user.currentBalance)}
                              <span className={`text-sm font-semibold ${getBalanceColor(user.currentBalance)}`}>
                                {formatCurrency(user.currentBalance)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                            {formatCurrency(user.totalDebit)}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-400">
                            {formatCurrency(user.totalCredit)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                            {user.transactionCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                            {formatDate(user.lastTransaction)}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/dashboard/finance/admin/ledgers/${user.userId}`}>
                              <Button variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10">
                                <Eye className="w-4 h-4 mr-2" />
                                View Ledger
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[var(--text-secondary)]">No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-6 flex justify-end gap-4">
              <Link href="/dashboard/finance/reports">
                <Button variant="outline" className="border-cyan-500/40 text-cyan-300">
                  <Download className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </ProtectedRoute>
  );
}
