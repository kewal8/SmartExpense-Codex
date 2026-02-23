'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, CalendarClock, Repeat, HandCoins, ChartNoAxesCombined } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const nav: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/emis', label: 'EMIs', icon: CalendarClock },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/khata', label: 'Khata', icon: HandCoins },
  { href: '/reports', label: 'Reports', icon: ChartNoAxesCombined }
];

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useSession();

  return (
    <aside className="fixed left-4 top-4 hidden h-[calc(100vh-2rem)] w-[260px] flex-col rounded-[20px] border border-[var(--border-glass)] bg-[var(--bg-glass)] p-4 backdrop-blur-xl lg:flex">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">SmartExpense</h1>
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-[rgba(0,122,255,0.1)] text-[var(--accent-blue)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-xl border border-[var(--border-glass)] p-3">
        <p className="text-xs text-[var(--text-secondary)]">{data?.user?.email}</p>
      </div>
    </aside>
  );
}
