'use client';

import { Bell, UserCircle2 } from 'lucide-react';

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between rounded-b-2xl border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 backdrop-blur-xl lg:hidden">
      <span className="text-base font-semibold text-[var(--text-primary)]">SmartExpense</span>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="rounded-lg p-2 text-[var(--text-secondary)]">
          <Bell className="h-5 w-5" />
        </button>
        <button aria-label="Profile" className="rounded-lg p-2 text-[var(--text-secondary)]">
          <UserCircle2 className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
