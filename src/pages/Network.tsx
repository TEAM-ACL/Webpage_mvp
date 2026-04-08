import type { ElementType } from "react";
import DashboardShell from "../components/dashboard/DashboardShell";
import PageHeader from "../components/dashboard/PageHeader";
import SummaryGrid, { type SummaryItem } from "../components/dashboard/SummaryGrid";
import {
  Users,
  UserPlus,
  Briefcase,
  Sparkles,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Search,
  ShieldCheck,
  Handshake,
} from "lucide-react";

type MatchType = "Collaborator" | "Mentor" | "Peer" | "Opportunity";
type MatchCard = { id: number; name: string; role: string; type: MatchType; matchScore: number; reason: string; skills: string[]; availability: string };
type ActivityItem = { id: number; name: string; action: string; time: string };
type SuggestedGroup = { id: number; title: string; description: string; members: number };

const summaryCards: SummaryItem[] = [
  { title: "Recommended Matches", value: "12", note: "Aligned to your pathway", icon: Sparkles },
  { title: "Mentors Available", value: "4", note: "Stage-fit guidance", icon: ShieldCheck },
  { title: "Collaboration Requests", value: "3", note: "Open invitations", icon: Handshake },
  { title: "Connections Made", value: "9", note: "People already connected", icon: Users },
];

const recommendedMatches: MatchCard[] = [
  { id: 1, name: "Esther A.", role: "Cloud Engineer", type: "Collaborator", matchScore: 92, reason: "Overlap in cloud security interests and practical project building.", skills: ["AWS", "IAM", "Linux"], availability: "Open to collaborate" },
  { id: 2, name: "Daniel K.", role: "Security Analyst", type: "Mentor", matchScore: 88, reason: "Guidance on monitoring, detection, and workflows.", skills: ["SIEM", "Detection", "IR"], availability: "Available for mentorship" },
  { id: 3, name: "Miriam O.", role: "Product Builder", type: "Peer", matchScore: 81, reason: "Good fit for innovation teamwork and delivery.", skills: ["Product", "Research", "Coordination"], availability: "Open to connect" },
  { id: 4, name: "Cloud Security Project Sprint", role: "Mini Project Opportunity", type: "Opportunity", matchScore: 86, reason: "Fits your pathway and offers relevant collaboration.", skills: ["Cloud", "Security", "Docs"], availability: "Starts this week" },
];

const activityFeed: ActivityItem[] = [
  { id: 1, name: "Esther A.", action: "accepted your connection request", time: "2 hours ago" },
  { id: 2, name: "Daniel K.", action: "shared a mentoring note on cloud monitoring", time: "Today" },
  { id: 3, name: "Miriam O.", action: "invited you to a project discussion", time: "Yesterday" },
];

const suggestedGroups: SuggestedGroup[] = [
  { id: 1, title: "Cloud Security Builders", description: "Hands-on cloud + security projects.", members: 24 },
  { id: 2, title: "Innovation Execution Circle", description: "Turn ideas into practical MVP outputs.", members: 18 },
  { id: 3, title: "Career Readiness Community", description: "Portfolio, visibility, and opportunity readiness.", members: 31 },
];

const card = "rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm";
const subtle = "text-[var(--color-on-surface-variant)]";
const primaryButton = "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90";
const outlineButton = "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";

function getMatchTypeStyles(type: MatchType) {
  if (type === "Collaborator") return "bg-blue-100 text-blue-700 border-blue-200";
  if (type === "Mentor") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (type === "Peer") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-purple-100 text-purple-700 border-purple-200";
}
function getScoreText(score: number) {
  if (score >= 90) return "Very strong fit";
  if (score >= 80) return "Strong fit";
  if (score >= 70) return "Good fit";
  return "Moderate fit";
}

