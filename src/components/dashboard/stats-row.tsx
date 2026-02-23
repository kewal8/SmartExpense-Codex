import { formatCurrency } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';

export function StatsRow({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard title="This Month Spend" value={formatCurrency(stats.thisMonthSpend)} meta={`${stats.deltaPercent.toFixed(1)}% vs last month`} />
      <StatCard
        title="Monthly Budget"
        value={stats.monthlyBudget ? formatCurrency(stats.monthlyBudget) : 'Not Set'}
        meta={
          stats.monthlyBudget
            ? `${((stats.thisMonthSpend / stats.monthlyBudget) * 100 || 0).toFixed(1)}% used`
            : 'Set in settings'
        }
      />
      <StatCard title="To Collect" value={formatCurrency(stats.toCollect)} />
      <StatCard title="To Pay" value={formatCurrency(stats.toPay)} />
      <StatCard title="Fixed Outflow" value={formatCurrency(stats.fixedOutflow)} />
    </div>
  );
}
