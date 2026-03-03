'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { GlassCard } from '@/components/ui/glass-card';

const THEMES = [
  { value: 'auto', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;

export function AppearanceSettings() {
  const { theme, setTheme } = useDarkMode();

  return (
    <GlassCard className="p-4">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-4">Theme</p>
      <div className="mt-3 flex gap-2">
        {THEMES.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 text-[12px] font-semibold transition-all ${
              theme === value
                ? 'border-accent-border bg-accent-soft text-accent'
                : 'border-stroke bg-card-2 text-ink-3 hover:border-stroke hover:text-ink-2'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
