import type { JSX } from "react";
import type { OrganisationHealthMetric } from "../../data/mockOrganisationOverview";

const barClasses: Record<OrganisationHealthMetric["tone"], string> = {
  indigo: "bg-indigo-600",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
};

export default function OrganisationHealthCard({
  metrics,
}: {
  metrics: OrganisationHealthMetric[];
}): JSX.Element {
  const engagementScore = metrics.find((metric) => metric.label === "Engagement")?.value ?? 0;
  const readinessScore = metrics.find((metric) => metric.label === "Readiness")?.value ?? 0;
  const pathwayProgress = metrics.find((metric) => metric.label === "Pathway Progress")?.value ?? 0;
  const projectCompletion = metrics.find((metric) => metric.label === "Project Evidence")?.value ?? 0;
  const opportunityEngagement = metrics.find((metric) => metric.label === "Opportunity Engagement")?.value ?? 0;
  const healthScore = Math.round(
    engagementScore * 0.25
      + readinessScore * 0.25
      + pathwayProgress * 0.2
      + projectCompletion * 0.15
      + opportunityEngagement * 0.15,
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Organisation Health</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{healthScore}%</h2>
          <p className="mt-1 text-sm text-slate-500">Weighted from engagement, readiness, progress, evidence, and opportunities.</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-bold text-white">Live formula</div>
      </div>
      <div className="mt-6 space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${barClasses[metric.tone]}`} style={{ width: `${metric.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
