import type { JSX } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { OrganisationPriorityAction } from "../../data/mockOrganisationOverview";

const priorityClasses: Record<OrganisationPriorityAction["priority"], string> = {
  low: "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]",
  medium: "bg-[var(--color-warning-container)] text-[var(--color-warning)]",
  high: "bg-[var(--color-error-container)] text-[var(--color-error)]",
  critical: "bg-[var(--color-error)] text-[var(--color-error-container)]",
};

export default function PriorityActionsPanel({
  actions,
  onAction,
}: {
  actions: OrganisationPriorityAction[];
  onAction: (action: OrganisationPriorityAction) => void;
}): JSX.Element {
  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-error)]">Priority Actions</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">What needs attention now</h2>
        </div>
        <AlertTriangle className="text-[var(--color-error)]" />
      </div>
      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <article key={action.id} className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--color-on-surface)]">{action.title}</h3>
                <p className="mt-1 text-sm leading-5 text-[var(--color-on-surface-variant)]">{action.description}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${priorityClasses[action.priority]}`}>
                {action.priority}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                {action.affectedCount ? `${action.affectedCount} affected • ` : ""}
                {action.recommendedResponse}
              </p>
              <button
                type="button"
                onClick={() => onAction(action)}
                className="inline-flex items-center gap-1 rounded-xl bg-[var(--color-surface-container-lowest)] px-3 py-2 text-xs font-black text-[var(--organisation-action)] ring-1 ring-[var(--color-outline-variant)] transition hover:bg-[var(--color-surface-container-high)]"
              >
                Act
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
