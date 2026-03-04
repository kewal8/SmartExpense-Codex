'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function TrendChart({ data }: { data: { month: string; total: number }[] }) {
  return (
    <div style={{ height: '160px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="month"
            stroke="#3f3c52"
            tick={{ fill: '#6e6b84', fontSize: 11, fontFamily: 'Geist Mono' }}
            axisLine={{ stroke: '#3f3c52' }}
            tickLine={false}
          />
          <YAxis
            stroke="#3f3c52"
            tick={{ fill: '#6e6b84', fontSize: 11, fontFamily: 'Geist Mono' }}
            axisLine={{ stroke: '#3f3c52' }}
            tickLine={false}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Total']}
            contentStyle={{
              background: '#252230',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontFamily: 'Geist Mono',
              fontSize: '12px',
              color: '#f2f0f8'
            }}
            cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
          />
          <Line
            dataKey="total"
            stroke="#7c6af7"
            strokeWidth={2}
            dot={{ r: 3, fill: '#7c6af7', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#9d8ff9', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
