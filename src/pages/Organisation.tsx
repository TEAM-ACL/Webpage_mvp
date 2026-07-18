import { useCallback, useEffect, useMemo, useState, type JSX, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  BrainCircuit,
  Briefcase,
  ChevronRight,
  Filter,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getInstitutionalAIInsight,
  getOrganisationMembers,
  getOrganisationOverview,
  refreshInstitutionalAIInsight,
} from "../services/organisation";
import type {
  InstitutionalAIInsight,
  InstitutionalRecommendedAction,
  OrganisationMember,
  OrganisationOverviewResponse,
} from "../types/organisation";

type NavItem =
  | "Dashboard"
  | "People"
  | "Programmes"
  | "Opportunities"
  | "Intelligence"
  | "Interventions"
  | "Reports"
  | "Settings";

type HealthMetric = {
  label: string;
  value: number;
  color: string;
};

const navItems: Array<{ label: NavItem; icon: typeof LayoutDashboard }> = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "People", icon: Users },
  { label: "Programmes", icon: GraduationCap },
  { label: "Opportunities", icon: Briefcase },
  { label: "Intelligence", icon: BrainCircuit },
  { label: "Interventions", icon: Zap },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const fallbackPeople: OrganisationMember[] = [
  {
    id: "person-1",
    fullName: "Amara Okafor",
    email: "amara@example.com",
    goal: "Cloud Engineer",
    cohortName: "AWS Cloud Dev",
    readinessScore: 88,
    pathwayProgress: 74,
    lastActiveAt: "2026-07-17T09:00:00Z",
    status: "active",
    needsSupport: false,
  },
  {
    id: "person-2",
    fullName: "James Wilson",
    email: "james@example.com",
    goal: "Data Scientist",
    cohortName: "Data Mastery",
    readinessScore: 42,
    pathwayProgress: 28,
    lastActiveAt: "2026-07-02T13:00:00Z",
    status: "inactive",
    needsSupport: true,
  },
  {
    id: "person-3",
    fullName: "Sarah Chen",
    email: "sarah@example.com",
    goal: "AI Researcher",
    cohortName: "ML Ops",
    readinessScore: 76,
    pathwayProgress: 64,
    lastActiveAt: "2026-07-16T15:30:00Z",
    status: "active",
    needsSupport: false,
  },
];

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export default function Organisation(): JSX.Element {
  const navigate = useNavigate();
  const { profile, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavItem>("Dashboard");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [overview, setOverview] = useState<OrganisationOverviewResponse | null>(null);
  const [people, setPeople] = useState<OrganisationMember[]>(fallbackPeople);
  const [insight, setInsight] = useState<InstitutionalAIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInsightRefreshing, setIsInsightRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [overviewResult, peopleResult, insightResult] = await Promise.allSettled([
      getOrganisationOverview(),
      getOrganisationMembers(),
      getInstitutionalAIInsight(),
    ]);

    if (overviewResult.status === "fulfilled") {
      setOverview(overviewResult.value);
    } else {
      setError(overviewResult.reason instanceof Error ? overviewResult.reason.message : "Unable to load organisation data.");
    }
    if (peopleResult.status === "fulfilled") {
      setPeople(peopleResult.value);
    }
    if (insightResult.status === "fulfilled") {
      setInsight(insightResult.value.insight);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const organisationName = overview?.summary.organisationName || profile?.organisationName || "VisionTech Organisation";
  const organisationType = overview?.summary.organisationType || "Training Provider";
  const administratorName = profile?.fullName || user?.display_name || user?.email || "Organisation Admin";
  const healthMetrics = useMemo(() => buildHealthMetrics(overview), [overview]);
  const summaryStats = useMemo(() => buildSummaryStats(overview, insight), [overview, insight]);
  const peopleNeedingSupport = people.filter((person) => person.needsSupport);

  async function handleRefreshInsight(): Promise<void> {
    setIsInsightRefreshing(true);
    try {
      const response = await refreshInstitutionalAIInsight();
      setInsight(response.insight);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to refresh institutional AI insight.");
    } finally {
      setIsInsightRefreshing(false);
    }
  }

  function handleAction(action: InstitutionalRecommendedAction): void {
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

  function handleNavSelect(label: NavItem): void {
    setActiveTab(label);
    setIsMobileNavOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <OrganisationSidebar
        activeTab={activeTab}
        organisationName={organisationName}
        organisationType={organisationType}
        administratorName={administratorName}
        isOpen={isMobileNavOpen}
        onSelect={handleNavSelect}
        onClose={() => setIsMobileNavOpen(false)}
        onLogout={() => void logout()}
      />

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 lg:hidden"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 transition focus-within:border-indigo-500 md:flex">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search people, programmes, or insights..."
                className="w-full border-none bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 md:inline">
                Preview fallback active
              </span>
            )}
            <button className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-xs font-bold text-slate-700">
              {administratorName.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-4 lg:p-8">
          {activeTab === "Dashboard" ? (
            <DashboardView
              organisationName={organisationName}
              summaryStats={summaryStats}
              healthMetrics={healthMetrics}
              insight={insight}
              peopleNeedingSupport={peopleNeedingSupport}
              isLoading={isLoading}
              isRefreshing={isInsightRefreshing}
              onRefreshInsight={handleRefreshInsight}
              onReviewPeople={() => navigate("/organisation/members?filter=needs-support")}
              onCreateSprint={() => navigate("/organisation/cohorts?create=true")}
              onPostOpportunity={() => navigate("/organisation/opportunities?create=true")}
              onAction={handleAction}
            />
          ) : activeTab === "People" ? (
            <PeopleView people={people} onOpenPeoplePage={() => navigate("/organisation/members")} />
          ) : (
            <ModulePreview activeTab={activeTab} onOpenModule={() => navigate(moduleDestination(activeTab))} />
          )}
        </div>
      </main>

      <AiCopilotPanel
        isOpen={isAiPanelOpen}
        insight={insight}
        healthMetrics={healthMetrics}
        onClose={() => setIsAiPanelOpen(false)}
        onOpen={() => setIsAiPanelOpen(true)}
        onRefresh={() => void handleRefreshInsight()}
      />
    </div>
  );
}

function OrganisationSidebar({
  activeTab,
  organisationName,
  organisationType,
  administratorName,
  isOpen,
  onSelect,
  onClose,
  onLogout,
}: {
  activeTab: NavItem;
  organisationName: string;
  organisationType: string;
  administratorName: string;
  isOpen: boolean;
  onSelect: (label: NavItem) => void;
  onClose: () => void;
  onLogout: () => void;
}): JSX.Element {
  return (
    <>
      {isOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={onClose} />}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white p-4 transition lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-start justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight">VisionTech</span>
              <span className="block text-xs font-medium text-slate-500">Institution OS</span>
            </div>
          </div>
          <button type="button" className="rounded-xl border border-slate-200 p-2 lg:hidden" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="truncate text-sm font-bold tracking-tight text-slate-900">{organisationName}</p>
          <p className="mt-1 text-xs font-medium capitalize text-slate-500">{organisationType}</p>
          <p className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
            {administratorName}
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.label}
              onClick={() => onSelect(item.label)}
            />
          ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Admin Logout
        </button>
      </aside>
    </>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
        active ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon size={18} className={active ? "text-indigo-400" : "group-hover:text-slate-900"} />
      {label}
    </button>
  );
}

function DashboardView({
  organisationName,
  summaryStats,
  healthMetrics,
  insight,
  peopleNeedingSupport,
  isLoading,
  isRefreshing,
  onRefreshInsight,
  onReviewPeople,
  onCreateSprint,
  onPostOpportunity,
  onAction,
}: {
  organisationName: string;
  summaryStats: Array<{ label: string; value: string; trend: string; color?: string }>;
  healthMetrics: HealthMetric[];
  insight: InstitutionalAIInsight | null;
  peopleNeedingSupport: OrganisationMember[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefreshInsight: () => Promise<void>;
  onReviewPeople: () => void;
  onCreateSprint: () => void;
  onPostOpportunity: () => void;
  onAction: (action: InstitutionalRecommendedAction) => void;
}): JSX.Element {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-indigo-600">Outcome-first command centre</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Good morning, {organisationName}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Your organisation dashboard now starts with intelligence, people outcomes, and actions — not static tables.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryStats.map((stat) => (
            <Card key={stat.label} className="px-6 py-4 hover:border-indigo-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <div className="mt-1 flex items-end justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">{stat.value}</h3>
                <span className={cx("rounded-full bg-slate-100 px-2 py-1 text-xs font-bold", stat.color || "text-indigo-600")}>
                  {stat.trend}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ExecutiveBrief
            insight={insight}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onRefresh={onRefreshInsight}
            onAction={onAction}
          />
        </div>
        <HealthScore metrics={healthMetrics} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Immediate Interventions</h2>
            <p className="text-sm text-slate-500">Action cards pair risk signals with recommended administrator moves.</p>
          </div>
          <button type="button" onClick={onReviewPeople} className="text-sm font-bold text-indigo-600 hover:underline">
            Review all support cases
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <InterventionCard
            icon={<AlertCircle size={20} />}
            tone="amber"
            title={`${peopleNeedingSupport.length || 1} members need attention`}
            detail="Support risk detected from inactivity, low readiness, or incomplete progress."
            action="Schedule Mentor Review"
            onClick={onReviewPeople}
          />
          <InterventionCard
            icon={<TrendingUp size={20} />}
            tone="indigo"
            title="Readiness-to-opportunity window"
            detail="High-readiness members should be matched with opportunities before momentum fades."
            action="Post Opportunity"
            onClick={onPostOpportunity}
          />
          <InterventionCard
            icon={<Target size={20} />}
            tone="emerald"
            title="Project evidence gap"
            detail="Programme engagement is stronger than submitted evidence."
            action="Create Portfolio Sprint"
            onClick={onCreateSprint}
          />
          <InterventionCard
            icon={<BrainCircuit size={20} />}
            tone="sky"
            title="AI recommendation queue"
            detail="Use the executive brief actions before making manual changes."
            action="Refresh Insight"
            onClick={() => void onRefreshInsight()}
          />
        </div>
      </section>
    </div>
  );
}

function ExecutiveBrief({
  insight,
  isLoading,
  isRefreshing,
  onRefresh,
  onAction,
}: {
  insight: InstitutionalAIInsight | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onAction: (action: InstitutionalRecommendedAction) => void;
}): JSX.Element {
  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-950 to-indigo-950 text-white shadow-xl">
      <Sparkles className="absolute right-5 top-5 text-indigo-400 opacity-40" size={44} />
      <div className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <BrainCircuit size={20} className="text-indigo-400" />
              VisionTech AI Executive Brief
            </h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-indigo-300">
              {isLoading ? "Analysing institution" : `Confidence ${insight?.confidenceScore ?? 72}%`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={isRefreshing}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh AI"}
          </button>
        </div>

        <div className="mt-6 space-y-4 text-slate-300">
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-indigo-500" />
            <p className="text-sm leading-6">{insight?.summary || "Loading institution-wide intelligence from your organisation data."}</p>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-amber-500" />
            <p className="text-sm leading-6">
              {insight?.mainConcern || "Practical evidence and intervention signals will appear here once AI analysis completes."}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-indigo-300">Recommended next move</p>
            <p className="text-sm text-white">
              {insight?.recommendedActions[0]?.description || "Create a practical portfolio sprint to bridge the evidence gap."}
            </p>
            {insight?.recommendedActions[0] && (
              <button
                type="button"
                onClick={() => onAction(insight.recommendedActions[0])}
                className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-black text-slate-950"
              >
                Review Action
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function HealthScore({ metrics }: { metrics: HealthMetric[] }): JSX.Element {
  const overall = Math.round(metrics.reduce((total, metric) => total + metric.value, 0) / metrics.length);
  return (
    <Card>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-bold tracking-tight text-slate-800">Organisation Health</h2>
          <p className="mt-1 text-xs text-slate-500">Three-second institutional checkup</p>
        </div>
        <span className="text-3xl font-black text-indigo-600">{overall}%</span>
      </div>
      <div className="space-y-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={cx("h-full rounded-full transition-all", metric.color)} style={{ width: `${metric.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PeopleView({
  people,
  onOpenPeoplePage,
}: {
  people: OrganisationMember[];
  onOpenPeoplePage: () => void;
}): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">People are outcomes, not rows</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Human Potential Cards</h1>
          <p className="mt-2 text-sm text-slate-500">Review goals, readiness, risk, and growth momentum at a glance.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold transition hover:bg-slate-50">
            <Filter size={16} />
            Filters
          </button>
          <button onClick={onOpenPeoplePage} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-200">
            Open Members Page
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 text-sm font-bold text-slate-500">
        {["Overview", "Progress", "Support", "Achievements"].map((tab) => (
          <button
            key={tab}
            className={cx(
              "border-b-2 px-2 pb-3 transition",
              tab === "Overview" ? "border-indigo-600 text-indigo-600" : "border-transparent hover:text-slate-800",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}

function PersonCard({ person }: { person: OrganisationMember }): JSX.Element {
  const risk = person.needsSupport || person.readinessScore < 50 ? "High" : "Low";
  return (
    <Card className="group cursor-pointer hover:shadow-md">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-black text-slate-600">
          {person.fullName.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold tracking-tight transition group-hover:text-indigo-600">{person.fullName}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Target size={12} />
            {person.goal || "Goal not set"}
          </p>
          <p className="mt-1 text-xs text-slate-400">{person.cohortName || "No programme assigned"}</p>
        </div>
        <span
          className={cx(
            "rounded px-2 py-0.5 text-[10px] font-black uppercase",
            risk === "High" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600",
          )}
        >
          {risk} Risk
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500">Readiness</span>
          <span className="font-black">{person.readinessScore}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${person.readinessScore}%` }} />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((badge) => (
              <div key={badge} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold">
                <Award size={10} />
              </div>
            ))}
          </div>
          <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}

function AiCopilotPanel({
  isOpen,
  insight,
  healthMetrics,
  onClose,
  onOpen,
  onRefresh,
}: {
  isOpen: boolean;
  insight: InstitutionalAIInsight | null;
  healthMetrics: HealthMetric[];
  onClose: () => void;
  onOpen: () => void;
  onRefresh: () => void;
}): JSX.Element {
  const weakestMetric = healthMetrics.reduce((lowest, metric) => (metric.value < lowest.value ? metric : lowest), healthMetrics[0]);

  return (
    <>
      <aside
        className={cx(
          "hidden overflow-hidden border-l border-slate-200 bg-white transition-all duration-300 xl:flex xl:flex-col",
          isOpen ? "w-80" : "w-0 border-none",
        )}
      >
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles size={20} />
              <span className="font-bold tracking-tight">VisionTech AI</span>
            </div>
            <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="mb-2 font-bold">Suggested Actions</p>
              <ul className="space-y-3">
                {["Who needs support?", "Which programme is improving?", "Generate impact report", "Analyse skill gaps"].map((question) => (
                  <li key={question} className="group flex cursor-pointer items-center justify-between text-slate-600 hover:text-indigo-600">
                    <span>{question}</span>
                    <ChevronRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <p className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Contextual Insight</p>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-950">
                I noticed that <strong>{weakestMetric.label}</strong> is the weakest health signal at{" "}
                <strong>{weakestMetric.value}%</strong>. Prioritise the action queue before adding new reports.
              </div>
              {insight?.mainConcern && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                  {insight.mainConcern}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6">
            <div className="relative">
              <textarea
                placeholder="Ask anything..."
                className="h-24 w-full resize-none rounded-2xl border border-slate-200 p-4 pr-12 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={onRefresh} className="absolute bottom-3 right-3 rounded-xl bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700">
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition hover:scale-110"
        >
          <Sparkles size={20} />
        </button>
      )}
    </>
  );
}

function ModulePreview({ activeTab, onOpenModule }: { activeTab: NavItem; onOpenModule: () => void }): JSX.Element {
  return (
    <Card className="min-h-[420px]">
      <p className="text-sm font-semibold text-indigo-600">Outcome module</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{activeTab}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        This section is now part of the outcome-first organisation structure. Open the dedicated module to manage the workflow in detail.
      </p>
      <button onClick={onOpenModule} className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-100">
        Open {activeTab}
      </button>
    </Card>
  );
}

function InterventionCard({
  icon,
  tone,
  title,
  detail,
  action,
  onClick,
}: {
  icon: ReactNode;
  tone: "amber" | "indigo" | "emerald" | "sky";
  title: string;
  detail: string;
  action: string;
  onClick: () => void;
}): JSX.Element {
  const tones = {
    amber: "border-l-amber-500 text-amber-600 bg-amber-50",
    indigo: "border-l-indigo-500 text-indigo-600 bg-indigo-50",
    emerald: "border-l-emerald-500 text-emerald-600 bg-emerald-50",
    sky: "border-l-sky-500 text-sky-600 bg-sky-50",
  };

  return (
    <div className={cx("flex items-center justify-between gap-4 rounded-r-2xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm", tones[tone].split(" ")[0])}>
      <div className="flex items-center gap-4">
        <div className={cx("rounded-xl p-2", tones[tone])}>{icon}</div>
        <div>
          <p className="text-sm font-black tracking-tight text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
      </div>
      <button onClick={onClick} className="shrink-0 text-xs font-black text-indigo-600 hover:underline">
        {action}
      </button>
    </div>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <div className={cx("rounded-2xl border border-slate-200 bg-white p-6 transition-all", className)}>
      {children}
    </div>
  );
}

function buildSummaryStats(
  overview: OrganisationOverviewResponse | null,
  insight: InstitutionalAIInsight | null,
): Array<{ label: string; value: string; trend: string; color?: string }> {
  return [
    {
      label: "Active Learners",
      value: String(overview?.summary.activeMembers ?? 0),
      trend: `${overview?.summary.totalMembers ?? 0} total`,
    },
    {
      label: "New Insights",
      value: String(insight?.recommendedActions.length ?? 0),
      trend: insight ? "AI ready" : "Loading",
    },
    {
      label: "Need Attention",
      value: String(overview?.summary.membersNeedingSupport ?? 0),
      trend: "Critical",
      color: "text-red-500",
    },
    {
      label: "Readiness",
      value: `${overview?.summary.averageReadiness ?? 0}%`,
      trend: "Health",
    },
  ];
}

function buildHealthMetrics(overview: OrganisationOverviewResponse | null): HealthMetric[] {
  const totalMembers = overview?.summary.totalMembers ?? 0;
  const activeMembers = overview?.summary.activeMembers ?? 0;
  const supportCount = overview?.summary.membersNeedingSupport ?? 0;
  const engagement = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
  const supportHealth = totalMembers > 0 ? Math.round(((totalMembers - supportCount) / totalMembers) * 100) : 75;

  return [
    { label: "Engagement", value: engagement, color: "bg-indigo-500" },
    { label: "Readiness", value: overview?.summary.averageReadiness ?? 0, color: "bg-emerald-500" },
    { label: "Projects", value: supportHealth, color: "bg-amber-500" },
    { label: "Opportunities", value: Math.max(60, overview?.summary.averageReadiness ?? 0), color: "bg-sky-500" },
  ];
}

function moduleDestination(activeTab: NavItem): string {
  const destinations: Record<NavItem, string> = {
    Dashboard: "/organisation",
    People: "/organisation/members",
    Programmes: "/organisation/cohorts",
    Opportunities: "/organisation/opportunities",
    Intelligence: "/organisation",
    Interventions: "/organisation/interventions",
    Reports: "/organisation/reports",
    Settings: "/organisation/settings",
  };
  return destinations[activeTab];
}
