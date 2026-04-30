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
import { type SummaryItem } from "../components/dashboard/SummaryGrid";
import { useAuth } from "../context/AuthContext";
import { testAIBackendCall } from "../services/aiService";
import type { CreateCustomPathwayPayload } from "../types/ai";
import {
  createLearningProgress,
  getLearningProgress,
  updateLearningProgress,
} from "../services/learning";
import type { LearningProgressItem, LearningStatus } from "../types/learning";
import {
  createUserProject,
  deleteUserProject,
  getUserProjects,
  updateUserProject,
} from "../services/projects";
import type { ProjectStatus, UserProject } from "../types/projects";

type PathwayStep = {
  id: string;
  title: string;
  description: string;
  status: "completed" | "active" | "locked";
};

type ActivityItem = {
  id: string;
  title: string;
  time: string;
  status: "done" | "in-progress" | "upcoming" | "error";
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
type CustomPathwayFormState = CreateCustomPathwayPayload;
type ProjectFormState = {
  title: string;
  description: string;
  category: string;
  skills_used: string;
  github_url: string;
  demo_url: string;
  documentation_url: string;
};

function buildStats({
  pathwayProgressPercent,
  skillsCount,
  activeMatchesCount,
  aiNextStepCount,
}: {
  pathwayProgressPercent: number;
  skillsCount: number | null;
  activeMatchesCount: number;
  aiNextStepCount: number | null;
}): SummaryItem[] {
  return [
    {
      title: "Pathway Progress",
      value: `${pathwayProgressPercent}%`,
      note:
        pathwayProgressPercent >= 80
          ? "Strong momentum across intelligence sections"
          : "Progress reflects current readiness and loaded intelligence data",
      icon: TrendingUp,
    },
    {
      title: "Skills Identified",
      value: skillsCount !== null ? String(skillsCount) : "-",
      note: skillsCount !== null ? "Captured from onboarding" : "Add skills in onboarding to unlock precision",
      icon: Target,
    },
    {
      title: "Active Matches",
      value: String(activeMatchesCount),
      note:
        activeMatchesCount > 0
          ? "Potential collaborators and mentors"
          : "Load matching data to reveal active opportunities",
      icon: Users,
    },
    {
      title: "AI Insights",
      value: aiNextStepCount !== null ? String(aiNextStepCount) : "-",
      note: aiNextStepCount !== null ? "AI next steps currently available" : "Complete onboarding to see insights",
      icon: Lightbulb,
    },
  ];
}

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
  if (status === "error") return "bg-red-500";
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

function formatRelativeTime(value: string): string {
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return "Recently";
  const deltaMinutes = Math.max(0, Math.floor((Date.now() - target) / 60000));
  if (deltaMinutes < 1) return "Just now";
  if (deltaMinutes < 60) return `${deltaMinutes} minute${deltaMinutes === 1 ? "" : "s"} ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours} hour${deltaHours === 1 ? "" : "s"} ago`;
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays} day${deltaDays === 1 ? "" : "s"} ago`;
}

function getStateScore(state: IntelligenceSectionState): number {
  if (state === "ready") return 100;
  if (state === "loading") return 55;
  if (state === "error") return 20;
  return 35;
}

function renderMiniBarChart({
  values,
  colorClassName,
}: {
  values: number[];
  colorClassName: string;
}): JSX.Element {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-16 items-end gap-1">
      {values.map((value, index) => (
        <div key={`${index}-${value}`} className="flex-1 rounded-t-sm bg-slate-200/70">
          <div
            className={`w-full rounded-t-sm ${colorClassName}`}
            style={{ height: `${Math.max(8, (value / max) * 64)}px` }}
          />
        </div>
      ))}
    </div>
  );
}

function renderWaveChart({
  values,
  stroke,
  fill,
}: {
  values: number[];
  stroke: string;
  fill: string;
}): JSX.Element {
  if (values.length === 0) {
    return (
      <div className="h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50" />
    );
  }
  const width = 220;
  const height = 64;
  const max = Math.max(1, ...values);
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full overflow-visible rounded-xl">
      <polygon points={areaPoints} fill={fill} />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

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
    customPathways,
    customPathwaysLoading,
    customPathwaysError,
    customPathwaysUpdatedAt,
    loadCustomPathways,
    createCustomPathway,
    updateCustomPathway,
    archiveCustomPathway,
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
  const [showCustomPathwayForm, setShowCustomPathwayForm] = useState(false);
  const [editingCustomPathwayId, setEditingCustomPathwayId] = useState<string | null>(null);
  const [learningItems, setLearningItems] = useState<LearningProgressItem[]>([]);
  const [learningLoading, setLearningLoading] = useState(false);
  const [learningError, setLearningError] = useState<string | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    title: "",
    description: "",
    category: "",
    skills_used: "",
    github_url: "",
    demo_url: "",
    documentation_url: "",
  });
  const [customPathwayForm, setCustomPathwayForm] = useState<CustomPathwayFormState>({
    title: "",
    description: "",
    desired_outcome: "",
    current_skill_level: "",
    reason_for_interest: "",
  });
  // ACL: ensure intelligence bootstrap runs once per stable page mount context
  const intelligenceBootstrapStarted = useRef(false);

  const field = profile?.fieldOfInterest || "Cloud Security Pathway";
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
  const learningSummary = useMemo(() => {
    const tracked = learningItems.length;
    const completed = learningItems.filter((item) => item.status === "completed").length;
    const inProgress = learningItems.filter((item) => item.status === "in_progress").length;
    const completionRate = tracked > 0 ? Math.round((completed / tracked) * 100) : 0;
    return { tracked, completed, inProgress, completionRate };
  }, [learningItems]);
  const projectSummary = useMemo(() => {
    const tracked = projects.length;
    const completed = projects.filter((project) => project.status === "completed").length;
    const inProgress = projects.filter((project) => project.status === "in_progress").length;
    const appliedSkills = new Set(projects.flatMap((project) => project.skills_used)).size;
    return { tracked, completed, inProgress, appliedSkills };
  }, [projects]);

  const displayMatches = useMemo(() => {
    if (matches?.matches) {
      return matches.matches.map((match) => ({
        id: match.user_id,
        name: match.name,
        matchScore: match.match_score,
        sharedSkills: match.shared_skills ?? [],
        sharedInterests: match.shared_interests ?? [],
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

  const dynamicPathwaySteps = useMemo<PathwayStep[]>(() => {
    const recommendationItems = recommendations?.recommendations ?? [];
    if (recommendationItems.length === 0) {
      return [];
    }

    return recommendationItems.slice(0, 4).map((item, index) => {
      let status: PathwayStep["status"] = "locked";
      if (item.action_state?.completed || isCompletedRecommendationItem(item)) {
        status = "completed";
      } else if (item.action_state?.started || item.action_state?.clicked || index === 0) {
        status = "active";
      }

      return {
        id: item.pathway_id || `pathway-${index}`,
        title: item.title || `Pathway ${index + 1}`,
        description:
          item.match_reason || item.summary || "Recommended pathway based on your current profile data.",
        status,
      };
    });
  }, [recommendations]);

  const recentActivities = useMemo<ActivityItem[]>(() => {
    const entries = [
      {
        id: "ai-insight-action",
        action: aiInsightLastAction,
      },
      {
        id: "recommendations-action",
        action: recommendationsLastAction,
      },
      {
        id: "matches-action",
        action: matchesLastAction,
      },
      {
        id: "refresh-action",
        action: intelligenceLastAction,
      },
    ]
      .filter((entry): entry is { id: string; action: NonNullable<typeof aiInsightLastAction> } => Boolean(entry.action))
      .map((entry) => {
        const status: ActivityItem["status"] =
          entry.action.status === "success"
            ? "done"
            : entry.action.status === "error"
              ? "error"
              : "in-progress";
        return {
          id: entry.id,
          title: entry.action.message,
          time: formatRelativeTime(entry.action.timestamp),
          status,
          timestamp: new Date(entry.action.timestamp).getTime(),
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(({ timestamp: _timestamp, ...rest }) => rest);

    return entries;
  }, [aiInsightLastAction, recommendationsLastAction, matchesLastAction, intelligenceLastAction]);

  const completionPercent = useMemo(() => {
    let score = 0;
    if (onboardingComplete === true) score += 40;
    if (insightReady) score += 20;
    if (recommendationsReady) score += 20;
    if (matchesReady) score += 20;
    return score;
  }, [onboardingComplete, insightReady, recommendationsReady, matchesReady]);

  const activePathwayTitle =
    dynamicPathwaySteps.find((step) => step.status === "active")?.title ?? null;

  const completionMessage =
    completionPercent >= 80
      ? "Strong momentum across your intelligence profile."
      : activePathwayTitle
        ? `Keep building. Your next milestone is ${activePathwayTitle}.`
        : "Keep building. Load recommendations to reveal your next milestone.";

  const pathwayStatusDistribution = useMemo(() => {
    const distribution = { completed: 0, active: 0, locked: 0 };
    dynamicPathwaySteps.forEach((step) => {
      distribution[step.status] += 1;
    });
    return distribution;
  }, [dynamicPathwaySteps]);

  const recommendationComposition = useMemo(
    () => ({
      resources: recommendationResources.length,
      projects: recommendationProjects.length,
    }),
    [recommendationResources.length, recommendationProjects.length],
  );

  const customPathwayStatusDistribution = useMemo(() => {
    const counts = { private: 0, pending_review: 0, approved: 0, rejected: 0 };
    customPathways.forEach((pathway) => {
      if (pathway.status in counts) {
        counts[pathway.status as keyof typeof counts] += 1;
      }
    });
    return counts;
  }, [customPathways]);

  const matchScoreTrend = useMemo(
    () => displayMatches.slice(0, 6).map((match) => match.matchScore),
    [displayMatches],
  );
  const recommendationWaveValues = useMemo(
    () => [
      recommendationComposition.resources,
      recommendationComposition.projects,
      recommendations?.recommendations.length ?? 0,
    ],
    [recommendationComposition.resources, recommendationComposition.projects, recommendations],
  );
  const aiConfidenceScore = aiConfidence === "high" ? 100 : aiConfidence === "medium" ? 60 : 30;
  const aiInsightWaveValues = useMemo(
    () =>
      aiInsight
        ? [aiInsight.skill_gaps.length, aiInsight.next_steps.length, aiConfidenceScore]
        : [],
    [aiInsight, aiConfidenceScore],
  );

  const stats = useMemo(
    () =>
      buildStats({
        pathwayProgressPercent: completionPercent,
        skillsCount,
        activeMatchesCount: displayMatches.length,
        aiNextStepCount: aiInsight ? aiInsight.next_steps.length : null,
      }),
    [completionPercent, skillsCount, displayMatches.length, aiInsight],
  );

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
  const overallHealthScore = Math.round(
    (getStateScore(aiInsightState) + getStateScore(recommendationsState) + getStateScore(matchesState)) / 3,
  );
  const readinessTrend = [
    {
      id: "ai",
      label: "AI Insight",
      score: getStateScore(aiInsightState),
      state: aiInsightState,
    },
    {
      id: "recommendations",
      label: "Recommendations",
      score: getStateScore(recommendationsState),
      state: recommendationsState,
    },
    {
      id: "matching",
      label: "Smart Matching",
      score: getStateScore(matchesState),
      state: matchesState,
    },
  ];
  const profileDepthSignals = [
    {
      id: "skills",
      label: "Skills",
      value: profileSkills.length,
      target: minimumSkillsForStrongInsight,
      tone: "bg-sky-500",
    },
    {
      id: "interests",
      label: "Interests",
      value: profileInterests.length,
      target: minimumInterestsForStrongInsight,
      tone: "bg-violet-500",
    },
    {
      id: "goals",
      label: "Goals",
      value: profileGoals.length,
      target: minimumGoalsForStrongInsight,
      tone: "bg-emerald-500",
    },
  ];

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

  // ACL: smoke test backend AI provider connectivity via /ai/readiness
  const handleTestAIConnection = async (): Promise<void> => {
    try {
      const data = await testAIBackendCall("Explain VisionTech in one sentence");
      const output =
        typeof data?.message === "string"
          ? data.message
          : typeof data?.output === "string"
            ? data.output
            : "AI test call succeeded.";
      setActionFeedback({
        type: "success",
        message: `AI connection test succeeded: ${output}`,
      });
      // Keep full payload available for quick debugging
      console.log("AI test response:", data);
    } catch (error) {
      setActionFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "AI test call failed.",
      });
    }
  };

  const resetCustomPathwayForm = (): void => {
    setCustomPathwayForm({
      title: "",
      description: "",
      desired_outcome: "",
      current_skill_level: "",
      reason_for_interest: "",
    });
    setEditingCustomPathwayId(null);
    setShowCustomPathwayForm(false);
  };

  const handleLoadCustomPathways = async (): Promise<void> => {
    const result = await loadCustomPathways();
    showActionFeedback(result, result.success ? "info" : "error");
  };

  const handleCustomPathwayFieldChange = (
    field: keyof CustomPathwayFormState,
    value: string,
  ): void => {
    setCustomPathwayForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStartEditingCustomPathway = (pathway: {
    id: string;
    title: string;
    description: string;
    desired_outcome: string;
    current_skill_level: string;
    reason_for_interest: string;
  }): void => {
    setEditingCustomPathwayId(pathway.id);
    setShowCustomPathwayForm(true);
    setCustomPathwayForm({
      title: pathway.title,
      description: pathway.description,
      desired_outcome: pathway.desired_outcome,
      current_skill_level: pathway.current_skill_level,
      reason_for_interest: pathway.reason_for_interest,
    });
  };

  const handleSubmitCustomPathway = async (): Promise<void> => {
    const payload: CreateCustomPathwayPayload = {
      title: customPathwayForm.title.trim(),
      description: customPathwayForm.description.trim(),
      desired_outcome: customPathwayForm.desired_outcome.trim(),
      current_skill_level: customPathwayForm.current_skill_level.trim(),
      reason_for_interest: customPathwayForm.reason_for_interest.trim(),
    };

    if (
      !payload.title
      || !payload.description
      || !payload.desired_outcome
      || !payload.current_skill_level
      || !payload.reason_for_interest
    ) {
      setActionFeedback({
        type: "error",
        message: "Please complete all custom pathway fields before submitting.",
      });
      return;
    }

    const result = editingCustomPathwayId
      ? await updateCustomPathway(editingCustomPathwayId, payload)
      : await createCustomPathway(payload);

    showActionFeedback(result, result.success ? "success" : "error");

    if (result.success) {
      resetCustomPathwayForm();
    }
  };

  const handleArchiveCustomPathway = async (customPathwayId: string): Promise<void> => {
    const result = await archiveCustomPathway(customPathwayId);
    showActionFeedback(result, result.success ? "info" : "error");
  };

  const loadLearningTracker = async (): Promise<void> => {
    setLearningLoading(true);
    setLearningError(null);
    try {
      const response = await getLearningProgress();
      setLearningItems(response.items ?? []);
    } catch (error) {
      setLearningError(error instanceof Error ? error.message : "Learning progress could not be loaded.");
    } finally {
      setLearningLoading(false);
    }
  };

  const trackRecommendation = async (item: RecommendationCard): Promise<void> => {
    const alreadyTracked = learningItems.some(
      (learningItem) => learningItem.title.trim().toLowerCase() === item.title.trim().toLowerCase(),
    );
    if (alreadyTracked) {
      setActionFeedback({
        type: "info",
        message: `"${item.title}" is already in your learning tracker.`,
      });
      return;
    }

    try {
      const created = await createLearningProgress({
        title: item.title,
        platform: item.type,
        resource_url: "",
      });
      setLearningItems((current) => [created, ...current]);
      setActionFeedback({
        type: "success",
        message: `"${item.title}" was added to your learning tracker.`,
      });
    } catch (error) {
      setActionFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to track this learning resource.",
      });
    }
  };

  const updateLearningItem = async (
    id: string,
    payload: { status?: LearningStatus; progress_percent?: number },
  ): Promise<void> => {
    try {
      const updated = await updateLearningProgress(id, payload);
      setLearningItems((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (error) {
      setActionFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update learning progress.",
      });
    }
  };

  const incrementLearningProgress = async (item: LearningProgressItem): Promise<void> => {
    const nextPercent = Math.min(100, item.progress_percent + 10);
    const nextStatus: LearningStatus =
      nextPercent >= 100 ? "completed" : nextPercent > 0 ? "in_progress" : "not_started";
    await updateLearningItem(item.id, {
      progress_percent: nextPercent,
      status: nextStatus,
    });
  };

  const markLearningComplete = async (item: LearningProgressItem): Promise<void> => {
    await updateLearningItem(item.id, { status: "completed", progress_percent: 100 });
  };

  const loadProjects = async (): Promise<void> => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const response = await getUserProjects();
      setProjects(response.items ?? []);
    } catch (error) {
      setProjectsError(error instanceof Error ? error.message : "Projects could not be loaded.");
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleProjectFieldChange = (field: keyof ProjectFormState, value: string): void => {
    setProjectForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetProjectForm = (): void => {
    setProjectForm({
      title: "",
      description: "",
      category: "",
      skills_used: "",
      github_url: "",
      demo_url: "",
      documentation_url: "",
    });
    setShowProjectForm(false);
  };

  const handleCreateProject = async (): Promise<void> => {
    const title = projectForm.title.trim();
    const description = projectForm.description.trim();
    const category = projectForm.category.trim();
    const skillsUsed = projectForm.skills_used
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!title || !description || !category || skillsUsed.length === 0) {
      setActionFeedback({
        type: "error",
        message: "Please provide title, description, category, and at least one skill.",
      });
      return;
    }

    try {
      const created = await createUserProject({
        title,
        description,
        category,
        skills_used: skillsUsed,
        github_url: projectForm.github_url.trim() || undefined,
        demo_url: projectForm.demo_url.trim() || undefined,
        documentation_url: projectForm.documentation_url.trim() || undefined,
      });
      setProjects((current) => [created, ...current]);
      setActionFeedback({
        type: "success",
        message: "Project added successfully.",
      });
      resetProjectForm();
    } catch (error) {
      setActionFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to create project.",
      });
    }
  };

  const handleUpdateProject = async (
    id: string,
    payload: {
      status?: ProjectStatus;
      progress_percent?: number;
    },
  ): Promise<void> => {
    try {
      const updated = await updateUserProject(id, payload);
      setProjects((current) =>
        current.map((project) => (project.id === id ? updated : project)),
      );
    } catch (error) {
      setActionFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update project.",
      });
    }
  };

  const handleIncrementProjectProgress = async (project: UserProject): Promise<void> => {
    // TODO: Replace manual increments with automatic sync once external project links are accessible.
    const nextPercent = Math.min(100, project.progress_percent + 10);
    const nextStatus: ProjectStatus =
      nextPercent >= 100 ? "completed" : nextPercent > 0 ? "in_progress" : "idea";
    await handleUpdateProject(project.id, {
      progress_percent: nextPercent,
      status: nextStatus,
    });
  };

  const handleCompleteProject = async (project: UserProject): Promise<void> => {
    await handleUpdateProject(project.id, {
      status: "completed",
      progress_percent: 100,
    });
  };

  const handleDeleteProject = async (projectId: string): Promise<void> => {
    try {
      await deleteUserProject(projectId);
      setProjects((current) => current.filter((project) => project.id !== projectId));
      setActionFeedback({
        type: "info",
        message: "Project removed from tracker.",
      });
    } catch (error) {
      setActionFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to remove project.",
      });
    }
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
    recommendationsRecoveryActions.push({
      id: "recommendations-custom-pathway",
      label: "Other (Custom)",
      onClick: () => {
        setShowCustomPathwayForm(true);
        setEditingCustomPathwayId(null);
      },
      disabled: customPathwaysLoading || intelligenceRefreshing,
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
    recommendationsRecoveryActions.push({
      id: "recommendations-custom-pathway",
      label: "Other (Custom)",
      onClick: () => {
        setShowCustomPathwayForm(true);
        setEditingCustomPathwayId(null);
      },
      disabled: customPathwaysLoading || intelligenceRefreshing,
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

      await loadLearningTracker();
      await loadProjects();
      await loadCustomPathways();
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
    loadLearningTracker,
    loadProjects,
    loadCustomPathways,
  ]);

  useEffect(() => {
    if (!user) {
      intelligenceBootstrapStarted.current = false;
      setActionFeedback(null);
      resetCustomPathwayForm();
      setLearningItems([]);
      setLearningError(null);
      setProjects([]);
      setProjectsError(null);
      resetProjectForm();
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
      <section className="mb-6 overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-indigo-100 via-fuchsia-50 to-cyan-50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
              VisionTech Intelligence
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
              Your personalised guidance and growth direction
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-indigo-950/75">
              Track pathway progress, understand next steps, and receive intelligent recommendations tailored to your saved goals and profile.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleRefreshIntelligence()}
              disabled={!pageReady || intelligenceRefreshing || aiReadinessLoading || refreshIntelligenceBlocked}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-indigo-300 bg-white px-4 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {intelligenceRefreshing ? "Refreshing..." : "Refresh Intelligence"}
            </button>
            <button
              type="button"
              onClick={() => void handleTestAIConnection()}
              disabled={!user || profileLoading}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-300 bg-white px-4 text-sm font-semibold text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Test AI Connection
            </button>
            <button
              type="button"
              disabled
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-indigo-700 px-4 text-sm font-semibold text-white opacity-50"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <div
            key={item.title}
            className={`rounded-3xl border p-5 shadow-sm ${
              index === 0
                ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-white"
                : index === 1
                  ? "border-sky-200 bg-gradient-to-br from-sky-50 to-white"
                  : index === 2
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                    : "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-on-surface-variant)]">{item.title}</p>
              <div
                className={`rounded-xl p-2 ${
                  index === 0
                    ? "bg-indigo-100 text-indigo-700"
                    : index === 1
                      ? "bg-sky-100 text-sky-700"
                      : index === 2
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-fuchsia-100 text-fuchsia-700"
                }`}
              >
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[var(--color-on-surface)]">{item.value}</p>
            <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">{item.note}</p>
            <div className="mt-4">
              {renderWaveChart({
                values:
                  index === 0
                    ? [completionPercent, overallHealthScore, readySectionCount, errorSectionCount + emptySectionCount]
                    : index === 1
                      ? [profileSkills.length, profileInterests.length, profileGoals.length]
                      : index === 2
                        ? (matchScoreTrend.length > 0 ? matchScoreTrend : [displayMatches.length])
                        : [aiInsight?.next_steps.length ?? 0, aiInsight?.skill_gaps.length ?? 0, recommendations?.recommendations.length ?? 0],
                stroke:
                  index === 0
                    ? "#4f46e5"
                    : index === 1
                      ? "#0284c7"
                      : index === 2
                        ? "#059669"
                        : "#c026d3",
                fill:
                  index === 0
                    ? "rgba(79,70,229,0.12)"
                    : index === 1
                      ? "rgba(2,132,199,0.12)"
                      : index === 2
                        ? "rgba(5,150,105,0.12)"
                        : "rgba(192,38,211,0.12)",
              })}
            </div>
          </div>
        ))}
      </section>
      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-gradient-to-br from-[var(--color-surface-container-low)] via-[var(--color-surface-container)] to-[var(--color-surface-container-low)] p-4 text-sm xl:col-span-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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

            <div className="grid min-w-[220px] grid-cols-3 gap-2">
              {readinessTrend.map((item) => (
                <div key={item.id} className="rounded-xl border border-[var(--color-outline-variant)] bg-white/80 p-2">
                  <p className="text-[11px] font-semibold text-[var(--color-on-surface-variant)]">{item.label}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        item.state === "ready"
                          ? "bg-emerald-500"
                          : item.state === "loading"
                            ? "bg-amber-500"
                            : item.state === "error"
                              ? "bg-rose-500"
                              : "bg-slate-400"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[var(--color-on-surface)]">{item.score}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-gradient-to-b from-[#f6f2ff] to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
            Intelligence Health
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div
              className="grid h-20 w-20 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#4f46e5 ${overallHealthScore * 3.6}deg, #e2e8f0 0deg)`,
              }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-sm font-bold text-[var(--color-on-surface)]">
                {overallHealthScore}%
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">Operational confidence</p>
              <p className={`mt-1 text-xs ${subtle}`}>
                {overallHealthScore >= 80
                  ? "Signals are strong across intelligence services."
                  : overallHealthScore >= 60
                    ? "Most systems are available, with minor gaps."
                    : "Some sections need attention to raise quality."}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
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
      </section>

      <section className="mb-6 rounded-2xl border border-[var(--color-outline-variant)] bg-gradient-to-r from-sky-50 via-white to-violet-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--color-on-surface)]">Profile Signal Depth</p>
          <p className={`text-xs ${subtle}`}>Live onboarding data quality indicators</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {profileDepthSignals.map((item) => {
            const score = Math.min(100, Math.round((item.value / item.target) * 100));
            return (
              <div key={item.id} className="rounded-xl border border-[var(--color-outline-variant)] bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-[var(--color-on-surface)]">
                    {item.value}/{item.target}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${score}%` }} />
                </div>
                <p className={`mt-2 text-xs ${subtle}`}>
                  {score >= 100 ? "Strong" : "Needs enrichment"}
                </p>
              </div>
            );
          })}
        </div>
      </section>
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
        <div className="rounded-3xl border border-fuchsia-200/70 bg-gradient-to-br from-fuchsia-50 via-white to-indigo-50 p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-fuchsia-700">Current Focus</p>
              <h2 className="mt-2 text-2xl font-bold text-fuchsia-900">{field}</h2>
              <p className="mt-2 max-w-xl text-sm text-fuchsia-900/75">
                You are in the structured development stage. VisionTech is guiding you from skill awareness into practical readiness and stronger opportunity alignment.
              </p>
            </div>

            <div className="rounded-2xl border border-fuchsia-200 bg-white/90 p-5">
              <p className="text-sm text-fuchsia-700">Completion</p>
              <p className="mt-1 text-3xl font-bold text-fuchsia-900">{completionPercent}%</p>
              <p className="mt-2 text-sm text-fuchsia-900/70">{completionMessage}</p>
              <div className="mt-3">
                {renderWaveChart({
                  values: [
                    completionPercent,
                    overallHealthScore,
                    readySectionCount,
                    loadingSectionCount + errorSectionCount + emptySectionCount,
                  ],
                  stroke: "#c026d3",
                  fill: "rgba(192,38,211,0.12)",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-violet-700">Quick Summary</p>

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
            <div className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-700">Intelligent Pathway</p>
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
              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-indigo-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Pathway Phase Mix</p>
                  <div className="mt-3">
                    {renderMiniBarChart({
                      values: [
                        pathwayStatusDistribution.completed,
                        pathwayStatusDistribution.active,
                        pathwayStatusDistribution.locked,
                      ],
                      colorClassName: "bg-gradient-to-t from-indigo-500 to-sky-400",
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Done</p>
                    <p className="mt-1 text-xl font-bold text-emerald-800">{pathwayStatusDistribution.completed}</p>
                  </div>
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">Active</p>
                    <p className="mt-1 text-xl font-bold text-sky-800">{pathwayStatusDistribution.active}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-700">Locked</p>
                    <p className="mt-1 text-xl font-bold text-slate-800">{pathwayStatusDistribution.locked}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {dynamicPathwaySteps.map((step, index) => (
                  <div key={step.id} className="relative rounded-2xl border border-[var(--color-outline-variant)] p-4">
                    {index !== dynamicPathwaySteps.length - 1 && <div className="absolute left-7 top-14 h-10 w-px bg-[var(--color-outline-variant)]" />}
                    <div className="flex gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white bg-[var(--color-primary)]">
                        {step.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : step.status === "active" ? <Clock3 className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
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
                {dynamicPathwaySteps.length === 0 && (
                  <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                    No guided pathway steps yet. Load recommendations to populate this journey.
                  </div>
                )}
              </div>
            </div>

            {/* AI insights */}
            <div className="rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-violet-700">AI Insights</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Personalised growth guidance</h3>
                  <p className="mt-2 text-sm text-violet-900/75">
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
                  <p className="mt-2 text-xs text-violet-900/60">
                    Last updated: {formatTimestamp(aiInsightUpdatedAt)}
                  </p>
                  <p className="mt-1 text-xs text-violet-900/60">
                    Source: {getAIInsightSourceLabel(aiInsightSource)}
                  </p>
                  {aiInsight && aiInsightIsCached && (
                    <p className="mt-1 text-xs text-violet-900/60">
                      Using cached data
                    </p>
                  )}
                  {(skillsAreThin || interestsAreThin || goalsAreThin) && (
                    <p className="mt-1 text-xs text-violet-900/60">
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
                  <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
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
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-violet-200 bg-white px-4 text-sm font-medium text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-violet-200 bg-white/90 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Insight Signal Curve</p>
                      <div className="mt-2">
                        {renderWaveChart({
                          values: aiInsightWaveValues,
                          stroke: "#7c3aed",
                          fill: "rgba(124,58,237,0.12)",
                        })}
                      </div>
                    </div>
                    <div className="rounded-xl border border-violet-200 bg-white/90 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Gap vs Action Distribution</p>
                      <div className="mt-3">
                        {renderMiniBarChart({
                          values: [aiInsight.skill_gaps.length, aiInsight.next_steps.length],
                          colorClassName: "bg-gradient-to-t from-violet-600 to-fuchsia-400",
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-violet-900/60">
                    {aiConfidence === "high"
                      ? "Your profile data is strong, so this insight is highly personalised."
                      : aiConfidence === "medium"
                        ? "This insight is based on limited data. Adding more details will improve accuracy."
                        : "This insight has low confidence due to limited profile data."}
                  </p>
                  <p className="mb-3 text-xs text-violet-900/60">
                    {aiInsightSource === "fresh"
                      ? "This insight was generated during your current session."
                      : aiInsightSource === "saved"
                        ? "This insight was retrieved from your saved intelligence data."
                        : "Source information is not available."}
                  </p>
                  <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-r from-violet-100/60 to-indigo-100/50 p-4">
                    <div className="mb-2 inline-flex rounded-xl bg-white/85 p-2 shadow-sm">
                      <Sparkles className="h-4 w-4 text-violet-700" />
                    </div>
                    <h4 className="font-semibold text-violet-700">Profile summary</h4>
                    <p className="mt-2 text-sm leading-6 text-violet-950/80">{aiInsight.summary}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
                      <p className="text-sm font-semibold text-sky-800">Skill gaps</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {aiInsight.skill_gaps.map((gap, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-3 py-2 text-xs font-medium text-sky-800 shadow-sm"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                            {gap}
                          </span>
                        ))}
                        {aiInsight.skill_gaps.length === 0 && (
                          <span className="text-sm text-sky-800/70">No gaps detected</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800">Next steps</p>
                      <ul className="mt-3 space-y-2 text-sm text-emerald-900/80">
                        {aiInsight.next_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-white/80 px-3 py-2">
                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                        {aiInsight.next_steps.length === 0 && <li className="text-emerald-800/70">Next steps will appear here</li>}
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
              )}
            </div>

            {/* Recommendations section */}
            <div className="rounded-3xl border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-cyan-700">Recommendations</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Suggested pathways and next steps</h3>
                  <p className="mt-2 text-sm text-cyan-900/75">
                    Practical recommendations aligned with your saved profile and AI guidance.
                  </p>
                  <p className="mt-2 text-xs text-cyan-900/60">
                    Last updated: {formatTimestamp(recommendationsUpdatedAt)}
                  </p>
                  {(skillsAreThin || goalsAreThin) && (
                    <p className="mt-1 text-xs text-cyan-900/60">
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
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-cyan-200 bg-white/90 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Recommendation Mix</p>
                        <div className="mt-3">
                          {renderMiniBarChart({
                            values: [recommendationComposition.resources, recommendationComposition.projects],
                            colorClassName: "bg-gradient-to-t from-cyan-600 to-sky-400",
                          })}
                        </div>
                      </div>
                      <div className="rounded-xl border border-sky-200 bg-white/90 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Priority Wave</p>
                        <div className="mt-2">
                          {renderWaveChart({
                            values: recommendationWaveValues,
                            stroke: "#0284c7",
                            fill: "rgba(2,132,199,0.14)",
                          })}
                        </div>
                      </div>
                    </div>
                    {!hasStructuredRecommendationFields && hasFilteredCompletedRecommendations && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        Completed tasks were excluded from this list.
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-cyan-700">Recommended Resources</h4>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        {recommendationResources.map((item) => (
                          <div
                            key={item.id}
                            className="group rounded-2xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="mb-3 inline-flex rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                              Resource
                            </div>
                            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{item.title}</p>
                            <p className="mt-1 text-xs text-cyan-900/65">
                              {item.type} - {item.level}
                            </p>
                            <p className="mt-3 text-sm text-cyan-950/75">{item.reason}</p>
                            <button
                              type="button"
                              onClick={() => {
                                void trackRecommendation(item);
                              }}
                              className="mt-4 inline-flex items-center rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50"
                            >
                              Track Learning
                            </button>
                          </div>
                        ))}
                        {recommendationResources.length === 0 && (
                          <p className={`text-sm ${subtle}`}>No resource recommendations available yet.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-cyan-700">Recommended Projects</h4>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        {recommendationProjects.map((item) => (
                          <div
                            key={item.id}
                            className="group rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="mb-3 inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                              Project
                            </div>
                            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{item.title}</p>
                            <p className="mt-1 text-xs text-sky-900/65">
                              {item.type} - {item.level}
                            </p>
                            {item.badges && item.badges.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.badges.map((badge) => (
                                  <span
                                    key={`${item.id}-${badge}`}
                                    className="rounded-full border border-cyan-200 bg-white px-2 py-1 text-[10px] font-medium text-cyan-700"
                                  >
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            <p className="mt-3 text-sm text-sky-950/75">{item.reason}</p>
                            <button
                              type="button"
                              onClick={() => {
                                void trackRecommendation(item);
                              }}
                              className="mt-4 inline-flex items-center rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                            >
                              Track Learning
                            </button>
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

            {/* Projects tracker section */}
            <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-blue-700">Project Tracker</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Build and track your portfolio</h3>
                  <p className="mt-2 text-sm text-blue-950/75">
                    Capture what you are building, which skills you are applying, and how far each project has progressed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void loadProjects();
                    }}
                    disabled={projectsLoading}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {projectsLoading ? "Loading..." : "Reload"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProjectForm((current) => !current)}
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    {showProjectForm ? "Close form" : "Add project"}
                  </button>
                </div>
              </div>
              <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-blue-200 bg-white/90 p-3">
                  <p className="text-xs text-blue-700/80">Projects Tracked</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">{projectSummary.tracked}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white/90 p-3">
                  <p className="text-xs text-emerald-700/80">Completed</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">{projectSummary.completed}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white/90 p-3">
                  <p className="text-xs text-amber-700/80">In Progress</p>
                  <p className="mt-1 text-2xl font-bold text-amber-800">{projectSummary.inProgress}</p>
                </div>
                <div className="rounded-xl border border-violet-200 bg-white/90 p-3">
                  <p className="text-xs text-violet-700/80">Skills Applied</p>
                  <p className="mt-1 text-2xl font-bold text-violet-800">{projectSummary.appliedSkills}</p>
                </div>
              </div>

              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 p-3">
                <p className="text-sm font-medium text-amber-900">Progress updates are currently manual.</p>
                <p className="mt-1 text-sm text-amber-800">
                  Automatic tracking from external project links is planned for a future iteration.
                </p>
              </div>

              {showProjectForm ? (
                <div className="mb-5 rounded-2xl border border-blue-200 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-[var(--color-on-surface)]">Create project</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      value={projectForm.title}
                      onChange={(event) => handleProjectFieldChange("title", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)]"
                      placeholder="Project title"
                    />
                    <input
                      type="text"
                      value={projectForm.category}
                      onChange={(event) => handleProjectFieldChange("category", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)]"
                      placeholder="Category (e.g. Cybersecurity)"
                    />
                    <textarea
                      value={projectForm.description}
                      onChange={(event) => handleProjectFieldChange("description", event.target.value)}
                      className="min-h-[90px] rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)] md:col-span-2"
                      placeholder="Project description"
                    />
                    <input
                      type="text"
                      value={projectForm.skills_used}
                      onChange={(event) => handleProjectFieldChange("skills_used", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)] md:col-span-2"
                      placeholder="Skills used (comma separated)"
                    />
                    <input
                      type="url"
                      value={projectForm.github_url}
                      onChange={(event) => handleProjectFieldChange("github_url", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)]"
                      placeholder="GitHub URL (optional)"
                    />
                    <input
                      type="url"
                      value={projectForm.demo_url}
                      onChange={(event) => handleProjectFieldChange("demo_url", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)]"
                      placeholder="Demo URL (optional)"
                    />
                    <input
                      type="url"
                      value={projectForm.documentation_url}
                      onChange={(event) => handleProjectFieldChange("documentation_url", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)] md:col-span-2"
                      placeholder="Documentation URL (optional)"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleCreateProject();
                      }}
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Save project
                    </button>
                    <button
                      type="button"
                      onClick={resetProjectForm}
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {projectsError ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {projectsError}
                </div>
              ) : null}

              {projectsLoading && projects.length === 0 ? (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Loading projects...
                </div>
              ) : projects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((project) => (
                    <div key={project.id} className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-[var(--color-on-surface)]">{project.title}</h4>
                          <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {project.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-700">Category: {project.category}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {project.skills_used.map((skill) => (
                          <span
                            key={`${project.id}-${skill}`}
                            className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-slate-700">Progress: {project.progress_percent}%</p>
                        <div className="mt-1 h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${Math.max(0, Math.min(100, project.progress_percent))}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs">
                        {project.github_url ? (
                          <a href={project.github_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            GitHub
                          </a>
                        ) : null}
                        {project.demo_url ? (
                          <a href={project.demo_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            Demo
                          </a>
                        ) : null}
                        {project.documentation_url ? (
                          <a href={project.documentation_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            Documentation
                          </a>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void handleIncrementProjectProgress(project);
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          +10%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleCompleteProject(project);
                          }}
                          className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Mark Complete
                        </button>
                        <select
                          value={project.status}
                          onChange={(event) => {
                            void handleUpdateProject(project.id, { status: event.target.value as ProjectStatus });
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value="idea">Idea</option>
                          <option value="planning">Planning</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="paused">Paused</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDeleteProject(project.id);
                          }}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">No projects tracked yet.</p>
                  <p className={`mt-1 text-sm ${subtle}`}>
                    Add a project to show what you are building and how your skills are being applied.
                  </p>
                </div>
              )}
            </div>

            {/* Learning progress section */}
            <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-indigo-700">Learning Progress</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Track your growth loop</h3>
                  <p className="mt-2 text-sm text-indigo-950/75">
                    Save recommended learning resources and update your progress manually.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void loadLearningTracker();
                  }}
                  disabled={learningLoading}
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {learningLoading ? "Loading..." : "Reload"}
                </button>
              </div>
              <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-indigo-200 bg-white/90 p-3">
                  <p className="text-xs text-indigo-700/80">Courses Tracked</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-900">{learningSummary.tracked}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white/90 p-3">
                  <p className="text-xs text-emerald-700/80">Completed</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">{learningSummary.completed}</p>
                </div>
                <div className="rounded-xl border border-sky-200 bg-white/90 p-3">
                  <p className="text-xs text-sky-700/80">In Progress</p>
                  <p className="mt-1 text-2xl font-bold text-sky-800">{learningSummary.inProgress}</p>
                </div>
                <div className="rounded-xl border border-violet-200 bg-white/90 p-3">
                  <p className="text-xs text-violet-700/80">Completion Rate</p>
                  <p className="mt-1 text-2xl font-bold text-violet-800">{learningSummary.completionRate}%</p>
                </div>
              </div>
              {learningError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {learningError}
                </div>
              ) : null}
              {learningLoading && learningItems.length === 0 ? (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Loading tracked learning...
                </div>
              ) : learningItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {learningItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h4 className="font-semibold text-[var(--color-on-surface)]">{item.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{item.platform}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {item.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-slate-500">{item.progress_percent}%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{ width: `${Math.max(0, Math.min(100, item.progress_percent))}%` }}
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void incrementLearningProgress(item);
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          +10%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void markLearningComplete(item);
                          }}
                          className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Mark Complete
                        </button>
                        <select
                          value={item.status}
                          onChange={(event) => {
                            void updateLearningItem(item.id, { status: event.target.value as LearningStatus });
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">No tracked learning yet.</p>
                  <p className={`mt-1 text-sm ${subtle}`}>
                    Use Track Learning on recommendations to start your learn-track-improve loop.
                  </p>
                </div>
              )}
            </div>

            {/* Custom pathways section */}
            <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-700">Custom Pathways</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Build your own pathway</h3>
                  <p className="mt-2 text-sm text-amber-900/75">
                    If official pathways do not fit your goal, define a custom pathway and keep it in your intelligence workspace.
                  </p>
                  <p className="mt-2 text-xs text-amber-900/60">
                    Last updated: {formatTimestamp(customPathwaysUpdatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleLoadCustomPathways()}
                    disabled={customPathwaysLoading || intelligenceRefreshing}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {customPathwaysLoading ? "Loading..." : "Load custom pathways"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomPathwayForm((current) => !current)}
                    disabled={customPathwaysLoading || intelligenceRefreshing}
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showCustomPathwayForm ? "Close form" : "Create custom pathway"}
                  </button>
                </div>
              </div>
              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-amber-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Status Distribution</p>
                  <div className="mt-3">
                    {renderMiniBarChart({
                      values: [
                        customPathwayStatusDistribution.private,
                        customPathwayStatusDistribution.pending_review,
                        customPathwayStatusDistribution.approved,
                        customPathwayStatusDistribution.rejected,
                      ],
                      colorClassName: "bg-gradient-to-t from-amber-500 to-orange-400",
                    })}
                  </div>
                </div>
                <div className="rounded-xl border border-orange-200 bg-white/90 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Portfolio Split</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div
                      className="grid h-16 w-16 place-items-center rounded-full"
                      style={{
                        background: `conic-gradient(#f59e0b ${
                          customPathways.length > 0
                            ? Math.round((customPathwayStatusDistribution.private / customPathways.length) * 360)
                            : 0
                        }deg, #fde68a 0deg)`,
                      }}
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-[10px] font-bold text-amber-800">
                        {customPathways.length}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-amber-900/70">
                      <p>Private: {customPathwayStatusDistribution.private}</p>
                      <p>Review: {customPathwayStatusDistribution.pending_review}</p>
                      <p>Approved: {customPathwayStatusDistribution.approved}</p>
                      <p>Rejected: {customPathwayStatusDistribution.rejected}</p>
                    </div>
                  </div>
                </div>
              </div>

              {customPathwaysError ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {customPathwaysError}
                </div>
              ) : null}

              {showCustomPathwayForm ? (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-[var(--color-on-surface)]">
                    {editingCustomPathwayId ? "Edit custom pathway" : "Create a custom pathway"}
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      value={customPathwayForm.title}
                      onChange={(event) => handleCustomPathwayFieldChange("title", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)]"
                      placeholder="Pathway title"
                    />
                    <input
                      type="text"
                      value={customPathwayForm.current_skill_level}
                      onChange={(event) => handleCustomPathwayFieldChange("current_skill_level", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)]"
                      placeholder="Current skill level"
                    />
                    <input
                      type="text"
                      value={customPathwayForm.desired_outcome}
                      onChange={(event) => handleCustomPathwayFieldChange("desired_outcome", event.target.value)}
                      className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)] md:col-span-2"
                      placeholder="Desired outcome"
                    />
                    <textarea
                      value={customPathwayForm.description}
                      onChange={(event) => handleCustomPathwayFieldChange("description", event.target.value)}
                      className="min-h-[96px] rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)] md:col-span-2"
                      placeholder="Describe this custom pathway"
                    />
                    <textarea
                      value={customPathwayForm.reason_for_interest}
                      onChange={(event) => handleCustomPathwayFieldChange("reason_for_interest", event.target.value)}
                      className="min-h-[96px] rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm text-[var(--color-on-surface)] md:col-span-2"
                      placeholder="Why this pathway matters to you"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSubmitCustomPathway()}
                      disabled={customPathwaysLoading || intelligenceRefreshing}
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {editingCustomPathwayId ? "Save updates" : "Save custom pathway"}
                    </button>
                    <button
                      type="button"
                      onClick={resetCustomPathwayForm}
                      disabled={customPathwaysLoading || intelligenceRefreshing}
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {customPathwaysLoading && customPathways.length === 0 ? (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Loading custom pathways...
                </div>
              ) : customPathways.length > 0 ? (
                <div className="space-y-3">
                  {customPathways.map((pathway) => (
                    <div
                      key={pathway.id}
                      className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-[var(--color-on-surface)]">{pathway.title}</h4>
                          <p className="mt-1 text-xs uppercase tracking-wide text-amber-900/70">
                            {pathway.current_skill_level} - {pathway.status}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditingCustomPathway(pathway)}
                            disabled={customPathwaysLoading || intelligenceRefreshing}
                            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-outline-variant)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-lowest)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void handleArchiveCustomPathway(pathway.id);
                            }}
                            disabled={customPathwaysLoading || intelligenceRefreshing}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Archive
                          </button>
                        </div>
                      </div>
                      <p className={`mt-3 text-sm ${subtle}`}>{pathway.description}</p>
                      <p className={`mt-2 text-sm ${subtle}`}>
                        <span className="font-semibold text-[var(--color-on-surface)]">Outcome:</span>{" "}
                        {pathway.desired_outcome}
                      </p>
                      <p className={`mt-1 text-sm ${subtle}`}>
                        <span className="font-semibold text-[var(--color-on-surface)]">Reason:</span>{" "}
                        {pathway.reason_for_interest}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">
                    No custom pathways yet.
                  </p>
                  <p className={`mt-1 text-sm ${subtle}`}>
                    Use "Create custom pathway" when official pathways do not match your direction.
                  </p>
                </div>
              )}
            </div>

            {/* Match section */}
            <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Smart Matching</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">People and collaboration fits</h3>
                  <p className="mt-2 text-sm text-emerald-900/75">
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
                  <p className="mt-2 text-xs text-emerald-900/60">
                    Last updated: {formatTimestamp(matchesUpdatedAt)}
                  </p>
                  {(skillsAreThin || interestsAreThin) && (
                    <p className="mt-1 text-xs text-emerald-900/60">
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
              <div className="mb-5 rounded-xl border border-emerald-200 bg-white/90 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Match Strength Wave</p>
                <div className="mt-2">
                  {renderWaveChart({
                    values: matchScoreTrend,
                    stroke: "#059669",
                    fill: "rgba(5,150,105,0.14)",
                  })}
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
                    <div key={match.id} className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-[var(--color-on-surface)]">{match.name}</h4>
                          <p className="mt-1 text-sm text-emerald-900/70">Smart profile match</p>
                        </div>
                        <div className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700">
                          {match.matchScore}%
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-emerald-900/80">Shared skills</p>
                          {match.sharedSkills.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {match.sharedSkills.map((skill) => (
                                <span
                                  key={`${match.id}-skill-${skill}`}
                                  className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-emerald-900/60">None yet</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-emerald-900/80">Shared interests</p>
                          {match.sharedInterests.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {match.sharedInterests.map((interest) => (
                                <span
                                  key={`${match.id}-interest-${interest}`}
                                  className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-medium text-teal-700"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-emerald-900/60">None yet</p>
                          )}
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-emerald-950/75">{match.reason}</p>
                      <button
                        type="button"
                        disabled
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-medium text-white opacity-50"
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
            <div className="rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-rose-700">Quick Actions</p>
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
                    className={`${comingSoonButtonClass} w-full justify-between border-rose-200 bg-white/80 text-left`}
                  >
                    <span className="flex items-center gap-3 text-rose-700">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--color-on-surface-variant)]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Activity timeline */}
            <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Recent Activity</p>
              <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Your momentum</h3>
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2">
                {renderWaveChart({
                  values: recentActivities.map((activity) =>
                    activity.status === "done"
                      ? 100
                      : activity.status === "in-progress"
                        ? 60
                        : activity.status === "error"
                          ? 20
                          : 40,
                  ),
                  stroke: "#475569",
                  fill: "rgba(71,85,105,0.12)",
                })}
              </div>
              <div className="mt-5 space-y-4">
                {recentActivities.map((activity) => (
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
                {recentActivities.length === 0 && (
                  <p className={`text-sm ${subtle}`}>
                    No activity recorded yet. Intelligence actions will appear here as you use the dashboard.
                  </p>
                )}
              </div>
            </div>

            {/* Opportunity readiness box */}
            <div className="rounded-3xl bg-gradient-to-br from-[var(--color-primary)] via-[#2d0d72] to-[#0f766e] p-6 text-white shadow-sm">
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


