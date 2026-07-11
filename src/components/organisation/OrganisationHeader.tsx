import type { JSX, ReactNode } from "react";
import { Menu } from "lucide-react";

type OrganisationHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  onMenuClick: () => void;
};

export default function OrganisationHeader({
  eyebrow = "Institutional Command Centre",
  title,
  description,
  actions,
  onMenuClick,
}: OrganisationHeaderProps): JSX.Element {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex gap-4">
        <button
          type="button"
          className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-on-surface)]">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
            {description}
          </p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div>}
    </div>
  );
}
