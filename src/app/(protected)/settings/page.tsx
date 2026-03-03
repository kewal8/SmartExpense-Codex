'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Route } from 'next';
import {
  ChevronRight,
  CreditCard,
  Palette,
  Bell,
  UserCircle2,
  Tags,
  Users,
  Wallet,
  LogOut,
  ChartNoAxesCombined,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

function SettingsRow({
  href,
  label,
  description,
  icon: Icon,
  iconBg,
  iconBorder,
  iconColor,
}: {
  href: Route;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-section"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border"
        style={{ background: iconBg, borderColor: iconBorder }}
      >
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <span className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium leading-tight text-ink">{label}</p>
        {description && <p className="text-[11px] leading-tight text-ink-4">{description}</p>}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-4 ml-auto" />
    </Link>
  );
}

export default function SettingsHomePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-4">
      <div className="text-[20px] font-bold tracking-[-0.4px] text-ink" style={{ fontSize: '20px' }}>Settings</div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center gap-3 rounded-[20px] border border-stroke bg-card p-4 shadow-card"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-[18px] font-bold text-white"
          style={{ boxShadow: '0 4px 14px var(--accent-glow)' }}
        >
          {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold tracking-[-0.3px] text-ink">
            {session?.user?.name ?? 'User'}
          </p>
          <p className="mt-0.5 truncate font-mono text-[12px] text-ink-3">
            {session?.user?.email ?? ''}
          </p>
        </div>
      </motion.div>

      {/* Manage */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.04 }}
        className="rounded-card border border-stroke bg-card px-3 py-2 shadow-card"
      >
        <p className="px-2 pb-1 pt-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-2">Manage</p>
        <div className="space-y-0.5">
          <SettingsRow
            href="/settings/expense-types"
            label="Expense Types"
            description="Categorize your spending"
            icon={Tags}
            iconBg="rgba(124,106,247,0.12)"
            iconBorder="rgba(124,106,247,0.2)"
            iconColor="#9d8ff9"
          />
          <SettingsRow
            href="/settings/emi-types"
            label="EMI Types"
            description="Organize loan categories"
            icon={CreditCard}
            iconBg="rgba(251,191,36,0.12)"
            iconBorder="rgba(251,191,36,0.2)"
            iconColor="#fbbf24"
          />
          <SettingsRow
            href="/settings/people"
            label="People"
            description="Track lend & borrow"
            icon={Users}
            iconBg="rgba(52,211,153,0.12)"
            iconBorder="rgba(52,211,153,0.2)"
            iconColor="#34d399"
          />
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
        className="rounded-card border border-stroke bg-card px-3 py-2 shadow-card"
      >
        <p className="px-2 pb-1 pt-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-2">Preferences</p>
        <div className="space-y-0.5">
          <SettingsRow
            href="/settings/budget"
            label="Budget"
            description="Monthly spend targets"
            icon={Wallet}
            iconBg="rgba(124,106,247,0.12)"
            iconBorder="rgba(124,106,247,0.2)"
            iconColor="#9d8ff9"
          />
          <SettingsRow
            href="/settings/notifications"
            label="Notifications"
            description="Alerts and reminders"
            icon={Bell}
            iconBg="rgba(251,191,36,0.12)"
            iconBorder="rgba(251,191,36,0.2)"
            iconColor="#fbbf24"
          />
          <SettingsRow
            href="/settings/appearance"
            label="Appearance"
            description="Theme and display"
            icon={Palette}
            iconBg="rgba(100,116,139,0.12)"
            iconBorder="rgba(100,116,139,0.2)"
            iconColor="#94a3b8"
          />
        </div>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.12 }}
        className="rounded-card border border-stroke bg-card px-3 py-2 shadow-card"
      >
        <p className="px-2 pb-1 pt-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-2">Account</p>
        <div className="space-y-0.5">
          <SettingsRow
            href="/settings/profile"
            label="Profile"
            icon={UserCircle2}
            iconBg="rgba(124,106,247,0.12)"
            iconBorder="rgba(124,106,247,0.2)"
            iconColor="#9d8ff9"
          />
          <SettingsRow
            href="/reports"
            label="Reports"
            icon={ChartNoAxesCombined}
            iconBg="rgba(52,211,153,0.12)"
            iconBorder="rgba(52,211,153,0.2)"
            iconColor="#34d399"
          />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--red-soft)]"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border transition-colors group-hover:bg-[var(--red-border)]"
              style={{ background: 'var(--red-soft)', borderColor: 'var(--red-border)' }}
            >
              <LogOut className="h-4 w-4 text-[var(--red)]" />
            </div>
            <p className="text-[13.5px] font-medium text-[var(--red)]">Sign out</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
