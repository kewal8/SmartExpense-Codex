'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState<'login' | 'register' | 'google' | null>(null);
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction('login');
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoadingAction(null);

    if (result?.error) {
      setError('Invalid credentials');
      showToast('Invalid credentials', 'error');
      return;
    }
    showToast('Signed in');
    window.location.href = '/dashboard';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction('register');
    setError('');

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || 'Registration failed');
      showToast(payload.error || 'Registration failed', 'error');
      setLoadingAction(null);
      return;
    }

    const result = await signIn('credentials', { email, password, redirect: false });
    setLoadingAction(null);
    if (result?.error) {
      setError('Account created, but sign in failed');
      showToast('Account created, but sign in failed', 'error');
      return;
    }
    showToast('Account created');
    window.location.href = '/dashboard';
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
      {/* Logo block */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent shadow-[0_4px_16px_var(--accent-glow)]">
          <span className="font-mono text-[22px] font-semibold text-white">₹</span>
        </div>
        <div className="text-center">
          <h1 className="text-[22px] font-bold tracking-[-0.5px] text-ink">SmartExpense</h1>
          <p className="mt-0.5 font-mono text-[11.5px] text-ink-3">Personal Smart Expense Manager</p>
        </div>
      </div>

      {/* Card */}
      <section className="w-full max-w-[400px] rounded-[20px] border border-stroke bg-card p-6 shadow-card">
        {/* Tab switcher */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-[12px] bg-bg-deep p-1">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`h-9 rounded-[9px] text-[13px] font-semibold transition-all duration-200 ${
              tab === 'login'
                ? 'bg-accent text-white shadow-[0_2px_8px_var(--accent-glow)]'
                : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`h-9 rounded-[9px] text-[13px] font-semibold transition-all duration-200 ${
              tab === 'register'
                ? 'bg-accent text-white shadow-[0_2px_8px_var(--accent-glow)]'
                : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form
          className="space-y-4"
          onSubmit={tab === 'login' ? handleLogin : handleRegister}
          suppressHydrationWarning
        >
          {tab === 'register' ? (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                data-lpignore="true"
                data-1p-ignore="true"
                required
              />
            </div>
          ) : null}

          <div suppressHydrationWarning>
            <label htmlFor="email" className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              data-lpignore="true"
              data-1p-ignore="true"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              data-lpignore="true"
              data-1p-ignore="true"
              required
            />
          </div>

          {error ? (
            <p className="rounded-[8px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.08)] px-3 py-2 font-mono text-[12px] text-semantic-red">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            isLoading={loadingAction === (tab === 'login' ? 'login' : 'register')}
            loadingLabel={tab === 'login' ? 'Signing in...' : 'Creating account...'}
          >
            {tab === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-stroke" />
          <span className="font-mono text-[11px] text-ink-4">or</span>
          <div className="h-px flex-1 bg-stroke" />
        </div>

        {/* Google */}
        <Button
          variant="secondary"
          className="w-full"
          isLoading={loadingAction === 'google'}
          loadingLabel="Redirecting..."
          onClick={async () => {
            if (loadingAction) return;
            setLoadingAction('google');
            await signIn('google', { callbackUrl: '/dashboard' });
          }}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </section>

      <p className="mt-6 font-mono text-[11px] text-ink-4">
        Your finances, organized.
      </p>
    </main>
  );
}
