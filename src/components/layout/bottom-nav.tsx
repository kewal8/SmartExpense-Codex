'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, CalendarClock, Repeat, HandCoins } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/expenses', label: 'My Expenses', icon: Receipt },
  { href: '/emis', label: 'EMIs', icon: CalendarClock },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/khata', label: 'Khata', icon: HandCoins }
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-30 grid grid-cols-5 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-2 backdrop-blur-xl lg:hidden">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'tap-nav flex h-12 flex-col items-center justify-center rounded-xl text-[11px] font-medium',
              active ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'
            )}
          >
            <Icon className="mb-1 h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
