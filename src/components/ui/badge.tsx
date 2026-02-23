import { cn } from '@/lib/utils';

type Tone = 'blue' | 'green' | 'red' | 'orange' | 'gray';

const toneMap: Record<Tone, string> = {
  blue: 'bg-[rgba(0,122,255,0.1)] text-[var(--accent-blue)]',
  green: 'bg-[rgba(52,199,89,0.1)] text-[var(--accent-green)]',
  red: 'bg-[rgba(255,59,48,0.1)] text-[var(--accent-red)]',
  orange: 'bg-[rgba(255,149,0,0.1)] text-[var(--accent-orange)]',
  gray: 'bg-[rgba(134,134,139,0.12)] text-[var(--text-secondary)]'
};

export function Badge({ tone = 'gray', className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', toneMap[tone], className)}>{children}</span>;
}
