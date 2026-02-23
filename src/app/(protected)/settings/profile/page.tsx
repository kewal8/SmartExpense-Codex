'use client';

import { signOut } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { PageCrumbHeader } from '@/components/layout/page-crumb-header';

export default function SettingsProfilePage() {
  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return (await res.json()).data as { email: string };
    }
  });

  return (
    <div className="space-y-4">
      <PageCrumbHeader
        title="Profile"
        parentLabel="Settings"
        parentHref="/settings"
        crumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Profile' }
        ]}
      />

      <GlassCard className="p-4">
        <h2 className="text-xl font-semibold">Account</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{settings.data?.email}</p>
        <Button variant="danger" className="mt-4" onClick={() => signOut({ callbackUrl: '/login' })}>
          Sign out
        </Button>
      </GlassCard>
    </div>
  );
}
