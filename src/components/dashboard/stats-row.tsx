import { StatCard } from '@/components/ui/stat-card';

type DashboardStats = {
  thisMonthSpend: number;
  lastMonthSpend: number;
  deltaPercent: number;
  toCollect: number;
  fixedOutflow: number;
};

export function StatsRow({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard title="This Month Spend" value={`₹${stats.thisMonthSpend.toLocaleString('en-IN')}`} meta="spending so far" accent="accent" />
      <StatCard title="Fixed Outflow" value={`₹${stats.fixedOutflow.toLocaleString('en-IN')}`} meta="EMIs + recurring" accent="red" />
      <StatCard title="To Collect" value={`₹${stats.toCollect.toLocaleString('en-IN')}`} accent="amber" />
      <StatCard
        title="vs Last Month"
        value={`${stats.deltaPercent >= 0 ? '+' : ''}${stats.deltaPercent.toFixed(1)}%`}
        meta={`₹${stats.lastMonthSpend.toLocaleString('en-IN')} last month`}
        accent={stats.deltaPercent >= 0 ? 'red' : 'green'}
      />
    </div>
  );
}
