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
        'h-11 w-full rounded-xl border border-[var(--border-glass)] bg-[var(--bg-secondary)] px-3 text-[15px] text-[var(--text-primary)] shadow-sm transition-all duration-200 ease-out placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[rgba(0,122,255,0.2)]',
        className
      )}
      {...props}
    />
  );
});
