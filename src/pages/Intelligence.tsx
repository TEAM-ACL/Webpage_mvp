import type { JSX } from "react";
import { useEffect, useMemo, useRef } from "react";
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
  id: number;
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

function buildStats(skillsCount: number | null, aiCount: number | null): SummaryItem[] {
  return [
    { title: "Pathway Progress", value: "45%", note: "Moving steadily toward your goal", icon: TrendingUp },
    {
      title: "Skills Identified",
      value: skillsCount !== null ? String(skillsCount) : "—",
      note: skillsCount !== null ? "Captured from onboarding" : "Add skills in onboarding to unlock precision",
      icon: Target,
    },
    { title: "Active Matches", value: "8", note: "Potential collaborators and mentors", icon: Users },
    {
      title: "AI Insights",
      value: aiCount !== null ? String(aiCount) : "—",
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

const matches: MatchCard[] = [
  {
    id: 1,
    name: "Esther A.",
    role: "Cloud Engineer",
    matchScore: 92,
    reason: "Shared interest in cloud security and infrastructure growth.",
  },
  {
    id: 2,
    name: "Daniel K.",
    role: "Cybersecurity Analyst",
    matchScore: 87,
    reason: "Strong overlap in security monitoring and hands-on lab practice.",
  },
  {
    id: 3,
    name: "Miriam O.",
    role: "Product Builder",
    matchScore: 81,
    reason: "Useful fit for collaboration around innovation and technical execution.",
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

const subtle = "text-[var(--color-on-surface-variant)]";

export default function Intelligence(): JSX.Element {
  const {
    profile,
    profileLoading,
    aiInsight,
    aiInsightLoading,
    aiInsightError,
    refreshAIInsight,
    loadLatestAIInsight,
    recommendations,
    recommendationsLoading,
    recommendationsError,
    loadRecommendations,
  } = useAuth();
  const hasLoadedLatestInsight = useRef(false);
  const hasLoadedRecommendations = useRef(false);

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

  const stats = useMemo(() => buildStats(skillsCount, aiInsight ? aiInsight.next_steps.length : null), [skillsCount, aiInsight]);

  const aiStatusLabel = aiInsight
    ? "Live"
    : aiInsightLoading
      ? "Loading"
      : aiInsightError
        ? "Unavailable"
        : "Sample";

  const missingProfile = !profile;

  // ACL: manual AI refresh handler for Intelligence page
  const handleRefreshAIInsight = async (): Promise<void> => {
    try {
      await refreshAIInsight();
    } catch (error) {
      console.error("ACL: Failed to refresh AI insight from Intelligence page", error);
    }
  };

  // ACL: load latest saved AI insight on Intelligence page entry
  useEffect(() => {
    if (profileLoading) return;
    if (!profile) return;
    if (hasLoadedLatestInsight.current) return;

    hasLoadedLatestInsight.current = true;
    void loadLatestAIInsight();
  }, [profileLoading, profile, loadLatestAIInsight]);

  // ACL: load recommendations on Intelligence page entry
  useEffect(() => {
    if (profileLoading) return;
    if (!profile) return;
    if (hasLoadedRecommendations.current) return;

    hasLoadedRecommendations.current = true;
    void loadRecommendations();
  }, [profileLoading, profile, loadRecommendations]);

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
        description={
          missingProfile
            ? "Finish onboarding to fully personalise your dashboard."
            : "Track pathway progress, understand next steps, and receive intelligent recommendations tailored to your goals."
        }
        actions={
          <>
            <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90">
              <Sparkles className="mr-2 h-4 w-4" />
              Start New Pathway
            </button>
          </>
        }
      />

      <SummaryGrid items={stats} />

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
                <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
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
                          : "Complete onboarding to unlock personalised recommendations."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
  <div className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
    {aiStatusLabel}
  </div>

  <button
    type="button"
    onClick={handleRefreshAIInsight}
    disabled={aiInsightLoading || missingProfile}
    className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Sparkles className="mr-2 h-4 w-4" />
    {aiInsightLoading ? "Refreshing..." : "Refresh AI Insight"}
  </button>
</div>
              </div>

              {aiInsightLoading ? (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Generating your personalised insight from your saved profile...
                </div>
              ) : aiInsight ? (
                <div className="space-y-5">
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
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
             <p>AI insight unavailable right now. Your profile data is still loaded and usable.</p>
            <button
              type="button"
              onClick={handleRefreshAIInsight}
              disabled={aiInsightLoading || missingProfile}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-2xl border border-amber-300 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Try again
              </button>
          </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4">
                    <h4 className="font-semibold text-[var(--color-primary)]">No saved AI insight yet</h4>
                    <p className={`mt-2 text-sm leading-6 ${subtle}`}>
                      Your profile is loaded, but no saved AI guidance is available yet. You can generate a fresh insight now.
                    </p>
                    <button
                      type="button"
                      onClick={handleRefreshAIInsight}
                      disabled={aiInsightLoading || missingProfile}
                      className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate AI Insight
                    </button>
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
              <div className="mb-6">
                <p className={`text-sm font-semibold ${subtle}`}>Recommendations</p>
                <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Suggested resources and projects</h3>
                <p className={`mt-2 text-sm ${subtle}`}>
                  Practical recommendations aligned with your saved profile and AI guidance.
                </p>
              </div>

              {recommendationsLoading ? (
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Loading recommendations...
                </div>
              ) : recommendations ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-[var(--color-primary)]">Recommended Resources</h4>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      {recommendations.recommended_resources.map((item) => (
                        <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                          <p className="text-sm font-semibold text-[var(--color-on-surface)]">{item.title}</p>
                          <p className={`mt-1 text-xs ${subtle}`}>
                            {item.type} • {item.level}
                          </p>
                          <p className={`mt-3 text-sm ${subtle}`}>{item.reason}</p>
                        </div>
                      ))}
                      {recommendations.recommended_resources.length === 0 && (
                        <p className={`text-sm ${subtle}`}>No resource recommendations available yet.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[var(--color-primary)]">Recommended Projects</h4>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      {recommendations.recommended_projects.map((item) => (
                        <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                          <p className="text-sm font-semibold text-[var(--color-on-surface)]">{item.title}</p>
                          <p className={`mt-1 text-xs ${subtle}`}>
                            {item.type} • {item.level}
                          </p>
                          <p className={`mt-3 text-sm ${subtle}`}>{item.reason}</p>
                        </div>
                      ))}
                      {recommendations.recommended_projects.length === 0 && (
                        <p className={`text-sm ${subtle}`}>No project recommendations available yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : recommendationsError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Recommendations are unavailable right now.
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)]">
                  Recommendations will appear here once the backend recommendation service is available.
                </div>
              )}
            </div>

            {/* Match section */}
            <div className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${subtle}`}>Smart Matching</p>
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">People and collaboration fits</h3>
                </div>
                <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                  Explore all matches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {matches.map((match) => (
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
                    <button className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
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
                    className="flex w-full items-center justify-between rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-left transition hover:bg-[var(--color-surface-container-low)]"
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
              <button className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-container-low)]">
                View readiness details
              </button>
            </div>
          </aside>
        </section>
    </DashboardShell>
  );
}
