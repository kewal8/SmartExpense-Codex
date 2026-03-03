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
        'h-11 w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-[12px] px-3 text-[14px] text-ink focus:outline-none focus:border-accent/60 focus:bg-[rgba(255,255,255,0.06)] appearance-none cursor-pointer transition-colors',
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
