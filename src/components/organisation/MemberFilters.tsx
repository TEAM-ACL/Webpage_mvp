import type { JSX } from "react";
import type { MemberStatus, OrganisationMember } from "../../types/organisation";

export type MemberFiltersState = {
  search: string;
  cohort: string;
  goal: string;
  status: "all" | MemberStatus;
  readiness: "all" | "low" | "medium" | "high";
};

type MemberFiltersProps = {
  filters: MemberFiltersState;
  cohorts: string[];
  goals: string[];
  onChange: (filters: MemberFiltersState) => void;
};

export const defaultMemberFilters: MemberFiltersState = {
  search: "",
  cohort: "all",
  goal: "all",
  status: "all",
  readiness: "all",
};

export function filterMembers(
  members: OrganisationMember[],
  filters: MemberFiltersState,
): OrganisationMember[] {
  return members.filter((member) => {
    const searchTarget = `${member.fullName} ${member.email}`.toLowerCase();
    const matchesSearch = searchTarget.includes(filters.search.trim().toLowerCase());
    const matchesCohort = filters.cohort === "all" || member.cohortName === filters.cohort;
    const matchesGoal = filters.goal === "all" || member.goal === filters.goal;
    const matchesStatus = filters.status === "all" || member.status === filters.status;
    const matchesReadiness =
      filters.readiness === "all" ||
      (filters.readiness === "low" && member.readinessScore < 50) ||
      (filters.readiness === "medium" && member.readinessScore >= 50 && member.readinessScore < 75) ||
      (filters.readiness === "high" && member.readinessScore >= 75);

    return matchesSearch && matchesCohort && matchesGoal && matchesStatus && matchesReadiness;
  });
}

export default function MemberFilters({
  filters,
  cohorts,
  goals,
  onChange,
}: MemberFiltersProps): JSX.Element {
  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Search by name or email"
          className="rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <select
          value={filters.cohort}
          onChange={(event) => onChange({ ...filters, cohort: event.target.value })}
          className="rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm"
        >
          <option value="all">All cohorts</option>
          {cohorts.map((cohort) => (
            <option key={cohort} value={cohort}>{cohort}</option>
          ))}
        </select>
        <select
          value={filters.goal}
          onChange={(event) => onChange({ ...filters, goal: event.target.value })}
          className="rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm"
        >
          <option value="all">All goals</option>
          {goals.map((goal) => (
            <option key={goal} value={goal}>{goal}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value as MemberFiltersState["status"] })}
          className="rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={filters.readiness}
          onChange={(event) => onChange({ ...filters, readiness: event.target.value as MemberFiltersState["readiness"] })}
          className="rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm"
        >
          <option value="all">All readiness</option>
          <option value="low">Below 50%</option>
          <option value="medium">50% - 74%</option>
          <option value="high">75%+</option>
        </select>
      </div>
    </section>
  );
}
