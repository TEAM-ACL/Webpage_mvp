import type { JSX } from "react";

type OrganisationSummaryCardProps = {
  label: string;
  value: string | number;
  note: string;
};

export default function OrganisationSummaryCard({
  label,
  value,
  note,
}: OrganisationSummaryCardProps): JSX.Element {
  return (
    <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-[var(--color-on-surface)]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--color-on-surface-variant)]">{note}</p>
    </div>
  );
}
