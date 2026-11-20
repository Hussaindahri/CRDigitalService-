import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { PLATFORMS } from '../data/platforms';
import { apiFetch } from '../lib/api';
import { PlatformIcon, WhatsAppIcon } from '../components/PlatformIcon';
import type { ServiceItem } from '../types/domain';

interface HomePageProps {
  services: ServiceItem[];
  onNavigate: (path: string) => void;
}

export function HomePage({ services, onNavigate }: HomePageProps) {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPlatform, setInquiryPlatform] = useState('YouTube & TikTok');
  const [inquiryBudget, setInquiryBudget] = useState('$1,000 – $5,000 / mo');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const platformStats = useMemo(() => {
    return PLATFORMS.map((meta) => {
      const items = services.filter((s) => s.platform === meta.id && s.active);
      const minRate = items.length > 0 ? Math.min(...items.map((i) => i.ratePer1k)) : 0;
      return {
        meta,
        count: items.length,
        minRate,
      };
    });
  }, [services]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError('');
    setInquirySuccess(false);
    setInquirySubmitting(true);
    try {
      await apiFetch('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          platform: inquiryPlatform,
          monthlyBudget: inquiryBudget,
          notes: inquiryNotes,
        }),
      });
      setInquirySuccess(true);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryNotes('');
    } catch (err) {
      setInquiryError(err instanceof Error ? err.message : 'Could not submit inquiry.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <div>
      {/* 1. Hero Split */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-medium text-blue-700 tracking-normal">
                Multi-Channel Digital Servicing · Eight Social Networks
              </p>
              <h1
                className="font-display font-bold tracking-tight text-slate-900 leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                Managed audience growth and campaign fulfillment in one console.
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                CR Digital Servicing coordinates retention-paced distribution, subscriber acquisition, and campaign reporting across YouTube, TikTok, Instagram, Telegram, Facebook, LinkedIn, Pinterest, and Snapchat.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="/services"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/services');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Browse Services</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/dashboard');
                  }}
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  Open Client Portal
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                <img
                  src="/src/assets/images/hero_digital_studio_1795181146415.jpg"
                  alt="CR Digital Servicing analytics and creative studio operations desk"
                  referrerPolicy="no-referrer"
                  className="w-full h-full lg:h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-Column KPI Strip below hero split */}
          <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900">
                8 Networks
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Dedicated channel pages and rate cards
              </p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900">
                {services.length} Packages
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Active fulfillment routes ready for ordering
              </p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900">
                30–60 Days
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Automated refill coverage on retention tiers
              </p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900">
                99.4%
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Campaign completion within SLA window
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Directory */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">
              Platform Servicing Directory
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
              Select a social channel to inspect package specifications, delivery speeds, and launch a direct campaign order.
            </p>
          </div>
          <a
            href="/services"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/services');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            <span>Compare all packages</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {platformStats.map(({ meta, count, minRate }) => (
            <a
              key={meta.id}
              href={meta.path}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(meta.path);
              }}
              className="group bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-6 flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <PlatformIcon platform={meta.id} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {count} services
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-slate-900">
                  {meta.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                  {meta.headline}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono tabular-nums text-slate-700 font-medium">
                  From ${minRate.toFixed(2)} / 1k
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Configure</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 3. Capabilities & Proof of Impact */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-16 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">
                Operational Architecture
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Built for media buyers, creator networks, and retention teams managing recurring cross-channel campaigns without fragmented spreadsheets.
              </p>
            </div>
            <div className="lg:col-span-7 divide-y divide-slate-200 border-t border-b border-slate-200">
              <div className="py-5">
                <h3 className="text-base font-display font-semibold text-slate-900">
                  01. Paced Retention Fulfillment
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Campaigns route through staggered daily caps rather than single-hour spikes, preserving watch-duration curves and natural subscriber velocity.
                </p>
              </div>
              <div className="py-5">
                <h3 className="text-base font-display font-semibold text-slate-900">
                  02. Unified Wallet & Automated Refunds
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Fund once via card, ACH wire, or USDT and allocate balances across all eight networks with instant ledger accounting and automatic cancellation refunds.
                </p>
              </div>
              <div className="py-5">
                <h3 className="text-base font-display font-semibold text-slate-900">
                  03. Direct Refill & SLA Tracking
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Every retention-backed order carries an explicit 30-day or 60-day refill window triggerable in one click from the client dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Adjacent Proof / Case Studies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <article className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-slate-200 overflow-hidden">
                <img
                  src="/src/assets/images/case_video_creator_1795181146217.jpg"
                  alt="Video production desk used for YouTube and TikTok campaign case study"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    YouTube & TikTok · Creator Studio Case Study
                  </p>
                  <h3 className="text-xl font-display font-semibold text-slate-900 mt-1.5">
                    +4,200 Qualified Watch Hours & 185K Cross-Platform Views in 45 Days
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    A B2B hardware review channel paired long-form YouTube watch-time packages with Shorts seeding to reach monetization eligibility ahead of Q4 sponsor launches.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-mono tabular-nums text-slate-700">
                  <span>Retention Avg: 4m 12s</span>
                  <span>Refill Claims: 0</span>
                </div>
              </div>
            </article>

            <article className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-slate-200 overflow-hidden">
                <img
                  src="/src/assets/images/case_brand_growth_1795181145869.jpg"
                  alt="Digital strategist reviewing LinkedIn and Instagram campaign performance"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    Instagram, LinkedIn & Pinterest · Retail Agency Case Study
                  </p>
                  <h3 className="text-xl font-display font-semibold text-slate-900 mt-1.5">
                    3.2x Launch Week Social Proof Across 14 Product Drops
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    An e-commerce collective consolidated Instagram Reels plays, Pinterest repins, and LinkedIn executive updates under one prepaid CR Digital ledger.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-mono tabular-nums text-slate-700">
                  <span>14 Drops · 90 Days</span>
                  <span>99.6% SLA On-Time</span>
                </div>
              </div>
            </article>
          </div>

          {/* Attributable Testimonial */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img
              src="/src/assets/images/avatar_client_lead_1795181145429.jpg"
              alt="Marcus Vance, Head of Growth at Northstar Media Studio"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-2">
              <p className="text-base text-slate-800 leading-relaxed">
                “Moving from three separate vendors to CR Digital cut our campaign setup time from two hours per client launch to under ten minutes, with transparent per-1k rates and predictable pacing.”
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">Marcus Vance</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>Head of Growth, Northstar Media Studio</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Managed Retainer / Discovery Lead Capture */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">
              Request Agency Volume Rates
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Managing monthly spend above $2,500 across multiple client accounts? Submit your target channels and our operations desk will configure custom rate tiers on your portal account.
            </p>
            <div className="pt-2 space-y-2.5 text-xs text-slate-500">
              <p>Standard Turnaround · Within 4 business hours</p>
              <p>Direct Billing · Invoice, ACH Wire, Card, or USDT</p>
              <div className="pt-1">
                <a
                  href="https://wa.me/92309253008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>WhatsApp Desk ·</span>
                  <span className="font-mono tabular-nums">+92309253008</span>
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={handleInquirySubmit} className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inq-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="inq-name"
                  type="text"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder="Jordan Patel"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="inq-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Work Email
                </label>
                <input
                  id="inq-email"
                  type="email"
                  required
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  placeholder="jordan@agency.com"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inq-platform" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Primary Channels
                </label>
                <select
                  id="inq-platform"
                  value={inquiryPlatform}
                  onChange={(e) => setInquiryPlatform(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                >
                  <option>YouTube & TikTok</option>
                  <option>Instagram & Facebook</option>
                  <option>Telegram & Snapchat</option>
                  <option>LinkedIn & Pinterest</option>
                  <option>All 8 Platforms</option>
                </select>
              </div>
              <div>
                <label htmlFor="inq-budget" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Monthly Volume
                </label>
                <select
                  id="inq-budget"
                  value={inquiryBudget}
                  onChange={(e) => setInquiryBudget(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                >
                  <option>$500 – $1,000 / mo</option>
                  <option>$1,000 – $5,000 / mo</option>
                  <option>$5,000 – $15,000 / mo</option>
                  <option>$15,000+ / mo</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="inq-notes" className="block text-sm font-medium text-slate-700 mb-1.5">
                Campaign Notes
              </label>
              <textarea
                id="inq-notes"
                rows={3}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                placeholder="Share target pacing, markets, or API reporting needs."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            {inquiryError && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inquiryError}</span>
              </div>
            )}

            {inquirySuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Rate card request logged. Our operations desk will follow up by email.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={inquirySubmitting}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
            >
              {inquirySubmitting ? 'Submitting...' : 'Request Custom Rate Card'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
