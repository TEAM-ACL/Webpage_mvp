import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  LogOut,
  MailPlus,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import InstitutionalAIInsightCard from "../components/organisation/InstitutionalAIInsightCard";
import DashboardShell from "../components/dashboard/DashboardShell";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/AuthContext";
import {
  getInstitutionalAIInsight,
  getOrganisationOverview,
  refreshInstitutionalAIInsight,
} from "../services/organisation";
import type {
  InstitutionalAIInsight,
  InstitutionalRecommendedAction,
  OrganisationActivityItem,
  OrganisationCohort,
  OrganisationInsightResponse,
  OrganisationMemberProgress,
  OrganisationOverviewResponse,
  OrganisationSummaryMetric,
  OrganisationSupportSignal,
} from "../types/organisation";

const card = "rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm";
const subtle = "text-[var(--color-on-surface-variant)]";
const primaryButton = "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90";
const outlineButton = "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";

const summaryMetrics: OrganisationSummaryMetric[] = [
  { label: "Total Members", value: "128", note: "Learners attached to this institution" },
  { label: "Active This Month", value: "94", note: "Members with recent pathway activity" },
  { label: "Active Cohorts", value: "6", note: "Programmes currently in progress" },
  { label: "Average Readiness", value: "67%", note: "Institution-wide opportunity readiness" },
  { label: "Opportunities Shared", value: "21", note: "Open roles, projects, and programmes" },
  { label: "Need Support", value: "18", note: "Members flagged for intervention" },
];

const memberProgress: OrganisationMemberProgress[] = [
  { id: "member-1", name: "Amara Okafor", goal: "Cloud support role", pathwayStage: "Project evidence", readinessScore: 72, lastActivity: "Today", status: "On track" },
  { id: "member-2", name: "Jayden Smith", goal: "Digital skills bootcamp", pathwayStage: "Learning actions", readinessScore: 48, lastActivity: "9 days ago", status: "Needs support" },
  { id: "member-3", name: "Priya Nair", goal: "Graduate employability", pathwayStage: "Interview readiness", readinessScore: 81, lastActivity: "Yesterday", status: "On track" },
  { id: "member-4", name: "Lewis Carter", goal: "Software project portfolio", pathwayStage: "Onboarding", readinessScore: 22, lastActivity: "18 days ago", status: "Incomplete onboarding" },
];

const cohorts: OrganisationCohort[] = [
  { id: "cohort-1", name: "Cloud Career Cohort", members: 32, averageCompletion: 61, averageReadiness: 68, startDate: "May 2026", endDate: "Aug 2026", status: "Active" },
  { id: "cohort-2", name: "Graduate Employability Cohort", members: 44, averageCompletion: 74, averageReadiness: 71, startDate: "Apr 2026", endDate: "Jul 2026", status: "Active" },
  { id: "cohort-3", name: "Digital Skills Bootcamp", members: 28, averageCompletion: 39, averageReadiness: 55, startDate: "Jun 2026", endDate: "Sep 2026", status: "Planning" },
];

const supportSignals: OrganisationSupportSignal[] = [
  { id: "support-1", title: "18 members need intervention", description: "Low readiness, no active project, or no activity within 14 days.", severity: "High" },
  { id: "support-2", title: "Project evidence is weak", description: "42 members have learning progress but no completed practical project.", severity: "Medium" },
  { id: "support-3", title: "Onboarding completion gap", description: "11 invited members have not completed their baseline profile.", severity: "Medium" },
];

const activity: OrganisationActivityItem[] = [
  { id: "activity-1", label: "New member joined", detail: "Amara joined Cloud Career Cohort", time: "25 minutes ago" },
  { id: "activity-2", label: "Opportunity published", detail: "Junior Cloud Support Sprint shared with two cohorts", time: "2 hours ago" },
  { id: "activity-3", label: "Pathway progress", detail: "Priya completed Interview Readiness stage", time: "Yesterday" },
  { id: "activity-4", label: "Report prepared", detail: "June Skills Gap Report is ready for review", time: "2 days ago" },
];

const skillGaps = [
  { label: "Cloud troubleshooting", value: 64 },
  { label: "Project documentation", value: 58 },
  { label: "Interview confidence", value: 46 },
  { label: "Workplace communication", value: 39 },
];

const opportunityTypes = [
  "Employment",
  "Internship",
  "Mentoring",
  "Training",
  "Scholarship",
  "Volunteering",
  "Project collaboration",
];

const reportTypes = [
  "Member Progress Report",
  "Cohort Performance Report",
  "Skills Gap Report",
  "Opportunity Readiness Report",
  "Engagement Report",
];

