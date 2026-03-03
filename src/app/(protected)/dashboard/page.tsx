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

function HeroCard({ data }: {
  data: {
    thisMonthSpend: number
    lastMonthSpend: number
    deltaPercent: number
    monthlyBudget: number | null
    toCollect: number
    toPay: number
  }
}) {
  const isUp = data.deltaPercent >= 0
  const delta = Math.abs(data.deltaPercent).toFixed(1)
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#7c6af7]/40 bg-gradient-to-br from-[#13112a] via-[#1a1638] to-[#2a1f52] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.3),0_8px_28px_rgba(0,0,0,0.4)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[#7c6af7]/40 blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-8 -left-6 h-40 w-40 rounded-full bg-[#9d8ff9]/25 blur-[40px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-64 rounded-full bg-[#7c6af7]/10 blur-[50px]" />
      <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-white/40">{month}</p>
      <p className="mb-1 text-[13px] font-medium text-white/50">Total Spent</p>
      <div className="mb-2 flex items-start gap-1">
        <span className="mt-[7px] font-mono text-[22px] font-normal text-white/50">₹</span>
        <span className="font-mono text-[36px] lg:text-[40px] font-semibold leading-none tracking-[-0.05em] text-white">
          {data.thisMonthSpend.toLocaleString('en-IN')}
        </span>
      </div>
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.12)] px-3 py-1">
        <span className="font-mono text-[11px] font-semibold text-semantic-green">
          {isUp ? '↑' : '↓'} {delta}% vs last month
        </span>
      </div>
      <div className="relative z-10 grid grid-cols-3 gap-1.5">
        <div className="rounded-[8px] border border-white/[0.06] bg-white/[0.04] px-2.5 py-2">
          <p className="mb-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-white/35">Budget</p>
          {data.monthlyBudget ? (
            <p className="font-mono text-[14px] font-semibold tracking-[-0.5px] text-white">₹{data.monthlyBudget.toLocaleString('en-IN')}</p>
          ) : (
            <p className="text-[12px] font-medium text-white/30">Not set</p>
          )}
        </div>
        <div className="rounded-[8px] border border-white/[0.06] bg-white/[0.04] px-2.5 py-2">
          <p className="mb-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-white/35">Collect</p>
          <p className="font-mono text-[15px] font-semibold tracking-[-0.5px] text-semantic-amber">₹{data.toCollect.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-[8px] border border-white/[0.06] bg-white/[0.04] px-2.5 py-2">
          <p className="mb-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-white/35">To Pay</p>
          <p className="font-mono text-[15px] font-semibold tracking-[-0.5px] text-semantic-red">₹{data.toPay.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  )
}

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
    <div className="space-y-3">
      {stats.data ? (
        <HeroCard data={stats.data} />
      ) : (
        <div className="h-[220px] animate-pulse rounded-[24px] bg-card border border-stroke" />
      )}

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
            <Link href="/emis" className="text-accent transition-colors hover:text-accent-2">
              Add EMI
            </Link>
            <Link href="/settings/people" className="text-accent transition-colors hover:text-accent-2">
              Add Person
            </Link>
          </div>
        </div>
      ) : null}

      {stats.data ? <StatsRow stats={stats.data} /> : <div className="bg-card border border-stroke rounded-card shadow-card px-5 py-4 text-ink-3 text-sm">Loading stats...</div>}

      {collectReminders.data ? (
        <AmountToCollect items={collectReminders.data} />
      ) : (
        <div className="bg-card border border-stroke rounded-card shadow-card px-5 py-4 text-ink-3 text-sm">Loading collection reminders...</div>
      )}

      {reminders.data ? <PaymentReminders reminders={reminders.data} /> : <div className="bg-card border border-stroke rounded-card shadow-card px-5 py-4 text-ink-3 text-sm">Loading reminders...</div>}

      {expenses.data ? (
        <RecentExpenses expenses={expenses.data} onAddExpense={() => setShowExpense(true)} />
      ) : (
        <div className="bg-card border border-stroke rounded-card shadow-card px-5 py-4 text-ink-3 text-sm">Loading expenses...</div>
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
