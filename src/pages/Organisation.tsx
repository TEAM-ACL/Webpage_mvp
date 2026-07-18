import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Plus, UserPlus, Users } from "lucide-react";
import CohortPerformancePanel from "../components/organisation/CohortPerformancePanel";
import InstitutionalAIInsightCard from "../components/organisation/InstitutionalAIInsightCard";
import OpportunityActivityPanel from "../components/organisation/OpportunityActivityPanel";
import OrganisationActivityFeed from "../components/organisation/OrganisationActivityFeed";
import OrganisationHealthCard from "../components/organisation/OrganisationHealthCard";
import OrganisationLayout from "../components/organisation/OrganisationLayout";
import OrganisationMetricCard from "../components/organisation/OrganisationMetricCard";
import PriorityActionsPanel from "../components/organisation/PriorityActionsPanel";
import SupportMembersTable from "../components/organisation/SupportMembersTable";
import { useAuth } from "../context/AuthContext";
import {
  mockCohortPerformance,
  mockOpportunityActivity,
  mockOrganisationHealth,
  mockOrganisationMetrics,
  mockPriorityActions,
  mockRecentActivity,
  mockSupportMembers,
  type OrganisationPriorityAction,
} from "../data/mockOrganisationOverview";
import {
  getInstitutionalAIInsight,
  getOrganisationMembers,
  getOrganisationOverview,
  refreshInstitutionalAIInsight,
} from "../services/organisation";
import type {
  InstitutionalAIInsight,
  InstitutionalRecommendedAction,
  OrganisationActivity,
  OrganisationMember,
  OrganisationOverviewResponse,
} from "../types/organisation";

