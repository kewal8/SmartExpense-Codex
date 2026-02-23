'use client';

import { useDarkMode } from '@/hooks/useDarkMode';
import { Button } from '@/components/ui/button';

export function AppearanceSettings() {
  const { theme, setTheme } = useDarkMode();

  return (
    <div className="glass-card p-4">
      <h2 className="text-xl font-semibold">Appearance</h2>
      <div className="mt-3 flex gap-2">
        {['auto', 'light', 'dark'].map((value) => (
          <Button key={value} variant={theme === value ? 'primary' : 'secondary'} onClick={() => setTheme(value)}>
            {value}
          </Button>
        ))}
      </div>
    </div>
  );
}
