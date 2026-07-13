import { useEffect, useMemo, useState, type JSX } from "react";
import { Download, MailPlus, Plus, Users } from "lucide-react";
import EmptyState from "../../components/organisation/EmptyState";
import InviteMemberModal from "../../components/organisation/InviteMemberModal";
import MemberDetailsDrawer from "../../components/organisation/MemberDetailsDrawer";
import MemberFilters, {
  defaultMemberFilters,
  filterMembers,
  type MemberFiltersState,
} from "../../components/organisation/MemberFilters";
import MembersTable from "../../components/organisation/MembersTable";
import OrganisationLayout from "../../components/organisation/OrganisationLayout";
import OrganisationSummaryCard from "../../components/organisation/OrganisationSummaryCard";
import { useAuth } from "../../context/AuthContext";
import {
  assignMemberToCohort,
  createMemberIntervention,
  getOrganisationMembers,
  getOrganisationOverview,
  inviteOrganisationMember,
  updateOrganisationMember,
} from "../../services/organisation";
import type {
  InviteOrganisationMemberRequest,
  OrganisationMember,
  OrganisationOverviewResponse,
} from "../../types/organisation";

const primaryButton = "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90";
const outlineButton = "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";

export default function OrganisationMembers(): JSX.Element {
  const { profile, user } = useAuth();
  const [overview, setOverview] = useState<OrganisationOverviewResponse | null>(null);
  const [members, setMembers] = useState<OrganisationMember[]>([]);
  const [filters, setFilters] = useState<MemberFiltersState>(defaultMemberFilters);
  const [selectedMember, setSelectedMember] = useState<OrganisationMember | null>(null);
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMembers(): Promise<void> {
      setIsLoading(true);
      const [overviewResult, membersResult] = await Promise.allSettled([
        getOrganisationOverview(),
        getOrganisationMembers(),
      ]);

      if (!isMounted) return;
      if (overviewResult.status === "fulfilled") {
        setOverview(overviewResult.value);
      }
      if (membersResult.status === "fulfilled") {
        setMembers(membersResult.value);
      }
      setIsLoading(false);
    }

    void loadMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  const organisationName =
    overview?.summary.organisationName || profile?.organisationName || "VisionTech Organisation";
  const organisationType = overview?.summary.organisationType || "Training Provider";
  const administratorRole = profile?.role || user?.role || "Platform Administrator";

  const cohorts = useMemo(
    () => Array.from(new Set(members.map((member) => member.cohortName).filter(Boolean))) as string[],
    [members],
  );
  const goals = useMemo(
    () => Array.from(new Set(members.map((member) => member.goal).filter(Boolean))) as string[],
    [members],
  );
  const filteredMembers = useMemo(() => filterMembers(members, filters), [members, filters]);
  const memberMetrics = useMemo(() => buildMemberMetrics(members), [members]);

  async function handleInvite(payload: InviteOrganisationMemberRequest): Promise<void> {
    const invitedMember = await inviteOrganisationMember(payload);
    setMembers((currentMembers) => [invitedMember, ...currentMembers]);
    setNotice(`${invitedMember.fullName} has been invited.`);
  }

  function handleViewMember(member: OrganisationMember): void {
    setSelectedMember(member);
    setIsMemberDrawerOpen(true);
  }

  function handleCloseMemberDrawer(): void {
    setIsMemberDrawerOpen(false);
    setSelectedMember(null);
  }

  async function handleAssignToCohort(member: OrganisationMember): Promise<void> {
    const cohortName = window.prompt("Assign to cohort", member.cohortName || cohorts[0] || "Cloud Career Cohort");
    if (!cohortName) return;
    await assignMemberToCohort(member.id, { cohortName });
    setMembers((currentMembers) =>
      currentMembers.map((currentMember) =>
        currentMember.id === member.id ? { ...currentMember, cohortName } : currentMember,
      ),
    );
    setSelectedMember((currentMember) =>
      currentMember?.id === member.id ? { ...currentMember, cohortName } : currentMember,
    );
    setNotice(`${member.fullName} assigned to ${cohortName}.`);
  }

  async function handleCreateIntervention(member: OrganisationMember): Promise<void> {
    await createMemberIntervention(member.id, {
      type: member.status === "inactive" ? "inactive_member" : "low_readiness",
      reason: member.status === "inactive" ? "No recent workspace activity." : "Readiness score requires support.",
      recommendedAction: "Assign a short practical project and schedule mentor feedback.",
      riskLevel: member.readinessScore < 50 ? "medium" : "low",
    });
    setMembers((currentMembers) =>
      currentMembers.map((currentMember) =>
        currentMember.id === member.id
          ? {
              ...currentMember,
              needsSupport: true,
              openInterventions: [
                ...(currentMember.openInterventions || []),
                "Practical project support intervention",
              ],
            }
          : currentMember,
      ),
    );
    setNotice(`Support intervention created for ${member.fullName}.`);
  }

  async function handleRecommendOpportunity(member: OrganisationMember): Promise<void> {
    await updateOrganisationMember(member.id, {
      assignedOpportunities: [...(member.assignedOpportunities || []), "Recommended opportunity"],
    });
    setNotice(`Opportunity recommendation prepared for ${member.fullName}.`);
  }

  function handleExportMembers(): void {
    const csvRows = [
      ["Name", "Email", "Goal", "Cohort", "Readiness", "Pathway Progress", "Status"],
      ...filteredMembers.map((member) => [
        member.fullName,
        member.email,
        member.goal || "",
        member.cohortName || "",
        `${member.readinessScore}%`,
        `${member.pathwayProgress}%`,
        member.status,
      ]),
    ];
    const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "organisation-members.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OrganisationLayout
      organisationName={organisationName}
      organisationType={organisationType}
      administratorRole={administratorRole}
      title="Members"
      description="View, support and manage people connected to this organisation."
      actions={
        <>
          <button type="button" className={outlineButton} onClick={() => setIsInviteOpen(true)}>
            <MailPlus className="mr-2 h-4 w-4" />
            Invite Member
          </button>
          <button type="button" className={outlineButton} onClick={() => setNotice("Create Cohort will connect to the cohorts module next.")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Cohort
          </button>
          <button type="button" className={primaryButton} onClick={handleExportMembers}>
            <Download className="mr-2 h-4 w-4" />
            Export Members
          </button>
        </>
      }
    >
      {notice && (
        <section className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {notice}
        </section>
      )}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {memberMetrics.map((metric) => (
          <OrganisationSummaryCard key={metric.label} {...metric} />
        ))}
      </section>

      <div className="mb-6">
        <MemberFilters filters={filters} cohorts={cohorts} goals={goals} onChange={setFilters} />
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
          <p className="text-sm text-[var(--color-on-surface-variant)]">Loading organisation members...</p>
        </div>
      ) : filteredMembers.length > 0 ? (
        <MembersTable
          members={filteredMembers}
          onSelectMember={handleViewMember}
          onAssignToCohort={handleAssignToCohort}
          onCreateIntervention={handleCreateIntervention}
        />
      ) : (
        <EmptyState
          title="No members match these filters"
          description="Try clearing filters or inviting a new member into this organisation."
        />
      )}

      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onInvite={handleInvite} />
      <MemberDetailsDrawer
        member={selectedMember}
        isOpen={isMemberDrawerOpen}
        onClose={handleCloseMemberDrawer}
        onCreateIntervention={handleCreateIntervention}
        onRecommendOpportunity={handleRecommendOpportunity}
        onAssignToCohort={handleAssignToCohort}
      />
    </OrganisationLayout>
  );
}

function buildMemberMetrics(members: OrganisationMember[]): Array<{ label: string; value: string | number; note: string }> {
  return [
    { label: "Total Members", value: members.length, note: "Registered organisation members" },
    { label: "Active Members", value: members.filter((member) => member.status === "active").length, note: "Members currently progressing" },
    { label: "Inactive Members", value: members.filter((member) => member.status === "inactive").length, note: "Members needing re-engagement" },
    { label: "Need Support", value: members.filter((member) => member.needsSupport).length, note: "Members flagged for intervention" },
  ];
}
