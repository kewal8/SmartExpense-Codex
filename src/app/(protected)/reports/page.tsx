'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, PieChart } from 'lucide-react';
import { TrendChart } from '@/components/reports/trend-chart';
import { CategoryPie } from '@/components/reports/category-pie';
import { ExportButtons } from '@/components/reports/export-buttons';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { ListState } from '@/components/ui/list-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

type ReportSummary = {
  monthlyEmi: Array<{ month: string; total: number; count: number }>;
  totalEmi: number;
  totalRecurring: number;
};

export default function ReportsPage() {
  const router = useRouter();
  const monthly = useQuery({
    queryKey: ['reports-monthly'],
    queryFn: async () => {
      const res = await fetch('/api/reports/monthly');
      if (!res.ok) throw new Error('Failed monthly report');
      return (await res.json()).data;
    }
  });

  const category = useQuery({
    queryKey: ['reports-category'],
    queryFn: async () => {
      const res = await fetch('/api/reports/category');
      if (!res.ok) throw new Error('Failed category report');
      return (await res.json()).data;
    }
  });

  const summary = useQuery<ReportSummary>({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const res = await fetch('/api/reports/summary');
      if (!res.ok) throw new Error('Failed summary report');
      return (await res.json()).data;
    }
  });

  const isReportsLoading = monthly.isLoading || category.isLoading;
  const isReportsEmpty = Boolean(
    monthly.isSuccess &&
      category.isSuccess &&
      (monthly.data?.length ?? 0) === 0 &&
      (category.data?.length ?? 0) === 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">Reports</h1>
        <ExportButtons />
      </div>

      <section className="glass-card p-4">
        <h2 className="text-xl font-semibold">Summary</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">Total EMI</p>
            <p className="mt-1 font-mono text-lg font-semibold">{formatCurrency(summary.data?.totalEmi ?? 0)}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">Total Recurring</p>
            <p className="mt-1 font-mono text-lg font-semibold">{formatCurrency(summary.data?.totalRecurring ?? 0)}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">EMIs per month (last 12 months)</p>
            <div className="mt-2 max-h-28 space-y-1 overflow-y-auto pr-1 text-xs">
              {(summary.data?.monthlyEmi ?? []).map((item) => (
                <div key={item.month} className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>{item.month}</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {item.count} | {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ListState
        isLoading={isReportsLoading}
        isEmpty={isReportsEmpty}
        renderSkeleton={() => (
          <div className="space-y-4">
            <div className="glass-card h-[300px] p-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-4 h-[220px] w-full" />
            </div>
            <div className="glass-card h-[320px] p-4">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="mt-4 h-[240px] w-full" />
            </div>
          </div>
        )}
        renderEmpty={() => (
          <EmptyState
            title="No data to analyze"
            description="Add expenses to unlock trends and breakdowns."
            icon={<BarChart3 className="h-5 w-5" />}
            primaryAction={{ label: 'Add Expense', onClick: () => router.push('/expenses') }}
          />
        )}
        renderContent={() => (
          <>
            {(monthly.data ?? []).length > 0 ? (
              <TrendChart data={monthly.data ?? []} />
            ) : (
              <EmptyState
                title="No monthly trend available"
                description="Track expenses across months to view your trend chart."
                icon={<BarChart3 className="h-5 w-5" />}
              />
            )}
            {(category.data ?? []).length > 0 ? (
              <CategoryPie data={category.data ?? []} />
            ) : (
              <div className="glass-card">
                <EmptyState
                  title="No category breakdown yet"
                  description="Add categorized expenses to view category analytics."
                  icon={<PieChart className="h-5 w-5" />}
                />
                <div className="mt-3 text-center">
                  <Link href="/expenses">
                    <Button>Add Expense</Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}
