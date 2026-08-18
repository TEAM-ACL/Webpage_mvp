import { useEffect, useMemo, useState, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { useOrganisation } from "../../context/OrganisationContext";
import {
  assignMemberToCohort,
  createMemberIntervention,
  getOrganisationMembers,
  getOrganisationOverview,
  inviteOrganisationMember,
  recommendMemberOpportunity,
} from "../../services/organisation";
import type {
  InviteOrganisationMemberRequest,
  OrganisationMember,
  OrganisationOverviewResponse,
} from "../../types/organisation";

const primaryButton = "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--organisation-action)] px-4 text-sm font-semibold text-[var(--organisation-on-action)] transition hover:opacity-90";
const outlineButton = "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";

export default function OrganisationMembers(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const { activeSlug, organisation, getOrganisationPath, isModuleEnabled } = useOrganisation();
  const organisationId = organisation?.id;
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
        getOrganisationOverview(organisationId),
        getOrganisationMembers(organisationId),
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
  }, [organisationId]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const shouldOpenInvite = queryParams.get("invite") === "true";
    const requestedFilter = queryParams.get("filter");
    const requestedAction = queryParams.get("action");

    if (shouldOpenInvite) {
      setIsInviteOpen(true);
    }
    if (requestedFilter === "needs-support") {
      setFilters((currentFilters) => ({
        ...currentFilters,
        support: "needs-support",
      }));
    }
    if (requestedAction === "share-resource") {
      setNotice("Choose one or more members to prepare a resource-sharing action.");
    }
  }, [location.search]);

  const organisationName =
    organisation?.name || overview?.summary.organisationName || profile?.organisationName || "VisionTech Organisation";
  const organisationType = organisation?.organisationType || overview?.summary.organisationType || "Training Provider";
  const administratorRole = organisation?.role || profile?.role || user?.role || "Platform Administrator";
  const tenantInviteUrl = `${window.location.origin}/org/${activeSlug}/signup`;

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
    if (!organisationId) return;
    const invitedMember = await inviteOrganisationMember(organisationId, payload);
    setMembers((currentMembers) => [invitedMember, ...currentMembers]);
    setNotice(`${invitedMember.fullName} has been invited. Share the tenant signup link if email delivery is not connected yet.`);
  }

  function handleClearSupportFilter(): void {
    setFilters((currentFilters) => ({
      ...currentFilters,
      support: "all",
    }));
    navigate(getOrganisationPath("members"), { replace: true });
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
    if (!cohortName || !organisationId) return;
    const updatedMember = await assignMemberToCohort(organisationId, member.id, { cohortName });
    setMembers((currentMembers) =>
      currentMembers.map((currentMember) =>
        currentMember.id === member.id ? updatedMember : currentMember,
      ),
    );
    setSelectedMember((currentMember) =>
      currentMember?.id === member.id ? updatedMember : currentMember,
    );
    setNotice(`${member.fullName} assigned to ${cohortName}.`);
  }

  async function handleCreateIntervention(member: OrganisationMember): Promise<void> {
    if (!organisationId) return;
    await createMemberIntervention(organisationId, member.id, {
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
    if (!organisationId) return;
    const recommendation = await recommendMemberOpportunity(organisationId, member.id, {
      title: "Recommended opportunity",
      note: "Prepared from the organisation members dashboard.",
    });
    setMembers((currentMembers) =>
      currentMembers.map((currentMember) =>
        currentMember.id === member.id
          ? {
              ...currentMember,
              assignedOpportunities: [
                ...(currentMember.assignedOpportunities || []),
                recommendation.title,
              ],
            }
          : currentMember,
      ),
    );
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
      {!isModuleEnabled("members") ? (
        <section className="rounded-3xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-8 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-on-surface-variant)]">Module Hidden</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--color-on-surface)]">Members is disabled for this organisation</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
            Administrators can re-enable member management from organisation settings when this workspace needs people management tools.
          </p>
          <button
            type="button"
            onClick={() => navigate(getOrganisationPath("settings"))}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--organisation-action)] px-5 py-3 text-sm font-black text-[var(--organisation-on-action)] transition hover:opacity-90"
          >
            Open Settings
          </button>
        </section>
      ) : (
        <>
          {notice && (
            <section className="mb-6 rounded-3xl border border-[var(--color-success)] bg-[var(--color-success-container)] p-4 text-sm font-semibold text-[var(--color-success)]">
              {notice}
            </section>
          )}

          {filters.support === "needs-support" ? (
            <section className="mb-6 flex flex-col gap-3 rounded-3xl border border-[var(--color-warning)] bg-[var(--color-warning-container)] p-4 text-sm text-[var(--color-warning)] sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold">Showing members who need support or intervention.</span>
              <button
                type="button"
                onClick={handleClearSupportFilter}
                className="inline-flex w-fit items-center justify-center rounded-2xl border border-[var(--color-warning)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-sm font-bold text-[var(--color-warning)] transition hover:bg-[var(--color-surface-container-high)]"
              >
                Clear support filter
              </button>
            </section>
          ) : null}

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

          <InviteMemberModal
            isOpen={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
            onInvite={handleInvite}
            inviteUrl={tenantInviteUrl}
            organisationName={organisationName}
          />
          <MemberDetailsDrawer
            member={selectedMember}
            isOpen={isMemberDrawerOpen}
            onClose={handleCloseMemberDrawer}
            onCreateIntervention={handleCreateIntervention}
            onRecommendOpportunity={handleRecommendOpportunity}
            onAssignToCohort={handleAssignToCohort}
          />
        </>
      )}
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
