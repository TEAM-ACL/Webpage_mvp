import type { ElementType, CSSProperties } from "react";
import {
  Shield,
  Users,
  UserCheck,
  Activity,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Settings,
  Search,
  Sparkles,
  FolderKanban,
  Network,
  CheckCircle2,
  Handshake,
} from "lucide-react";

type SummaryCard = { title: string; value: string; note: string; icon: ElementType };
type PlatformStat = { id: number; label: string; value: string; helper: string };
type ActivityItem = { id: number; title: string; description: string; time: string; type: "user" | "system" | "warning" };
type FlaggedItem = { id: number; title: string; category: string; reason: string; status: "Pending" | "Reviewing" | "Resolved" };
type UserSegment = { id: number; name: string; count: number; progress: number };

const summaryCards: SummaryCard[] = [
  { title: "Total Users", value: "1,248", note: "All registered users", icon: Users },
  { title: "Active This Week", value: "486", note: "Recent engaged users", icon: Activity },
  { title: "Onboarding Completed", value: "73%", note: "Finished profile & pathway", icon: UserCheck },
  { title: "Open Flags", value: "14", note: "Needs admin attention", icon: AlertTriangle },
];

const platformStats: PlatformStat[] = [
  { id: 1, label: "Intelligence Page Engagement", value: "68%", helper: "Strongest interaction this week" },
  { id: 2, label: "Workspace Activity Rate", value: "54%", helper: "Users creating tasks/projects" },
  { id: 3, label: "Network Connection Rate", value: "41%", helper: "Connections made/accepted" },
  { id: 4, label: "Admin Response Efficiency", value: "89%", helper: "Avg completion rate for actions" },
];

const recentActivity: ActivityItem[] = [
  { id: 1, title: "Onboarding completions increased", description: "27 users completed onboarding in 24h.", time: "1 hour ago", type: "user" },
  { id: 2, title: "Recommendation refresh complete", description: "Matching & pathway cache updated.", time: "3 hours ago", type: "system" },
  { id: 3, title: "Flagged profile requires review", description: "Profile flagged for inconsistent data.", time: "Today", type: "warning" },
  { id: 4, title: "Workspace spike detected", description: "Project creation above weekly average.", time: "Today", type: "system" },
];

const flaggedItems: FlaggedItem[] = [
  { id: 1, title: "Profile mismatch review", category: "User Data", reason: "Goals and collaboration prefs conflict.", status: "Pending" },
  { id: 2, title: "Inactive mentor listing", category: "Network", reason: "Listed mentor not engaging recently.", status: "Reviewing" },
  { id: 3, title: "Duplicate workspace signal", category: "Workspace", reason: "Similar project created multiple times.", status: "Resolved" },
];

const userSegments: UserSegment[] = [
  { id: 1, name: "New Users", count: 214, progress: 62 },
  { id: 2, name: "Active Pathways", count: 533, progress: 78 },
  { id: 3, name: "Collaboration-Ready", count: 289, progress: 55 },
  { id: 4, name: "High Opportunity Readiness", count: 121, progress: 38 },
];

const themeOverride: CSSProperties = { "--color-primary": "#1f0954" } as CSSProperties;
const surface = "bg-[var(--color-surface)] text-[var(--color-on-surface)]";
const card = "rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm";
const subtle = "text-[var(--color-on-surface-variant)]";
const primaryButton = "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90";
const outlineButton = "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";

function activityBadge(type: ActivityItem["type"]) {
  if (type === "user") return "bg-blue-100 text-blue-700";
  if (type === "system") return "bg-emerald-100 text-emerald-700";
  return "bg-red-100 text-red-700";
}

