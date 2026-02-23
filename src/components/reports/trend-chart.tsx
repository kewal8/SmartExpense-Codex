'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function TrendChart({ data }: { data: { month: string; total: number }[] }) {
  return (
    <div className="glass-card h-[300px] p-4">
      <h2 className="mb-3 text-xl font-semibold">Monthly Trend</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Line dataKey="total" stroke="var(--accent-blue)" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