export default function Network() {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="VisionTech Network"
        title="Connect with people and opportunities that fit your path"
        description="Discover collaborators, mentors, peers, and opportunities recommended by your goals, pathway stage, and activity."
        actions={
          <>
            <button className={outlineButton}>
              <Search className="mr-2 h-4 w-4" />
              Search Network
            </button>
            <button className={primaryButton}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Connection
            </button>
          </>
        }
      />

      <SummaryGrid items={summaryCards} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className={`${card} p-6`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Recommended Matches</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Best-fit connections for you</h2>
              </div>
              <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                Explore all
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recommendedMatches.map((match) => (
                <div key={match.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-5 transition hover:border-[var(--color-primary)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">{match.name}</h3>
                        <span className={`text-sm ${subtle}`}>{match.role}</span>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getMatchTypeStyles(match.type)}`}>{match.type}</span>
                      </div>
                      <p className={`mt-3 text-sm leading-6 ${subtle}`}>{match.reason}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {match.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-[var(--color-surface-container-low)] px-3 py-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className={`mt-4 flex flex-wrap items-center gap-4 text-sm ${subtle}`}>
                        <span>{match.availability}</span>
                        <span>{getScoreText(match.matchScore)}</span>
                      </div>
                    </div>
                    <div className="w-full max-w-[180px]">
                      <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4 text-center">
                        <p className={`text-xs uppercase tracking-wide ${subtle}`}>Match Score</p>
                        <p className="mt-2 text-3xl font-bold text-[var(--color-on-surface)]">{match.matchScore}%</p>
                      </div>
                      <button className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90">
                        Connect
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-[var(--color-surface-container-low)]">
                    <div className="h-2 rounded-full bg-[var(--color-primary)]" style={{ width: `${match.matchScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} p-6`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Suggested Spaces</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Communities worth joining</h2>
              </div>
              <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                View all groups
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {suggestedGroups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-4 transition hover:border-[var(--color-primary)]">
                  <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-3 w-fit">
                    <Users className="h-5 w-5 text-[var(--color-on-surface)]" />
                  </div>
                  <h3 className="mt-4 font-semibold text-[var(--color-on-surface)]">{group.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${subtle}`}>{group.description}</p>
                  <p className={`mt-4 text-sm ${subtle}`}>{group.members} member(s)</p>
                  <button className={`${outlineButton} mt-4 h-10 w-full justify-center`}>Join space</button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} p-6`}>
            <div className="mb-6">
              <p className={`text-sm font-semibold ${subtle}`}>Opportunity Layer</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Practical ways to engage now</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-5">
                <div className="rounded-2xl bg-[var(--color-surface-container-lowest)] p-3 w-fit">
                  <Briefcase className="h-5 w-5 text-[var(--color-on-surface)]" />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--color-on-surface)]">Join a mini project sprint</h3>
                <p className={`mt-2 text-sm leading-6 ${subtle}`}>Work with recommended users on a practical challenge tied to your pathway.</p>
                <button className={`${primaryButton} mt-4 h-10 w-full justify-center`}>Explore sprint</button>
              </div>
              <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-5">
                <div className="rounded-2xl bg-[var(--color-surface-container-lowest)] p-3 w-fit">
                  <MessageSquare className="h-5 w-5 text-[var(--color-on-surface)]" />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--color-on-surface)]">Request a mentor session</h3>
                <p className={`mt-2 text-sm leading-6 ${subtle}`}>Get focused help from a mentor matched to your current stage or skill gap.</p>
                <button className={`${primaryButton} mt-4 h-10 w-full justify-center`}>Request session</button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className={`${card} p-6`}>
            <p className={`text-sm font-semibold ${subtle}`}>Connection Activity</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Recent updates</h2>
            <div className="mt-5 space-y-4">
              {activityFeed.map((item) => (
                <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                  <p className="text-sm leading-6 text-[var(--color-on-surface)]">
                    <span className="font-semibold text-[var(--color-on-surface)]">{item.name}</span> {item.action}
                  </p>
                  <p className={`mt-2 text-xs ${subtle}`}>{item.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} p-6`}>
            <p className={`text-sm font-semibold ${subtle}`}>Quick Actions</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Grow your network</h2>
            <div className="mt-5 space-y-3">
              {[
                { label: "Find collaborator", icon: UserPlus },
                { label: "Explore mentors", icon: ShieldCheck },
                { label: "View requests", icon: Handshake },
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

          <div className="rounded-3xl bg-[var(--color-primary)] p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-white/80">Network Insight</p>
            <h2 className="mt-1 text-xl font-bold">Aligned collaboration wins</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Connect around specific tasks, projects, or mentoring needs rather than random networking to get the strongest outcomes.
            </p>
            <button className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-container-low)]">
              View fit details
            </button>
          </div>

          <div className={`${card} p-6`}>
            <p className={`text-sm font-semibold ${subtle}`}>Profile Signal</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Improve match quality</h2>
            <p className={`mt-3 text-sm leading-6 ${subtle}`}>Complete pathway preferences and collaboration settings to strengthen recommendations.</p>
            <div className="mt-4 h-2 w-full rounded-full bg-[var(--color-surface-container-low)]">
              <div className="h-2 w-[78%] rounded-full bg-[var(--color-primary)]" />
            </div>
            <p className={`mt-2 text-sm ${subtle}`}>Profile completeness: 78%</p>
            <button className={`${outlineButton} mt-4 h-10 w-full justify-center`}>Complete profile</button>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
