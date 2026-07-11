import type { JSX } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps): JSX.Element {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-8 text-center">
      <h3 className="text-lg font-bold text-[var(--color-on-surface)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
        {description}
      </p>
    </div>
  );
}
