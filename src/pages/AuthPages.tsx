import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPagesProps {
  mode: 'login' | 'register';
  onNavigate: (path: string) => void;
}

export function AuthPages({ mode, onNavigate }: AuthPagesProps) {
  const { login, register } = useAuth();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const account = await login(email, password);
        onNavigate(account.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        await register({ name, email, password, company });
        onNavigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const account = await login(demoEmail, demoPassword);
      onNavigate(account.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-16 flex justify-center">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 space-y-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-blue-700">
            {mode === 'login' ? 'Account Access' : 'Client Onboarding'}
          </p>
          <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">
            {mode === 'login' ? 'Sign in to CR Digital' : 'Create your servicing account'}
          </h1>
          <p className="text-sm text-slate-600">
            {mode === 'login'
              ? 'Access campaign orders, wallet funding, and refill controls.'
              : 'New client accounts include a $25.00 onboarding test credit.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="auth-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maya Lin"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="auth-company" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Agency or Brand (Optional)
                </label>
                <input
                  id="auth-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Northstar Media Studio"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors"
          >
            {submitting
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="pt-5 border-t border-slate-200 space-y-2.5">
            <p className="text-xs font-medium text-slate-500">Demo Workspace Accounts</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => quickLogin('client@crdigital.io', 'client123')}
                className="px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-left"
              >
                <span className="block font-semibold">Client Demo</span>
                <span className="block text-slate-500 truncate">Maya Lin</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => quickLogin('admin@crdigital.io', 'admin123')}
                className="px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-left"
              >
                <span className="block font-semibold">Admin Demo</span>
                <span className="block text-slate-500 truncate">Alex Rivera</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <>
              Need a servicing account?{' '}
              <a
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/register');
                }}
                className="font-medium text-blue-700 hover:underline"
              >
                Register here
              </a>
            </>
          ) : (
            <>
              Already registered?{' '}
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/login');
                }}
                className="font-medium text-blue-700 hover:underline"
              >
                Sign in
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
