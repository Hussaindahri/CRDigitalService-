import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLATFORM_MAP } from '../data/platforms';
import { apiFetch } from '../lib/api';
import type { OrderRecord, ServiceItem, UserAccount } from '../types/domain';

interface OrderCalculatorProps {
  services: ServiceItem[];
  selectedServiceId?: string;
  onSelectServiceId?: (id: string) => void;
  onOrderCreated?: (order: OrderRecord) => void;
  onNavigate: (path: string) => void;
  title?: string;
}

export function OrderCalculator({
  services,
  selectedServiceId,
  onSelectServiceId,
  onOrderCreated,
  onNavigate,
  title = 'Configure & Place Order',
}: OrderCalculatorProps) {
  const { user, setUserDirect } = useAuth();
  const [internalId, setInternalId] = useState<string>(services[0]?.id || '');

  const activeServiceId = selectedServiceId || internalId;
  const activeService = useMemo(
    () => services.find((s) => s.id === activeServiceId) || services[0],
    [services, activeServiceId]
  );

  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(activeService?.minOrder || 1000);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (activeService) {
      setQuantity((prev) => {
        if (prev < activeService.minOrder) return activeService.minOrder;
        if (prev > activeService.maxOrder) return activeService.maxOrder;
        return prev;
      });
    }
  }, [activeService]);

  const handleServiceChange = (id: string) => {
    setCreatedOrder(null);
    setErrorMsg('');
    if (onSelectServiceId) {
      onSelectServiceId(id);
    } else {
      setInternalId(id);
    }
    const found = services.find((s) => s.id === id);
    if (found) {
      setQuantity(found.minOrder);
    }
  };

  const estimatedTotal = useMemo(() => {
    if (!activeService || !Number.isFinite(quantity)) return 0;
    return Number(((quantity / 1000) * activeService.ratePer1k).toFixed(2));
  }, [activeService, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCreatedOrder(null);

    if (!user) {
      onNavigate('/login');
      return;
    }
    if (!activeService) return;

    setSubmitting(true);
    try {
      const data = await apiFetch<{ order: OrderRecord; user: UserAccount }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: activeService.id,
          targetUrl: targetUrl.trim(),
          quantity,
        }),
      });
      setUserDirect(data.user);
      setCreatedOrder(data.order);
      setTargetUrl('');
      if (onOrderCreated) {
        onOrderCreated(data.order);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (services.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
        No active services are currently available for this selection.
      </div>
    );
  }

  const platformMeta = activeService ? PLATFORM_MAP[activeService.platform] : undefined;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant wallet deduction · Transparent per-1,000 unit pricing
          </p>
        </div>
        {user && (
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-500">Available Balance</p>
            <p className="text-sm font-mono font-semibold text-slate-900 tabular-nums">
              ${user.balance.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="calc-service" className="block text-sm font-medium text-slate-700 mb-1.5">
            Service Package
          </label>
          <select
            id="calc-service"
            value={activeService?.id || ''}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.id}] {s.name} — ${s.ratePer1k.toFixed(2)} / 1,000
              </option>
            ))}
          </select>
        </div>

        {activeService && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-900">{activeService.description}</p>
            <p className="font-mono tabular-nums text-slate-500">
              Start: {activeService.startTime} · Speed: {activeService.speed} · Coverage:{' '}
              {activeService.retention}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="calc-url" className="block text-sm font-medium text-slate-700 mb-1.5">
            Destination URL
          </label>
          <input
            id="calc-url"
            type="url"
            required
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder={platformMeta?.targetPlaceholder || 'https://...'}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="calc-qty" className="text-sm font-medium text-slate-700">
              Order Quantity
            </label>
            {activeService && (
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Min {activeService.minOrder.toLocaleString()} · Max{' '}
                {activeService.maxOrder.toLocaleString()}
              </span>
            )}
          </div>
          <input
            id="calc-qty"
            type="number"
            required
            min={activeService?.minOrder || 1}
            max={activeService?.maxOrder || 1000000}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 focus:border-blue-700 focus:outline-none"
          />
          {activeService && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {[
                activeService.minOrder,
                Math.min(activeService.maxOrder, activeService.minOrder * 5),
                Math.min(activeService.maxOrder, activeService.minOrder * 10),
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-md border transition-colors ${
                    quantity === preset
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Estimated Total</span>
          <span className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900">
            ${estimatedTotal.toFixed(2)}
          </span>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {createdOrder && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Order {createdOrder.id} queued for fulfillment</span>
            </div>
            <p className="text-emerald-800">
              {createdOrder.quantity.toLocaleString()} units scheduled for ${createdOrder.charge.toFixed(2)}.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="inline-flex items-center gap-1 font-medium text-emerald-900 underline"
            >
              <span>Track in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
        >
          {user
            ? submitting
              ? 'Submitting Order...'
              : 'Submit Campaign Order'
            : 'Sign In to Place Order'}
        </button>
      </form>
    </div>
  );
}
