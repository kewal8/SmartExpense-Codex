import { cn } from '@/lib/utils';

export function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-stroke rounded-card shadow-card p-5', className)}>{children}</div>;
}
