import { useCallback, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PLATFORMS, normalizeRoutePath } from './data/platforms';
import { apiFetch } from './lib/api';
import { PublicLayout } from './components/PublicLayout';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { PlatformPage } from './pages/PlatformPage';
import { AuthPages } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AdminPage } from './pages/AdminPage';
import type { OrderRecord, PlatformId, ServiceItem } from './types/domain';

function AppRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizeRoutePath(window.location.pathname)
  );
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const loadServices = useCallback(async () => {
    try {
      const data = await apiFetch<{ services: ServiceItem[] }>('/api/services');
      setServices(data.services);
    } catch {
      // Keep existing services if transient error
    } finally {
      setLoadingServices(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizeRoutePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const titleMap: Record<string, string> = {
      '/': 'CR Digital Servicing — Multi-Channel Social Growth & Fulfillment',
      '/services': 'Services Catalog — CR Digital Servicing',
      '/login': 'Sign In — CR Digital Servicing',
      '/register': 'Create Account — CR Digital Servicing',
      '/dashboard': 'Client Dashboard — CR Digital Servicing',
      '/payments': 'Wallet & Billing — CR Digital Servicing',
      '/admin': 'Admin Console — CR Digital Servicing',
    };
    const platformMatch = PLATFORMS.find((p) => p.path === currentPath);
    if (platformMatch) {
      document.title = `${platformMatch.name} Servicing — CR Digital Servicing`;
    } else {
      document.title = titleMap[currentPath] || 'CR Digital Servicing';
    }
  }, [currentPath]);

  const navigate = useCallback((path: string) => {
    const normalized = normalizeRoutePath(path);
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleOrderCreated = useCallback((_order: OrderRecord) => {
    // Orders are persisted on the backend and fetched on Dashboard mount
  }, []);

  // Dedicated workspace routes
  if (currentPath === '/dashboard') {
    return <DashboardPage services={services} onNavigate={navigate} />;
  }
  if (currentPath === '/payments') {
    return <PaymentsPage onNavigate={navigate} />;
  }
  if (currentPath === '/admin') {
    return <AdminPage onServicesUpdated={setServices} onNavigate={navigate} />;
  }

  // Dedicated platform routes
  const matchedPlatform = PLATFORMS.find((p) => p.path === currentPath);

  return (
    <PublicLayout currentPath={currentPath} onNavigate={navigate}>
      {loadingServices && services.length === 0 ? (
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      ) : currentPath === '/' ? (
        <HomePage services={services} onNavigate={navigate} />
      ) : currentPath === '/services' ? (
        <ServicesPage
          services={services}
          onOrderCreated={handleOrderCreated}
          onNavigate={navigate}
        />
      ) : matchedPlatform ? (
        <PlatformPage
          platformId={matchedPlatform.id as PlatformId}
          services={services}
          onOrderCreated={handleOrderCreated}
          onNavigate={navigate}
        />
      ) : currentPath === '/login' ? (
        <AuthPages mode="login" onNavigate={navigate} />
      ) : currentPath === '/register' ? (
        <AuthPages mode="register" onNavigate={navigate} />
      ) : (
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center space-y-4">
          <h1 className="text-2xl font-display font-bold text-slate-900">Page not found</h1>
          <p className="text-sm text-slate-600">
            The requested route does not match an active CR Digital Servicing page.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
          >
            Return Home
          </button>
        </div>
      )}
    </PublicLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
