import { GlassCard } from '@/components/ui/glass-card';

export function StatCard({ title, value, meta }: { title: string; value: string; meta?: string }) {
  return (
    <GlassCard className="p-4">
      <p className="text-[13px] text-[var(--text-secondary)]">{title}</p>
      <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
      {meta ? <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{meta}</p> : null}
    </GlassCard>
  );
}
