'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Moon, Search, Sun, UserCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';

export function MobileTopBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-bg px-4 lg:hidden">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-5 rounded-md bg-accent" />
        <span className="text-base font-semibold text-ink">SmartExpense</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-stroke flex items-center justify-center hover:bg-card-2 transition-colors relative"
        >
          <Search className="w-4 h-4 text-ink-3" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-stroke flex items-center justify-center hover:bg-card-2 transition-colors"
        >
          <Bell className="w-4 h-4 text-ink-3" />
        </button>
        <button
          type="button"
          aria-label="Toggle theme"
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-stroke flex items-center justify-center hover:bg-card-2 transition-colors relative"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && (theme === 'dark' ? <Sun className="w-4 h-4 text-ink-3" /> : <Moon className="w-4 h-4 text-ink-3" />)}
        </button>
        <Link
          href="/settings"
          aria-label="Open settings"
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-stroke flex items-center justify-center hover:bg-card-2 transition-colors relative"
        >
          <UserCircle2 className="w-4 h-4 text-ink-3" />
        </Link>
      </div>
    </header>
  );
}
