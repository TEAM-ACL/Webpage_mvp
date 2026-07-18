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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Opportunity Activity</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Active opportunity signals</h2>
        </div>
        <button type="button" onClick={onOpenOpportunities} className="text-sm font-bold text-indigo-700 hover:underline">
          View all
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {opportunities.map((opportunity) => (
          <article key={opportunity.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-950">{opportunity.title}</h3>
                <p className="mt-1 text-sm font-semibold text-amber-700">{opportunity.closingLabel}</p>
              </div>
              <button type="button" onClick={onOpenOpportunities} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                View
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-3">
                <p className="text-xs text-slate-500">Strong matches</p>
                <p className="font-black text-slate-950">{opportunity.strongMatches}</p>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <p className="text-xs text-slate-500">Interest</p>
                <p className="font-black text-slate-950">{opportunity.expressionsOfInterest}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
