'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AppearanceSettings } from '@/components/settings/appearance-settings';

export default function SettingsAppearancePage() {
  return (
    <div className="space-y-4">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ChevronLeft className="h-4 w-4" /> Settings
      </Link>
      <h1 className="text-[28px] font-bold tracking-[-0.02em]">Appearance</h1>
      <AppearanceSettings />
    </div>
  );
}
