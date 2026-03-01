'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
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
    router.push('/dashboard');
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
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-primary)] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
      <section className="glass-card w-full max-w-md">
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">SmartExpense</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Personal Smart Expense Manager</p>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-[rgba(134,134,139,0.1)] p-1">
          <button
            onClick={() => setTab('login')}
            className={`h-11 rounded-lg text-sm font-semibold ${tab === 'login' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`h-11 rounded-lg text-sm font-semibold ${tab === 'register' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
          >
            Register
          </button>
        </div>

        <form
          className="mt-5 space-y-3"
          onSubmit={tab === 'login' ? handleLogin : handleRegister}
          suppressHydrationWarning
        >
          {tab === 'register' ? (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm text-[var(--text-secondary)]">
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
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-[var(--text-secondary)]">
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
            <label htmlFor="password" className="mb-1 block text-sm text-[var(--text-secondary)]">
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
          {error ? <p className="text-sm text-[var(--accent-red)]">{error}</p> : null}
          <Button
            type="submit"
            className="w-full"
            isLoading={loadingAction === (tab === 'login' ? 'login' : 'register')}
            loadingLabel={tab === 'login' ? 'Signing in...' : 'Creating...'}
          >
            {tab === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="my-4 h-px bg-[var(--border-glass)]" />

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
          Continue with Google
        </Button>
      </section>
    </main>
  );
}
