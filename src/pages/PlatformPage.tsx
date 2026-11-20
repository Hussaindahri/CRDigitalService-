import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { PLATFORMS, PLATFORM_MAP } from '../data/platforms';
import { OrderCalculator } from '../components/OrderCalculator';
import { PlatformIcon } from '../components/PlatformIcon';
import type { OrderRecord, PlatformId, ServiceItem } from '../types/domain';

interface PlatformPageProps {
  platformId: PlatformId;
  services: ServiceItem[];
  onOrderCreated: (order: OrderRecord) => void;
  onNavigate: (path: string) => void;
}

export function PlatformPage({
  platformId,
  services,
  onOrderCreated,
  onNavigate,
}: PlatformPageProps) {
  const meta = PLATFORM_MAP[platformId];
  const platformServices = useMemo(
    () => services.filter((s) => s.platform === platformId && s.active),
    [services, platformId]
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    platformServices[0]?.id || ''
  );

  useEffect(() => {
    setSelectedServiceId(platformServices[0]?.id || '');
  }, [platformId, platformServices]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12">
      {/* Platform Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                <PlatformIcon platform={platformId} className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-500">
                Dedicated Channel Servicing · {meta.name}
              </p>
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">
              {meta.name} Growth & Campaign Packages
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">{meta.summary}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:max-w-xs shrink-0 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <Info className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Pre-Order Requirements</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{meta.deliveryGuidance}</p>
          </div>
        </div>
      </div>

      {/* Main Split: Packages List + Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-slate-900">
              Available {meta.name} Packages ({platformServices.length})
            </h2>
            <a
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/services');
              }}
              className="text-xs font-medium text-blue-700 hover:underline"
            >
              View full catalog
            </a>
          </div>

          <div className="space-y-3">
            {platformServices.map((s) => {
              const isSelected = s.id === selectedServiceId;
              return (
                <div
                  key={s.id}
                  className={`bg-white border rounded-xl p-5 transition-colors ${
                    isSelected ? 'border-blue-700 ring-1 ring-blue-700/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-mono text-slate-500">
                        {s.id} · {s.category} · Start {s.startTime}
                      </p>
                      <h3 className="text-base font-display font-semibold text-slate-900">
                        {s.name}
                      </h3>
                      <p className="text-sm text-slate-600">{s.description}</p>
                      <p className="text-xs font-mono tabular-nums text-slate-500 pt-1">
                        Speed: {s.speed} · Range: {s.minOrder.toLocaleString()}–
                        {s.maxOrder.toLocaleString()} · {s.retention}
                      </p>
                    </div>

                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                      <div>
                        <p className="text-xl font-display font-bold font-mono tabular-nums text-slate-900">
                          ${s.ratePer1k.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">per 1,000</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isSelected ? 'Loaded in Calculator' : 'Configure Order'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <OrderCalculator
            services={platformServices}
            selectedServiceId={selectedServiceId}
            onSelectServiceId={setSelectedServiceId}
            onOrderCreated={onOrderCreated}
            onNavigate={onNavigate}
            title={`${meta.name} Order Checkout`}
          />
        </div>
      </div>

      {/* Other Channels Switcher */}
      <div className="pt-8 border-t border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Other Supported Channels</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {PLATFORMS.filter((p) => p.id !== platformId).map((p) => (
            <a
              key={p.id}
              href={p.path}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(p.path);
              }}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              <span className="inline-flex items-center gap-2 truncate">
                <PlatformIcon platform={p.id} className="w-4 h-4 shrink-0" />
                <span>{p.name}</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
