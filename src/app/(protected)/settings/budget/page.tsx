'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function SettingsBudgetPage() {
  const { showToast } = useToast();
  const [monthlyBudget, setMonthlyBudget] = useState('');

  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return (await res.json()).data as {
        currency: string;
        darkMode: 'auto' | 'light' | 'dark';
        emailReminders: boolean;
        reminderFrequency: 'daily' | '3_days_before' | 'weekly';
        monthlyBudget: number | null;
      };
    }
  });

  useEffect(() => {
    if (settings.data?.monthlyBudget != null) {
      setMonthlyBudget(String(settings.data.monthlyBudget));
    }
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: settings.data?.currency ?? 'INR',
          darkMode: settings.data?.darkMode ?? 'auto',
          emailReminders: settings.data?.emailReminders ?? false,
          reminderFrequency: settings.data?.reminderFrequency ?? '3_days_before',
          monthlyBudget: monthlyBudget ? Number(monthlyBudget) : null
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to save budget');
      return payload;
    },
    onSuccess: () => showToast('Saved'),
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to save budget', 'error')
  });

  return (
    <div className="space-y-4">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ChevronLeft className="h-4 w-4" /> Settings
      </Link>
      <h1 className="text-[28px] font-bold tracking-[-0.02em]">Budget</h1>

      <GlassCard className="p-4">
        <h2 className="text-xl font-semibold">Monthly Budget</h2>
        <div className="mt-3 max-w-sm space-y-2">
          <label className="text-sm text-[var(--text-secondary)]">Amount</label>
          <Input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} />
          <Button onClick={() => save.mutate()} isLoading={save.isPending} loadingLabel="Saving...">
            Save
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