export default function Organisation(): JSX.Element {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [overview, setOverview] = useState<OrganisationOverviewResponse | null>(null);
  const [supportMembers, setSupportMembers] = useState<OrganisationMember[]>(mockSupportMembers);
  const [insight, setInsight] = useState<InstitutionalAIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInsightRefreshing, setIsInsightRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsightError(null);

    const [overviewResult, membersResult, insightResult] = await Promise.allSettled([
      getOrganisationOverview(),
      getOrganisationMembers(),
      getInstitutionalAIInsight(),
    ]);

    if (overviewResult.status === "fulfilled") {
      setOverview(overviewResult.value);
    } else {
      setError(readError(overviewResult.reason, "Unable to load organisation overview."));
    }

    if (membersResult.status === "fulfilled") {
      const flaggedMembers = membersResult.value.filter((member) => member.needsSupport);
      setSupportMembers(flaggedMembers.length > 0 ? flaggedMembers.slice(0, 3) : []);
    }

    if (insightResult.status === "fulfilled") {
      setInsight(insightResult.value.insight);
    } else {
      setInsightError(readError(insightResult.reason, "Unable to load institutional AI insight."));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const organisationName = overview?.summary.organisationName || profile?.organisationName || "VisionTech Demo Organisation";
  const organisationType = overview?.summary.organisationType || "Training Provider";
  const administratorRole = profile?.role || user?.role || "Organisation Admin";
  const metrics = useMemo(() => {
    if (!overview) {
      return mockOrganisationMetrics;
    }

    return {
      totalMembers: overview.summary.totalMembers,
      activeMembers: overview.summary.activeMembers,
      activeCohorts: overview.summary.activeCohorts,
      averageReadiness: overview.summary.averageReadiness,
      openInterventions: overview.summary.membersNeedingSupport,
      activeOpportunities: mockOrganisationMetrics.activeOpportunities,
    };
  }, [overview]);
  const healthMetrics = useMemo(() => {
    if (!overview || overview.summary.totalMembers === 0) {
      return mockOrganisationHealth;
    }

    const engagement = Math.round((overview.summary.activeMembers / overview.summary.totalMembers) * 100);
    const supportHealth = Math.round(
      ((overview.summary.totalMembers - overview.summary.membersNeedingSupport) / overview.summary.totalMembers) * 100,
    );

    return [
      { label: "Engagement", value: engagement, tone: "indigo" as const },
      { label: "Readiness", value: overview.summary.averageReadiness, tone: "emerald" as const },
      { label: "Pathway Progress", value: Math.max(overview.summary.averageReadiness - 4, 0), tone: "sky" as const },
      { label: "Project Evidence", value: Math.max(supportHealth - 16, 0), tone: "amber" as const },
      { label: "Opportunity Engagement", value: Math.max(overview.summary.averageReadiness - 5, 0), tone: "rose" as const },
    ];
  }, [overview]);
  const recentActivity: OrganisationActivity[] = overview?.recentActivity?.length ? overview.recentActivity : mockRecentActivity;
  const hasNoMembers = !isLoading && metrics.totalMembers === 0;

  async function handleRefreshInsight(): Promise<void> {
    setIsInsightRefreshing(true);
    setInsightError(null);
    try {
      const response = await refreshInstitutionalAIInsight();
      setInsight(response.insight);
    } catch (error) {
      setInsightError(readError(error, "Unable to refresh institutional AI insight."));
    } finally {
      setIsInsightRefreshing(false);
    }
  }

  function handleAiAction(action: InstitutionalRecommendedAction): void {
    const destinations: Record<InstitutionalRecommendedAction["actionType"], string> = {
      create_cohort: "/organisation/cohorts?create=true",
      create_intervention: "/organisation/interventions?create=true",
      assign_project: "/organisation/cohorts?action=assign-project",
      share_resource: "/organisation/members?action=share-resource",
      share_opportunity: "/organisation/opportunities?create=true",
      review_members: "/organisation/members?filter=needs-support",
    };
    navigate(destinations[action.actionType]);
  }

  function handlePriorityAction(action: OrganisationPriorityAction): void {
    const destinations: Record<OrganisationPriorityAction["actionType"], string> = {
      review_members: "/organisation/members?filter=needs-support",
      create_intervention: "/organisation/interventions?create=true",
      create_cohort: "/organisation/cohorts?create=true",
      review_opportunities: "/organisation/opportunities",
    };
    navigate(destinations[action.actionType]);
  }

  return (
    <OrganisationLayout
      organisationName={organisationName}
      organisationType={organisationType}
      administratorRole={formatRole(administratorRole)}
      title="Organisation Overview"
      description="Monitor participation, development progress, opportunity readiness, and the actions that need administrator attention."
      actions={
        <>
          <ActionButton icon={<UserPlus className="h-4 w-4" />} label="Invite Member" onClick={() => navigate("/organisation/members?invite=true")} />
          <ActionButton icon={<Users className="h-4 w-4" />} label="Create Cohort" onClick={() => navigate("/organisation/cohorts?create=true")} />
          <ActionButton icon={<BriefcaseBusiness className="h-4 w-4" />} label="Add Opportunity" onClick={() => navigate("/organisation/opportunities?create=true")} primary />
        </>
      }
    >
      <div className="space-y-6">
        {error && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Backend overview data is unavailable, so professional preview data is shown. {error}
          </section>
        )}

        {hasNoMembers && (
          <section className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-700">New organisation</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">No members have joined yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Invite people to begin building institutional intelligence, cohorts, support workflows, and opportunity recommendations.
            </p>
            <button
              type="button"
              onClick={() => navigate("/organisation/members?invite=true")}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200"
            >
              <Plus className="h-4 w-4" />
              Invite First Member
            </button>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <OrganisationMetricCard label="Total People" value={isLoading ? "…" : metrics.totalMembers} note="Registered members in this organisation" tone="slate" />
          <OrganisationMetricCard label="Active People" value={isLoading ? "…" : metrics.activeMembers} note={`${activeMemberPercent(metrics)}% of registered people`} tone="indigo" />
          <OrganisationMetricCard label="Active Cohorts" value={isLoading ? "…" : metrics.activeCohorts} note="Programmes currently being delivered" tone="sky" />
          <OrganisationMetricCard label="Average Readiness" value={isLoading ? "…" : `${metrics.averageReadiness}%`} note="Opportunity readiness across members" tone="emerald" />
          <OrganisationMetricCard label="Open Interventions" value={isLoading ? "…" : metrics.openInterventions} note="People or cohorts needing support" tone="amber" />
          <OrganisationMetricCard label="Active Opportunities" value={isLoading ? "…" : metrics.activeOpportunities} note="Published opportunities being tracked" tone="rose" />
        </section>

        <InstitutionalAIInsightCard
          insight={insight}
          isLoading={isLoading}
          isRefreshing={isInsightRefreshing}
          error={insightError}
          onRefresh={() => void handleRefreshInsight()}
          onActionSelect={handleAiAction}
        />

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <OrganisationHealthCard metrics={healthMetrics} />
          <PriorityActionsPanel actions={mockPriorityActions} onAction={handlePriorityAction} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <CohortPerformancePanel cohorts={mockCohortPerformance} onOpenCohorts={() => navigate("/organisation/cohorts")} />
          <SupportMembersTable members={supportMembers} onReviewPeople={() => navigate("/organisation/members?filter=needs-support")} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <OpportunityActivityPanel opportunities={mockOpportunityActivity} onOpenOpportunities={() => navigate("/organisation/opportunities")} />
          <OrganisationActivityFeed activity={recentActivity} />
        </div>
      </div>
    </OrganisationLayout>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
}: {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
  primary?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200"
          : "inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]"
      }
    >
      {icon}
      {label}
    </button>
  );
}

function activeMemberPercent(metrics: { totalMembers: number; activeMembers: number }): number {
  if (metrics.totalMembers === 0) {
    return 0;
  }
  return Math.round((metrics.activeMembers / metrics.totalMembers) * 100);
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function readError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
