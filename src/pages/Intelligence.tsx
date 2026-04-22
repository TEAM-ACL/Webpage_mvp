import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import DashboardShell from "../components/dashboard/DashboardShell";
import PageHeader from "../components/dashboard/PageHeader";
import SummaryGrid, { type SummaryItem } from "../components/dashboard/SummaryGrid";
import { useAuth } from "../context/AuthContext";

// Static data (kept colocated for easy extraction into components later)
type PathwayStep = {
  id: number;
  title: string;
  description: string;
  status: "completed" | "active" | "locked";
};

type Insight = {
  id: number;
  title: string;
  description: string;
};

type MatchCard = {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  reason: string;
};

type ActivityItem = {
  id: number;
  title: string;
  time: string;
  status: "done" | "in-progress" | "upcoming";
};

type RecommendationCard = {
  id: string;
  title: string;
  type: string;
  level: string;
  reason: string;
  badges?: string[];
};

// ACL: section status options for lightweight intelligence state badges
type IntelligenceSectionState = "ready" | "loading" | "empty" | "error";
// ACL: onboarding guidance item for intelligence-readiness messaging
type IntelligenceGuidanceItem = {
  id: string;
  message: string;
};
// ACL: recovery action guidance for empty intelligence states
type IntelligenceRecoveryAction = {
  id: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

function buildStats(skillsCount: number | null, aiCount: number | null): SummaryItem[] {
  return [
    { title: "Pathway Progress", value: "45%", note: "Moving steadily toward your goal", icon: TrendingUp },
    {
      title: "Skills Identified",
      value: skillsCount !== null ? String(skillsCount) : "-",
      note: skillsCount !== null ? "Captured from onboarding" : "Add skills in onboarding to unlock precision",
      icon: Target,
    },
    { title: "Active Matches", value: "8", note: "Potential collaborators and mentors", icon: Users },
    {
      title: "AI Insights",
      value: aiCount !== null ? String(aiCount) : "-",
      note: aiCount !== null ? "Fresh recommendations ready" : "Complete onboarding to see insights",
      icon: Lightbulb,
    },
  ];
}


const pathwaySteps: PathwayStep[] = [
  {
    id: 1,
    title: "Networking Fundamentals",
    description: "Strengthen your understanding of core networking concepts.",
    status: "completed",
  },
  {
    id: 2,
    title: "Linux Security Basics",
    description: "Build confidence with permissions, logs, and hardening basics.",
    status: "completed",
  },
  {
    id: 3,
    title: "Cloud IAM and Access Control",
    description: "Focus on identity, least privilege, and policy management.",
    status: "active",
  },
  {
    id: 4,
    title: "Security Monitoring and SIEM",
    description: "Learn alerting, log review, and security event analysis.",
    status: "locked",
  },
];

const insights: Insight[] = [
  {
    id: 1,
    title: "Recommended next move",
    description:
      "Complete a mini project on cloud identity and access management to strengthen your current pathway stage.",
  },
  {
    id: 2,
    title: "Growth gap spotted",
    description:
      "Kubernetes and container security are emerging as useful next-step skills for users on similar cloud security tracks.",
  },
  {
    id: 3,
    title: "Momentum insight",
    description:
      "Users who complete 3 pathway tasks in one month usually improve their match quality and opportunity readiness.",
  },
];

const activities: ActivityItem[] = [
  {
    id: 1,
    title: "Completed Networking Fundamentals module",
    time: "2 days ago",
    status: "done",
  },
  {
    id: 2,
    title: "Started Cloud IAM pathway task",
    time: "Today",
    status: "in-progress",
  },
  {
    id: 3,
    title: "AI suggested a mini project for practical growth",
    time: "Today",
    status: "upcoming",
  },
];

function statusStyles(status: PathwayStep["status"]) {
  if (status === "completed") {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (status === "active") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  return "bg-zinc-100 text-zinc-500 border-zinc-200";
}

function activityDot(status: ActivityItem["status"]) {
  if (status === "done") return "bg-green-500";
  if (status === "in-progress") return "bg-blue-500";
  return "bg-zinc-400";
}

function isCompletedRecommendationItem(item: {
  status?: string;
  event_type?: string;
  is_completed?: boolean;
  completed?: boolean;
}): boolean {
  if (item.is_completed === true || item.completed === true) return true;

  const normalizedStatus = item.status?.trim().toLowerCase();
  const normalizedEventType = item.event_type?.trim().toLowerCase();
  const completedMarkers = new Set(["completed", "done", "finished"]);
  return (
    (normalizedStatus !== undefined && completedMarkers.has(normalizedStatus))
    || (normalizedEventType !== undefined && completedMarkers.has(normalizedEventType))
  );
}

const subtle = "text-[var(--color-on-surface-variant)]";

export default function Intelligence(): JSX.Element {
  const navigate = useNavigate();
  const {
    user,
    profile,
    onboardingComplete,
    profileLoading,
    aiInsight,
    aiInsightLoading,
    aiInsightError,
    aiInsightUpdatedAt,
    aiInsightSource,
    aiInsightIsCached,
    aiInsightLastAction,
    refreshAIInsight,
    loadLatestAIInsight,
    loadAIState,
    aiState,
    aiStateLoading,
    aiStateError,
    loadAIReadiness,
    aiReadiness,
    aiReadinessLoading,
    aiReadinessError,
    recommendations,
    recommendationsLoading,
    recommendationsError,
    recommendationsUpdatedAt,
    recommendationsLastAction,
    loadRecommendations,
    refreshRecommendations,
    matches,
    matchesLoading,
    matchesError,
    matchesUpdatedAt,
    matchesLastAction,
    loadMatches,
    intelligenceRefreshing,
    intelligenceUpdatedAt,
    intelligenceLastAction,
    refreshIntelligence,
  } = useAuth();
  // ACL: local feedback state for intelligence actions on this page
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  // ACL: ensure intelligence bootstrap runs once per stable page mount context
  const intelligenceBootstrapStarted = useRef(false);

  const field = profile?.fieldOfInterest || "Cloud Security Pathway";
  const headlineGoal = profile?.goals?.[0] || "Become opportunity-ready in cloud security";
  const skillsCount = profile?.skills ? profile.skills.length : null;
  const summaryGoal = profile?.goals?.[0] || "Grow in your chosen pathway";
  const summaryTask = profile?.interests?.[0]
    ? `Explore: ${profile.interests[0]}`
    : "Complete your next pathway task";
  const matchStrength = profile?.preferredWorkStyle
    ? `Strong fit for ${profile.preferredWorkStyle.toLowerCase()} work`
    : "High fit with technical collaborators";
  const profileSkills = Array.isArray(profile?.skills) ? profile.skills : [];
  const profileInterests = Array.isArray(profile?.interests) ? profile.interests : [];
  const profileGoals = Array.isArray(profile?.goals) ? profile.goals : [];
  const minimumSkillsForStrongInsight = 3;
  const minimumInterestsForStrongInsight = 2;
  const minimumGoalsForStrongInsight = 2;
  const skillsAreThin = profileSkills.length < minimumSkillsForStrongInsight;
  const interestsAreThin = profileInterests.length < minimumInterestsForStrongInsight;
  const goalsAreThin = profileGoals.length < minimumGoalsForStrongInsight;
  const onboardingDataIsThin = skillsAreThin || interestsAreThin || goalsAreThin;
  const onboardingReadyForIntelligence = onboardingComplete === true && !onboardingDataIsThin;
  let aiConfidence: "high" | "medium" | "low" = "low";
  if (!skillsAreThin && !interestsAreThin && !goalsAreThin) {
    aiConfidence = "high";
  } else if (!skillsAreThin || !interestsAreThin) {
    aiConfidence = "medium";
  }
  const intelligenceGuidanceItems: IntelligenceGuidanceItem[] = [];
  if (onboardingComplete !== true) {
    intelligenceGuidanceItems.push({
      id: "complete-onboarding",
      message: "Complete onboarding to unlock full intelligence features.",
    });
  }
  if (skillsAreThin) {
    intelligenceGuidanceItems.push({
      id: "skills-thin",
      message: `Add at least ${minimumSkillsForStrongInsight} skills to improve insight quality and recommendations.`,
    });
  }
  if (interestsAreThin) {
    intelligenceGuidanceItems.push({
      id: "interests-thin",
      message: `Add at least ${minimumInterestsForStrongInsight} interests to improve pathway relevance and smart matching.`,
    });
  }
  if (goalsAreThin) {
    intelligenceGuidanceItems.push({
      id: "goals-thin",
      message: `Add at least ${minimumGoalsForStrongInsight} goals to help the system generate better guidance.`,
    });
  }
  const shouldShowIntelligenceGuidance =
    !profileLoading &&
    Boolean(user) &&
    intelligenceGuidanceItems.length > 0;
  const completedReadinessAreas = [
    !skillsAreThin,
    !interestsAreThin,
    !goalsAreThin,
  ].filter(Boolean).length;

  const stats = useMemo(() => buildStats(skillsCount, aiInsight ? aiInsight.next_steps.length : null), [skillsCount, aiInsight]);

  const aiStatusLabel = aiInsight
    ? "Live"
    : aiInsightLoading
      ? "Loading"
      : aiInsightError
        ? "Unavailable"
        : "Sample";

  const hasStructuredRecommendationFields = useMemo(() => {
    if (!recommendations) return false;
    const payload = recommendations as unknown as Record<string, unknown>;
    return "recommended_resources" in payload || "recommended_projects" in payload;
  }, [recommendations]);

  const activeRecommendations = useMemo(
    () =>
      (recommendations?.recommendations ?? []).filter(
        (item) => !isCompletedRecommendationItem(item)
      ),
    [recommendations]
  );

  const hasFilteredCompletedRecommendations =
    !!recommendations
    && !!recommendations.recommendations
    && recommendations.recommendations.length > activeRecommendations.length;

  const recommendationResources = useMemo<RecommendationCard[]>(() => {
    if (!recommendations) return [];

    if (hasStructuredRecommendationFields) {
      const payload = recommendations as unknown as {
        recommended_resources?: Array<{
          id?: string;
          title?: string;
          type?: string;
          level?: string;
          reason?: string;
        }>;
      };

      return (payload.recommended_resources ?? []).map((item, index) => ({
        id: item.id ?? `resource-${index}`,
        title: item.title ?? "Untitled resource",
        type: item.type ?? "Resource",
        level: item.level ?? "General",
        reason: item.reason ?? "Recommended for your profile.",
      }));
    }

    return [];
  }, [recommendations, hasStructuredRecommendationFields]);

  const recommendationProjects = useMemo<RecommendationCard[]>(() => {
    if (!recommendations) return [];

    if (hasStructuredRecommendationFields) {
      const payload = recommendations as unknown as {
        recommended_projects?: Array<{
          id?: string;
          title?: string;
          type?: string;
          level?: string;
          reason?: string;
        }>;
      };

      return (payload.recommended_projects ?? []).map((item, index) => ({
        id: item.id ?? `project-${index}`,
        title: item.title ?? "Untitled project",
        type: item.type ?? "Project",
        level: item.level ?? "General",
        reason: item.reason ?? "Recommended for your profile.",
      }));
    }

    return activeRecommendations.map((item) => ({
      id: item.pathway_id,
      title: item.title,
      type: "Pathway",
      level: item.skill_level,
      reason: item.match_reason || item.summary,
      badges: item.action_state
        ? [
          item.action_state.viewed ? "Viewed" : null,
          item.action_state.clicked ? "Clicked" : null,
          item.action_state.saved ? "Saved" : null,
          item.action_state.dismissed ? "Dismissed" : null,
          item.action_state.started ? "Started" : null,
          item.action_state.completed ? "Completed" : null,
        ].filter((badge): badge is string => Boolean(badge))
        : [],
    }));
  }, [recommendations, hasStructuredRecommendationFields, activeRecommendations]);

  const hasRecommendationData =
    !!recommendations &&
    (recommendationResources.length > 0 || recommendationProjects.length > 0);

  const displayMatches = useMemo(() => {
    if (matches?.matches) {
      return matches.matches.map((match) => ({
        id: match.id,
        name: match.name,
        role: match.role,
        matchScore: match.match_score,
        reason: match.reason,
      }));
    }

    return [];
  }, [matches]);
  const hasRealMatches = !!matches && matches.matches.length > 0;

  const onboardingIncomplete = onboardingComplete === false;
  const notAuthenticated = !user;
  const pageReady = !!user && !!profile && onboardingComplete === true;
  const insightReady = !!aiInsight && !aiInsightLoading && !aiInsightError;
  const recommendationsReady =
    !!recommendations &&
    !recommendationsLoading &&
    !recommendationsError;
  const matchesReady = !!matches && !matchesLoading && !matchesError;

  const intelligenceLoading =
    aiInsightLoading || recommendationsLoading || matchesLoading;

  const hasRecoverableSectionErrors =
    !!aiInsightError || !!recommendationsError || !!matchesError;

  const intelligenceReady =
    pageReady &&
    !intelligenceLoading &&
    (insightReady || recommendationsReady || matchesReady);

  const profileInsightCanGenerate = aiReadiness?.profile_insight.can_generate ?? false;
  const profileInsightReadinessStatus = aiReadiness?.profile_insight.status ?? null;
  const profileInsightReadinessMessage = aiReadiness?.profile_insight.message ?? null;
  const recommendationsCanGenerate = aiReadiness?.recommendations.can_generate ?? false;
  const recommendationsReadinessStatus = aiReadiness?.recommendations.status ?? null;
  const recommendationsReadinessMessage = aiReadiness?.recommendations.message ?? null;

  const onboardingBlockedByAIState = aiState?.onboarding.status === "incomplete_onboarding";
  const emailNotVerified = aiState?.onboarding.is_email_verified === false;
  const refreshIntelligenceBlocked =
    aiReadiness !== null && (!profileInsightCanGenerate || !recommendationsCanGenerate);

  const getSectionState = (
    loading: boolean,
    error: string | null,
    hasData: boolean,
  ): IntelligenceSectionState => {
    if (loading) return "loading";
    if (error) return "error";
    if (hasData) return "ready";
    return "empty";
  };

  const aiInsightState = getSectionState(
    aiInsightLoading,
    aiInsightError,
    Boolean(aiInsight),
  );

  const recommendationsState = getSectionState(
    recommendationsLoading,
    recommendationsError,
    Boolean(recommendations),
  );

  const matchesState = getSectionState(
    matchesLoading,
    matchesError,
    Boolean(matches),
  );

  const getSectionStateLabel = (state: IntelligenceSectionState): string => {
    switch (state) {
      case "loading":
        return "Loading";
      case "error":
        return "Error";
      case "ready":
        return "Ready";
      case "empty":
      default:
        return "Empty";
    }
  };

  const getSectionStateClassName = (state: IntelligenceSectionState): string => {
    switch (state) {
      case "loading":
        return "bg-amber-100 text-amber-700";
      case "error":
        return "bg-red-100 text-red-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "empty":
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const renderSectionBadge = (state: IntelligenceSectionState) => (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getSectionStateClassName(state)}`}
    >
      {getSectionStateLabel(state)}
    </span>
  );

  const getAIInsightSourceLabel = (source: "saved" | "fresh" | null): string => {
    if (source === "fresh") return "Fresh";
    if (source === "saved") return "Saved";
    return "Not available";
  };

  const getAIInsightSourceClassName = (source: "saved" | "fresh" | null): string => {
    if (source === "fresh") {
      return "bg-blue-100 text-blue-700";
    }

    if (source === "saved") {
      return "bg-violet-100 text-violet-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  const renderAIInsightSourceBadge = (source: "saved" | "fresh" | null) => (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getAIInsightSourceClassName(source)}`}
    >
      {getAIInsightSourceLabel(source)}
    </span>
  );

  const getConfidenceLabel = (level: "high" | "medium" | "low"): string => {
    if (level === "high") return "High confidence";
    if (level === "medium") return "Moderate confidence";
    return "Low confidence";
  };

  const getConfidenceClass = (level: "high" | "medium" | "low"): string => {
    if (level === "high") return "bg-green-100 text-green-700";
    if (level === "medium") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getLastActionClassName = (
    status: "success" | "error" | "info",
  ): string => {
    switch (status) {
      case "success":
        return "text-green-700";
      case "error":
        return "text-red-700";
      case "info":
      default:
        return "text-slate-600";
    }
  };

  const renderLastAction = (
    action: {
      status: "success" | "error" | "info";
      message: string;
      timestamp: string;
    } | null,
  ) => {
    if (!action) {
      return (
        <p className={`mt-1 text-xs ${subtle}`}>
          Last action: No action recorded yet.
        </p>
      );
    }

    return (
      <p className={`mt-1 text-xs ${getLastActionClassName(action.status)}`}>
        Last action: {action.message} ({formatTimestamp(action.timestamp)})
      </p>
    );
  };

  const renderRecoveryActions = (
    actions: IntelligenceRecoveryAction[],
  ) => {
    if (actions.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled || !action.onClick}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              action.disabled || !action.onClick
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const renderErrorRecoveryBlock = ({
    title,
    description,
    error,
    actions,
  }: {
    title: string;
    description: string;
    error: string;
    actions: IntelligenceRecoveryAction[];
  }) => (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">{title}</p>
      <p className="mt-1 text-sm text-red-700">{description}</p>
      <p className="mt-2 text-sm text-red-700">
        <span className="font-medium">Error:</span> {error}
      </p>
      {renderRecoveryActions(actions)}
    </div>
  );

  const sectionStates: IntelligenceSectionState[] = [
    aiInsightState,
    recommendationsState,
    matchesState,
  ];
  const readySectionCount = sectionStates.filter((state) => state === "ready").length;
  const errorSectionCount = sectionStates.filter((state) => state === "error").length;
  const loadingSectionCount = sectionStates.filter((state) => state === "loading").length;
  const emptySectionCount = sectionStates.filter((state) => state === "empty").length;

  const aiInsightMissing = !aiInsight && !aiInsightLoading;
  const recommendationsMissing = !recommendations && !recommendationsLoading;
  const matchesMissing = !matches && !matchesLoading;
  const formatTimestamp = (value: string | null): string => {
    if (!value) return "Never";
    return new Date(value).toLocaleString();
  };
  const guidancePanelClassName =
    "rounded-2xl border border-amber-200 bg-amber-50 p-4";
  const comingSoonButtonClass =
    "inline-flex items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm font-medium opacity-50 cursor-not-allowed";

  const showActionFeedback = (
    result: { success: boolean; message: string },
    mode: "success" | "error" | "info" = "info",
  ): void => {
    if (result.success) {
      setActionFeedback({
        type: mode === "error" ? "success" : mode,
        message: result.message,
      });
      return;
    }
    setActionFeedback({
      type: "error",
      message: result.message,
    });
  };

  const getActionFeedbackClassName = (
    type: "success" | "error" | "info",
  ): string => {
    switch (type) {
      case "success":
        return "border border-green-200 bg-green-50 text-green-700";
      case "error":
        return "border border-red-200 bg-red-50 text-red-700";
      case "info":
      default:
        return "border border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  // ACL: manual AI refresh handler for Intelligence page
  const handleRefreshAIInsight = async (): Promise<void> => {
    const result = await refreshAIInsight();
    showActionFeedback(result, result.success ? "success" : "error");
  };

  // ACL: manually load latest saved AI insight
  const handleLoadLatestAIInsight = async (): Promise<void> => {
    const result = await loadLatestAIInsight();
    showActionFeedback(result, result.success ? "info" : "error");
  };

  // ACL: manually load backend recommendations
  const handleLoadRecommendations = async (): Promise<void> => {
    const result = await loadRecommendations();
    showActionFeedback(result, result.success ? "info" : "error");
  };

  // ACL: manually generate fresh recommendations
  const handleRefreshRecommendations = async (): Promise<void> => {
    const result = await refreshRecommendations();
    showActionFeedback(result, result.success ? "success" : "error");
  };

  // ACL: manually load backend matches
  const handleLoadMatches = async (): Promise<void> => {
    const result = await loadMatches();
    showActionFeedback(result, result.success ? "success" : "error");
  };

  // ACL: refresh all dynamic intelligence sections together
  const handleRefreshIntelligence = async (): Promise<void> => {
    const result = await refreshIntelligence();
    showActionFeedback(result, result.success ? "info" : "error");
  };

  const aiInsightRecoveryActions: IntelligenceRecoveryAction[] = [];
  if (onboardingComplete !== true) {
    aiInsightRecoveryActions.push({
      id: "ai-complete-onboarding",
      label: "Complete onboarding",
      onClick: () => navigate("/onboarding"),
    });
  } else if (onboardingDataIsThin) {
    aiInsightRecoveryActions.push({
      id: "ai-improve-profile",
      label: "Improve profile data",
      onClick: () => navigate("/onboarding"),
    });
    aiInsightRecoveryActions.push({
      id: "ai-refresh",
      label: "Refresh AI insight",
      onClick: () => {
        void handleRefreshAIInsight();
      },
      disabled:
        aiInsightLoading
        || intelligenceRefreshing
        || aiReadinessLoading
        || aiReadiness === null
        || !profileInsightCanGenerate,
    });
  } else {
    aiInsightRecoveryActions.push({
      id: "ai-load-latest",
      label: "Load saved insight",
      onClick: () => {
        void handleLoadLatestAIInsight();
      },
      disabled: aiInsightLoading || intelligenceRefreshing,
    });
    aiInsightRecoveryActions.push({
      id: "ai-refresh",
      label: "Refresh AI insight",
      onClick: () => {
        void handleRefreshAIInsight();
      },
      disabled:
        aiInsightLoading
        || intelligenceRefreshing
        || aiReadinessLoading
        || aiReadiness === null
        || !profileInsightCanGenerate,
    });
  }

  const recommendationsRecoveryActions: IntelligenceRecoveryAction[] = [];
  if (onboardingComplete !== true) {
    recommendationsRecoveryActions.push({
      id: "recommendations-complete-onboarding",
      label: "Complete onboarding",
      onClick: () => navigate("/onboarding"),
    });
  } else if (skillsAreThin || goalsAreThin) {
    recommendationsRecoveryActions.push({
      id: "recommendations-improve-profile",
      label: "Add more skills and goals",
      onClick: () => navigate("/onboarding"),
    });
    recommendationsRecoveryActions.push({
      id: "recommendations-refresh",
      label: "Refresh recommendations",
      onClick: () => {
        void handleRefreshRecommendations();
      },
      disabled:
        recommendationsLoading
        || intelligenceRefreshing
        || aiReadinessLoading
        || aiReadiness === null
        || !recommendationsCanGenerate,
    });
  } else {
    recommendationsRecoveryActions.push({
      id: "recommendations-refresh",
      label: "Refresh recommendations",
      onClick: () => {
        void handleRefreshRecommendations();
      },
      disabled:
        recommendationsLoading
        || intelligenceRefreshing
        || aiReadinessLoading
        || aiReadiness === null
        || !recommendationsCanGenerate,
    });
    recommendationsRecoveryActions.push({
      id: "recommendations-refresh-all",
      label: "Refresh all intelligence",
      onClick: () => {
        void handleRefreshIntelligence();
      },
      disabled: intelligenceRefreshing,
    });
  }

  const matchesRecoveryActions: IntelligenceRecoveryAction[] = [];
  if (onboardingComplete !== true) {
    matchesRecoveryActions.push({
      id: "matches-complete-onboarding",
      label: "Complete onboarding",
      onClick: () => navigate("/onboarding"),
    });
  } else if (skillsAreThin || interestsAreThin) {
    matchesRecoveryActions.push({
      id: "matches-improve-profile",
      label: "Add more skills and interests",
      onClick: () => navigate("/onboarding"),
    });
    matchesRecoveryActions.push({
      id: "matches-load",
      label: "Load smart matches",
      onClick: () => {
        void handleLoadMatches();
      },
      disabled: matchesLoading || intelligenceRefreshing,
    });
  } else {
    matchesRecoveryActions.push({
      id: "matches-load",
      label: "Load smart matches",
      onClick: () => {
        void handleLoadMatches();
      },
      disabled: matchesLoading || intelligenceRefreshing,
    });
    matchesRecoveryActions.push({
      id: "matches-refresh-all",
      label: "Refresh all intelligence",
      onClick: () => {
        void handleRefreshIntelligence();
      },
      disabled: intelligenceRefreshing,
    });
  }

  const allSectionsEmpty =
    !aiInsight &&
    !recommendations &&
    !matches &&
    !aiInsightLoading &&
    !recommendationsLoading &&
    !matchesLoading;

  const aiInsightErrorRecoveryActions: IntelligenceRecoveryAction[] = [
    {
      id: "ai-retry-refresh",
      label: "Retry AI insight",
      onClick: () => {
        void handleRefreshAIInsight();
      },
      disabled:
        aiInsightLoading
        || intelligenceRefreshing
        || aiReadinessLoading
        || aiReadiness === null
        || !profileInsightCanGenerate,
    },
    {
      id: "ai-refresh-all",
      label: "Refresh all intelligence",
      onClick: () => {
        void handleRefreshIntelligence();
      },
      disabled: intelligenceRefreshing,
    },
  ];
  if (onboardingComplete === true) {
    aiInsightErrorRecoveryActions.unshift({
      id: "ai-load-saved-after-error",
      label: "Load saved insight",
      onClick: () => {
        void handleLoadLatestAIInsight();
      },
      disabled: aiInsightLoading || intelligenceRefreshing,
    });
  }

  const recommendationsErrorRecoveryActions: IntelligenceRecoveryAction[] = [
    {
      id: "recommendations-retry",
      label: "Retry recommendations",
      onClick: () => {
        void handleRefreshRecommendations();
      },
      disabled:
        recommendationsLoading
        || intelligenceRefreshing
        || aiReadinessLoading
        || aiReadiness === null
        || !recommendationsCanGenerate,
    },
    {
      id: "recommendations-refresh-all",
      label: "Refresh all intelligence",
      onClick: () => {
        void handleRefreshIntelligence();
      },
      disabled: intelligenceRefreshing,
    },
  ];

  const matchesErrorRecoveryActions: IntelligenceRecoveryAction[] = [
    {
      id: "matches-retry",
      label: "Retry smart matches",
      onClick: () => {
        void handleLoadMatches();
      },
      disabled: matchesLoading || intelligenceRefreshing,
    },
    {
      id: "matches-refresh-all",
      label: "Refresh all intelligence",
      onClick: () => {
        void handleRefreshIntelligence();
      },
      disabled: intelligenceRefreshing,
    },
  ];

  // ACL: bootstrap missing intelligence data once when page context is ready
  useEffect(() => {
    if (intelligenceBootstrapStarted.current) {
      return;
    }

    if (!user || profileLoading) {
      return;
    }

    intelligenceBootstrapStarted.current = true;

    const bootstrap = async (): Promise<void> => {
      const state = await loadAIState();
      await loadAIReadiness();

      const onboardingStatus = state?.onboarding.status;
      const isVerified = state?.onboarding.is_email_verified ?? true;
      const blocked =
        onboardingStatus === "blocked" || onboardingStatus === "incomplete_onboarding" || !isVerified;

      if (blocked) {
        return;
      }

      const profileInsightStatus = state?.profile_insight.status;
      const recommendationsStatus = state?.recommendations.status;
      const matchesStatus = state?.matches.status;

      if (aiInsightMissing && (profileInsightStatus === "ready" || profileInsightStatus === "empty" || !state)) {
        await loadLatestAIInsight();
      }

      if (
        recommendationsMissing
        && (recommendationsStatus === "ready" || recommendationsStatus === "empty" || !state)
      ) {
        await loadRecommendations();
      }

      if (matchesMissing && (matchesStatus === "ready" || matchesStatus === "empty" || !state)) {
        await loadMatches();
      }
    };

    void bootstrap();
  }, [
    user,
    profile,
    profileLoading,
    onboardingComplete,
    aiInsightMissing,
    recommendationsMissing,
    matchesMissing,
    loadAIState,
    loadAIReadiness,
    loadLatestAIInsight,
    loadRecommendations,
    loadMatches,
  ]);

  useEffect(() => {
    if (!user) {
      intelligenceBootstrapStarted.current = false;
      setActionFeedback(null);
    }
  }, [user]);

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, [actionFeedback]);

  // ACL: redirect users to the correct MVP flow based on readiness state
  useEffect(() => {
    if (profileLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [profileLoading, user, navigate]);

  if (notAuthenticated) {
    return (
      <DashboardShell>
        <PageHeader
          eyebrow="VisionTech Intelligence"
          title="Sign in to access your intelligence dashboard"
          description="Your personalised guidance, recommendations, and matching will appear here after authentication."
        />
      </DashboardShell>
    );
  }

  if (profileLoading) {
    return (
      <DashboardShell>
        <PageHeader
          eyebrow="VisionTech Intelligence"
          title="Loading your personalised guidance"
          description="Fetching your profile and recommendations."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="VisionTech Intelligence"
        title="Your personalised guidance and growth direction"
        description="Track pathway progress, understand next steps, and receive intelligent recommendations tailored to your saved goals and profile."
        actions={
          <>
            <button
              type="button"
              onClick={() => void handleRefreshIntelligence()}
              disabled={!pageReady || intelligenceRefreshing || aiReadinessLoading || refreshIntelligenceBlocked}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {intelligenceRefreshing ? "Refreshing..." : "Refresh Intelligence"}
            </button>
            <button
              type="button"
              disabled
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white opacity-50"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </button>
          </>
        }
      />

      <SummaryGrid items={stats} />
      <div className="mb-6 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-[var(--color-on-surface)]">System status</p>
            <p className={`mt-1 ${subtle}`}>
              {intelligenceLoading
                ? "Refreshing intelligence services..."
                : hasRecoverableSectionErrors
                  ? "Some intelligence services need recovery."
                  : intelligenceReady
                    ? "Intelligence services are active and responding."
                    : "Intelligence services are waiting for available backend data."}
            </p>
            <p className={`mt-1 text-xs ${subtle}`}>
              Last full refresh: {formatTimestamp(intelligenceUpdatedAt)}
            </p>
            {intelligenceLastAction ? (
              <p className={`mt-1 text-xs ${getLastActionClassName(intelligenceLastAction.status)}`}>
                Last refresh action: {intelligenceLastAction.message} ({formatTimestamp(intelligenceLastAction.timestamp)})
              </p>
            ) : (
              <p className={`mt-1 text-xs ${subtle}`}>
                Last refresh action: No refresh action recorded yet.
              </p>
            )}
            <p className={`mt-1 text-xs ${subtle}`}>
              Sections: {readySectionCount} ready, {loadingSectionCount} loading, {emptySectionCount} empty, {errorSectionCount} error.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
              AI Insight: {aiInsightLoading ? "Loading" : aiInsightError ? "Error" : aiInsight ? "Ready" : "Empty"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
              Recommendations: {recommendationsLoading ? "Loading" : recommendationsError ? "Error" : recommendations ? "Ready" : "Empty"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
              Matching: {matchesLoading ? "Loading" : matchesError ? "Error" : matches ? "Ready" : "Empty"}
            </span>
          </div>
        </div>
      </div>
      {aiStateLoading ? (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Checking intelligence readiness...
        </div>
      ) : null}
      {aiState?.onboarding.message && (onboardingBlockedByAIState || emailNotVerified) ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {aiState.onboarding.message}
        </div>
      ) : null}
      {aiReadinessError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {aiReadinessError}
        </div>
      ) : null}
      {aiStateError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {aiStateError}
        </div>
      ) : null}
      {hasRecoverableSectionErrors ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            Some intelligence sections need attention
          </p>
          <p className="mt-1 text-sm text-red-700">
            One or more intelligence requests failed. You can retry individual sections below or refresh all intelligence.
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                void handleRefreshIntelligence();
              }}
              disabled={intelligenceRefreshing}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                intelligenceRefreshing
                  ? "cursor-not-allowed bg-red-100 text-red-300"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              Refresh all intelligence
            </button>
          </div>
        </div>
      ) : null}
      {intelligenceRefreshing && (
        <div className="mb-6 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
          Refreshing your AI insight, recommendations, and matches...
        </div>
      )}
      {actionFeedback ? (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${getActionFeedbackClassName(actionFeedback.type)}`}
        >
          {actionFeedback.message}
        </div>
      ) : null}
      {shouldShowIntelligenceGuidance ? (
        <section className={`mb-6 ${guidancePanelClassName}`}>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Intelligence readiness guidance
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Your current profile data may limit the quality of insights, recommendations, or matching.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Readiness: {completedReadinessAreas}/3 profile areas strong enough for richer intelligence.
              </p>
            </div>

            <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700">
              {intelligenceGuidanceItems.map((item) => (
                <li key={item.id}>{item.message}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      {allSectionsEmpty && onboardingComplete === true ? (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800">
            Intelligence is ready to be generated
          </p>
          <p className="mt-1 text-sm text-blue-700">
            Your profile is available, but no intelligence has been loaded yet.
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                void handleRefreshIntelligence();
              }}
              disabled={intelligenceRefreshing}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                intelligenceRefreshing
                  ? "cursor-not-allowed bg-blue-100 text-blue-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Refresh all intelligence
            </button>
          </div>
        </div>
      ) : null}

      {/* Hero summary */}
      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-on-surface-variant)]">Current Focus</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--color-primary)]">{field}</h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--color-on-surface-variant)]">
                You are in the structured development stage. VisionTech is guiding you from skill awareness into practical readiness and stronger opportunity alignment.
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-5">
              <p className="text-sm text-[var(--color-on-surface-variant)]">Completion</p>
              <p className="mt-1 text-3xl font-bold text-[var(--color-on-surface)]">45%</p>
              <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">Keep building. Your next milestone is Cloud IAM.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[var(--color-on-surface-variant)]">Quick Summary</p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">Goal</p>
              <p className="mt-1 font-semibold text-[var(--color-primary)]">{summaryGoal}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">Next Task</p>
              <p className="mt-1 font-semibold text-[var(--color-on-surface)]">{summaryTask}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">Match Strength</p>
              <p className="mt-1 font-semibold text-[var(--color-on-surface)]">{matchStrength}</p>
            </div>
          </div>
        </div>
      </section>

        {/* Main content grid */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left and center content */}
          <div className="space-y-6 xl:col-span-2">
            {/* Pathway section */}
            <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${subtle}`}>Intelligent Pathway</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Your guided journey</h3>
                </div>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] opacity-50"
                >
                  View full pathway
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {pathwaySteps.map((step, index) => (
                  <div key={step.id} className="relative rounded-2xl border border-[var(--color-outline-variant)] p-4">
                    {index !== pathwaySteps.length - 1 && <div className="absolute left-7 top-14 h-10 w-px bg-[var(--color-outline-variant)]" />}
                    <div className="flex gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white bg-[var(--color-primary)]">
                        {step.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : step.status === "active" ? <Clock3 className="h-4 w-4" /> : <span className="text-xs font-bold">{step.id}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="font-semibold text-[var(--color-on-surface)]">{step.title}</h4>
                            <p className={`mt-1 text-sm ${subtle}`}>{step.description}</p>
                          </div>
                          <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles(step.status)}`}>{step.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI insights */}
            <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className={`text-sm font-semibold ${subtle}`}>AI Insights</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Personalised growth guidance</h3>
                  <p className={`mt-2 text-sm ${subtle}`}>
                    {aiInsight
                      ? "Generated from your latest onboarding profile."
                      : aiInsightLoading
                        ? "Generating AI insight from your saved profile."
                        : aiInsightError
                          ? "AI insight unavailable right now."
                          : onboardingComplete !== true
                            ? "Complete onboarding to unlock personalised insights."
                            : onboardingReadyForIntelligence
                              ? "AI insight is ready to generate from your profile."
                              : "AI insight quality may be limited until onboarding data is stronger."}
                  </p>
                  <p className={`mt-2 text-xs ${subtle}`}>
                    Last updated: {formatTimestamp(aiInsightUpdatedAt)}
                  </p>
                  <p className={`mt-1 text-xs ${subtle}`}>
                    Source: {getAIInsightSourceLabel(aiInsightSource)}
                  </p>
                  {aiInsight && aiInsightIsCached && (
                    <p className={`mt-1 text-xs ${subtle}`}>
                      Using cached data
                    </p>
                  )}
                  {(skillsAreThin || interestsAreThin || goalsAreThin) && (
                    <p className={`mt-1 text-xs ${subtle}`}>
                      Insight quality may be limited until your skills, interests, and goals are more complete.
                    </p>
                  )}
                  {renderLastAction(aiInsightLastAction)}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {aiInsight ? renderAIInsightSourceBadge(aiInsightSource) : null}
                  {aiInsight ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getConfidenceClass(aiConfidence)}`}
                    >
                      {getConfidenceLabel(aiConfidence)}
                    </span>
                  ) : null}
                  {renderSectionBadge(aiInsightState)}
                  <div className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    {aiStatusLabel}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRefreshAIInsight()}
                    disabled={
                      aiInsightLoading
                      || intelligenceRefreshing
                      || aiReadinessLoading
                      || aiReadiness === null
                      || !profileInsightCanGenerate
                    }
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {aiInsightLoading ? "Refreshing..." : "Refresh AI Insight"}
                  </button>
                </div>
              </div>
              {!profileInsightCanGenerate && profileInsightReadinessMessage ? (
                <p className={`mb-4 text-xs ${subtle}`}>
                  {profileInsightReadinessMessage} ({profileInsightReadinessStatus ?? "blocked"})
                </p>
              ) : null}

              {aiInsightLoading ? (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Generating your personalised insight from your saved profile...
                </div>
              ) : aiInsight ? (
                <div className="space-y-5">
                  <p className={`mt-1 text-xs ${subtle}`}>
                    {aiConfidence === "high"
                      ? "Your profile data is strong, so this insight is highly personalised."
                      : aiConfidence === "medium"
                        ? "This insight is based on limited data. Adding more details will improve accuracy."
                        : "This insight has low confidence due to limited profile data."}
                  </p>
                  <p className={`mb-3 text-xs ${subtle}`}>
                    {aiInsightSource === "fresh"
                      ? "This insight was generated during your current session."
                      : aiInsightSource === "saved"
                        ? "This insight was retrieved from your saved intelligence data."
                        : "Source information is not available."}
                  </p>
                  <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                    <div className="mb-2 inline-flex rounded-xl bg-[var(--color-surface-container-lowest)] p-2">
                      <Sparkles className="h-4 w-4 text-[var(--color-on-surface)]" />
                    </div>
                    <h4 className="font-semibold text-[var(--color-primary)]">Profile summary</h4>
                    <p className={`mt-2 text-sm leading-6 ${subtle}`}>{aiInsight.summary}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                      <p className="text-sm font-semibold text-[var(--color-on-surface)]">Skill gaps</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {aiInsight.skill_gaps.map((gap, idx) => (
                          <span key={idx} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[var(--color-on-surface-variant)]">
                            {gap}
                          </span>
                        ))}
                        {aiInsight.skill_gaps.length === 0 && (
                          <span className={`text-sm ${subtle}`}>No gaps detected</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                      <p className="text-sm font-semibold text-[var(--color-on-surface)]">Next steps</p>
                      <ul className="mt-3 space-y-2 text-sm text-[var(--color-on-surface-variant)]">
                        {aiInsight.next_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                            <span>{step}</span>
                          </li>
                        ))}
                        {aiInsight.next_steps.length === 0 && <li className={subtle}>Next steps will appear here</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : aiInsightError ? (
                renderErrorRecoveryBlock({
                  title: "AI insight could not be loaded",
                  description:
                    onboardingComplete !== true
                      ? "Complete onboarding first, then retry AI insight generation."
                      : onboardingDataIsThin
                        ? "Your current profile data may limit AI insight quality, but you can still retry now."
                        : "The AI insight request did not complete successfully. You can retry this section or refresh all intelligence.",
                  error: aiInsightError,
                  actions: aiInsightErrorRecoveryActions,
                })
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-800">
                      AI insight is not available yet.
                    </p>
                    <p className={`mt-1 text-sm ${subtle}`}>
                      {onboardingComplete !== true
                        ? "Complete onboarding to unlock AI-generated insight."
                        : onboardingDataIsThin
                          ? "Your profile data is still too limited for stronger AI insight generation."
                          : "You can retrieve the latest saved insight or generate a fresh one now."}
                    </p>
                    {renderRecoveryActions(aiInsightRecoveryActions)}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {insights.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                        <div className="mb-3 inline-flex rounded-xl bg-[var(--color-surface-container-lowest)] p-2">
                          <Sparkles className="h-4 w-4 text-[var(--color-on-surface)]" />
                        </div>
                        <h4 className="font-semibold text-[var(--color-primary)]">{item.title}</h4>
                        <p className={`mt-2 text-sm leading-6 ${subtle}`}>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations section */}
            <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${subtle}`}>Recommendations</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Suggested pathways and next steps</h3>
                  <p className={`mt-2 text-sm ${subtle}`}>
                    Practical recommendations aligned with your saved profile and AI guidance.
                  </p>
                  <p className={`mt-2 text-xs ${subtle}`}>
                    Last updated: {formatTimestamp(recommendationsUpdatedAt)}
                  </p>
                  {(skillsAreThin || goalsAreThin) && (
                    <p className={`mt-1 text-xs ${subtle}`}>
                      Recommendations improve when your profile includes enough skills and goals.
                    </p>
                  )}
                  {!recommendationsCanGenerate && recommendationsReadinessMessage ? (
                    <p className={`mt-1 text-xs ${subtle}`}>
                      {recommendationsReadinessMessage} ({recommendationsReadinessStatus ?? "blocked"})
                    </p>
                  ) : null}
                  {renderLastAction(recommendationsLastAction)}
                </div>
                <div className="shrink-0">
                  {renderSectionBadge(recommendationsState)}
                </div>
              </div>

              {recommendationsLoading ? (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Loading recommendations...
                </div>
              ) : recommendations ? (
                hasRecommendationData ? (
                  <div className="space-y-6">
                    {!hasStructuredRecommendationFields && hasFilteredCompletedRecommendations && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        Completed tasks were excluded from this list.
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-[var(--color-primary)]">Recommended Resources</h4>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        {recommendationResources.map((item) => (
                          <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{item.title}</p>
                            <p className={`mt-1 text-xs ${subtle}`}>
                              {item.type} - {item.level}
                            </p>
                            <p className={`mt-3 text-sm ${subtle}`}>{item.reason}</p>
                          </div>
                        ))}
                        {recommendationResources.length === 0 && (
                          <p className={`text-sm ${subtle}`}>No resource recommendations available yet.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[var(--color-primary)]">Recommended Projects</h4>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        {recommendationProjects.map((item) => (
                          <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{item.title}</p>
                            <p className={`mt-1 text-xs ${subtle}`}>
                              {item.type} - {item.level}
                            </p>
                            {item.badges && item.badges.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.badges.map((badge) => (
                                  <span
                                    key={`${item.id}-${badge}`}
                                    className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
                                  >
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            <p className={`mt-3 text-sm ${subtle}`}>{item.reason}</p>
                          </div>
                        ))}
                        {recommendationProjects.length === 0 && (
                          <p className={`text-sm ${subtle}`}>No project recommendations available yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                    No recommendations are available yet for your current saved profile.
                  </div>
                )
              ) : recommendationsError ? (
                renderErrorRecoveryBlock({
                  title: "Recommendations could not be loaded",
                  description:
                    onboardingComplete !== true
                      ? "Complete onboarding first, then retry recommendations."
                      : skillsAreThin || goalsAreThin
                        ? "Your current profile may be too limited for stronger recommendation results, but you can retry now."
                        : "The recommendations request failed. Retry this section or refresh all intelligence.",
                  error: recommendationsError,
                  actions: recommendationsErrorRecoveryActions,
                })
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">
                    Recommendations are not available yet.
                  </p>
                  <p className={`mt-1 text-sm ${subtle}`}>
                    {onboardingComplete !== true
                      ? "Complete onboarding to unlock recommendations."
                      : skillsAreThin || goalsAreThin
                        ? "Recommendations work better when your profile includes enough skills and goals."
                        : "You can load recommendations now using your current intelligence profile."}
                  </p>
                  {renderRecoveryActions(recommendationsRecoveryActions)}
                </div>
              )}
            </div>

            {/* Match section */}
            <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${subtle}`}>Smart Matching</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">People and collaboration fits</h3>
                  <p className={`mt-2 text-sm ${subtle}`}>
                    {matchesLoading
                      ? "Loading backend-driven matches..."
                      : hasRealMatches
                        ? "Matches aligned with your saved profile."
                        : matchesError
                          ? "Matching is unavailable right now."
                          : !matches
                            ? "No smart matches have been loaded yet."
                            : "No matches are available yet for your current profile."}
                  </p>
                  <p className={`mt-2 text-xs ${subtle}`}>
                    Last updated: {formatTimestamp(matchesUpdatedAt)}
                  </p>
                  {(skillsAreThin || interestsAreThin) && (
                    <p className={`mt-1 text-xs ${subtle}`}>
                      Smart matching works better when both skills and interests are well defined.
                    </p>
                  )}
                  {renderLastAction(matchesLastAction)}
                </div>
                <div className="flex items-center gap-3">
                  {renderSectionBadge(matchesState)}
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] opacity-50"
                  >
                    Explore all matches
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
              {matchesLoading ? (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Loading matches...
                </div>
              ) : matchesError ? (
                renderErrorRecoveryBlock({
                  title: "Smart matches could not be loaded",
                  description:
                    onboardingComplete !== true
                      ? "Complete onboarding first, then retry smart matching."
                      : skillsAreThin || interestsAreThin
                        ? "Your current profile may not yet be rich enough for stronger matching, but you can retry now."
                        : "The smart matching request failed. Retry this section or refresh all intelligence.",
                  error: matchesError,
                  actions: matchesErrorRecoveryActions,
                })
              ) : displayMatches.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {displayMatches.map((match) => (
                    <div key={match.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-[var(--color-on-surface)]">{match.name}</h4>
                          <p className={`mt-1 text-sm ${subtle}`}>{match.role}</p>
                        </div>
                        <div className="rounded-xl px-3 py-2 text-sm font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                          {match.matchScore}%
                        </div>
                      </div>
                      <p className={`mt-4 text-sm ${subtle}`}>{match.reason}</p>
                      <button
                        type="button"
                        disabled
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white opacity-50"
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">
                    Smart matches are not available yet.
                  </p>
                  <p className={`mt-1 text-sm ${subtle}`}>
                    {!matches
                      ? onboardingComplete !== true
                        ? "Complete onboarding to unlock smart matching."
                        : skillsAreThin || interestsAreThin
                          ? "Matching improves when your skills and interests are more complete."
                          : "You can load smart matches from your current profile intelligence."
                      : "No collaborator or opportunity matches are available yet."}
                  </p>
                  {!matches ? renderRecoveryActions(matchesRecoveryActions) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar content */}
          <aside className="space-y-6">
            {/* Quick actions */}
            <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <p className={`text-sm font-semibold ${subtle}`}>Quick Actions</p>
              <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Move faster</h3>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Start learning task", icon: BookOpen },
                  { label: "Open project workspace", icon: FolderKanban },
                  { label: "View opportunities", icon: Briefcase },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    disabled
                    className={`${comingSoonButtonClass} w-full justify-between text-left`}
                  >
                    <span className="flex items-center gap-3 text-[var(--color-primary)]">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--color-on-surface-variant)]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Activity timeline */}
            <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <p className={`text-sm font-semibold ${subtle}`}>Recent Activity</p>
              <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Your momentum</h3>
              <div className="mt-5 space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="pt-2">
                      <span className={`block h-3 w-3 rounded-full ${activityDot(activity.status)}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-on-surface)]">{activity.title}</p>
                      <p className={`mt-1 text-xs ${subtle}`}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity readiness box */}
            <div className="rounded-3xl p-6 text-white shadow-sm bg-[var(--color-primary)]">
              <p className="text-sm font-semibold text-white/80">VisionTech Signal</p>
              <h3 className="mt-1 text-xl font-bold">Opportunity readiness is improving</h3>
              <p className="mt-3 text-sm leading-6 text-white/90">
                Based on your current pathway activity and skills alignment, your profile is becoming more attractive for future collaboration and role-based opportunities.
              </p>
              <button
                type="button"
                disabled
                className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-[var(--color-primary)] opacity-50"
              >
                View readiness details
              </button>
            </div>
          </aside>
        </section>
    </DashboardShell>
  );
}