function flagBadge(status: FlaggedItem["status"]) {
  if (status === "Pending") return "bg-red-100 text-red-700 border-red-200";
  if (status === "Reviewing") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export default function Admin() {
  return (
    <main className={`min-h-screen ${surface}`} style={themeOverride}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className={`mb-8 flex flex-col gap-4 ${card} p-6 lg:flex-row lg:items-center lg:justify-between`}>
          <div>
            <div className="inline-flex items-center rounded-full bg-[var(--color-surface-container-low)] px-3 py-1 text-xs font-semibold text-[var(--color-on-surface)]">
              <Shield className="mr-2 h-3.5 w-3.5" />
              Admin Control Centre
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl text-[var(--color-on-surface)]">
              Monitor platform health and guide VisionTech operations
            </h1>
            <p className={`mt-2 max-w-3xl text-sm ${subtle}`}>
              Review user activity, onboarding performance, matching quality, workspace signals, and items needing admin attention.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className={outlineButton}>
              <Search className="mr-2 h-4 w-4" />
              Search Records
            </button>
            <button className={primaryButton}>
              <Settings className="mr-2 h-4 w-4" />
              Platform Settings
            </button>
          </div>
        </header>

        {/* Summary cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((cardData) => {
            const Icon = cardData.icon;
            return (
              <div key={cardData.title} className={`${card} p-5`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${subtle}`}>{cardData.title}</p>
                    <p className="mt-3 text-3xl font-bold text-[var(--color-on-surface)]">{cardData.value}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-3">
                    <Icon className="h-5 w-5 text-[var(--color-on-surface)]" />
                  </div>
                </div>
                <p className={`mt-4 text-sm ${subtle}`}>{cardData.note}</p>
              </div>
            );
          })}
        </section>

        {/* Main content */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* Platform analytics */}
            <div className={`${card} p-6`}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${subtle}`}>Platform Analytics</p>
                  <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Current operational signals</h2>
                </div>
                <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                  View detailed analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {platformStats.map((stat) => (
                  <div key={stat.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-5">
                    <div className="flex items-center justify-between">
                      <p className="max-w-[75%] text-sm font-medium text-[var(--color-on-surface-variant)]">{stat.label}</p>
                      <BarChart3 className="h-5 w-5 text-[var(--color-on-surface)]" />
                    </div>
                    <p className="mt-4 text-3xl font-bold text-[var(--color-on-surface)]">{stat.value}</p>
                    <p className={`mt-2 text-sm leading-6 ${subtle}`}>{stat.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* User segments */}
            <div className={`${card} p-6`}>
              <div className="mb-6">
                <p className={`text-sm font-semibold ${subtle}`}>User Segments</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">How users are distributed</h2>
              </div>
              <div className="space-y-4">
                {userSegments.map((segment) => (
                  <div key={segment.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--color-on-surface)]">{segment.name}</h3>
                        <p className={`mt-1 text-sm ${subtle}`}>{segment.count} users in this segment</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium text-[var(--color-on-surface)]">Segment weight: {segment.progress}%</p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-[var(--color-surface-container-low)]">
                      <div className="h-2 rounded-full bg-[var(--color-primary)]" style={{ width: `${segment.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className={`${card} p-6`}>
              <div className="mb-6">
                <p className={`text-sm font-semibold ${subtle}`}>Recent Activity</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Latest platform events</h2>
              </div>
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-4 transition hover:border-[var(--color-primary)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-[var(--color-on-surface)]">{item.title}</h3>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${activityBadge(item.type)}`}>
                            {item.type}
                          </span>
                        </div>
                        <p className={`mt-2 text-sm leading-6 ${subtle}`}>{item.description}</p>
                      </div>
                      <p className={`text-sm ${subtle}`}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            {/* Quick actions */}
            <div className={`${card} p-6`}>
              <p className={`text-sm font-semibold ${subtle}`}>Quick Actions</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Admin shortcuts</h2>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Review users", icon: Users },
                  { label: "Check AI signals", icon: Sparkles },
                  { label: "Audit workspaces", icon: FolderKanban },
                  { label: "Review network activity", icon: Network },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="flex w-full items-center justify-between rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-left transition hover:bg-[var(--color-surface-container-low)]"
                  >
                    <span className="flex items-center gap-3 text-[var(--color-on-surface)]">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--color-on-surface-variant)]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Flagged items */}
            <div className={`${card} p-6`}>
              <p className={`text-sm font-semibold ${subtle}`}>Flagged Items</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Needs attention</h2>
              <div className="mt-5 space-y-4">
                {flaggedItems.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--color-on-surface)]">{item.title}</h3>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${flagBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm font-medium ${subtle}`}>{item.category}</p>
                    <p className={`mt-2 text-sm leading-6 ${subtle}`}>{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform health */}
            <div className="rounded-3xl bg-[var(--color-primary)] p-6 text-white shadow-sm">
              <p className="text-sm font-semibold text-white/80">Platform Health</p>
              <h2 className="mt-1 text-xl font-bold">VisionTech shows healthy engagement</h2>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Onboarding completion is improving, user activity is stable, and core areas show traction for MVP.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/70">Stability</p>
                  <p className="mt-2 text-lg font-bold">Good</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/70">Growth Signal</p>
                  <p className="mt-2 text-lg font-bold">Positive</p>
                </div>
              </div>
            </div>

            {/* Admin efficiency */}
            <div className={`${card} p-6`}>
              <p className={`text-sm font-semibold ${subtle}`}>Admin Efficiency</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">This week’s review progress</h2>
              <p className={`mt-3 text-sm leading-6 ${subtle}`}>23 of 29 pending admin checks have been completed.</p>
              <div className="mt-4 h-2 w-full rounded-full bg-[var(--color-surface-container-low)]">
                <div className="h-2 w-[79%] rounded-full bg-[var(--color-primary)]" />
              </div>
              <div className={`mt-4 flex items-center gap-2 text-sm ${subtle}`}>
                <CheckCircle2 className="h-4 w-4" />
                Review completion: 79%
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
