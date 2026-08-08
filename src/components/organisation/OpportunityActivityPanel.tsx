import type { JSX } from "react";
import type { OrganisationOpportunityActivity } from "../../data/mockOrganisationOverview";

export default function OpportunityActivityPanel({
  opportunities,
  onOpenOpportunities,
}: {
  opportunities: OrganisationOpportunityActivity[];
  onOpenOpportunities: () => void;
}): JSX.Element {
  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-success)]">Opportunity Activity</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">Active opportunity signals</h2>
        </div>
        <button type="button" onClick={onOpenOpportunities} className="text-sm font-bold text-[var(--organisation-action)] hover:underline">
          View all
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {opportunities.map((opportunity) => (
          <article key={opportunity.id} className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-[var(--color-on-surface)]">{opportunity.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[var(--color-warning)]">{opportunity.closingLabel}</p>
              </div>
              <button type="button" onClick={onOpenOpportunities} className="rounded-xl bg-[var(--color-surface-container-lowest)] px-3 py-2 text-xs font-bold text-[var(--color-on-surface)] ring-1 ring-[var(--color-outline-variant)]">
                View
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[var(--color-surface-container-high)] p-3">
                <p className="text-xs text-[var(--color-on-surface-variant)]">Strong matches</p>
                <p className="font-black text-[var(--color-on-surface)]">{opportunity.strongMatches}</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-surface-container-high)] p-3">
                <p className="text-xs text-[var(--color-on-surface-variant)]">Interest</p>
                <p className="font-black text-[var(--color-on-surface)]">{opportunity.expressionsOfInterest}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
