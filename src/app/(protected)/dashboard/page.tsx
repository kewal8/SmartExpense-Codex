'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { StatsRow } from '@/components/dashboard/stats-row';
import { AmountToCollect } from '@/components/dashboard/amount-to-collect';
import { PaymentReminders } from '@/components/dashboard/payment-reminders';
import { RecentExpenses } from '@/components/dashboard/recent-expenses';
import { AddExpenseModal } from '@/components/expenses/add-expense-modal';
import { AddTransactionModal } from '@/components/khata/add-transaction-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { CircleDollarSign } from 'lucide-react';

async function getStats() {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return (await res.json()).data;
}

async function getReminders() {
  const res = await fetch('/api/dashboard/reminders');
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return (await res.json()).data;
}

async function getCollectReminders() {
  const res = await fetch('/api/dashboard/collect-reminders');
  if (!res.ok) throw new Error('Failed to fetch collection reminders');
  return (await res.json()).data;
}

async function getExpenses() {
  const res = await fetch('/api/expenses?limit=15&page=1');
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return (await res.json()).data.items;
}

async function getTypes() {
  const res = await fetch('/api/expense-types');
  if (!res.ok) throw new Error('Failed to fetch types');
  return (await res.json()).data;
}

async function getPersons() {
  const res = await fetch('/api/persons');
  if (!res.ok) throw new Error('Failed to fetch persons');
  return (await res.json()).data;
}

async function getEmis() {
  const res = await fetch('/api/emis');
  if (!res.ok) throw new Error('Failed to fetch EMIs');
  return (await res.json()).data;
}

async function getRecurring() {
  const res = await fetch('/api/recurring');
  if (!res.ok) throw new Error('Failed to fetch recurring payments');
  return (await res.json()).data;
}

type PersonOption = { id: string; name: string };

export default function DashboardPage() {
  const [showExpense, setShowExpense] = useState(false);
  const [showLend, setShowLend] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);

  const stats = useQuery({ queryKey: ['dashboard-stats'], queryFn: getStats });
  const reminders = useQuery({ queryKey: ['dashboard-reminders'], queryFn: getReminders });
  const collectReminders = useQuery({ queryKey: ['dashboard-collect-reminders'], queryFn: getCollectReminders });
  const expenses = useQuery({ queryKey: ['dashboard-recent-expenses'], queryFn: getExpenses });
  const types = useQuery({ queryKey: ['expense-types'], queryFn: getTypes });
  const persons = useQuery<PersonOption[]>({ queryKey: ['persons'], queryFn: getPersons });
  const emis = useQuery({ queryKey: ['emis'], queryFn: getEmis });
  const recurring = useQuery({ queryKey: ['recurring'], queryFn: getRecurring });

  const personOptions = Array.isArray(persons.data) ? persons.data : [];

  const isFirstTimeUser =
    Array.isArray(expenses.data) &&
    Array.isArray(emis.data) &&
    Array.isArray(recurring.data) &&
    expenses.data.length === 0 &&
    personOptions.length === 0 &&
    emis.data.length === 0 &&
    recurring.data.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Track spending and upcoming dues.</p>
      </div>

      <QuickActions
        onAddExpense={() => setShowExpense(true)}
        onLend={() => setShowLend(true)}
        onBorrow={() => setShowBorrow(true)}
      />

      {isFirstTimeUser ? (
        <div className="space-y-3 text-center">
          <EmptyState
            title="Welcome to SmartExpense"
            description="Add your first record to start tracking spending, fixed dues, and khata balances."
            icon={<CircleDollarSign className="h-5 w-5" />}
            primaryAction={{ label: 'Add Expense', onClick: () => setShowExpense(true) }}
          />
          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            <Link href="/emis" className="text-[var(--accent-blue)] transition-colors hover:text-[var(--accent-blue)]/80">
              Add EMI
            </Link>
            <Link href="/settings/people" className="text-[var(--accent-blue)] transition-colors hover:text-[var(--accent-blue)]/80">
              Add Person
            </Link>
          </div>
        </div>
      ) : null}

      {stats.data ? <StatsRow stats={stats.data} /> : <div className="glass-card">Loading stats...</div>}

      {collectReminders.data ? (
        <AmountToCollect items={collectReminders.data} />
      ) : (
        <div className="glass-card">Loading collection reminders...</div>
      )}

      {reminders.data ? <PaymentReminders reminders={reminders.data} /> : <div className="glass-card">Loading reminders...</div>}

      {expenses.data ? (
        <RecentExpenses expenses={expenses.data} onAddExpense={() => setShowExpense(true)} />
      ) : (
        <div className="glass-card">Loading expenses...</div>
      )}

      <AddExpenseModal open={showExpense} onClose={() => setShowExpense(false)} types={types.data ?? []} />
      <AddTransactionModal
        open={showLend}
        onClose={() => setShowLend(false)}
        type="lend"
        persons={personOptions.map((p) => ({ id: p.id, name: p.name }))}
      />
      <AddTransactionModal
        open={showBorrow}
        onClose={() => setShowBorrow(false)}
        type="borrow"
        persons={personOptions.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
