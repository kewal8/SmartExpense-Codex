'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, CalendarClock, Repeat, HandCoins } from 'lucide-react';

const navItems: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/emis', label: 'EMIs', icon: CalendarClock },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/khata', label: 'Khata', icon: HandCoins },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-white/[0.06] bg-bg-deep/80 backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 relative"
          >
            <item.icon
              className={`w-[22px] h-[22px] transition-colors ${isActive ? 'text-accent' : 'text-ink-4'}`}
            />
            <span
              className={`text-[10px] font-semibold tracking-[0.02em] transition-colors ${isActive ? 'text-accent-2' : 'text-ink-4'}`}
            >
              {item.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
