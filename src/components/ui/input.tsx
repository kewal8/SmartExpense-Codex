import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full max-w-full min-w-0 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-[12px] px-3 text-[14px] text-ink font-mono placeholder:text-ink-4 focus:outline-none focus:border-accent/60 focus:bg-[rgba(255,255,255,0.06)] transition-colors',
        className
      )}
      {...props}
    />
  );
});
