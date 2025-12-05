'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AdminRoute } from '@/components/auth/AdminRoute';

interface Container {
  id: string;
  containerNumber: string;
  trackingNumber: string | null;
  vesselName: string | null;
  shippingLine: string | null;
  destinationPort: string | null;
  estimatedArrival: string | null;
  status: string;
  progress: number;
  currentCount: number;
  maxCapacity: number;
  createdAt: string;
  _count: {
    shipments: number;
    expenses: number;
    invoices: number;
    documents: number;
  };
}

const statusColors: Record<string, string> = {
  CREATED: 'bg-gray-500',
  WAITING_FOR_LOADING: 'bg-yellow-500',
  LOADED: 'bg-blue-500',
  IN_TRANSIT: 'bg-indigo-600',
  ARRIVED_PORT: 'bg-green-500',
  CUSTOMS_CLEARANCE: 'bg-orange-500',
  RELEASED: 'bg-teal-500',
  CLOSED: 'bg-gray-700',
};

const statusLabels: Record<string, string> = {
  CREATED: 'Created',
  WAITING_FOR_LOADING: 'Waiting for Loading',
  LOADED: 'Loaded',
  IN_TRANSIT: 'In Transit',
  ARRIVED_PORT: 'Arrived',
  CUSTOMS_CLEARANCE: 'Customs',
  RELEASED: 'Released',
  CLOSED: 'Closed',
};

export default function ContainersPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchContainers();
  }, [page, statusFilter, searchQuery]);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/containers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setContainers(data.containers);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching containers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContainers();
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Containers
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage shipping containers and tracking
                </p>
              </div>
              <Button onClick={() => router.push('/dashboard/containers/new')}>
                + New Container
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <form onSubmit={handleSearch} className="flex-1">
                <input
                  type="text"
                  placeholder="Search by container #, tracking #, vessel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </form>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Container Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading containers...</p>
            </div>
          ) : containers.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No containers found</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/containers/new')}>
                Create First Container
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {containers.map((container) => (
                  <Card
                    key={container.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/dashboard/containers/${container.id}`)}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {container.containerNumber}
                        </h3>
                        {container.trackingNumber && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tracking: {container.trackingNumber}
                          </p>
                        )}
                      </div>
                      <Badge className={statusColors[container.status]}>
                        {statusLabels[container.status]}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {container.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${container.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      {container.vesselName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Vessel:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {container.vesselName}
                          </span>
                        </div>
                      )}
                      {container.shippingLine && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Line:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {container.shippingLine}
                          </span>
                        </div>
                      )}
                      {container.destinationPort && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Destination:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {container.destinationPort}
                          </span>
                        </div>
                      )}
                      {container.estimatedArrival && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ETA:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {new Date(container.estimatedArrival).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Vehicles: </span>
                          <span className="text-gray-900 dark:text-white font-bold">
                            {container._count.shipments}/{container.maxCapacity}
                          </span>
                        </div>
                        <div className="flex gap-3 text-gray-600 dark:text-gray-400">
                          <span>📄 {container._count.documents}</span>
                          <span>💰 {container._count.expenses}</span>
                          <span>📊 {container._count.invoices}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}
