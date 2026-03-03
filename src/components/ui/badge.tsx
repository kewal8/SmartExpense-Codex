import { cn } from '@/lib/utils';

type Tone = 'blue' | 'green' | 'red' | 'orange' | 'gray';

const toneMap: Record<Tone, string> = {
  blue:   'bg-accent-soft text-accent border border-accent-border',
  green:  'bg-semantic-green-soft text-semantic-green border border-semantic-green-border',
  red:    'bg-semantic-red-soft text-semantic-red border border-semantic-red-border',
  orange: 'bg-semantic-amber-soft text-semantic-amber border border-semantic-amber-border',
  gray:   'bg-bg-deep text-ink-3 border border-stroke',
};

export function Badge({ tone = 'gray', className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold font-mono tracking-wide', toneMap[tone], className)}>{children}</span>;
}
