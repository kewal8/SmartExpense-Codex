import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Option = { label: string; value: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, className, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-[var(--border-glass)] bg-[var(--bg-secondary)] px-3 text-[15px] text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[rgba(0,122,255,0.2)]',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});
