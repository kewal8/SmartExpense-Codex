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
  primary: 'bg-accent text-white border-0 shadow-[0_4px_12px_var(--accent-glow)] hover:bg-accent/90',
  secondary: 'bg-[rgba(255,255,255,0.06)] text-ink border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)]',
  danger: 'bg-transparent text-[var(--red)] hover:bg-[var(--red-soft)]'
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
        'tap-feedback relative h-11 rounded-[12px] px-4 text-[14px] font-semibold transition-all duration-200 ease-out disabled:opacity-50',
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
