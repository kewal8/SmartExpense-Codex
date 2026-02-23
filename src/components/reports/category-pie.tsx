'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const colors = ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#8e8e93'];

export function CategoryPie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="glass-card h-[320px] p-4">
      <h2 className="mb-3 text-xl font-semibold">Category Breakdown</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
