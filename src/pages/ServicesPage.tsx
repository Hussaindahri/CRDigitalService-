import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PLATFORMS, PLATFORM_MAP } from '../data/platforms';
import { OrderCalculator } from '../components/OrderCalculator';
import { PlatformIcon } from '../components/PlatformIcon';
import type { OrderRecord, PlatformId, ServiceItem } from '../types/domain';

interface ServicesPageProps {
  services: ServiceItem[];
  onOrderCreated: (order: OrderRecord) => void;
  onNavigate: (path: string) => void;
}

export function ServicesPage({
  services,
  onOrderCreated,
  onNavigate,
}: ServicesPageProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | PlatformId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return services.filter((s) => {
      if (!s.active) return false;
      if (selectedPlatform !== 'all' && s.platform !== selectedPlatform) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.platform.toLowerCase().includes(q)
      );
    });
  }, [services, selectedPlatform, searchQuery]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-700">Live Rate Schedule</p>
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900 mt-1">
            Servicing Catalog & Order Builder
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Filter active fulfillment packages across all eight social networks. Select any row to populate the live order calculator.
          </p>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service ID or keyword..."
            aria-label="Search services"
            className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Platform Segmented Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-xl mb-8">
        <button
          type="button"
          onClick={() => setSelectedPlatform('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedPlatform === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Networks
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPlatform(p.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedPlatform === p.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PlatformIcon platform={p.id} className="w-3.5 h-3.5" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Service Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filteredServices.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-medium text-slate-900">No matching services found</p>
              <p className="text-xs text-slate-500">
                Try clearing your search keyword or switching to All Networks.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPlatform('all');
                }}
                className="px-4 py-2 text-xs font-medium text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4 text-right">Rate / 1K</th>
                    <th className="py-3 px-4 text-right">Limits</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredServices.map((s) => {
                    const isSelected = s.id === selectedServiceId;
                    const meta = PLATFORM_MAP[s.platform];
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {s.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {meta.name} · {s.category} · Start {s.startTime} · {s.retention}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                          ${s.ratePer1k.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-slate-500 whitespace-nowrap">
                          {s.minOrder.toLocaleString()}–{s.maxOrder.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedServiceId(s.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              isSelected
                                ? 'bg-blue-700 text-white'
                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sticky Order Builder */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <OrderCalculator
            services={services.filter((s) => s.active)}
            selectedServiceId={selectedServiceId}
            onSelectServiceId={setSelectedServiceId}
            onOrderCreated={onOrderCreated}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}
