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
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-white/[0.06] bg-bg-deep/80 backdrop-blur-xl p-2 lg:hidden">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        const isCenter = item.href === '/emis';
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'tap-nav flex flex-col items-center justify-center rounded-xl text-[11px] font-medium',
              isCenter
                ? cn(
                    '-mt-[18px] h-[52px] w-[52px] rounded-[16px] bg-accent shadow-[0_6px_20px_var(--accent-glow)] mx-auto',
                    active ? 'text-white' : 'text-white/80'
                  )
                : cn('h-12', active ? 'text-accent' : 'text-ink-4')
            )}
          >
            <Icon className={cn(isCenter ? 'h-5 w-5' : 'mb-1 h-4 w-4')} />
            {!isCenter && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
