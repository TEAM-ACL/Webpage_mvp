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
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-info)]">Cohort Performance</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">Top active cohorts</h2>
        </div>
        <button type="button" onClick={onOpenCohorts} className="text-sm font-bold text-[var(--organisation-action)] hover:underline">
          View all
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {cohorts.map((cohort) => (
          <article key={cohort.id} className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-[var(--color-on-surface)]">{cohort.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{cohort.memberCount} people</p>
              </div>
              <span className="rounded-full bg-[var(--color-success-container)] px-3 py-1 text-xs font-bold text-[var(--color-success)]">{cohort.status}</span>
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
    <div className="rounded-2xl bg-[var(--color-surface-container-high)] p-3">
      <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">{label}</p>
      <p className="mt-1 font-black text-[var(--color-on-surface)]">{value}</p>
    </div>
  );
}
