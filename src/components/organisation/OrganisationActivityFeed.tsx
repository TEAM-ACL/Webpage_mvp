import type { JSX } from "react";
import type { OrganisationActivity } from "../../types/organisation";

export default function OrganisationActivityFeed({
  activity,
}: {
  activity: OrganisationActivity[];
}): JSX.Element {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Recent Activity</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Administrator-useful updates</h2>
      <div className="mt-5 space-y-4">
        {activity.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No organisation activity has been recorded yet.</p>
        ) : (
          activity.map((item) => (
            <article key={item.id} className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <div>
                <p className="font-bold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{formatActivityDate(item.createdAt)}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
