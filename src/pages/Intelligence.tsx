import type { JSX, ElementType } from "react";
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

// Static data (kept colocated for easy extraction into components later)
type StatCard = {
  title: string;
  value: string;
  note: string;
  icon: ElementType;
};

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

const accent = "#1f0954";

const stats: StatCard[] = [
  {
    title: "Pathway Progress",
    value: "45%",
    note: "You are moving steadily toward your goal",
    icon: TrendingUp,
  },
  {
    title: "Skills Identified",
    value: "12",
    note: "Technical and growth skills mapped",
    icon: Target,
  },
  {
    title: "Active Matches",
    value: "8",
    note: "Potential collaborators and mentors",
    icon: Users,
  },
  {
    title: "AI Insights",
    value: "16",
    note: "New recommendations generated this week",
    icon: Lightbulb,
  },
];

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

export default function Intelligence(): JSX.Element {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top bar */}
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">VisionTech Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, Chidera</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Your growth journey is active. Track progress, discover intelligent recommendations, and connect with the right opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              style={{ color: accent }}
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </button>

            <button
              className="inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium text-white transition"
              style={{ backgroundColor: accent }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start New Pathway
            </button>
          </div>
        </header>

        {/* Hero summary */}
        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500">Current Focus</p>
                <h2 className="mt-2 text-2xl font-bold" style={{ color: accent }}>
                  Cloud Security Pathway
                </h2>
                <p className="mt-2 max-w-xl text-sm text-zinc-600">
                  You are currently in the structured development stage. VisionTech is guiding you from skill awareness into practical readiness and stronger opportunity alignment.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-5">
                <p className="text-sm text-zinc-500">Completion</p>
                <p className="mt-1 text-3xl font-bold">45%</p>
                <p className="mt-2 text-sm text-zinc-600">Keep building. Your next milestone is Cloud IAM.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">Quick Summary</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">Goal</p>
                <p className="mt-1 font-semibold" style={{ color: accent }}>
                  Become opportunity-ready in cloud security
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">Next Task</p>
                <p className="mt-1 font-semibold">Complete Cloud IAM practical exercise</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">Match Strength</p>
                <p className="mt-1 font-semibold">High fit with technical collaborators</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">{stat.title}</p>
                    <p className="mt-3 text-3xl font-bold" style={{ color: accent }}>
                      {stat.value}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-zinc-100 p-3">
                    <Icon className="h-5 w-5 text-zinc-700" />
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-600">{stat.note}</p>
              </div>
            );
          })}
        </section>

        {/* Main content grid */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left and center content */}
          <div className="space-y-6 xl:col-span-2">
            {/* Pathway section */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">Intelligent Pathway</p>
                  <h3 className="mt-1 text-xl font-bold">Your guided journey</h3>
                </div>

                <button
                  className="inline-flex items-center text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  style={{ color: accent }}
                >
                  View full pathway
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {pathwaySteps.map((step, index) => (
                  <div key={step.id} className="relative rounded-2xl border border-zinc-200 p-4">
                    {index !== pathwaySteps.length - 1 && (
                      <div className="absolute left-7 top-14 h-10 w-px bg-zinc-200" />
                    )}

                    <div className="flex gap-4">
                      <div
                        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: accent }}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : step.status === "active" ? (
                          <Clock3 className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold">{step.id}</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="font-semibold">{step.title}</h4>
                            <p className="mt-1 text-sm text-zinc-600">{step.description}</p>
                          </div>

                          <span
                            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles(step.status)}`}
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI insights */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-semibold text-zinc-500">AI Insights</p>
                <h3 className="mt-1 text-xl font-bold">Personalised growth guidance</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {insights.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-zinc-100 p-4">
                    <div className="mb-3 inline-flex rounded-xl bg-white p-2">
                      <Sparkles className="h-4 w-4 text-zinc-700" />
                    </div>
                    <h4 className="font-semibold" style={{ color: accent }}>
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Match section */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">Smart Matching</p>
                  <h3 className="mt-1 text-xl font-bold">People and collaboration fits</h3>
                </div>

                <button
                  className="inline-flex items-center text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  style={{ color: accent }}
                >
                  Explore all matches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {matches.map((match) => (
                  <div key={match.id} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{match.name}</h4>
                        <p className="mt-1 text-sm text-zinc-500">{match.role}</p>
                      </div>

                      <div
                        className="rounded-xl px-3 py-2 text-sm font-bold"
                        style={{ backgroundColor: `${accent}0D`, color: accent }}
                      >
                        {match.matchScore}%
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-zinc-600">{match.reason}</p>

                    <button
                      className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-medium text-white transition"
                      style={{ backgroundColor: accent }}
                    >
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
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-zinc-500">Quick Actions</p>
              <h3 className="mt-1 text-xl font-bold">Move faster</h3>

              <div className="mt-5 space-y-3">
                <button className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-left transition hover:bg-zinc-50">
                  <span className="flex items-center gap-3" style={{ color: accent }}>
                    <BookOpen className="h-4 w-4" />
                    Start learning task
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </button>

                <button className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-left transition hover:bg-zinc-50">
                  <span className="flex items-center gap-3" style={{ color: accent }}>
                    <FolderKanban className="h-4 w-4" />
                    Open project workspace
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </button>

                <button className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-left transition hover:bg-zinc-50">
                  <span className="flex items-center gap-3" style={{ color: accent }}>
                    <Briefcase className="h-4 w-4" />
                    View opportunities
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Activity timeline */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-zinc-500">Recent Activity</p>
              <h3 className="mt-1 text-xl font-bold">Your momentum</h3>

              <div className="mt-5 space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="pt-2">
                      <span className={`block h-3 w-3 rounded-full ${activityDot(activity.status)}`} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-zinc-800">{activity.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity readiness box */}
            <div className="rounded-3xl p-6 text-white shadow-sm" style={{ backgroundColor: accent }}>
              <p className="text-sm font-semibold text-white/80">VisionTech Signal</p>
              <h3 className="mt-1 text-xl font-bold">Opportunity readiness is improving</h3>
              <p className="mt-3 text-sm leading-6 text-white/90">
                Based on your current pathway activity and skills alignment, your profile is becoming more attractive for future collaboration and role-based opportunities.
              </p>

              <button className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100">
                View readiness details
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
