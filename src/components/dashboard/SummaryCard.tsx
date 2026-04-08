import type { ElementType } from "react";

type SummaryCardProps = {
  title: string;
  value: string;
  note: string;
  icon: ElementType;
};

export default function SummaryCard({ title, value, note, icon: Icon }: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">{title}</p>
          <p className="mt-3 text-3xl font-bold text-[var(--color-on-surface)]">{value}</p>
        </div>
        <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-3">
          <Icon className="h-5 w-5 text-[var(--color-on-surface)]" />
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--color-on-surface-variant)]">{note}</p>
    </div>
  );
}
