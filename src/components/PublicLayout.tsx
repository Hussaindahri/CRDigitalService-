import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLATFORMS } from '../data/platforms';
import { BrandLogoMark, WhatsAppIcon } from './PlatformIcon';

interface PublicLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function PublicLayout({
  currentPath,
  onNavigate,
  children,
}: PublicLayoutProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Payments', path: '/payments' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin', path: '/admin' },
  ];

  const primaryCtaPath = user ? '/dashboard' : '/login';
  const primaryCtaLabel = user ? 'Client Portal' : 'Sign In';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-700 rounded"
          >
            <BrandLogoMark className="w-7 h-7 shrink-0" />
            <span>CR Digital</span>
          </a>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            {navItems.map((item) => {
              const active = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                    active
                      ? 'text-slate-900 border-blue-700'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={primaryCtaPath}
              onClick={(e) => handleLinkClick(e, primaryCtaPath)}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {primaryCtaLabel}
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                className={`block py-2.5 text-sm font-medium ${
                  currentPath === item.path ? 'text-blue-700' : 'text-slate-700'
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <a
                href={primaryCtaPath}
                onClick={(e) => handleLinkClick(e, primaryCtaPath)}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg"
              >
                {primaryCtaLabel}
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4 space-y-3">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="inline-flex items-center gap-2.5 text-base font-bold text-slate-900"
              >
                <BrandLogoMark className="w-6 h-6" />
                <span>CR Digital Servicing</span>
              </a>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                Multi-channel campaign fulfillment, retention pacing, and billing console for digital agencies and creator teams.
              </p>
              <div className="space-y-2 text-xs text-slate-500">
                <p>Operations Desk · support@crdigital.io</p>
                <a
                  href="https://wa.me/92309253008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span className="font-mono tabular-nums">+92309253008</span>
                </a>
              </div>
            </div>

            <div className="md:col-span-5">
              <h2 className="text-xs font-semibold text-slate-900 mb-4">
                Platform Channels
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-slate-600">
                {PLATFORMS.map((p) => (
                  <a
                    key={p.id}
                    href={p.path}
                    onClick={(e) => handleLinkClick(e, p.path)}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {p.name} Servicing
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <h2 className="text-xs font-semibold text-slate-900 mb-4">
                Client & Operations
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li>
                  <a
                    href="/services"
                    onClick={(e) => handleLinkClick(e, '/services')}
                    className="hover:text-slate-900 transition-colors"
                  >
                    Full Service Catalog
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    onClick={(e) => handleLinkClick(e, '/dashboard')}
                    className="hover:text-slate-900 transition-colors"
                  >
                    Client Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/payments"
                    onClick={(e) => handleLinkClick(e, '/payments')}
                    className="hover:text-slate-900 transition-colors"
                  >
                    Wallet & Payments
                  </a>
                </li>
                <li>
                  <a
                    href="/admin"
                    onClick={(e) => handleLinkClick(e, '/admin')}
                    className="hover:text-slate-900 transition-colors"
                  >
                    Admin Console
                  </a>
                </li>
                <li>
                  <a
                    href="/register"
                    onClick={(e) => handleLinkClick(e, '/register')}
                    className="hover:text-slate-900 transition-colors"
                  >
                    Create Account
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 CR Digital Servicing. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a
                href="/services"
                onClick={(e) => handleLinkClick(e, '/services')}
                className="hover:text-slate-800"
              >
                Rate Schedule
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="/login"
                onClick={(e) => handleLinkClick(e, '/login')}
                className="hover:text-slate-800"
              >
                Account Access
              </a>
            </div>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/92309253008"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact CR Digital Servicing on WhatsApp +92309253008"
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm border border-emerald-800 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <WhatsAppIcon className="w-4 h-4 shrink-0" />
        <span className="font-mono tabular-nums">+92309253008</span>
      </a>
    </div>
  );
}
