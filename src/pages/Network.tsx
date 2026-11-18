import { useEffect, useMemo, useState } from "react";
import DashboardShell from "../components/dashboard/DashboardShell";
import PageHeader from "../components/dashboard/PageHeader";
import SummaryGrid, { type SummaryItem } from "../components/dashboard/SummaryGrid";
import TenantContextBanner from "../components/dashboard/TenantContextBanner";
import { useAuth } from "../context/AuthContext";
import { useOrganisation } from "../context/OrganisationContext";
import {
  getCollaborationConnections,
  getIncomingCollaborationRequests,
  getOutgoingCollaborationRequests,
} from "../services/collaboration";
import type {
  CollaborationConnection,
  CollaborationRequestItem,
} from "../types/collaboration";
import {
  Users,
  UserPlus,
  Briefcase,
  ArrowRight,
  MessageSquare,
  Search,
  ShieldCheck,
  Handshake,
} from "lucide-react";

type ActivityItem = { id: string; name: string; action: string; time: string };
type SuggestedGroup = { id: number; title: string; description: string; members: number };

const suggestedGroups: SuggestedGroup[] = [
  { id: 1, title: "Cloud Security Builders", description: "Hands-on cloud + security projects.", members: 24 },
  { id: 2, title: "Innovation Execution Circle", description: "Turn ideas into practical MVP outputs.", members: 18 },
  { id: 3, title: "Career Readiness Community", description: "Portfolio, visibility, and opportunity readiness.", members: 31 },
];

const card = "rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm";
const subtle = "text-[var(--color-on-surface-variant)]";
const primaryButton = "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90";
const outlineButton = "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";

export default function Network() {
  const { profile } = useAuth();
  const { organisation } = useOrganisation();
  const organisationId = organisation?.id ?? profile?.organisationId ?? null;
  const [connections, setConnections] = useState<CollaborationConnection[]>([]);
  const [incoming, setIncoming] = useState<CollaborationRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<CollaborationRequestItem[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!organisationId) {
      setConnections([]);
      setIncoming([]);
      setOutgoing([]);
      return () => { active = false; };
    }
    setNetworkLoading(true);
    setNetworkError(null);
    void Promise.all([
      getCollaborationConnections(organisationId),
      getIncomingCollaborationRequests(organisationId),
      getOutgoingCollaborationRequests(organisationId),
    ])
      .then(([connectionResult, incomingResult, outgoingResult]) => {
        if (!active) return;
        setConnections(connectionResult.items);
        setIncoming(incomingResult.items);
        setOutgoing(outgoingResult.items);
      })
      .catch((error) => {
        if (active) setNetworkError(error instanceof Error ? error.message : "Unable to load network activity.");
      })
      .finally(() => {
        if (active) setNetworkLoading(false);
      });
    return () => { active = false; };
  }, [organisationId]);

  const pendingRequests = useMemo(
    () => [...incoming, ...outgoing].filter((request) => request.status === "pending"),
    [incoming, outgoing],
  );
  const summaryCards: SummaryItem[] = [
    { title: "Active Connections", value: String(connections.length), note: "Authorised project relationships", icon: Users },
    { title: "Incoming Requests", value: String(incoming.filter((item) => item.status === "pending").length), note: "Waiting for your decision", icon: Handshake },
    { title: "Outgoing Requests", value: String(outgoing.filter((item) => item.status === "pending").length), note: "Waiting for a response", icon: UserPlus },
    { title: "Project Permissions", value: String(connections.filter((item) => item.permission_scope.includes("project_activity")).length), note: "Scoped to collaboration activity", icon: ShieldCheck },
  ];
  const activityFeed: ActivityItem[] = connections.map((connection) => ({
    id: connection.id,
    name: connection.counterpart_name,
    action: `connected with you on ${connection.project_title}`,
    time: new Date(connection.connected_at).toLocaleDateString(),
  }));
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

      <TenantContextBanner />

      <SummaryGrid items={summaryCards} />

      {networkError ? <p className="mb-6 text-sm font-semibold text-[var(--color-error)]">{networkError}</p> : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className={`${card} p-6`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Authorised Relationships</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Your active project connections</h2>
              </div>
              <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                Explore all
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {networkLoading ? <p className={`text-sm ${subtle}`}>Loading connections...</p> : null}
              {!networkLoading && connections.length === 0 ? (
                <p className={`rounded-2xl bg-[var(--color-surface-container-low)] p-5 text-sm ${subtle}`}>
                  No active connections yet. Accepting a project collaboration request will create one here.
                </p>
              ) : null}
              {connections.map((connection) => (
                <div key={connection.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">{connection.counterpart_name}</h3>
                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Project collaborator</span>
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${subtle}`}>Connected on {connection.project_title}</p>
                  <p className={`mt-2 text-xs ${subtle}`}>Permission: project activity only</p>
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
              {activityFeed.length === 0 ? <p className={`mt-5 text-sm ${subtle}`}>No connection activity yet.</p> : null}
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
                { label: `View requests (${pendingRequests.length})`, icon: Handshake },
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