export default function Organisation(): JSX.Element {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [overview, setOverview] = useState<OrganisationOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [institutionalInsight, setInstitutionalInsight] = useState<InstitutionalAIInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [isInsightRefreshing, setIsInsightRefreshing] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const loadInstitutionalInsight = useCallback(async () => {
    try {
      setIsInsightLoading(true);
      setInsightError(null);
      const response = await getInstitutionalAIInsight();
      setInstitutionalInsight(response.insight);
    } catch (error) {
      setInsightError(
        error instanceof Error ? error.message : "Unable to load institutional AI insight",
      );
    } finally {
      setIsInsightLoading(false);
    }
  }, []);

  const handleRefreshInstitutionalInsight = useCallback(async () => {
    try {
      setIsInsightRefreshing(true);
      setInsightError(null);
      const response = await refreshInstitutionalAIInsight();
      setInstitutionalInsight(response.insight);
    } catch (error) {
      setInsightError(
        error instanceof Error ? error.message : "Unable to refresh institutional AI insight",
      );
    } finally {
      setIsInsightRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadOrganisationOverview(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const organisationOverview = await getOrganisationOverview();
        if (isMounted) {
          setOverview(organisationOverview);
        }
      } catch (error) {
        if (isMounted) {
          setOverview(null);
          setError(error instanceof Error ? error.message : "Unable to load the organisation dashboard");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrganisationOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void loadInstitutionalInsight();
  }, [loadInstitutionalInsight]);

  function handleInstitutionalAction(action: InstitutionalRecommendedAction): void {
    switch (action.actionType) {
      case "create_cohort":
        navigate("/organisation/cohorts?create=true");
        break;
      case "create_intervention":
        navigate("/organisation/interventions?create=true");
        break;
      case "share_opportunity":
        navigate("/organisation/opportunities?create=true");
        break;
      case "review_members":
        navigate("/organisation/members?filter=needs-support");
        break;
      case "assign_project":
        navigate("/organisation/cohorts?action=assign-project");
        break;
      case "share_resource":
        navigate("/organisation/members?action=share-resource");
        break;
      default:
        console.warn("Unsupported institutional AI action:", action.actionType);
    }
  }

  const administratorName =
    profile?.fullName || user?.display_name || user?.email || "Organisation Administrator";
  const organisationName =
    overview?.summary.organisationName || profile?.organisationName || "VisionTech Organisation";
  const organisationType = overview?.summary.organisationType || "Institution";
  const dashboardMetrics = useMemo(() => buildSummaryMetrics(overview), [overview]);
  const dashboardSupportSignals = useMemo(() => buildSupportSignals(overview), [overview]);
  const dashboardActivity = useMemo(() => buildActivity(overview), [overview]);
  const dashboardInsight = fallbackInsight;

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className={`text-sm ${subtle}`}>Loading organisation dashboard...</p>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-700">Organisation dashboard unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-red-900/80">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className={primaryButton}>
            Try again
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Institutional Command Centre"
        title="Organisation Dashboard"
        description="Manage members, cohorts, opportunities, progress signals, and institutional readiness from one protected workspace."
        actions={
          <>
            <button className={outlineButton}>
              <MailPlus className="mr-2 h-4 w-4" />
              Invite Members
            </button>
            <button className={primaryButton}>
              <Plus className="mr-2 h-4 w-4" />
              Create Cohort
            </button>
          </>
        }
      />

      <section className={`${card} mb-6 overflow-hidden p-6`}>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className={`text-sm font-semibold ${subtle}`}>Organisation</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--color-on-surface)]">{organisationName}</h2>
            <p className={`mt-3 text-sm leading-6 ${subtle}`}>
              Administrator: <span className="font-semibold text-[var(--color-on-surface)]">{administratorName}</span>
              {" "}· Type: <span className="font-semibold text-emerald-700">{organisationType}</span>
              {" "}· Reporting period: July 2026
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button className={outlineButton}>
              <BriefcaseBusiness className="mr-2 h-4 w-4" />
              Add Opportunity
            </button>
            <button className={outlineButton}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              onClick={() => void logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Admin Logout
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {dashboardMetrics.map((metric) => (
          <div key={metric.label} className={`${card} p-5`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${subtle}`}>{metric.label}</p>
            <p className="mt-3 text-2xl font-bold text-[var(--color-on-surface)]">{metric.value}</p>
            <p className={`mt-2 text-xs leading-5 ${subtle}`}>{metric.note}</p>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <InstitutionalAIInsightCard
          insight={institutionalInsight}
          isLoading={isInsightLoading}
          isRefreshing={isInsightRefreshing}
          error={insightError}
          onRefresh={handleRefreshInstitutionalInsight}
          onActionSelect={handleInstitutionalAction}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <MemberProgressSection members={memberProgress} />
          <CohortSection cohorts={cohorts} />
          <AnalyticsSection skillGaps={skillGaps} />
        </div>

        <aside className="space-y-6">
          <QuickActions />
          <SupportPanel supportSignals={dashboardSupportSignals} />
          <ActivityFeed activity={dashboardActivity} />
          <OrganisationInsight insight={dashboardInsight} />
        </aside>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <OpportunitiesSection />
        <ReportsSection />
      </section>
    </DashboardShell>
  );
}

function MemberProgressSection({ members }: { members: OrganisationMemberProgress[] }): JSX.Element {
  return (
    <section className={`${card} p-6`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${subtle}`}>Member Progress Overview</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Who needs support now?</h2>
        </div>
        <Users className="h-5 w-5 text-[var(--color-primary)]" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className={`text-left text-sm ${subtle}`}>
              <th className="pb-2 pr-4 font-medium">Member</th>
              <th className="pb-2 pr-4 font-medium">Current Goal</th>
              <th className="pb-2 pr-4 font-medium">Pathway Stage</th>
              <th className="pb-2 pr-4 font-medium">Readiness</th>
              <th className="pb-2 pr-4 font-medium">Last Activity</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 pr-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="rounded-2xl bg-[var(--color-surface-container-low)]">
                <td className="rounded-l-2xl px-4 py-4 text-sm font-semibold text-[var(--color-on-surface)]">{member.name}</td>
                <td className={`px-4 py-4 text-sm ${subtle}`}>{member.goal}</td>
                <td className={`px-4 py-4 text-sm ${subtle}`}>{member.pathwayStage}</td>
                <td className="px-4 py-4 text-sm font-semibold text-[var(--color-on-surface)]">{member.readinessScore}%</td>
                <td className={`px-4 py-4 text-sm ${subtle}`}>{member.lastActivity}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(member.status)}`}>
                    {member.status}
                  </span>
                </td>
                <td className="rounded-r-2xl px-4 py-4">
                  <button className="rounded-xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-on-surface)]">
                    View Progress
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CohortSection({ cohorts }: { cohorts: OrganisationCohort[] }): JSX.Element {
  return (
    <section className={`${card} p-6`}>
      <div className="mb-5">
        <p className={`text-sm font-semibold ${subtle}`}>Cohort Management</p>
        <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Programme performance</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {cohorts.map((cohort) => (
          <div key={cohort.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-[var(--color-on-surface)]">{cohort.name}</h3>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{cohort.status}</span>
            </div>
            <p className={`mt-2 text-sm ${subtle}`}>{cohort.members} members · {cohort.startDate} to {cohort.endDate}</p>
            <ProgressRow label="Completion" value={cohort.averageCompletion} />
            <ProgressRow label="Readiness" value={cohort.averageReadiness} />
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalyticsSection({ skillGaps }: { skillGaps: Array<{ label: string; value: number }> }): JSX.Element {
  return (
    <section className={`${card} p-6`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${subtle}`}>Readiness and Skills Analytics</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Institutional skill signals</h2>
        </div>
        <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {skillGaps.map((gap) => (
          <ProgressRow key={gap.label} label={gap.label} value={gap.value} />
        ))}
      </div>
    </section>
  );
}

function QuickActions(): JSX.Element {
  const actions = ["Invite Members", "Create Cohort", "Add Opportunity", "Assign Support", "Generate Report"];
  return (
    <section className={`${card} p-6`}>
      <p className={`text-sm font-semibold ${subtle}`}>Quick Actions</p>
      <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Administrator tools</h2>
      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <button key={action} className="flex w-full items-center justify-between rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-left text-sm font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]">
            {action}
            <Plus className="h-4 w-4 text-[var(--color-on-surface-variant)]" />
          </button>
        ))}
      </div>
    </section>
  );
}

