import type { JSX } from "react";
import { X } from "lucide-react";
import type { OrganisationMember } from "../../types/organisation";

type MemberDetailsDrawerProps = {
  member: OrganisationMember | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateIntervention: (member: OrganisationMember) => void;
  onAssignToCohort: (member: OrganisationMember) => void;
  onRecommendOpportunity: (member: OrganisationMember) => void;
};

export default function MemberDetailsDrawer({
  member,
  isOpen,
  onClose,
  onCreateIntervention,
  onAssignToCohort,
  onRecommendOpportunity,
}: MemberDetailsDrawerProps): JSX.Element | null {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close member details"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">Organisation Member</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--color-on-surface)]">{member.fullName}</h2>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{member.email}</p>
          </div>
          <button type="button" className="rounded-xl border border-[var(--color-outline-variant)] p-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Metric label="Readiness" value={`${member.readinessScore}%`} />
          <Metric label="Pathway Progress" value={`${member.pathwayProgress}%`} />
          <Metric label="Overdue Tasks" value={member.overdueTasks ?? 0} />
          <Metric label="Status" value={member.needsSupport ? "Needs support" : member.status} />
        </div>

        <Section title="Profile summary">
          <p>Goal: {member.goal || "Not set"}</p>
          <p>Pathway: {member.currentPathway || "Not set"}</p>
          <p>Cohort: {member.cohortName || "Unassigned"}</p>
        </Section>
        <ListSection title="Skill gaps" items={member.skillGaps} empty="No skill gaps recorded." />
        <ListSection title="Active projects" items={member.activeProjects} empty="No active projects yet." />
        <ListSection title="Recent activity" items={member.recentActivity} empty="No recent activity yet." />
        <ListSection title="Assigned opportunities" items={member.assignedOpportunities} empty="No opportunities assigned." />
        <ListSection title="Open interventions" items={member.openInterventions} empty="No open interventions." />

        <section className="mt-6 rounded-2xl border border-[var(--color-outline-variant)] p-4">
          <h3 className="font-semibold text-[var(--color-on-surface)]">Support Assessment</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">
            {member.needsSupport
              ? "This member has been flagged for institutional support."
              : "No immediate support concern has been identified."}
          </p>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" className="rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white">
            View Full Profile
          </button>
          <button type="button" className="rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm font-semibold" onClick={() => onCreateIntervention(member)}>
            Create Intervention
          </button>
          <button type="button" className="rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm font-semibold" onClick={() => onRecommendOpportunity(member)}>
            Recommend Opportunity
          </button>
          <button type="button" className="rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm font-semibold" onClick={() => onAssignToCohort(member)}>
            Assign to Cohort
          </button>
        </div>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }): JSX.Element {
  return (
    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
      <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[var(--color-on-surface)]">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: JSX.Element | JSX.Element[] }): JSX.Element {
  return (
    <section className="mt-6 rounded-2xl border border-[var(--color-outline-variant)] p-4">
      <h3 className="font-semibold text-[var(--color-on-surface)]">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-[var(--color-on-surface-variant)]">{children}</div>
    </section>
  );
}

function ListSection({ title, items, empty }: { title: string; items?: string[]; empty: string }): JSX.Element {
  return (
    <Section title={title}>
      {(items?.length ? items : [empty]).map((item) => (
        <p key={item}>{item}</p>
      ))}
    </Section>
  );
}
