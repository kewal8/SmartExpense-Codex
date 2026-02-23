'use client';

import { useTheme } from 'next-themes';

export function useDarkMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return {
    theme,
    resolvedTheme,
    setTheme
  };
}
