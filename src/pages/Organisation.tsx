import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Plus, UserPlus, Users } from "lucide-react";
import CohortPerformancePanel from "../components/organisation/CohortPerformancePanel";
import InstitutionalAIInsightCard from "../components/organisation/InstitutionalAIInsightCard";
import OrganisationAIPanel from "../components/organisation/OrganisationAIPanel";
import OpportunityActivityPanel from "../components/organisation/OpportunityActivityPanel";
import OrganisationActivityFeed from "../components/organisation/OrganisationActivityFeed";
import OrganisationHealthCard from "../components/organisation/OrganisationHealthCard";
import OrganisationHomepageWidgetRegistry from "../components/organisation/OrganisationHomepageWidgetRegistry";
import OrganisationLayout from "../components/organisation/OrganisationLayout";
import OrganisationMetricCard from "../components/organisation/OrganisationMetricCard";
import PriorityActionsPanel from "../components/organisation/PriorityActionsPanel";
import SupportMembersTable from "../components/organisation/SupportMembersTable";
import type { OrganisationHomepageWidgetType } from "../config/organisationHomepageWidgets";
import { useAuth } from "../context/AuthContext";
import { useOrganisation } from "../context/OrganisationContext";
import {
  getInstitutionalAIInsight,
  getOrganisationCohorts,
  getOrganisationMemberInterventions,
  getOrganisationMembers,
  getOrganisationOpportunities,
  getOrganisationOpportunityRecommendations,
  getOrganisationOverview,
  refreshInstitutionalAIInsight,
} from "../services/organisation";
import type {
  InstitutionalAIInsight,
  InstitutionalRecommendedAction,
  OrganisationActivity,
  OrganisationCohortOverview,
  OrganisationCohortPerformance,
  OrganisationHealthMetric,
  OrganisationMember,
  OrganisationMemberInterventionRecord,
  OrganisationMemberOpportunityRecommendationRecord,
  OrganisationOpportunityActivity,
  OrganisationOpportunityRecord,
  OrganisationOverviewResponse,
  OrganisationOverviewMetrics,
  OrganisationPriorityAction,
} from "../types/organisation";

