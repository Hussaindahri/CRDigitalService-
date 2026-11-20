import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLATFORMS } from '../data/platforms';
import { BrandLogoMark, PlatformIcon, WhatsAppIcon } from './PlatformIcon';

interface WorkspaceLayoutProps {
  currentPath: string;
  breadcrumb: string;
  onNavigate: (path: string) => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  children: React.ReactNode;
}

export function WorkspaceLayout({
  currentPath,
  breadcrumb,
  onNavigate,
  primaryAction,
  children,
}: WorkspaceLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (path: string) => {
    setSidebarOpen(false);
    onNavigate(path);
  };

  const handleLogout = async () => {
    await logout();
    go('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go('/')}
          className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          <BrandLogoMark className="w-6 h-6 shrink-0" />
          <span>CR Digital</span>
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-slate-500 mb-2">Workspace</p>
          <button
            type="button"
            onClick={() => go('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentPath === '/dashboard'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => go('/services')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentPath === '/services'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Service Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => go('/payments')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentPath === '/payments'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Wallet & Billing</span>
          </button>
          <button
            type="button"
            onClick={() => go('/admin')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentPath === '/admin'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Admin Console</span>
          </button>
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-slate-500 mb-2">Platform Channels</p>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(p.path)}
              className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <PlatformIcon platform={p.id} className="w-4 h-4 shrink-0 text-slate-500" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/70">
        <a
          href="https://wa.me/92309253008"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
        >
          <WhatsAppIcon className="w-4 h-4 shrink-0 text-emerald-700" />
          <span className="font-mono tabular-nums">+92309253008</span>
        </a>
        {user ? (
          <div className="space-y-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">
                {user.role === 'admin' ? 'Administrator' : 'Client Account'} · {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => go('/')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Storefront</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => go('/login')}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200 sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white border-r border-slate-200 h-full z-50">
            {navContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open workspace navigation"
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-slate-500 truncate">
              <span>CR Digital</span>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="font-medium text-slate-900">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <span>Wallet Balance:</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  ${user.balance.toFixed(2)}
                </span>
              </div>
            )}
            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 max-w-[1200px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
