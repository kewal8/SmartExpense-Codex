'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, CalendarClock, Repeat, HandCoins, BookOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const nav: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'My Expenses', icon: Receipt },
  { href: '/emis', label: 'EMIs', icon: CalendarClock },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/khata', label: 'Khata', icon: HandCoins },
  { href: '/raseed', label: 'Raseed', icon: BookOpen }
];

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useSession();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[224px] flex-col border-r border-white/5 bg-[#0d0c11] p-4 lg:flex">
      <div className="flex items-center gap-2.5 px-2 pb-5 mb-2 border-b border-white/[0.06]">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-accent shadow-[0_4px_12px_var(--accent-glow)]">
          <span className="font-mono text-[13px] font-semibold text-white">₹</span>
        </div>
        <span className="text-[15px] font-bold tracking-[-0.3px] text-white">SmartExpense</span>
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
                'tap-feedback-soft flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent/20 text-white border border-accent/30'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/70'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-xl border border-white/5 p-3">
        <p className="text-xs text-ink-3">{data?.user?.email}</p>
      </div>
    </aside>
  );
}
