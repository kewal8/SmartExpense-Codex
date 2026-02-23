import Link from 'next/link';

type Crumb = {
  label: string;
  href?: string;
};

export function PageCrumbHeader({
  title,
  parentLabel,
  parentHref,
  crumbs,
  rightSlot
}: {
  title: string;
  parentLabel: string;
  parentHref: string;
  crumbs?: Crumb[];
  rightSlot?: React.ReactNode;
}) {
  const resolvedCrumbs: Crumb[] = crumbs?.length
    ? crumbs
    : [{ label: parentLabel, href: parentHref }, { label: title }];

  return (
    <div className="space-y-2">
      <div className="md:hidden">
        <Link
          href={parentHref}
          aria-label={`Back to ${parentLabel}`}
          className="inline-flex min-h-11 items-center gap-2 py-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <span aria-hidden="true">←</span>
          <span>{parentLabel}</span>
        </Link>
      </div>

      <div className="hidden md:block">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            {resolvedCrumbs.map((crumb, index) => {
              const isCurrent = index === resolvedCrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
                  {isCurrent ? (
                    <span aria-current="page" className="text-[var(--text-primary)]">
                      {crumb.label}
                    </span>
                  ) : crumb.href ? (
                    <Link href={crumb.href} className="hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {!isCurrent ? <span aria-hidden="true">/</span> : null}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">{title}</h1>
        {rightSlot ? <div className="flex flex-wrap items-center justify-end gap-2">{rightSlot}</div> : null}
      </div>
    </div>
  );
}