function SupportPanel({ supportSignals }: { supportSignals: OrganisationSupportSignal[] }): JSX.Element {
  return (
    <section className={`${card} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${subtle}`}>Members Requiring Support</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Intervention panel</h2>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-600" />
      </div>
      <div className="mt-5 space-y-3">
        {supportSignals.map((signal) => (
          <div key={signal.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-amber-950">{signal.title}</p>
              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-amber-700">{signal.severity}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-amber-900/80">{signal.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityFeed({ activity }: { activity: OrganisationActivityItem[] }): JSX.Element {
  return (
    <section className={`${card} p-6`}>
      <p className={`text-sm font-semibold ${subtle}`}>Organisation Activity</p>
      <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Recent updates</h2>
      <div className="mt-5 space-y-3">
        {activity.map((item) => (
          <div key={item.id} className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{item.label}</p>
            <p className={`mt-1 text-xs leading-5 ${subtle}`}>{item.detail}</p>
            <p className={`mt-2 text-[11px] ${subtle}`}>{item.time}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrganisationInsight({ insight }: { insight: OrganisationInsightResponse }): JSX.Element {
  return (
    <section className="rounded-3xl bg-[var(--color-primary)] p-6 text-white shadow-sm">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 h-5 w-5 text-white/80" />
        <div>
          <p className="text-sm font-semibold text-white/80">Organisation Insight</p>
          <h2 className="mt-1 text-xl font-bold">{insight.title}</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/80">
        {insight.message}
      </p>
    </section>
  );
}

function OpportunitiesSection(): JSX.Element {
  return (
    <section className={`${card} p-6`}>
      <p className={`text-sm font-semibold ${subtle}`}>Opportunities Management</p>
      <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Assign opportunities to cohorts</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {opportunityTypes.map((type) => (
          <div key={type} className="rounded-2xl border border-[var(--color-outline-variant)] p-4">
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{type}</p>
            <p className={`mt-1 text-xs ${subtle}`}>Prepare, publish, recommend, and track readiness.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportsSection(): JSX.Element {
  return (
    <section className={`${card} p-6`}>
      <p className={`text-sm font-semibold ${subtle}`}>Reports</p>
      <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Generate institutional reports</h2>
      <div className="mt-5 space-y-3">
        {reportTypes.map((report) => (
          <button key={report} className="flex w-full items-center justify-between rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-left text-sm font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]">
            {report}
            <FileText className="h-4 w-4 text-[var(--color-on-surface-variant)]" />
          </button>
        ))}
      </div>
    </section>
  );
}

const fallbackInsight: OrganisationInsightResponse = {
  title: "Create a practical project challenge",
  message:
    "Member participation is improving, but project evidence still needs attention. A practical project challenge could increase opportunity readiness.",
  source: "placeholder",
};

function buildSummaryMetrics(overview: OrganisationOverviewResponse | null): OrganisationSummaryMetric[] {
  if (!overview) return summaryMetrics;

  return [
    { label: "Total Members", value: String(overview.summary.totalMembers), note: "Registered organisation members" },
    { label: "Active Members", value: String(overview.summary.activeMembers), note: "Members active within the reporting period" },
    { label: "Active Cohorts", value: String(overview.summary.activeCohorts), note: "Currently running cohorts" },
    { label: "Average Readiness", value: `${overview.summary.averageReadiness}%`, note: "Average opportunity readiness" },
    { label: "Need Support", value: String(overview.summary.membersNeedingSupport), note: "Members requiring intervention" },
  ];
}

function buildSupportSignals(overview: OrganisationOverviewResponse | null): OrganisationSupportSignal[] {
  if (!overview) return supportSignals;

  return [
    {
      id: "live-support-readiness",
      title: `${overview.summary.membersNeedingSupport} members need intervention`,
      description: "Low readiness, incomplete onboarding, inactivity, or missing pathway progress.",
      severity: overview.summary.membersNeedingSupport > 0 ? "High" : "Low",
    },
    {
      id: "live-support-readiness-average",
      title: `${overview.summary.averageReadiness}% average readiness`,
      description: "Use targeted support to improve institutional opportunity readiness.",
      severity: overview.summary.averageReadiness < 50 ? "Medium" : "Low",
    },
  ];
}

function buildActivity(overview: OrganisationOverviewResponse | null): OrganisationActivityItem[] {
  if (!overview) return activity;

  return overview.recentActivity.map((item) => ({
    id: item.id,
    label: item.title,
    detail: item.description,
    time: formatDateLabel(item.createdAt),
  }));
}

function formatDateLabel(value: string | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function ProgressRow({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--color-on-surface)]">{label}</span>
        <span className={subtle}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-surface-container-low)]">
        <div className="h-2 rounded-full bg-[var(--color-primary)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function statusClass(status: OrganisationMemberProgress["status"]): string {
  if (status === "On track") return "bg-emerald-100 text-emerald-700";
  if (status === "Needs support") return "bg-amber-100 text-amber-700";
  if (status === "Incomplete onboarding") return "bg-purple-100 text-purple-700";
  return "bg-red-100 text-red-700";
}
