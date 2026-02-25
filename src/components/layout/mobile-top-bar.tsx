'use client';

import Link from 'next/link';
import { Bell, Search, UserCircle2 } from 'lucide-react';

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between rounded-b-2xl border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 backdrop-blur-xl lg:hidden">
      <span className="text-base font-semibold text-[var(--text-primary)]">SmartExpense</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          className="tap-feedback-soft inline-flex h-11 w-11 items-center justify-center rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="tap-feedback-soft inline-flex h-11 w-11 items-center justify-center rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]"
        >
          <Bell className="h-5 w-5" />
        </button>
        <Link
          href="/settings"
          aria-label="Open settings"
          className="tap-feedback-soft inline-flex h-11 w-11 items-center justify-center rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]"
        >
          <UserCircle2 className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
