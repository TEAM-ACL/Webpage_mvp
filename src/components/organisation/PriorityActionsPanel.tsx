import type { JSX } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { OrganisationPriorityAction } from "../../data/mockOrganisationOverview";

const priorityClasses: Record<OrganisationPriorityAction["priority"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
  critical: "bg-red-600 text-white",
};

export default function PriorityActionsPanel({
  actions,
  onAction,
}: {
  actions: OrganisationPriorityAction[];
  onAction: (action: OrganisationPriorityAction) => void;
}): JSX.Element {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Priority Actions</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">What needs attention now</h2>
        </div>
        <AlertTriangle className="text-rose-500" />
      </div>
      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <article key={action.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{action.title}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">{action.description}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${priorityClasses[action.priority]}`}>
                {action.priority}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-500">
                {action.affectedCount ? `${action.affectedCount} affected • ` : ""}
                {action.recommendedResponse}
              </p>
              <button
                type="button"
                onClick={() => onAction(action)}
                className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-indigo-700 ring-1 ring-slate-200 transition hover:bg-indigo-50"
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
