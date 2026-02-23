'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

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
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ChevronLeft className="h-4 w-4" /> Settings
      </Link>
      <h1 className="text-[28px] font-bold tracking-[-0.02em]">Profile</h1>

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
