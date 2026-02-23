'use client';

import Link from 'next/link';
import { ChevronRight, CreditCard, Palette, Bell, UserCircle2, Tags, Users, Wallet, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { GlassCard } from '@/components/ui/glass-card';

function SettingsRow({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link
      href={href}
      className="flex h-12 items-center justify-between rounded-xl px-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass-hover)]"
    >
      <span className="inline-flex items-center gap-3">
        <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
    </Link>
  );
}

export default function SettingsHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-[28px] font-bold tracking-[-0.02em]">Settings</h1>

      <GlassCard className="p-4">
        <h2 className="text-[13px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">Manage</h2>
        <div className="mt-2 space-y-1">
          <SettingsRow href="/settings/expense-types" label="Expense Types" icon={Tags} />
          <SettingsRow href="/settings/emi-types" label="EMI Types" icon={CreditCard} />
          <SettingsRow href="/settings/people" label="People" icon={Users} />
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h2 className="text-[13px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">Preferences</h2>
        <div className="mt-2 space-y-1">
          <SettingsRow href="/settings/budget" label="Budget" icon={Wallet} />
          <SettingsRow href="/settings/notifications" label="Notifications" icon={Bell} />
          <SettingsRow href="/settings/appearance" label="Appearance" icon={Palette} />
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h2 className="text-[13px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">Account</h2>
        <div className="mt-2 space-y-1">
          <SettingsRow href="/settings/profile" label="Profile" icon={UserCircle2} />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex h-12 w-full items-center justify-between rounded-xl px-2 text-sm text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.08)]"
          >
            <span className="inline-flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              Sign out
            </span>
            <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
