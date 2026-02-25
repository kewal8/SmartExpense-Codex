import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

type Variant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
  loadingLabel?: string;
};

const variantMap: Record<Variant, string> = {
  primary: 'bg-[var(--accent-blue)] text-white hover:shadow-soft',
  secondary: 'bg-[var(--bg-glass)] text-[var(--text-primary)] border border-[var(--border-glass)] hover:bg-[var(--bg-glass-hover)]',
  danger: 'bg-transparent text-[var(--accent-red)] hover:bg-[rgba(255,59,48,0.1)]'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', isLoading = false, loadingLabel, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'tap-feedback relative h-12 rounded-xl px-4 text-[15px] font-semibold transition-all duration-200 ease-out disabled:opacity-50',
        variantMap[variant],
        className
      )}
      {...props}
    >
      <span className={cn('inline-flex items-center justify-center gap-2', isLoading && 'opacity-0')}>{children}</span>
      {isLoading ? (
        <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
          <Spinner className="h-4 w-4" />
          <span>{loadingLabel ?? children}</span>
        </span>
      ) : null}
    </button>
  );
});
