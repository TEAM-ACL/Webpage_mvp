import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  badge?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, actions, badge }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        {badge ? badge : null}
        {eyebrow ? <p className="mt-0 text-sm font-medium text-[var(--color-on-surface-variant)]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-on-surface)] sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--color-on-surface-variant)]">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
