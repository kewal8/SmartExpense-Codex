'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AddExpenseModal } from '@/components/expenses/add-expense-modal';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ListState } from '@/components/ui/list-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

type ExpenseType = { id: string; name: string };

type ExpenseItem = {
  id: string;
  amount: number;
  date: string;
  note?: string | null;
  type: { name: string };
};

async function getStats() {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return (await res.json()).data as { thisMonthSpend: number; monthlyBudget: number | null };
}

async function getRecentExpenses() {
  const res = await fetch('/api/expenses?limit=15&page=1');
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return (await res.json()).data.items as ExpenseItem[];
}

async function getTypes() {
  const res = await fetch('/api/expense-types');
  if (!res.ok) throw new Error('Failed to fetch types');
  return (await res.json()).data as ExpenseType[];
}

export default function ExpensesHomePage() {
  const [showAdd, setShowAdd] = useState(false);

  const stats = useQuery({ queryKey: ['dashboard-stats'], queryFn: getStats });
  const recent = useQuery({ queryKey: ['expenses-home-recent'], queryFn: getRecentExpenses });
  const types = useQuery({ queryKey: ['expense-types'], queryFn: getTypes });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">Expenses</h1>
        <Button onClick={() => setShowAdd(true)}>Add Expense</Button>
      </div>

      <GlassCard className="p-4">
        <h2 className="text-xl font-semibold">Summary</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border-glass)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">This Month Spend</p>
            <p className="mt-1 font-mono text-xl font-semibold">{formatCurrency(stats.data?.thisMonthSpend ?? 0)}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-glass)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">Monthly Budget</p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {stats.data?.monthlyBudget ? formatCurrency(stats.data.monthlyBudget) : 'Not set'}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          <Link href="/expenses/all" className="text-sm text-[var(--accent-blue)]">
            View all
          </Link>
        </div>

        <div className="mt-3 space-y-2">
          <ListState
            isLoading={recent.isLoading}
            isError={recent.isError}
            isEmpty={Boolean(recent.isSuccess && (recent.data?.length ?? 0) === 0)}
            renderSkeleton={() => (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-xl border border-[var(--border-glass)] p-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-20" />
                  </div>
                ))}
              </div>
            )}
            renderEmpty={() => (
              <EmptyState
                title="No expenses yet"
                description="Start tracking spending by adding your first expense."
                ctaLabel="Add Expense"
                onCta={() => setShowAdd(true)}
              />
            )}
            renderContent={() =>
              (recent.data ?? []).slice(0, 15).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between rounded-xl border border-[var(--border-glass)] p-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{expense.type.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{formatDate(expense.date)}</p>
                  </div>
                  <p className="font-mono text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                </div>
              ))
            }
          />
        </div>
      </GlassCard>

      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)} types={types.data ?? []} />
    </div>
  );
}
