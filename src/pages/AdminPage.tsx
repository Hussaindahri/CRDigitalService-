import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Plus, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLATFORMS, PLATFORM_MAP } from '../data/platforms';
import { apiFetch } from '../lib/api';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import type {
  OrderRecord,
  OrderStatus,
  PaymentRecord,
  PlatformId,
  ServiceItem,
  UserAccount,
} from '../types/domain';

interface AdminPageProps {
  onServicesUpdated: (services: ServiceItem[]) => void;
  onNavigate: (path: string) => void;
}

type AdminTab = 'orders' | 'services' | 'payments' | 'users';

export function AdminPage({ onServicesUpdated, onNavigate }: AdminPageProps) {
  const { user, loading: authLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New Service Form State
  const [showAddService, setShowAddService] = useState(false);
  const [newPlatform, setNewPlatform] = useState<PlatformId>('youtube');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Views');
  const [newRate, setNewRate] = useState(4.5);
  const [newMin, setNewMin] = useState(500);
  const [newMax, setNewMax] = useState(100000);
  const [newDesc, setNewDesc] = useState('');

  const loadOverview = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const data = await apiFetch<{
        users: UserAccount[];
        services: ServiceItem[];
        orders: OrderRecord[];
        payments: PaymentRecord[];
      }>('/api/admin/overview');
      setUsers(data.users);
      setServices(data.services);
      setOrders(data.orders);
      setPayments(data.payments);
      onServicesUpdated(data.services.filter((s) => s.active));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load admin overview.');
    } finally {
      setLoading(false);
    }
  }, [user, onServicesUpdated]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const metrics = useMemo(() => {
    const approvedDeposits = payments
      .filter((p) => p.type === 'Deposit' && p.status === 'Approved')
      .reduce((sum, p) => sum + p.amount, 0);
    const activeOrders = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'In Progress'
    ).length;
    const pendingPayments = payments.filter((p) => p.status === 'Pending').length;
    return { approvedDeposits, activeOrders, pendingPayments };
  }, [payments, orders]);

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    setFeedback('');
    setErrorMsg('');
    try {
      const data = await apiFetch<{ order: OrderRecord }>(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      setFeedback(`Order ${orderId} updated to ${status}.`);
      if (status === 'Cancelled') {
        loadOverview();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update order.');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');
    setErrorMsg('');
    try {
      const data = await apiFetch<{ service: ServiceItem }>('/api/admin/services', {
        method: 'POST',
        body: JSON.stringify({
          platform: newPlatform,
          name: newName,
          category: newCategory,
          ratePer1k: Number(newRate),
          minOrder: Number(newMin),
          maxOrder: Number(newMax),
          description: newDesc,
        }),
      });
      const updated = [data.service, ...services];
      setServices(updated);
      onServicesUpdated(updated.filter((s) => s.active));
      setNewName('');
      setNewDesc('');
      setShowAddService(false);
      setFeedback(`Service ${data.service.id} added to catalog.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create service.');
    }
  };

  const handleToggleService = async (service: ServiceItem) => {
    try {
      const data = await apiFetch<{ service: ServiceItem }>(
        `/api/admin/services/${service.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ active: !service.active }),
        }
      );
      const updated = services.map((s) => (s.id === service.id ? data.service : s));
      setServices(updated);
      onServicesUpdated(updated.filter((s) => s.active));
      setFeedback(`Service ${service.id} ${data.service.active ? 'activated' : 'paused'}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to toggle service.');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await apiFetch(`/api/admin/services/${serviceId}`, { method: 'DELETE' });
      const updated = services.filter((s) => s.id !== serviceId);
      setServices(updated);
      onServicesUpdated(updated.filter((s) => s.active));
      setFeedback(`Service ${serviceId} removed.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to remove service.');
    }
  };

  const handlePaymentDecision = async (paymentId: string, status: 'Approved' | 'Rejected') => {
    setFeedback('');
    setErrorMsg('');
    try {
      await apiFetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadOverview();
      setFeedback(`Deposit ${paymentId} marked as ${status}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to process payment.');
    }
  };

  const handleCreditUser = async (userId: string, amount: number) => {
    try {
      const data = await apiFetch<{ user: UserAccount }>(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ balanceAdjustment: amount }),
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? data.user : u)));
      setFeedback(`Credited $${amount.toFixed(2)} to ${data.user.name}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to credit account.');
    }
  };

  const handleToggleUserStatus = async (targetUser: UserAccount) => {
    const nextStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const data = await apiFetch<{ user: UserAccount }>(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? data.user : u)));
      setFeedback(`${data.user.name} status set to ${nextStatus}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update account.');
    }
  };

  if (!authLoading && (!user || user.role !== 'admin')) {
    return (
      <WorkspaceLayout
        currentPath="/admin"
        breadcrumb="Admin Console"
        onNavigate={onNavigate}
      >
        <div className="max-w-lg mx-auto mt-12 bg-white border border-slate-200 rounded-xl p-8 space-y-5 text-center">
          <h1 className="text-xl font-display font-bold text-slate-900">
            Administrator Access Required
          </h1>
          <p className="text-sm text-slate-600">
            {user
              ? `You are currently signed in as ${user.name} (Client). Switch to the Demo Admin account to manage orders, catalog rates, and deposit approvals.`
              : 'Sign in with an administrator account to access operations controls.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={async () => {
                await login('admin@crdigital.io', 'admin123');
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Sign In as Demo Admin
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Back to Client Dashboard
            </button>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout
      currentPath="/admin"
      breadcrumb="Admin Console"
      onNavigate={onNavigate}
      primaryAction={{
        label: 'Add Service',
        onClick: () => {
          setActiveTab('services');
          setShowAddService(true);
        },
      }}
    >
      <div className="space-y-6">
        {/* Operations KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Approved Deposits</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              ${metrics.approvedDeposits.toFixed(2)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Active Orders Queue</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              {metrics.activeOrders}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Pending Deposit Approvals</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-amber-700 mt-1">
              {metrics.pendingPayments}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Catalog Services</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              {services.length}
            </p>
          </div>
        </div>

        {/* Feedback Banners */}
        {feedback && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>{feedback}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-xl">
          {(
            [
              { id: 'orders', label: `Orders Queue (${orders.length})` },
              { id: 'services', label: `Service Catalog (${services.length})` },
              {
                id: 'payments',
                label: `Deposit Approvals (${metrics.pendingPayments} pending)`,
              },
              { id: 'users', label: `Client Accounts (${users.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        )}

        {/* TAB 1: ORDERS QUEUE */}
        {!loading && activeTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Service & URL</th>
                    <th className="py-3 px-4 text-right">Qty / Charge</th>
                    <th className="py-3 px-4">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs font-semibold text-slate-900">
                        {order.id}
                        {order.refillRequested && (
                          <span className="block text-[11px] font-sans font-normal text-amber-700">
                            Refill requested
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-900">{order.userName}</p>
                        <p className="text-xs text-slate-500">{order.userEmail}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-900 truncate">{order.serviceName}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {PLATFORM_MAP[order.platform].name} · {order.targetUrl}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <p className="text-xs text-slate-900 font-semibold">
                          {order.quantity.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">${order.charge.toFixed(2)}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          aria-label={`Status for ${order.id}`}
                          value={order.status}
                          onChange={(e) =>
                            handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-700 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Partial">Partial</option>
                          <option value="Cancelled">Cancelled (Refund)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SERVICE CATALOG CRUD */}
        {!loading && activeTab === 'services' && (
          <div className="space-y-4">
            {showAddService && (
              <form
                onSubmit={handleCreateService}
                className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-display font-semibold text-slate-900">
                    Create New Service Package
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddService(false)}
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value as PlatformId)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Rate per 1,000 (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      value={newRate}
                      onChange={(e) => setNewRate(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Min Order
                    </label>
                    <input
                      type="number"
                      min="10"
                      required
                      value={newMin}
                      onChange={(e) => setNewMin(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Max Order
                    </label>
                    <input
                      type="number"
                      min="100"
                      required
                      value={newMax}
                      onChange={(e) => setNewMax(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Package Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. YouTube Premiere Boost"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Concise operational specification..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Service Package</span>
                </button>
              </form>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Platform & Package</th>
                      <th className="py-3 px-4 text-right">Rate / 1K</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {services.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {s.id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-500">
                            {PLATFORM_MAP[s.platform].name} · {s.category}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                          ${s.ratePer1k.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-xs font-semibold">
                          <span className={s.active ? 'text-emerald-700' : 'text-slate-500'}>
                            {s.active ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleService(s)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md"
                            >
                              {s.active ? 'Pause' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(s.id)}
                              aria-label={`Delete ${s.id}`}
                              className="p-1.5 text-red-700 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT APPROVALS */}
        {!loading && activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Method & Reference</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                        {p.id}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-900">{p.userName}</p>
                        <p className="text-xs text-slate-500">{p.userEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">
                          {p.method} · {p.type}
                        </p>
                        <p className="text-xs font-mono text-slate-500">{p.reference}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="block font-semibold text-slate-900">
                          {p.amount >= 0 ? `+$${p.amount.toFixed(2)}` : `-$${Math.abs(p.amount).toFixed(2)}`}
                        </span>
                        {p.currency === 'PKR' && p.originalAmount && (
                          <span className="block text-[11px] text-slate-500">
                            Rs {p.originalAmount.toLocaleString()} PKR
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs font-semibold">
                        <span
                          className={
                            p.status === 'Approved'
                              ? 'text-emerald-700'
                              : p.status === 'Pending'
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {p.status === 'Pending' ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handlePaymentDecision(p.id, 'Approved')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePaymentDecision(p.id, 'Rejected')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-md"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: USERS */}
        {!loading && activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                    <th className="py-3 px-4">Account</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-right">Spent</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">
                          {u.email} · {u.company}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 capitalize">{u.role}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        ${u.balance.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        ${u.totalSpent.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs font-semibold">
                        <span className={u.status === 'Active' ? 'text-emerald-700' : 'text-red-700'}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCreditUser(u.id, 50)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md"
                          >
                            +$50 Credit
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md"
                            >
                              {u.status === 'Active' ? 'Suspend' : 'Restore'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