export default function Organisation(): JSX.Element {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { organisation, getOrganisationPath } = useOrganisation();
  const organisationId = organisation?.id;
  const [overview, setOverview] = useState<OrganisationOverviewResponse | null>(null);
  const [supportMembers, setSupportMembers] = useState<OrganisationMember[]>([]);
  const [cohorts, setCohorts] = useState<OrganisationCohortOverview[]>([]);
  const [opportunities, setOpportunities] = useState<OrganisationOpportunityRecord[]>([]);
  const [opportunityRecommendations, setOpportunityRecommendations] = useState<OrganisationMemberOpportunityRecommendationRecord[]>([]);
  const [interventions, setInterventions] = useState<OrganisationMemberInterventionRecord[]>([]);
  const [insight, setInsight] = useState<InstitutionalAIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInsightRefreshing, setIsInsightRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [selectedAiPrompt, setSelectedAiPrompt] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsightError(null);

    const [
      overviewResult,
      membersResult,
      cohortsResult,
      opportunitiesResult,
      recommendationsResult,
      interventionsResult,
      insightResult,
    ] = await Promise.allSettled([
      getOrganisationOverview(organisationId),
      getOrganisationMembers(organisationId),
      organisationId ? getOrganisationCohorts(organisationId) : Promise.resolve([]),
      organisationId ? getOrganisationOpportunities(organisationId) : Promise.resolve([]),
      organisationId ? getOrganisationOpportunityRecommendations(organisationId) : Promise.resolve([]),
      organisationId ? getOrganisationMemberInterventions(organisationId) : Promise.resolve([]),
      getInstitutionalAIInsight(organisationId),
    ]);
    const loadErrors: string[] = [];

    if (overviewResult.status === "fulfilled") {
      setOverview(overviewResult.value);
    } else {
      setOverview(null);
      loadErrors.push(readError(overviewResult.reason, "Unable to load organisation overview."));
    }

    if (membersResult.status === "fulfilled") {
      const flaggedMembers = membersResult.value.filter((member) => member.needsSupport);
      setSupportMembers(flaggedMembers.length > 0 ? flaggedMembers.slice(0, 3) : []);
    } else {
      setSupportMembers([]);
      loadErrors.push(readError(membersResult.reason, "Unable to load organisation members."));
    }

    if (cohortsResult.status === "fulfilled") {
      setCohorts(cohortsResult.value);
    } else {
      setCohorts([]);
      loadErrors.push(readError(cohortsResult.reason, "Unable to load organisation cohorts."));
    }

    if (opportunitiesResult.status === "fulfilled") {
      setOpportunities(opportunitiesResult.value);
    } else {
      setOpportunities([]);
      loadErrors.push(readError(opportunitiesResult.reason, "Unable to load organisation opportunities."));
    }

    if (recommendationsResult.status === "fulfilled") {
      setOpportunityRecommendations(recommendationsResult.value);
    } else {
      setOpportunityRecommendations([]);
    }

    if (interventionsResult.status === "fulfilled") {
      setInterventions(interventionsResult.value);
    } else {
      setInterventions([]);
    }

    if (insightResult.status === "fulfilled") {
      setInsight(insightResult.value.insight);
    } else {
      setInsight(null);
      setInsightError(readError(insightResult.reason, "Unable to load institutional AI insight."));
    }

    setError(loadErrors.length > 0 ? loadErrors.join(" ") : null);
    setIsLoading(false);
  }, [organisationId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const organisationName = organisation?.name || overview?.summary.organisationName || profile?.organisationName || "VisionTech Demo Organisation";
  const organisationType = organisation?.organisationType || overview?.summary.organisationType || "Training Provider";
  const administratorRole = organisation?.role || profile?.role || user?.role || "Organisation Admin";
  const metrics = useMemo(() => {
    if (!overview) {
      return emptyOrganisationMetrics;
    }

    return {
      totalMembers: overview.summary.totalMembers,
      activeMembers: overview.summary.activeMembers,
      activeCohorts: overview.summary.activeCohorts,
      averageReadiness: overview.summary.averageReadiness,
      openInterventions: interventions.length || overview.summary.membersNeedingSupport,
      activeOpportunities: opportunities.filter((opportunity) => opportunity.status === "open").length,
    };
  }, [interventions.length, opportunities, overview]);
  const healthMetrics = useMemo(() => {
    if (!overview || overview.summary.totalMembers === 0) {
      return buildHealthMetrics(emptyOrganisationMetrics);
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
  const priorityActions = useMemo(
    () => buildPriorityActions(metrics, supportMembers, opportunities, interventions, insight),
    [insight, interventions, metrics, opportunities, supportMembers],
  );
  const cohortPerformance = useMemo(
    () => cohorts.map(mapCohortPerformance).slice(0, 3),
    [cohorts],
  );
  const opportunityActivity = useMemo(
    () => opportunities
      .filter((opportunity) => opportunity.status === "open")
      .map((opportunity) => mapOpportunityActivity(opportunity, opportunityRecommendations))
      .slice(0, 3),
    [opportunities, opportunityRecommendations],
  );
  const recentActivity: OrganisationActivity[] = overview?.recentActivity ?? [];
  const hasNoMembers = !isLoading && metrics.totalMembers === 0;
  const homepageWidgets: Record<OrganisationHomepageWidgetType, JSX.Element> = {
    metrics: (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <OrganisationMetricCard label="Total People" value={isLoading ? "…" : metrics.totalMembers} note="Registered members in this organisation" tone="slate" />
        <OrganisationMetricCard label="Active People" value={isLoading ? "…" : metrics.activeMembers} note={`${activeMemberPercent(metrics)}% of registered people`} tone="indigo" />
        <OrganisationMetricCard label="Active Cohorts" value={isLoading ? "…" : metrics.activeCohorts} note="Programmes currently being delivered" tone="sky" />
        <OrganisationMetricCard label="Average Readiness" value={isLoading ? "…" : `${metrics.averageReadiness}%`} note="Opportunity readiness across members" tone="emerald" />
        <OrganisationMetricCard label="Open Interventions" value={isLoading ? "…" : metrics.openInterventions} note="People or cohorts needing support" tone="amber" />
        <OrganisationMetricCard label="Active Opportunities" value={isLoading ? "…" : metrics.activeOpportunities} note="Published opportunities being tracked" tone="rose" />
      </section>
    ),
    ai_insight: (
      <InstitutionalAIInsightCard
        insight={insight}
        isLoading={isLoading}
        isRefreshing={isInsightRefreshing}
        error={insightError}
        onRefresh={() => void handleRefreshInsight()}
        onActionSelect={handleAiAction}
      />
    ),
    ai_assistant: (
      <OrganisationAIPanel
        contextLabel="Overview Intelligence"
        title="AI Command Assistant"
        insight={insight}
        isLoading={isLoading}
        isRefreshing={isInsightRefreshing}
        error={insightError}
        prompts={overviewAiPrompts}
        selectedPrompt={selectedAiPrompt}
        response={selectedAiPrompt ? buildOverviewAiResponse(selectedAiPrompt, metrics, insight) : null}
        onPromptSelect={setSelectedAiPrompt}
        onRefresh={() => void handleRefreshInsight()}
        onActionSelect={handleAiAction}
      />
    ),
    health_priority: (
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <OrganisationHealthCard metrics={healthMetrics} />
        <PriorityActionsPanel actions={priorityActions} onAction={handlePriorityAction} />
      </div>
    ),
    cohorts_support: (
      <div className="grid gap-6 xl:grid-cols-2">
        <CohortPerformancePanel cohorts={cohortPerformance} onOpenCohorts={() => navigate(getOrganisationPath("cohorts"))} />
        <SupportMembersTable members={supportMembers} onReviewPeople={() => navigate(getOrganisationPath("members?filter=needs-support"))} />
      </div>
    ),
    opportunities_activity: (
      <div className="grid gap-6 xl:grid-cols-2">
        <OpportunityActivityPanel opportunities={opportunityActivity} onOpenOpportunities={() => navigate(getOrganisationPath("opportunities"))} />
        <OrganisationActivityFeed activity={recentActivity} />
      </div>
    ),
  };

  async function handleRefreshInsight(): Promise<void> {
    setIsInsightRefreshing(true);
    setInsightError(null);
    try {
      const response = await refreshInstitutionalAIInsight(organisationId);
      setInsight(response.insight);
    } catch (error) {
      setInsightError(readError(error, "Unable to refresh institutional AI insight."));
    } finally {
      setIsInsightRefreshing(false);
    }
  }

  function handleAiAction(action: InstitutionalRecommendedAction): void {
    const destinations: Record<InstitutionalRecommendedAction["actionType"], string> = {
      create_cohort: getOrganisationPath("cohorts?create=true"),
      create_intervention: getOrganisationPath("interventions?create=true"),
      assign_project: getOrganisationPath("cohorts?action=assign-project"),
      share_resource: getOrganisationPath("members?action=share-resource"),
      share_opportunity: getOrganisationPath("opportunities?create=true"),
      review_members: getOrganisationPath("members?filter=needs-support"),
    };
    navigate(destinations[action.actionType]);
  }

  function handlePriorityAction(action: OrganisationPriorityAction): void {
    const destinations: Record<OrganisationPriorityAction["actionType"], string> = {
      review_members: getOrganisationPath("members?filter=needs-support"),
      create_intervention: getOrganisationPath("interventions?create=true"),
      create_cohort: getOrganisationPath("cohorts?create=true"),
      review_opportunities: getOrganisationPath("opportunities"),
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
          <ActionButton icon={<UserPlus className="h-4 w-4" />} label="Invite Member" onClick={() => navigate(getOrganisationPath("members?invite=true"))} />
          <ActionButton icon={<Users className="h-4 w-4" />} label="Create Cohort" onClick={() => navigate(getOrganisationPath("cohorts?create=true"))} />
          <ActionButton icon={<BriefcaseBusiness className="h-4 w-4" />} label="Add Opportunity" onClick={() => navigate(getOrganisationPath("opportunities?create=true"))} primary />
        </>
      }
    >
      <div className="space-y-6">
        {error && (
          <section className="rounded-3xl border border-[var(--color-warning)] bg-[var(--color-warning-container)] p-5 text-sm text-[var(--color-warning)]">
            Some live organisation data could not be loaded. Empty states are shown for unavailable sections. {error}
          </section>
        )}

        {hasNoMembers && (
          <section className="rounded-3xl border border-dashed border-[var(--color-info)] bg-[var(--color-info-container)] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-info)]">New organisation</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--color-on-surface)]">No members have joined yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
              Invite people to begin building institutional intelligence, cohorts, support workflows, and opportunity recommendations.
            </p>
            <button
              type="button"
              onClick={() => navigate(getOrganisationPath("members?invite=true"))}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--organisation-action)] px-4 py-3 text-sm font-bold text-[var(--organisation-on-action)] shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Invite First Member
            </button>
          </section>
        )}


        <OrganisationHomepageWidgetRegistry
          sections={organisation?.settings.homepageConfig || []}
          widgets={homepageWidgets}
        />
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
          ? "inline-flex items-center gap-2 rounded-2xl bg-[var(--organisation-action)] px-4 py-3 text-sm font-bold text-[var(--organisation-on-action)] shadow-lg"
          : "inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]"
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

const emptyOrganisationMetrics: OrganisationOverviewMetrics = {
  totalMembers: 0,
  activeMembers: 0,
  activeCohorts: 0,
  averageReadiness: 0,
  openInterventions: 0,
  activeOpportunities: 0,
};

function buildHealthMetrics(metrics: OrganisationOverviewMetrics): OrganisationHealthMetric[] {
  const engagement = activeMemberPercent(metrics);
  const supportHealth = metrics.totalMembers === 0
    ? 0
    : Math.round(((metrics.totalMembers - metrics.openInterventions) / metrics.totalMembers) * 100);

  return [
    { label: "Engagement", value: clampPercent(engagement), tone: "indigo" },
    { label: "Readiness", value: clampPercent(metrics.averageReadiness), tone: "emerald" },
    { label: "Pathway Progress", value: clampPercent(metrics.averageReadiness - 4), tone: "sky" },
    { label: "Project Evidence", value: clampPercent(supportHealth - 16), tone: "amber" },
    { label: "Opportunity Engagement", value: clampPercent(metrics.activeOpportunities > 0 ? metrics.averageReadiness - 5 : 0), tone: "rose" },
  ];
}

function buildPriorityActions(
  metrics: OrganisationOverviewMetrics,
  supportMembers: OrganisationMember[],
  opportunities: OrganisationOpportunityRecord[],
  interventions: OrganisationMemberInterventionRecord[],
  insight: InstitutionalAIInsight | null,
): OrganisationPriorityAction[] {
  const actions: OrganisationPriorityAction[] = [];

  if (supportMembers.length > 0 || metrics.openInterventions > 0) {
    actions.push({
      id: "priority-support",
      title: "Review people needing support",
      description: insight?.mainConcern || "Members are flagged by readiness, inactivity, or open intervention signals.",
      priority: supportMembers.length > 3 || metrics.openInterventions > 5 ? "high" : "medium",
      actionType: "review_members",
      affectedCount: Math.max(supportMembers.length, metrics.openInterventions),
      recommendedResponse: interventions.length > 0 ? "Review open interventions" : "Create targeted intervention",
    });
  }

  if (metrics.activeCohorts === 0 && metrics.totalMembers > 0) {
    actions.push({
      id: "priority-cohort",
      title: "Create a cohort for active members",
      description: "Members are present, but no active cohorts are currently being tracked.",
      priority: "medium",
      actionType: "create_cohort",
      affectedCount: metrics.totalMembers,
      recommendedResponse: "Create cohort",
    });
  }

  if (opportunities.filter((opportunity) => opportunity.status === "open").length === 0) {
    actions.push({
      id: "priority-opportunities",
      title: "Publish an opportunity",
      description: "No open opportunities are available for members to act on.",
      priority: metrics.totalMembers > 0 ? "medium" : "low",
      actionType: "review_opportunities",
      recommendedResponse: "Review opportunities",
    });
  }

  return actions;
}

function mapCohortPerformance(cohort: OrganisationCohortOverview): OrganisationCohortPerformance {
  return {
    id: cohort.cohort_id,
    name: cohort.name,
    memberCount: cohort.member_count,
    averageReadiness: cohort.average_readiness,
    pathwayCompletion: cohort.average_completion,
    needSupport: Math.max(0, cohort.member_count - Math.round((cohort.member_count * cohort.average_readiness) / 100)),
    status: cohort.status === "planning" ? "Planning" : cohort.status === "completed" ? "Completed" : "Active",
  };
}

function mapOpportunityActivity(
  opportunity: OrganisationOpportunityRecord,
  recommendations: OrganisationMemberOpportunityRecommendationRecord[],
): OrganisationOpportunityActivity {
  const relatedRecommendations = recommendations.filter((recommendation) =>
    recommendation.title.trim().toLowerCase() === opportunity.title.trim().toLowerCase(),
  );

  return {
    id: opportunity.id,
    title: opportunity.title,
    closingLabel: buildClosingLabel(opportunity),
    strongMatches: relatedRecommendations.length,
    expressionsOfInterest: relatedRecommendations.filter((recommendation) => recommendation.status !== "dismissed").length,
  };
}

function buildClosingLabel(opportunity: OrganisationOpportunityRecord): string {
  if (opportunity.status !== "open") {
    return `${opportunity.status.charAt(0).toUpperCase()}${opportunity.status.slice(1)} opportunity`;
  }
  if (!opportunity.closing_date) {
    return "Open opportunity";
  }

  const closingTime = new Date(opportunity.closing_date).getTime();
  if (Number.isNaN(closingTime)) {
    return "Open opportunity";
  }
  const days = Math.ceil((closingTime - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) {
    return "Closing date passed";
  }
  if (days === 0) {
    return "Closing today";
  }
  return `Closing in ${days} day${days === 1 ? "" : "s"}`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function readError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const overviewAiPrompts = [
  "What should I do first today?",
  "Where is the organisation weakest?",
  "Which action improves readiness fastest?",
];

function buildOverviewAiResponse(
  prompt: string,
  metrics: {
    totalMembers: number;
    activeMembers: number;
    activeCohorts: number;
    averageReadiness: number;
    openInterventions: number;
    activeOpportunities: number;
  },
  insight: InstitutionalAIInsight | null,
): string {
  const responses: Record<string, string> = {
    "What should I do first today?": `Start with the ${metrics.openInterventions} open interventions, then move active members into one practical project sprint.`,
    "Where is the organisation weakest?": `The weakest current signal is project evidence versus readiness. Average readiness is ${metrics.averageReadiness}%, but members still need stronger portfolio proof.`,
    "Which action improves readiness fastest?": "Create a short project cohort with mentor feedback. It improves readiness, evidence, and opportunity confidence at the same time.",
  };
  const baseResponse = responses[prompt] || "Focus on the highest-risk support signal and route it into a practical administrator workflow.";
  return insight?.mainConcern ? `${baseResponse} Current AI concern: ${insight.mainConcern}` : baseResponse;
}
