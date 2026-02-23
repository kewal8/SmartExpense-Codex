'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

type SettingsPayload = {
  currency: string;
  darkMode: 'auto' | 'light' | 'dark';
  emailReminders: boolean;
  reminderFrequency: 'daily' | '3_days_before' | 'weekly';
  monthlyBudget: number | null;
};

export default function SettingsNotificationsPage() {
  const { showToast } = useToast();

  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return (await res.json()).data as SettingsPayload;
    }
  });

  const save = useMutation({
    mutationFn: async (next: Partial<SettingsPayload>) => {
      const payload: SettingsPayload = {
        currency: settings.data?.currency ?? 'INR',
        darkMode: settings.data?.darkMode ?? 'auto',
        emailReminders: settings.data?.emailReminders ?? false,
        reminderFrequency: settings.data?.reminderFrequency ?? '3_days_before',
        monthlyBudget: settings.data?.monthlyBudget ?? null,
        ...next
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save notifications');
      return data;
    },
    onSuccess: () => showToast('Saved'),
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to save notifications', 'error')
  });

  return (
    <div className="space-y-4">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ChevronLeft className="h-4 w-4" /> Settings
      </Link>
      <h1 className="text-[28px] font-bold tracking-[-0.02em]">Notifications</h1>

      <GlassCard className="p-4">
        <h2 className="text-xl font-semibold">Email Reminders</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Get reminder emails for upcoming fixed payments.</p>

        <div className="mt-3 flex gap-2">
          <Button
            variant={settings.data?.emailReminders ? 'primary' : 'secondary'}
            isLoading={save.isPending}
            loadingLabel="Saving..."
            onClick={() => save.mutate({ emailReminders: true })}
          >
            Enable
          </Button>
          <Button
            variant={!settings.data?.emailReminders ? 'primary' : 'secondary'}
            isLoading={save.isPending}
            loadingLabel="Saving..."
            onClick={() => save.mutate({ emailReminders: false })}
          >
            Disable
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
