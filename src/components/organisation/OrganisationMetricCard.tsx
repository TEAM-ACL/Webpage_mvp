import type { JSX } from "react";

type OrganisationMetricCardProps = {
  label: string;
  value: string | number;
  note: string;
  tone?: "indigo" | "emerald" | "amber" | "sky" | "rose" | "slate";
};

const toneClasses: Record<NonNullable<OrganisationMetricCardProps["tone"]>, string> = {
  indigo: "bg-[var(--color-info-container)] text-[var(--color-info)] ring-[var(--color-outline-variant)]",
  emerald: "bg-[var(--color-success-container)] text-[var(--color-success)] ring-[var(--color-outline-variant)]",
  amber: "bg-[var(--color-warning-container)] text-[var(--color-warning)] ring-[var(--color-outline-variant)]",
  sky: "bg-[var(--color-info-container)] text-[var(--color-info)] ring-[var(--color-outline-variant)]",
  rose: "bg-[var(--color-error-container)] text-[var(--color-error)] ring-[var(--color-outline-variant)]",
  slate: "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] ring-[var(--color-outline-variant)]",
};

export default function OrganisationMetricCard({
  label,
  value,
  note,
  tone = "indigo",
}: OrganisationMetricCardProps): JSX.Element {
  return (
    <article className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-2xl ${toneClasses[tone]} px-3 py-1 text-xs font-bold ring-1`}>
        {label}
      </div>
      <p className="text-3xl font-black tracking-tight text-[var(--color-on-surface)]">{value}</p>
      <p className="mt-2 text-sm leading-5 text-[var(--color-on-surface-variant)]">{note}</p>
    </article>
  );
}
