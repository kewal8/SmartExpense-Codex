import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-[rgba(134,134,139,0.15)]', className)} aria-hidden="true" />;
}
