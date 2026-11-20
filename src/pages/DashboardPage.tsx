import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLATFORM_MAP } from '../data/platforms';
import { apiFetch } from '../lib/api';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { OrderCalculator } from '../components/OrderCalculator';
import type { OrderRecord, OrderStatus, ServiceItem, UserAccount } from '../types/domain';

interface DashboardPageProps {
  services: ServiceItem[];
  onNavigate: (path: string) => void;
}

const STATUS_FILTERS: Array<'All' | OrderStatus> = [
  'All',
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled',
];

function statusStyle(status: OrderStatus): string {
  switch (status) {
    case 'Completed':
      return 'text-emerald-700';
    case 'In Progress':
      return 'text-blue-700';
    case 'Pending':
      return 'text-amber-700';
    case 'Partial':
      return 'text-slate-700';
    case 'Cancelled':
      return 'text-red-700';
  }
}

export function DashboardPage({ services, onNavigate }: DashboardPageProps) {
  const { user, loading: authLoading, login, setUserDirect } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await apiFetch<{ orders: OrderRecord[] }>('/api/orders');
      setOrders(data.orders);
    } catch {
      // Handled gracefully via empty state
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.serviceName.toLowerCase().includes(q) ||
        o.targetUrl.toLowerCase().includes(q) ||
        o.platform.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status === 'Pending' || o.status === 'In Progress').length;
    const completed = orders.filter((o) => o.status === 'Completed').length;
    return { active, completed };
  }, [orders]);

  const handleRefill = async (orderId: string) => {
    setFeedback('');
    try {
      const data = await apiFetch<{ order: OrderRecord }>(`/api/orders/${orderId}/refill`, {
        method: 'POST',
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      setFeedback(`Refill check queued for ${orderId}.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to request refill.');
    }
  };

  const handleCancel = async (orderId: string) => {
    setFeedback('');
    try {
      const data = await apiFetch<{ order: OrderRecord; user: UserAccount }>(
        `/api/orders/${orderId}/cancel`,
        { method: 'POST' }
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      setUserDirect(data.user);
      setFeedback(`Order ${orderId} cancelled and $${data.order.charge.toFixed(2)} refunded.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to cancel order.');
    }
  };

  if (!authLoading && !user) {
    return (
      <WorkspaceLayout
        currentPath="/dashboard"
        breadcrumb="Client Dashboard"
        onNavigate={onNavigate}
      >
        <div className="max-w-lg mx-auto mt-12 bg-white border border-slate-200 rounded-xl p-8 space-y-5 text-center">
          <h1 className="text-xl font-display font-bold text-slate-900">
            Sign in to view your campaign workspace
          </h1>
          <p className="text-sm text-slate-600">
            Access live order progress, trigger refill checks, or submit new multi-channel campaigns.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={async () => {
                await login('client@crdigital.io', 'client123');
              }}
              className="px-4 py-2 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Use Client Demo (Maya Lin)
            </button>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout
      currentPath="/dashboard"
      breadcrumb="Client Dashboard"
      onNavigate={onNavigate}
      primaryAction={{
        label: showQuickOrder ? 'Hide Order Form' : 'New Order',
        onClick: () => setShowQuickOrder((prev) => !prev),
      }}
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Available Wallet</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              ${(user?.balance ?? 0).toFixed(2)}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/payments')}
              className="text-xs font-medium text-blue-700 hover:underline mt-2"
            >
              Add funds
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Active Campaigns</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              {stats.active}
            </p>
            <p className="text-xs text-slate-500 mt-2">Pending or in delivery</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Completed Orders</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              {stats.completed}
            </p>
            <p className="text-xs text-slate-500 mt-2">Refill protection active</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Lifetime Spend</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              ${(user?.totalSpent ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-2">Across all channels</p>
          </div>
        </div>

        {/* Inline Quick Order Builder */}
        {showQuickOrder && (
          <OrderCalculator
            services={services.filter((s) => s.active)}
            onOrderCreated={(order) => {
              setOrders((prev) => [order, ...prev]);
            }}
            onNavigate={onNavigate}
            title="New Campaign Order"
          />
        )}

        {feedback && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-900">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-700" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filter Bar + Orders Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order ID or URL..."
                aria-label="Search orders"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>

          {loadingOrders ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-10 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-medium text-slate-900">No orders match this view</p>
              <p className="text-xs text-slate-500">
                Launch a new campaign order or clear your status filter to view past fulfillment.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setSearchQuery('');
                  setShowQuickOrder(true);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                Create First Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Package & Target</th>
                    <th className="py-3 px-4 text-right">Delivered / Qty</th>
                    <th className="py-3 px-4 text-right">Charge</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredOrders.map((order) => {
                    const meta = PLATFORM_MAP[order.platform];
                    const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-mono text-xs font-semibold text-slate-900">
                            {order.id}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{dateStr}</p>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-medium text-slate-900 truncate">{order.serviceName}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {meta.name} · {order.targetUrl}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums text-slate-700 whitespace-nowrap">
                          {order.delivered.toLocaleString()} / {order.quantity.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-sm tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                          ${order.charge.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`text-xs font-semibold ${statusStyle(order.status)}`}>
                            {order.status}
                          </span>
                          {order.refillRequested && (
                            <span className="block text-[11px] text-slate-500">
                              Refill queued
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {(order.status === 'Completed' || order.status === 'In Progress') && (
                              <button
                                type="button"
                                disabled={order.refillRequested}
                                onClick={() => handleRefill(order.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 rounded-md"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>{order.refillRequested ? 'Queued' : 'Refill'}</span>
                              </button>
                            )}
                            {order.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => handleCancel(order.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-md"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
