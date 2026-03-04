'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Moon, Sun } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useDarkMode } from '@/hooks/useDarkMode';

export function Header() {
  const pathname = usePathname();
  const routeTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    emis: 'EMIs',
    khata: 'Khata',
    recurring: 'Recurring',
    expenses: 'Expenses',
    settings: 'Settings',
    reports: 'Reports',
  };
  const pageTitle = pathname.split('/').pop() ?? '';
  const title = routeTitles[pageTitle] ?? (pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1));
  const { resolvedTheme, setTheme } = useDarkMode();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuOpen) return;
      if (!menuRef.current?.contains(event.target as Node) && !menuButtonRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-20 mb-6 hidden h-16 items-center justify-between rounded-section border border-stroke bg-card px-4 shadow-card lg:flex">
      <div className="flex items-center gap-1.5">
        <span className="text-[12.5px] font-medium text-ink-4">SmartExpense</span>
        <span className="text-[11px] text-ink-5">/</span>
        <span className="text-[12.5px] font-semibold text-ink">{title}</span>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <button aria-label="Notifications" className="w-[34px] h-[34px] rounded-[10px] bg-card border border-stroke flex items-center justify-center hover:bg-card-2 transition-colors relative">
          <Bell className="w-4 h-4 text-ink-3" />
        </button>
        <button
          aria-label="Toggle theme"
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-stroke flex items-center justify-center hover:bg-card-2 transition-colors relative"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && (resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-ink-3" /> : <Moon className="w-4 h-4 text-ink-3" />)}
        </button>
        <div className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Profile menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="hidden h-[34px] w-[34px] rounded-[10px] bg-card border border-stroke items-center justify-center hover:bg-card-2 transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card md:inline-flex"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="font-mono text-[12px] font-bold text-accent">
              {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </button>
          <div className="h-9 w-9 rounded-full bg-accent-soft md:hidden" />
          {menuOpen ? (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Profile actions"
              className="absolute right-0 top-11 z-30 hidden min-w-[180px] rounded-xl border border-stroke bg-card p-1 shadow-float md:block"
            >
              <Link
                href="/settings"
                role="menuitem"
                className="tap-feedback-soft block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-bg-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <Link
                href="/reports"
                role="menuitem"
                className="tap-feedback-soft block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-bg-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => setMenuOpen(false)}
              >
                Reports
              </Link>
              <button
                type="button"
                role="menuitem"
                className="tap-feedback-soft block w-full rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-bg-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
