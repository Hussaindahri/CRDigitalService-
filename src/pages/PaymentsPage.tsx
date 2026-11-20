import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import type { PaymentRecord, UserAccount } from '../types/domain';

interface PaymentsPageProps {
  onNavigate: (path: string) => void;
}

const USD_TO_PKR = 278;

interface PaymentMethodOption {
  id: string;
  label: string;
  defaultCurrency: 'USD' | 'PKR';
  note: string;
  details: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'JazzCash',
    label: 'JazzCash (PKR)',
    defaultCurrency: 'PKR',
    note: 'Send PKR via JazzCash Mobile Account and enter your 11-digit TID reference.',
    details: 'Account: CR Digital Servicing · +92 309 253008',
  },
  {
    id: 'SadaPay',
    label: 'SadaPay (PKR)',
    defaultCurrency: 'PKR',
    note: 'Transfer PKR via SadaPay or Raast and submit your transaction reference.',
    details: 'Account: CR Digital Servicing · +92 309 253008',
  },
  {
    id: 'NBP Bank',
    label: 'NBP Bank (National Bank of Pakistan)',
    defaultCurrency: 'PKR',
    note: 'Direct NBP bank transfer or IBFT in PKR. Verified via Admin review.',
    details: 'NBP Corporate · Ref: CR Digital Servicing (+92 309 253008)',
  },
  {
    id: 'Meezan Bank',
    label: 'Meezan Bank (PKR)',
    defaultCurrency: 'PKR',
    note: 'Meezan Bank IBFT / Raast transfer in PKR. Submit your bank reference ID.',
    details: 'Meezan Business · Ref: CR Digital Servicing (+92 309 253008)',
  },
  {
    id: 'Wise Transfer',
    label: 'Wise Transfer (USD / PKR)',
    defaultCurrency: 'USD',
    note: 'International multi-currency transfer via Wise. Queued for operations verification.',
    details: 'Wise Email: billing@crdigital.io',
  },
  {
    id: 'Card (Stripe)',
    label: 'Card (Stripe)',
    defaultCurrency: 'USD',
    note: 'Instant USD wallet credit upon submission.',
    details: 'Visa / Mastercard / Amex',
  },
  {
    id: 'USDT (TRC-20)',
    label: 'USDT (TRC-20)',
    defaultCurrency: 'USD',
    note: 'Queued for admin confirmation with transaction hash.',
    details: 'TRC-20 Network · Submit TxHash below',
  },
  {
    id: 'Wire / ACH',
    label: 'Wire / ACH',
    defaultCurrency: 'USD',
    note: 'Queued for operations verification using transfer reference.',
    details: 'Domestic & International Bank Wire',
  },
];

