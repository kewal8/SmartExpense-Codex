import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';

const accentBar = {
  red:    'bg-semantic-red',
  amber:  'bg-semantic-amber',
  green:  'bg-semantic-green',
  accent: 'bg-accent',
};

export function StatCard({
  title,
  value,
  meta,
  accent,
  className,
}: {
  title: string;
  value: string;
  meta?: string;
  accent?: 'red' | 'amber' | 'green' | 'accent';
  className?: string;
}) {
  return (
    <GlassCard className={cn('relative overflow-hidden px-4 pt-4 pb-4 hover:-translate-y-0.5 hover:shadow-float transition-all duration-200', className)}>
      {accent && (
        <div className={cn('absolute top-0 left-0 right-0 h-[2.5px] rounded-t-card', accentBar[accent])} />
      )}
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-2 mb-2">{title}</p>
      <p className={cn(
        'font-mono font-semibold tracking-[-0.05em] tabular-nums text-ink mb-1',
        value.startsWith('₹') || value.startsWith('+') || value.startsWith('-')
          ? 'text-[22px]'
          : 'text-[15px] text-ink-3'
      )}>
        {value}
      </p>
      {meta && <p className="text-[11px] text-ink-3 font-mono">{meta}</p>}
    </GlassCard>
  );
}
