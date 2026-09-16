import { useEffect, useMemo, useState, type FormEvent, type JSX } from "react";
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
  createOrganisationCohort,
  getOrganisationCohorts,
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
  const [cohortOptions, setCohortOptions] = useState<string[]>([]);
  const [filters, setFilters] = useState<MemberFiltersState>(defaultMemberFilters);
  const [selectedMember, setSelectedMember] = useState<OrganisationMember | null>(null);
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateCohortOpen, setIsCreateCohortOpen] = useState(false);
  const [cohortAssignmentMember, setCohortAssignmentMember] = useState<OrganisationMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMembers(): Promise<void> {
      setIsLoading(true);
      const [overviewResult, membersResult, cohortsResult] = await Promise.allSettled([
        getOrganisationOverview(organisationId),
        getOrganisationMembers(organisationId),
        organisationId ? getOrganisationCohorts(organisationId) : Promise.resolve([]),
      ]);

      if (!isMounted) return;
      if (overviewResult.status === "fulfilled") {
        setOverview(overviewResult.value);
      }
      if (membersResult.status === "fulfilled") {
        setMembers(membersResult.value);
      } else {
        setActionError(readError(membersResult.reason, "Unable to load organisation members."));
      }
      if (cohortsResult.status === "fulfilled") {
        setCohortOptions(cohortsResult.value.map((cohort) => cohort.name));
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
    () =>
      Array.from(
        new Set([
          ...cohortOptions,
          ...members.map((member) => member.cohortName).filter(Boolean),
        ]),
      ) as string[],
    [cohortOptions, members],
  );
  const goals = useMemo(
    () => Array.from(new Set(members.map((member) => member.goal).filter(Boolean))) as string[],
    [members],
  );
  const filteredMembers = useMemo(() => filterMembers(members, filters), [members, filters]);
  const memberMetrics = useMemo(() => buildMemberMetrics(members), [members]);

  async function handleInvite(payload: InviteOrganisationMemberRequest): Promise<void> {
    if (!organisationId) return;
    setPendingAction("invite-member");
    setActionError(null);
    try {
      const invitedMember = await inviteOrganisationMember(organisationId, payload);
      setMembers((currentMembers) => [invitedMember, ...currentMembers]);
      setNotice(`${invitedMember.fullName} has been invited. Share the tenant signup link if email delivery is not connected yet.`);
    } catch (error) {
      setActionError(readError(error, "Unable to invite member."));
      throw error;
    } finally {
      setPendingAction(null);
    }
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

  function handleAssignToCohort(member: OrganisationMember): void {
    setActionError(null);
    setCohortAssignmentMember(member);
  }

  async function handleSubmitCohortAssignment(cohortName: string): Promise<void> {
    if (!cohortAssignmentMember || !organisationId) return;
    setPendingAction("assign-cohort");
    setActionError(null);
    try {
      const updatedMember = await assignMemberToCohort(organisationId, cohortAssignmentMember.id, { cohortName });
      setMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.id === cohortAssignmentMember.id ? updatedMember : currentMember,
        ),
      );
      setSelectedMember((currentMember) =>
        currentMember?.id === cohortAssignmentMember.id ? updatedMember : currentMember,
      );
      setCohortOptions((currentCohorts) =>
        currentCohorts.includes(cohortName) ? currentCohorts : [cohortName, ...currentCohorts],
      );
      setNotice(`${cohortAssignmentMember.fullName} assigned to ${cohortName}.`);
      setCohortAssignmentMember(null);
    } catch (error) {
      setActionError(readError(error, "Unable to assign member to cohort."));
      throw error;
    } finally {
      setPendingAction(null);
    }
  }

  function handleCreateCohort(): void {
    setActionError(null);
    setIsCreateCohortOpen(true);
  }

  async function handleSubmitCreateCohort(cohortName: string, description: string): Promise<void> {
    if (!organisationId) return;
    setPendingAction("create-cohort");
    setActionError(null);
    try {
      const cohort = await createOrganisationCohort(organisationId, {
        name: cohortName,
        description: description || "Created from the organisation members dashboard.",
        status: "active",
      });
      setCohortOptions((currentCohorts) =>
        currentCohorts.includes(cohort.name) ? currentCohorts : [cohort.name, ...currentCohorts],
      );
      setNotice(`${cohort.name} cohort created.`);
      setIsCreateCohortOpen(false);
    } catch (error) {
      setActionError(readError(error, "Unable to create cohort."));
      throw error;
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCreateIntervention(member: OrganisationMember): Promise<void> {
    if (!organisationId) return;
    setPendingAction(`intervention:${member.id}`);
    setActionError(null);
    try {
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
    } catch (error) {
      setActionError(readError(error, "Unable to create support intervention."));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRecommendOpportunity(member: OrganisationMember): Promise<void> {
    if (!organisationId) return;
    setPendingAction(`opportunity:${member.id}`);
    setActionError(null);
    try {
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
    } catch (error) {
      setActionError(readError(error, "Unable to recommend opportunity."));
    } finally {
      setPendingAction(null);
    }
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
          <button type="button" className={outlineButton} onClick={handleCreateCohort}>
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

          {actionError && (
            <section className="mb-6 rounded-3xl border border-[var(--color-error)] bg-[var(--color-error-container)] p-4 text-sm font-semibold text-[var(--color-error)]">
              {actionError}
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
          <CohortDialog
            mode="create"
            isOpen={isCreateCohortOpen}
            title="Create Cohort"
            description="Create a tenant-scoped cohort that can be used for member filtering and assignments."
            submitLabel="Create Cohort"
            existingCohorts={cohorts}
            isSubmitting={pendingAction === "create-cohort"}
            onClose={() => setIsCreateCohortOpen(false)}
            onSubmit={handleSubmitCreateCohort}
          />
          <CohortDialog
            mode="assign"
            isOpen={Boolean(cohortAssignmentMember)}
            title="Assign to Cohort"
            description={cohortAssignmentMember ? `Assign ${cohortAssignmentMember.fullName} to an existing or new cohort.` : ""}
            submitLabel="Assign Member"
            initialName={cohortAssignmentMember?.cohortName || cohorts[0] || ""}
            existingCohorts={cohorts}
            isSubmitting={pendingAction === "assign-cohort"}
            onClose={() => setCohortAssignmentMember(null)}
            onSubmit={(cohortName) => handleSubmitCohortAssignment(cohortName)}
          />
        </>
      )}
    </OrganisationLayout>
  );
}

type CohortDialogProps = {
  mode: "create" | "assign";
  isOpen: boolean;
  title: string;
  description: string;
  submitLabel: string;
  initialName?: string;
  existingCohorts: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (cohortName: string, description: string) => Promise<void>;
};

function CohortDialog({
  mode,
  isOpen,
  title,
  description,
  submitLabel,
  initialName = "",
  existingCohorts,
  isSubmitting,
  onClose,
  onSubmit,
}: CohortDialogProps): JSX.Element | null {
  const [cohortName, setCohortName] = useState(initialName);
  const [cohortDescription, setCohortDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCohortName(initialName);
      setCohortDescription("");
      setError(null);
    }
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const cleanName = cohortName.trim();
    if (!cleanName) {
      setError("Enter a cohort name.");
      return;
    }
    setError(null);
    try {
      await onSubmit(cleanName, cohortDescription.trim());
    } catch (submitError) {
      setError(readError(submitError, mode === "create" ? "Unable to create cohort." : "Unable to assign cohort."));
    }
  }

  return (
    <>
      <button type="button" aria-label={`Close ${title} modal overlay`} className="fixed inset-0 z-40 bg-slate-950/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[var(--color-surface-container-lowest)] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-[var(--color-on-surface)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">{description}</p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">Cohort Name</span>
            <input
              value={cohortName}
              onChange={(event) => setCohortName(event.target.value)}
              list="organisation-cohort-options"
              className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm text-[var(--color-on-surface)] outline-none focus:border-[var(--organisation-action)]"
              placeholder="Digital Skills Cohort"
              required
            />
            <datalist id="organisation-cohort-options">
              {existingCohorts.map((cohort) => (
                <option key={cohort} value={cohort} />
              ))}
            </datalist>
          </label>

          {mode === "create" ? (
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">Description</span>
              <textarea
                value={cohortDescription}
                onChange={(event) => setCohortDescription(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm text-[var(--color-on-surface)] outline-none focus:border-[var(--organisation-action)]"
                placeholder="Describe the cohort focus, audience, or programme."
              />
            </label>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-[var(--color-error)] bg-[var(--color-error-container)] px-4 py-3 text-sm font-semibold text-[var(--color-error)]">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" className="rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm font-semibold" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[var(--organisation-action)] px-4 py-3 text-sm font-semibold text-[var(--organisation-on-action)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </>
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

function readError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
