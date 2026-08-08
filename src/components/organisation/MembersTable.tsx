import type { JSX } from "react";
import type { OrganisationMember } from "../../types/organisation";

type MembersTableProps = {
  members: OrganisationMember[];
  onSelectMember: (member: OrganisationMember) => void;
  onAssignToCohort: (member: OrganisationMember) => void;
  onCreateIntervention: (member: OrganisationMember) => void;
};

export default function MembersTable({
  members,
  onSelectMember,
  onAssignToCohort,
  onCreateIntervention,
}: MembersTableProps): JSX.Element {
  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-sm text-[var(--color-on-surface-variant)]">
              <th className="pb-2 pr-4 font-medium">Member</th>
              <th className="pb-2 pr-4 font-medium">Goal</th>
              <th className="pb-2 pr-4 font-medium">Cohort</th>
              <th className="pb-2 pr-4 font-medium">Readiness</th>
              <th className="pb-2 pr-4 font-medium">Pathway Progress</th>
              <th className="pb-2 pr-4 font-medium">Last Active</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="bg-[var(--color-surface-container-low)]">
                <td className="rounded-l-2xl px-4 py-4">
                  <button type="button" className="text-left" onClick={() => onSelectMember(member)}>
                    <span className="block text-sm font-semibold text-[var(--color-on-surface)]">
                      {member.fullName}
                    </span>
                    <span className="block text-xs text-[var(--color-on-surface-variant)]">{member.email}</span>
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-[var(--color-on-surface-variant)]">{member.goal || "Not set"}</td>
                <td className="px-4 py-4 text-sm text-[var(--color-on-surface-variant)]">{member.cohortName || "Unassigned"}</td>
                <td className="px-4 py-4 text-sm font-semibold text-[var(--color-on-surface)]">{member.readinessScore}%</td>
                <td className="px-4 py-4 text-sm font-semibold text-[var(--color-on-surface)]">{member.pathwayProgress}%</td>
                <td className="px-4 py-4 text-sm text-[var(--color-on-surface-variant)]">{formatDate(member.lastActiveAt)}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(member.status, member.needsSupport)}`}>
                    {member.needsSupport ? "Needs support" : member.status}
                  </span>
                </td>
                <td className="rounded-r-2xl px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-xl bg-[var(--color-surface-container-lowest)] px-3 py-2 text-xs font-semibold text-[var(--color-on-surface)] ring-1 ring-[var(--color-outline-variant)]" onClick={() => onSelectMember(member)}>
                      View
                    </button>
                    <button type="button" className="rounded-xl bg-[var(--color-surface-container-lowest)] px-3 py-2 text-xs font-semibold text-[var(--color-on-surface)] ring-1 ring-[var(--color-outline-variant)]" onClick={() => onAssignToCohort(member)}>
                      Assign
                    </button>
                    <button type="button" className="rounded-xl bg-[var(--color-surface-container-lowest)] px-3 py-2 text-xs font-semibold text-[var(--color-on-surface)] ring-1 ring-[var(--color-outline-variant)]" onClick={() => onCreateIntervention(member)}>
                      Intervene
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function statusClass(status: OrganisationMember["status"], needsSupport: boolean): string {
  if (needsSupport) return "bg-[var(--color-warning-container)] text-[var(--color-warning)]";
  if (status === "active") return "bg-[var(--color-success-container)] text-[var(--color-success)]";
  if (status === "invited") return "bg-[var(--color-info-container)] text-[var(--color-info)]";
  if (status === "suspended") return "bg-[var(--color-error-container)] text-[var(--color-error)]";
  return "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]";
}

function formatDate(value?: string | null): string {
  if (!value) return "Not active yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
