import type { JSX } from "react";
import type { OrganisationCohortPerformance } from "../../data/mockOrganisationOverview";

export default function CohortPerformancePanel({
  cohorts,
  onOpenCohorts,
}: {
  cohorts: OrganisationCohortPerformance[];
  onOpenCohorts: () => void;
}): JSX.Element {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Cohort Performance</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Top active cohorts</h2>
        </div>
        <button type="button" onClick={onOpenCohorts} className="text-sm font-bold text-indigo-700 hover:underline">
          View all
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {cohorts.map((cohort) => (
          <article key={cohort.id} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-950">{cohort.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{cohort.memberCount} people</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{cohort.status}</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <Metric label="Readiness" value={`${cohort.averageReadiness}%`} />
              <Metric label="Progress" value={`${cohort.pathwayCompletion}%`} />
              <Metric label="Need support" value={cohort.needSupport} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }): JSX.Element {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}
