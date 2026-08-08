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
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-warning)]">Support Watchlist</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">People requiring support</h2>
        </div>
        <button type="button" onClick={onReviewPeople} className="text-sm font-bold text-[var(--organisation-action)] hover:underline">
          Review all
        </button>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]">
        {members.length === 0 ? (
          <div className="p-6 text-sm text-[var(--color-on-surface-variant)]">No people are currently flagged for support.</div>
        ) : (
          <div className="divide-y divide-[var(--color-outline-variant)]">
            {members.map((member) => (
              <div key={member.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1.1fr_1fr_0.8fr_auto] md:items-center">
                <div>
                  <p className="font-bold text-[var(--color-on-surface)]">{member.fullName}</p>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">{member.goal || "Goal not set"}</p>
                </div>
                <p className="text-[var(--color-on-surface-variant)]">{member.openInterventions?.[0] || "Low readiness signal"}</p>
                <span className="w-fit rounded-full bg-[var(--color-warning-container)] px-3 py-1 text-xs font-bold text-[var(--color-warning)]">
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