export function PaymentsPage({ onNavigate }: PaymentsPageProps) {
  const { user, loading: authLoading, login, setUserDirect } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [method, setMethod] = useState('JazzCash');
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('PKR');
  const [amount, setAmount] = useState(5000);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPayments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ payments: PaymentRecord[] }>('/api/payments');
      setPayments(data.payments);
    } catch {
      // Handled via empty state
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const pendingTotal = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'Pending' && p.type === 'Deposit')
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const selectedMethodObj = useMemo(
    () => PAYMENT_METHODS.find((m) => m.id === method) || PAYMENT_METHODS[0],
    [method]
  );

  const handleMethodChange = (nextMethodId: string) => {
    setMethod(nextMethodId);
    const found = PAYMENT_METHODS.find((m) => m.id === nextMethodId);
    if (found && found.defaultCurrency !== currency) {
      setCurrency(found.defaultCurrency);
      setAmount(found.defaultCurrency === 'PKR' ? 5000 : 100);
    }
  };

  const handleCurrencyToggle = (nextCurrency: 'USD' | 'PKR') => {
    if (nextCurrency === currency) return;
    setCurrency(nextCurrency);
    if (nextCurrency === 'PKR') {
      setAmount(Math.max(1500, Math.round((amount || 50) * USD_TO_PKR)));
    } else {
      setAmount(Math.max(10, Number(((amount || 5000) / USD_TO_PKR).toFixed(2))));
    }
  };

  const convertedUsd = useMemo(() => {
    const val = Number(amount || 0);
    return currency === 'PKR' ? Number((val / USD_TO_PKR).toFixed(2)) : Number(val.toFixed(2));
  }, [amount, currency]);

  const convertedPkr = useMemo(() => {
    const val = Number(amount || 0);
    return currency === 'USD' ? Math.round(val * USD_TO_PKR) : Math.round(val);
  }, [amount, currency]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const data = await apiFetch<{ payment: PaymentRecord; user: UserAccount }>(
        '/api/payments/deposit',
        {
          method: 'POST',
          body: JSON.stringify({ method, amount, currency, reference }),
        }
      );
      setPayments((prev) => [data.payment, ...prev]);
      setUserDirect(data.user);
      setReference('');
      const pkrNote =
        data.payment.currency === 'PKR' && data.payment.originalAmount
          ? ` (Rs ${data.payment.originalAmount.toLocaleString()} PKR)`
          : '';
      setSuccessMsg(
        data.payment.status === 'Approved'
          ? `$${data.payment.amount.toFixed(2)} USD${pkrNote} credited to your wallet immediately.`
          : `Deposit ${data.payment.id} for $${data.payment.amount.toFixed(2)} USD${pkrNote} submitted for Admin approval.`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit deposit.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <WorkspaceLayout
        currentPath="/payments"
        breadcrumb="Wallet & Billing"
        onNavigate={onNavigate}
      >
        <div className="max-w-lg mx-auto mt-12 bg-white border border-slate-200 rounded-xl p-8 space-y-5 text-center">
          <h1 className="text-xl font-display font-bold text-slate-900">
            Sign in to manage wallet funds
          </h1>
          <p className="text-sm text-slate-600">
            Add balance in PKR or USD via JazzCash, SadaPay, NBP Bank, Meezan Bank, Wise Transfer, Stripe, or USDT.
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
              Use Client Demo
            </button>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  const usdPresets = [10, 25, 50, 100, 250];
  const pkrPresets = [2500, 5000, 10000, 25000, 50000];

  return (
    <WorkspaceLayout
      currentPath="/payments"
      breadcrumb="Wallet & Billing"
      onNavigate={onNavigate}
      primaryAction={{
        label: 'Place Order',
        onClick: () => onNavigate('/services'),
      }}
    >
      <div className="space-y-6">
        {/* Balance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Available Balance</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              ${(user?.balance ?? 0).toFixed(2)}
            </p>
            <p className="text-xs font-mono tabular-nums text-slate-500 mt-1">
              ≈ Rs {Math.round((user?.balance ?? 0) * USD_TO_PKR).toLocaleString()} PKR
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Pending Deposits</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-amber-700 mt-1">
              ${pendingTotal.toFixed(2)}
            </p>
            <p className="text-xs font-mono tabular-nums text-slate-500 mt-1">
              ≈ Rs {Math.round(pendingTotal * USD_TO_PKR).toLocaleString()} PKR
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Lifetime Spend</p>
            <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 mt-1">
              ${(user?.totalSpent ?? 0).toFixed(2)}
            </p>
            <p className="text-xs font-mono tabular-nums text-slate-500 mt-1">
              ≈ Rs {Math.round((user?.totalSpent ?? 0) * USD_TO_PKR).toLocaleString()} PKR
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Add Funds Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6">
            <h1 className="text-lg font-display font-semibold text-slate-900">
              Add Wallet Funds
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Fund in PKR or USD via JazzCash, SadaPay, NBP Bank, Meezan Bank, Wise Transfer, Card, or USDT.
            </p>

            <form onSubmit={handleDeposit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="pay-method" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  id="pay-method"
                  value={method}
                  onChange={(e) => handleMethodChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-600 space-y-1">
                  <p>{selectedMethodObj.note}</p>
                  <p className="font-mono text-slate-800 font-medium">{selectedMethodObj.details}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="pay-amount" className="text-sm font-medium text-slate-700">
                    Amount ({currency})
                  </label>
                  <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md">
                    <button
                      type="button"
                      onClick={() => handleCurrencyToggle('PKR')}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        currency === 'PKR'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      PKR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCurrencyToggle('USD')}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        currency === 'USD'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      USD
                    </button>
                  </div>
                </div>

                <input
                  id="pay-amount"
                  type="number"
                  min={currency === 'PKR' ? 1390 : 5}
                  max={currency === 'PKR' ? 6950000 : 25000}
                  step={currency === 'PKR' ? '10' : '0.01'}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 focus:border-blue-700 focus:outline-none"
                />

                <div className="flex flex-wrap gap-2 mt-2">
                  {(currency === 'PKR' ? pkrPresets : usdPresets).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-md border ${
                        amount === preset
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {currency === 'PKR' ? `Rs ${preset.toLocaleString()}` : `$${preset}`}
                    </button>
                  ))}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-mono tabular-nums text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <span>1 USD = {USD_TO_PKR} PKR</span>
                  <span className="font-semibold text-slate-900">
                    {currency === 'PKR'
                      ? `Credits $${convertedUsd.toFixed(2)} USD`
                      : `≈ Rs ${convertedPkr.toLocaleString()} PKR`}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="pay-ref" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Transaction / TID / Reference ID
                </label>
                <input
                  id="pay-ref"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={
                    currency === 'PKR'
                      ? 'e.g. TID-09482716542 or IBFT Ref'
                      : 'e.g. Wise-82910 or tx_9182bc'
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors"
              >
                {submitting
                  ? 'Processing...'
                  : currency === 'PKR'
                  ? `Submit Rs ${Number(amount || 0).toLocaleString()} PKR ($${convertedUsd.toFixed(2)})`
                  : `Submit $${Number(amount || 0).toFixed(2)} USD Deposit`}
              </button>
            </form>
          </div>

          {/* Ledger Table */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-display font-semibold text-slate-900">
                Transaction Ledger
              </h2>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No wallet transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                      <th className="py-3 px-4">ID & Date</th>
                      <th className="py-3 px-4">Method & Ref</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {payments.map((p) => {
                      const dateStr = new Date(p.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                      const isPositive = p.amount >= 0;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <p className="font-mono text-xs font-semibold text-slate-900">{p.id}</p>
                            <p className="text-xs text-slate-500">{dateStr}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-900">
                              {p.method} · {p.type}
                            </p>
                            <p className="text-xs font-mono text-slate-500">{p.reference}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                            <span
                              className={`block font-semibold ${
                                isPositive ? 'text-emerald-700' : 'text-slate-900'
                              }`}
                            >
                              {isPositive
                                ? `+$${p.amount.toFixed(2)}`
                                : `-$${Math.abs(p.amount).toFixed(2)}`}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
