import type { JSX } from "react";
import type { OrganisationMember } from "../../types/organisation";

export default function SupportMembersTable({
  members,
  onReviewPeople,
}: {
  members: OrganisationMember[];
  onReviewPeople: () => void;
}): JSX.Element {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Support Watchlist</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">People requiring support</h2>
        </div>
        <button type="button" onClick={onReviewPeople} className="text-sm font-bold text-indigo-700 hover:underline">
          Review all
        </button>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
        {members.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No people are currently flagged for support.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div key={member.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1.1fr_1fr_0.8fr_auto] md:items-center">
                <div>
                  <p className="font-bold text-slate-950">{member.fullName}</p>
                  <p className="text-xs text-slate-500">{member.goal || "Goal not set"}</p>
                </div>
                <p className="text-slate-600">{member.openInterventions?.[0] || "Low readiness signal"}</p>
                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {member.readinessScore < 35 ? "High" : "Medium"} risk
                </span>
                <button type="button" onClick={onReviewPeople} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
