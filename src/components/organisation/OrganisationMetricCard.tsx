import type { JSX } from "react";

type OrganisationMetricCardProps = {
  label: string;
  value: string | number;
  note: string;
  tone?: "indigo" | "emerald" | "amber" | "sky" | "rose" | "slate";
};

const toneClasses: Record<NonNullable<OrganisationMetricCardProps["tone"]>, string> = {
  indigo: "from-indigo-50 text-indigo-700 ring-indigo-100",
  emerald: "from-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "from-amber-50 text-amber-700 ring-amber-100",
  sky: "from-sky-50 text-sky-700 ring-sky-100",
  rose: "from-rose-50 text-rose-700 ring-rose-100",
  slate: "from-slate-50 text-slate-700 ring-slate-100",
};

export default function OrganisationMetricCard({
  label,
  value,
  note,
  tone = "indigo",
}: OrganisationMetricCardProps): JSX.Element {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${toneClasses[tone]} px-3 py-1 text-xs font-bold ring-1`}>
        {label}
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{note}</p>
    </article>
  );
}
