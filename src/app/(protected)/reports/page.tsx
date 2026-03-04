'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import { TrendChart } from '@/components/reports/trend-chart';
import { EmptyState } from '@/components/ui/empty-state';

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

  const currentMonth = monthly.data?.[monthly.data.length - 1];
  const prevMonth = monthly.data?.[monthly.data.length - 2];
  const totalThisMonth = currentMonth?.total ?? 0;
  const totalLastMonth = prevMonth?.total ?? 0;
  const diff = totalThisMonth - totalLastMonth;
  const isUp = diff > 0;
  const pct = totalLastMonth > 0 ? Math.round((Math.abs(diff) / totalLastMonth) * 100) : null;

  if (isReportsLoading) {
    return (
      <div className="space-y-4">
        <h1 className="font-bold text-ink" style={{ fontSize: '20px' }}>Reports</h1>
        <div className="bg-card border border-stroke rounded-[18px] shadow-card p-4 animate-pulse h-[120px]" />
        <div className="bg-card border border-stroke rounded-[18px] shadow-card animate-pulse h-[200px]" />
        <div className="bg-card border border-stroke rounded-[18px] shadow-card animate-pulse h-[80px]" />
      </div>
    );
  }

  if (isReportsEmpty) {
    return (
      <div className="space-y-4">
        <h1 className="font-bold text-ink" style={{ fontSize: '20px' }}>Reports</h1>
        <EmptyState
          title="No data to analyze"
          description="Add expenses to unlock trends and breakdowns."
          icon={<BarChart3 className="h-5 w-5" />}
          primaryAction={{ label: 'Add Expense', onClick: () => router.push('/expenses') }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-ink" style={{ fontSize: '20px' }}>Reports</h1>

      {/* ── SECTION 1: This Month Snapshot ── */}
      <div className="bg-card border border-stroke rounded-[18px] shadow-card p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 mb-3">
          {currentMonth?.month ?? 'This Month'}
        </p>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[32px] font-semibold tracking-[-0.05em] tabular-nums text-ink leading-none">
              ₹{totalThisMonth.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-ink-3 font-mono mt-1.5">total expenses</p>
          </div>

          {pct !== null && (
            <div className="text-right">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold font-mono mb-1"
                style={{
                  background: isUp ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
                  border: `1px solid ${isUp ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`,
                  color: isUp ? '#f87171' : '#34d399'
                }}
              >
                {isUp ? '↑' : '↓'} {pct}%
              </div>
              <p className="text-[10px] text-ink-4 font-mono">
                ₹{totalLastMonth.toLocaleString('en-IN')} last month
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: Where money went ── */}
      {category.data && category.data.length > 0 && (
        <div className="bg-card border border-stroke rounded-[18px] shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.04)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2">Where it went</p>
          </div>

          {(() => {
            const total = category.data.reduce((s: number, c: { value: number }) => s + c.value, 0);
            const colors = [
              { bg: 'rgba(124,106,247,0.12)', border: 'rgba(124,106,247,0.2)', color: '#9d8ff9' },
              { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.2)', color: '#f87171' },
              { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
              { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.2)', color: '#34d399' },
              { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.2)', color: '#94a3b8' }
            ];
            return category.data
              .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
              .slice(0, 5)
              .map((cat: { name: string; value: number }, i: number) => {
                const catPct = Math.round((cat.value / total) * 100);
                const c = colors[i % colors.length];
                return (
                  <div
                    key={cat.name}
                    className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-b-0"
                  >
                    <div
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 border text-[13px]"
                      style={{ background: c.bg, borderColor: c.border }}
                    >
                      💰
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-ink tracking-[-0.2px] truncate">{cat.name}</p>
                        <p
                          className="font-mono text-[13px] font-semibold tabular-nums flex-shrink-0 ml-2"
                          style={{ color: c.color }}
                        >
                          ₹{cat.value.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-[3px] rounded-full bg-[rgba(255,255,255,0.06)]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${catPct}%`, background: c.color }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-ink-3 flex-shrink-0 w-8 text-right">
                          {catPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
          })()}
        </div>
      )}

      {/* ── SECTION 3: Fixed Burden ── */}
      {summary.data && (
        <div className="bg-card border border-stroke rounded-[18px] shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.04)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2">Fixed every month</p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.04)]">
            <div className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-ink-3 font-mono mb-1.5">EMIs</p>
              <p className="font-mono text-[16px] font-semibold text-ink tracking-[-0.04em] tabular-nums">
                ₹{(summary.data.totalEmi ?? 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-ink-3 font-mono mb-1.5">
                Recurring
              </p>
              <p className="font-mono text-[16px] font-semibold text-ink tracking-[-0.04em] tabular-nums">
                ₹{(summary.data.totalRecurring ?? 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-ink-3 font-mono mb-1.5">Total</p>
              <p
                className="font-mono text-[16px] font-semibold tracking-[-0.04em] tabular-nums"
                style={{ color: '#f87171' }}
              >
                ₹{((summary.data.totalEmi ?? 0) + (summary.data.totalRecurring ?? 0)).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 4: 6-month trend ── */}
      {monthly.data && monthly.data.length > 1 && (
        <div className="bg-card border border-stroke rounded-[18px] shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.04)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2">6-month trend</p>
          </div>

          <div className="p-4">
            <TrendChart data={monthly.data} />
          </div>
        </div>
      )}

      {/* ── SECTION 5: Export ── */}
      <div className="bg-card border border-stroke rounded-[18px] shadow-card p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 mb-3">Export</p>
        <a
          href="/api/reports/export"
          className="flex items-center justify-center gap-2 h-10 w-full rounded-[12px] bg-accent-soft border border-accent-border text-accent text-[13px] font-semibold hover:bg-accent/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </a>
      </div>
    </div>
  );
}
