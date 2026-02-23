'use client';

import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { PageCrumbHeader } from '@/components/layout/page-crumb-header';

export default function SettingsAppearancePage() {
  return (
    <div className="space-y-4">
      <PageCrumbHeader
        title="Appearance"
        parentLabel="Settings"
        parentHref="/settings"
        crumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Appearance' }
        ]}
      />
      <AppearanceSettings />
    </div>
  );
}
