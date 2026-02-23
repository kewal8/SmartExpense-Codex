'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Moon, Sun } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Input } from '@/components/ui/input';

export function Header() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useDarkMode();
  const hideSearchOnMobile = pathname.startsWith('/settings');
  const [menuOpen, setMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-20 mb-6 hidden h-16 items-center justify-between rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 backdrop-blur-xl lg:flex">
      <div className={`w-full max-w-sm ${hideSearchOnMobile ? 'hidden md:block' : ''}`}>
        <Input placeholder="Search..." aria-label="Search" className="h-10" />
      </div>
      <div className="ml-4 flex items-center gap-2">
        <button aria-label="Notifications" className="relative rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--accent-red)]" />
        </button>
        <button
          aria-label="Toggle theme"
          className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Profile menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="hidden h-9 w-9 rounded-full bg-[rgba(0,122,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-glass)] md:inline-flex"
            onClick={() => setMenuOpen((open) => !open)}
          />
          <div className="h-9 w-9 rounded-full bg-[rgba(0,122,255,0.15)] md:hidden" />
          {menuOpen ? (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Profile actions"
              className="absolute right-0 top-11 z-30 hidden min-w-[180px] rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-1 shadow-[var(--shadow-medium)] backdrop-blur-xl md:block"
            >
              <Link
                href="/settings"
                role="menuitem"
                className="block rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                type="button"
                role="menuitem"
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
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
