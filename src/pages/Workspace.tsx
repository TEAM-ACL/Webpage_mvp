import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "../components/dashboard/DashboardShell";
import PageHeader from "../components/dashboard/PageHeader";
import SummaryGrid, { type SummaryItem } from "../components/dashboard/SummaryGrid";
import { useAuth } from "../context/AuthContext";
import {
  getWorkspaceState,
  runWorkspaceLearningAction,
  runWorkspaceTaskAction,
  startWorkspaceFocus,
} from "../services/workspace";
import type { WorkspaceStateResponse, WorkspaceSummaryCard } from "../types/workspace";
import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  Users,
  Plus,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Sparkles,
} from "lucide-react";

type Project = { id: string; title: string; description: string; progress: number; status: "Active" | "In Review" | "Completed"; members: number };
type WorkspaceProject = Project & { nextAction: string; relatedGoal: string };
type Task = { id: string; title: string; project: string; priority: "Low" | "Medium" | "High"; due: string; status: "To Do" | "In Progress" | "Done"; action: "Start" | "Mark Complete" | "View"; backendId?: string };
type LearningAction = { id: string; title: string; skillArea: string; provider: string; reason: string; status: "Recommended" | "In Progress" | "Saved" | "Completed"; backendId?: string; sourceUrl?: string | null };
type CollaborationItem = { id: number; name: string; action: string; time: string };
type ReadinessItem = { label: string; value: number };

const summaryCards: SummaryItem[] = [
  { title: "Active Projects", value: "3", note: "Projects currently being worked on", icon: FolderKanban },
  { title: "Tasks Due", value: "7", note: "Action items that need attention", icon: Clock3 },
  { title: "Completed Tasks", value: "18", note: "Finished tasks across your workspace", icon: CheckCircle2 },
  { title: "Collaborators", value: "5", note: "People connected to your workspaces", icon: Users },
  { title: "Readiness Score", value: "68%", note: "Current opportunity readiness signal", icon: Sparkles },
];

const fallbackTodaysFocus = {
  mainAction: "Complete one project task",
  reason: "This improves your opportunity readiness by adding practical evidence to your profile.",
  estimatedTime: "45 minutes",
};

const projects: WorkspaceProject[] = [
  {
    id: "preview-project-1",
    title: "Cloud Support Portfolio",
    description: "Build practical cloud support evidence through troubleshooting notes, IAM practice, and deployment documentation.",
    progress: 45,
    status: "Active",
    members: 2,
    nextAction: "Add troubleshooting notes",
    relatedGoal: "IT Support / Cloud Support",
  },
  {
    id: "preview-project-2",
    title: "VisionTech Pathway Research",
    description: "Organise ideas, notes, and opportunity signals that support pathway recommendations.",
    progress: 62,
    status: "In Review",
    members: 3,
    nextAction: "Summarise two opportunity patterns",
    relatedGoal: "Career direction",
  },
  {
    id: "preview-project-3",
    title: "Portfolio Readiness Tasks",
    description: "A structured effort to build practical evidence and project visibility for opportunity readiness.",
    progress: 90,
    status: "Completed",
    members: 1,
    nextAction: "Review final project evidence",
    relatedGoal: "Portfolio credibility",
  },
];

const tasks: Task[] = [
  { id: "preview-task-1", title: "Complete IAM lab notes", project: "Cloud Support Portfolio", priority: "High", due: "Today", status: "In Progress", action: "Mark Complete" },
  { id: "preview-task-2", title: "Upload project documentation", project: "Portfolio Readiness Tasks", priority: "Medium", due: "Tomorrow", status: "To Do", action: "Start" },
  { id: "preview-task-3", title: "Review AI-generated pathway suggestions", project: "VisionTech Pathway Research", priority: "Medium", due: "This week", status: "To Do", action: "Start" },
  { id: "preview-task-4", title: "Finish workspace summary update", project: "Cloud Support Portfolio", priority: "Low", due: "This week", status: "Done", action: "View" },
];

const fallbackLearningActions: LearningAction[] = [
  { id: "preview-learning-1", title: "Cloud IAM Best Practices", skillArea: "Cloud security", provider: "External guide", reason: "Strengthens evidence for your Cloud Support Portfolio.", status: "Recommended" },
  { id: "preview-learning-2", title: "Troubleshooting Documentation Practice", skillArea: "Technical writing", provider: "Project template", reason: "Helps turn project activity into visible portfolio proof.", status: "In Progress" },
  { id: "preview-learning-3", title: "Intro to Ticket Handling Workflows", skillArea: "IT support", provider: "External course", reason: "Connects your current project to practical support-role workflows.", status: "Saved" },
  { id: "preview-learning-4", title: "Portfolio Case Study Structure", skillArea: "Career readiness", provider: "Template", reason: "Improves how employers and mentors understand your project evidence.", status: "Recommended" },
];

const collaborationFeed: CollaborationItem[] = [
  { id: 1, name: "Esther A.", action: "left mentor feedback on Cloud Support Portfolio", time: "1 hour ago" },
  { id: 2, name: "Daniel K.", action: "joined VisionTech Pathway Research workspace", time: "3 hours ago" },
  { id: 3, name: "Miriam O.", action: "shared a project comment in Portfolio Readiness Tasks", time: "Yesterday" },
];

const readinessBreakdown: ReadinessItem[] = [
  { label: "Skills", value: 70 },
  { label: "Projects", value: 45 },
  { label: "CV", value: 80 },
  { label: "Interview", value: 60 },
];

const card = "rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm";
const subtle = "text-[var(--color-on-surface-variant)]";
const primaryButton = "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90";
const outlineButton = "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-medium text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";

function statusBadge(status: Project["status"]): string {
  if (status === "Active") return "bg-[color:var(--color-primary)/0.1] text-[var(--color-primary)] border border-[color:var(--color-primary)/0.2]";
  if (status === "In Review") return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
}
function priorityBadge(priority: Task["priority"]): string {
  if (priority === "High") return "bg-red-100 text-red-700";
  if (priority === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}
function taskStatusBadge(status: Task["status"]): string {
  if (status === "Done") return "bg-emerald-100 text-emerald-700";
  if (status === "In Progress") return "bg-[color:var(--color-primary)/0.12] text-[var(--color-primary)]";
  return "bg-slate-100 text-slate-700";
}
function learningStatusBadge(status: LearningAction["status"]): string {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "In Progress") return "bg-[color:var(--color-primary)/0.12] text-[var(--color-primary)]";
  if (status === "Saved") return "bg-slate-100 text-slate-700";
  return "bg-emerald-100 text-emerald-700";
}

function NotLiveBadge({ label = "Not live yet" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      {label}
    </span>
  );
}

function summaryIcon(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("project")) return FolderKanban;
  if (normalized.includes("task")) return Clock3;
  if (normalized.includes("learning")) return BookOpen;
  if (normalized.includes("collaborator")) return Users;
  return Sparkles;
}

function mapSummaryCards(cards: WorkspaceSummaryCard[]): SummaryItem[] {
  return cards.map((item) => ({
    title: item.title,
    value: item.value,
    note: item.note,
    icon: summaryIcon(item.title),
  }));
}

function mapProjectStatus(status: string): Project["status"] {
  if (status === "completed") return "Completed";
  if (status === "planning" || status === "paused") return "In Review";
  return "Active";
}

function mapTaskPriority(priority: string): Task["priority"] {
  if (priority === "high") return "High";
  if (priority === "low") return "Low";
  return "Medium";
}

function mapTaskStatus(status: string): Task["status"] {
  if (status === "done") return "Done";
  if (status === "in_progress") return "In Progress";
  return "To Do";
}

function mapLearningStatus(status: string): LearningAction["status"] {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  if (status === "saved") return "Saved";
  return "Recommended";
}

export default function Workspace() {
  const { aiInsight, aiInsightUpdatedAt, recommendations } = useAuth();
  const [workspaceState, setWorkspaceState] = useState<WorkspaceStateResponse | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [workspaceActionLoading, setWorkspaceActionLoading] = useState<string | null>(null);
  const [workspaceActionMessage, setWorkspaceActionMessage] = useState<string | null>(null);

  const loadWorkspaceState = useCallback(async () => {
    setWorkspaceLoading(true);
    setWorkspaceError(null);
    try {
      const state = await getWorkspaceState();
      setWorkspaceState(state);
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Workspace state could not be loaded.",
      );
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspaceState();
  }, [loadWorkspaceState]);

  async function runWorkspaceAction(
    actionKey: string,
    action: () => Promise<{ message: string; redirect_url: string | null; state: WorkspaceStateResponse | null }>,
  ): Promise<void> {
    setWorkspaceActionLoading(actionKey);
    setWorkspaceActionMessage(null);
    setWorkspaceError(null);
    try {
      const result = await action();
      if (result.state) {
        setWorkspaceState(result.state);
      }
      setWorkspaceActionMessage(result.message);
      if (result.redirect_url) {
        window.open(result.redirect_url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Workspace action could not be completed.",
      );
    } finally {
      setWorkspaceActionLoading(null);
    }
  }

  function taskPayloadFromLabel(actionLabel: Task["action"]): "start" | "complete" | "view" {
    if (actionLabel === "Mark Complete") return "complete";
    if (actionLabel === "View") return "view";
    return "start";
  }

  async function handleStartFocus(): Promise<void> {
    await runWorkspaceAction("focus:start", () => startWorkspaceFocus());
  }

  async function handleTaskAction(task: Task): Promise<void> {
    if (!task.backendId) return;
    await runWorkspaceAction(`task:${task.backendId}`, () =>
      runWorkspaceTaskAction(task.backendId!, { action: taskPayloadFromLabel(task.action) }),
    );
  }

  async function handleLearningAction(resource: LearningAction): Promise<void> {
    if (!resource.backendId) {
      if (resource.sourceUrl) {
        window.open(resource.sourceUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }
    await runWorkspaceAction(`learning:${resource.backendId}`, () =>
      runWorkspaceLearningAction(resource.backendId!, { action: "open" }),
    );
  }

  const notLiveSections = workspaceState?.not_live_sections ?? [];
  const hasNotLiveSection = (section: string): boolean =>
    !workspaceState || notLiveSections.includes(section);

  const displayedSummaryCards = workspaceState?.summary_cards?.length
    ? mapSummaryCards(workspaceState.summary_cards)
    : summaryCards;

  const displayedProjects: WorkspaceProject[] = workspaceState?.projects?.length
    ? workspaceState.projects.map((project) => ({
      id: project.project_id,
      title: project.title,
      description: project.description,
      progress: project.progress_percent,
      status: mapProjectStatus(project.status),
      members: project.members,
      nextAction: project.next_action,
      relatedGoal: project.related_goal,
    }))
    : projects;

  const displayedTasks: Task[] = workspaceState?.tasks?.length
    ? workspaceState.tasks.map((task) => ({
      id: task.task_id,
      backendId: task.task_id,
      title: task.title,
      project: task.linked_project,
      priority: mapTaskPriority(task.priority),
      due: task.due_label,
      status: mapTaskStatus(task.status),
      action: task.action_label,
    }))
    : tasks;

  const backendLearningActions: LearningAction[] = workspaceState?.learning_actions?.length
    ? workspaceState.learning_actions.map((action) => ({
      id: action.action_id,
      backendId: action.action_id,
      title: action.title,
      skillArea: action.skill_area,
      provider: action.provider,
      reason: action.reason,
      status: mapLearningStatus(action.status),
      sourceUrl: action.source_url,
    }))
    : [];

  const displayedReadiness = workspaceState?.readiness?.length
    ? workspaceState.readiness
    : readinessBreakdown;

  const displayedCollaboration = workspaceState?.collaboration?.length
    ? workspaceState.collaboration.map((item, index) => ({
      id: index + 1,
      name: item.actor_name,
      action: item.action,
      time: item.time_label,
    }))
    : collaborationFeed;

  const intelligenceLearningActions = useMemo<LearningAction[]>(() => {
    const resourceActions = (recommendations?.recommended_resources ?? []).map((item, index) => ({
      id: `intelligence-resource-${index + 1}`,
      title: item.title || "Recommended learning resource",
      skillArea: item.level || item.type || "Pathway skill",
      provider: item.sources?.[0]?.platform || "External provider",
      reason: item.reason || "Recommended from your Intelligence plan.",
      status: "Recommended" as const,
      sourceUrl: item.sources?.[0]?.url ?? null,
    }));

    const pathwayActions = (recommendations?.recommendations ?? []).map((item, index) => ({
      id: `intelligence-pathway-${item.pathway_id || index + 1}`,
      title: item.title,
      skillArea: item.skill_level || "Pathway skill",
      provider: "VisionTech pathway",
      reason: item.match_reason || item.next_steps[0] || "Recommended from your AI pathway guidance.",
      status: item.action_state?.started || item.action_state?.completed ? "In Progress" as const : "Recommended" as const,
    }));

    return [...resourceActions, ...pathwayActions].slice(0, 4);
  }, [recommendations]);

  const learningActions = backendLearningActions.length > 0
    ? backendLearningActions
    : intelligenceLearningActions.length > 0
      ? intelligenceLearningActions
      : fallbackLearningActions;
  const learningActionsAreLive = backendLearningActions.length > 0 || intelligenceLearningActions.length > 0;

  const focus = useMemo(() => {
    if (workspaceState?.focus) {
      return {
        mainAction: workspaceState.focus.main_action,
        reason: workspaceState.focus.reason,
        estimatedTime: `${workspaceState.focus.estimated_time_minutes} minutes`,
      };
    }

    const topRecommendation = recommendations?.recommendations?.[0];
    const action =
      aiInsight?.next_best_actions?.[0]
      || aiInsight?.next_steps?.[0]
      || topRecommendation?.next_steps?.[0]
      || fallbackTodaysFocus.mainAction;

    const reason = topRecommendation
      ? `This moves your recommended ${topRecommendation.title} pathway from insight into evidence.`
      : aiInsight?.summary
        ? "This action is based on your latest AI insight and helps turn guidance into visible progress."
        : fallbackTodaysFocus.reason;

    return {
      mainAction: action,
      reason,
      estimatedTime: fallbackTodaysFocus.estimatedTime,
    };
  }, [aiInsight, recommendations, workspaceState]);

  const aiSummary = workspaceState?.insight?.message || aiInsight?.summary;
  const aiUpdatedAt = workspaceState?.ai_insight_updated_at || aiInsightUpdatedAt;
  const workspaceInsight = workspaceState?.insight;

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Continue from your Intelligence Plan"
        title="Action Workspace"
        description="Turn your AI insight into practical progress, projects, and opportunity readiness."
        actions={
          <>
            <button className={outlineButton} onClick={() => void loadWorkspaceState()} disabled={workspaceLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {workspaceLoading ? "Refreshing..." : "Refresh AI Guidance"}
            </button>
            <button
              className={primaryButton}
              onClick={() => void handleStartFocus()}
              disabled={workspaceActionLoading !== null}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Continue My Plan
            </button>
          </>
        }
      />

      {workspaceLoading ? (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Loading workspace execution state...
        </div>
      ) : null}
      {workspaceError ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Workspace backend state is unavailable, so preview data is shown. {workspaceError}
        </div>
      ) : null}
      {workspaceActionMessage ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {workspaceActionMessage}
        </div>
      ) : null}

      <section className={`${card} mb-6 p-6`}>
        <p className={`text-sm font-semibold ${subtle}`}>Your AI Insight Summary</p>
        <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Diagnosis becomes execution here</h2>
        <p className={`mt-3 max-w-4xl text-sm leading-6 ${subtle}`}>
          {aiSummary
            || "Load or refresh your Intelligence plan to turn AI guidance into workspace tasks, project evidence, and learning actions."}
        </p>
        <p className={`mt-3 text-xs ${subtle}`}>
          Last AI update: {aiUpdatedAt ? new Date(aiUpdatedAt).toLocaleString() : "Not loaded yet"}
        </p>
      </section>

      <section className={`${card} mb-6 overflow-hidden p-6`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">Today's Focus</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--color-on-surface)]">{focus.mainAction}</h2>
            <p className={`mt-3 max-w-3xl text-sm leading-6 ${subtle}`}>
              <span className="font-semibold text-[var(--color-on-surface)]">Recommended by VisionTech AI:</span>{" "}
              {focus.reason}
            </p>
            <p className={`mt-2 text-sm ${subtle}`}>Estimated time: {focus.estimatedTime}</p>
          </div>
          <button
            className={primaryButton}
            onClick={() => void handleStartFocus()}
            disabled={workspaceActionLoading !== null}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            {workspaceActionLoading === "focus:start" ? "Starting..." : "Start Focus Task"}
          </button>
        </div>
      </section>

      <section className="mb-3 flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${subtle}`}>Workspace metrics</p>
        {!workspaceState ? <NotLiveBadge label="Preview fallback" /> : null}
      </section>
      <SummaryGrid items={displayedSummaryCards} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className={`${card} p-6`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Active Projects</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Your current workspaces</h2>
              </div>
              {hasNotLiveSection("projects") ? <NotLiveBadge label="Preview fallback" /> : null}
              <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {displayedProjects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-5 transition hover:border-[var(--color-primary)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">{project.title}</h3>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(project.status)}`}>{project.status}</span>
                        {!workspaceState ? <NotLiveBadge label="Preview data" /> : null}
                      </div>
                      <p className={`mt-2 max-w-2xl text-sm leading-6 ${subtle}`}>{project.description}</p>
                      <div className={`mt-4 flex flex-wrap gap-4 text-sm ${subtle}`}>
                        <span>{project.members} member(s)</span>
                        <span>{project.progress}% complete</span>
                      </div>
                    </div>
                    <button className="inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90">
                      Open Project
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                      <p className={`text-xs font-semibold uppercase tracking-wide ${subtle}`}>Next action</p>
                      <p className="mt-1 text-sm font-medium text-[var(--color-on-surface)]">{project.nextAction}</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                      <p className={`text-xs font-semibold uppercase tracking-wide ${subtle}`}>Related goal</p>
                      <p className="mt-1 text-sm font-medium text-[var(--color-on-surface)]">{project.relatedGoal}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 w-full rounded-full bg-[var(--color-surface-container-low)]">
                      <div className="h-2 rounded-full bg-[var(--color-primary)]" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} p-6`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Task Board</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Tasks that need your attention</h2>
              </div>
              {hasNotLiveSection("tasks") ? <NotLiveBadge label="Derived actions" /> : null}
              <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                Manage tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className={`text-left text-sm ${subtle}`}>
                    <th className="pb-2 pr-4 font-medium">Task</th>
                    <th className="pb-2 pr-4 font-medium">Linked Project</th>
                    <th className="pb-2 pr-4 font-medium">Priority</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Due Date</th>
                    <th className="pb-2 pr-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTasks.map((task) => (
                    <tr key={task.id} className="rounded-2xl bg-[var(--color-surface-container-low)]">
                      <td className="rounded-l-2xl px-4 py-4 text-sm font-medium text-[var(--color-on-surface)]">{task.title}</td>
                      <td className={`px-4 py-4 text-sm ${subtle}`}>{task.project}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityBadge(task.priority)}`}>{task.priority}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${taskStatusBadge(task.status)}`}>{task.status}</span>
                      </td>
                      <td className={`px-4 py-4 text-sm ${subtle}`}>{task.due}</td>
                      <td className="rounded-r-2xl px-4 py-4">
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-3 text-xs font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => void handleTaskAction(task)}
                          disabled={!task.backendId || workspaceActionLoading !== null}
                        >
                          {workspaceActionLoading === `task:${task.backendId}` ? "Updating..." : task.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${card} p-6`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Recommended Learning Actions</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Learning pulled from your Intelligence plan</h2>
              </div>
              {!learningActionsAreLive ? <NotLiveBadge label="Preview fallback" /> : null}
              <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                Add learning resource
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {learningActions.map((resource) => (
                <div key={resource.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-4 transition hover:border-[var(--color-primary)]">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-3">
                      <BookOpen className="h-5 w-5 text-[var(--color-on-surface)]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--color-on-surface)]">{resource.title}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${learningStatusBadge(resource.status)}`}>
                          {resource.status}
                        </span>
                      </div>
                      <p className={`mt-2 text-xs font-medium ${subtle}`}>{resource.skillArea} · {resource.provider}</p>
                      <p className={`mt-2 text-sm leading-6 ${subtle}`}>{resource.reason}</p>
                      <button
                        className="mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-[var(--color-outline-variant)] px-3 text-xs font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => void handleLearningAction(resource)}
                        disabled={workspaceActionLoading !== null || (!resource.backendId && !resource.sourceUrl)}
                      >
                        {workspaceActionLoading === `learning:${resource.backendId}` ? "Opening..." : "Open Resource"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className={`${card} p-6`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Opportunity Readiness</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Where to improve next</h2>
              </div>
              {hasNotLiveSection("readiness") ? <NotLiveBadge label="Preview fallback" /> : null}
            </div>
            <div className="mt-5 space-y-4">
              {displayedReadiness.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--color-on-surface)]">{item.label}</span>
                    <span className={subtle}>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-surface-container-low)]">
                    <div className="h-2 rounded-full bg-[var(--color-primary)]" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90">
              Improve Readiness
            </button>
          </div>

          <div className={`${card} p-6`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Support & Collaboration</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Recent pathway support</h2>
              </div>
              {hasNotLiveSection("collaboration") ? <NotLiveBadge /> : null}
            </div>
            <div className="mt-5 space-y-4">
              {displayedCollaboration.map((item) => (
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${subtle}`}>Quick Actions</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Keep moving</h2>
              </div>
              <NotLiveBadge />
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Create project", icon: Plus },
                { label: "Add task", icon: CheckCircle2 },
                { label: "Add learning resource", icon: BookOpen },
                { label: "Request feedback", icon: MessageSquare },
                { label: "Update progress", icon: Clock3 },
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

          <div className="rounded-3xl bg-[var(--color-primary)] text-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white/80">{workspaceInsight?.title ?? "Workspace Insight"}</p>
                <h2 className="mt-1 text-xl font-bold">Your execution rhythm is improving</h2>
              </div>
              {hasNotLiveSection("workspace_insight_ai_refresh") ? (
                <span className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  Not live yet
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/80">
              {workspaceInsight?.message
                ?? "You are making good progress, but your project evidence is still weaker than your skills signal. Complete one practical project task this week to improve your readiness score."}
            </p>
            <button className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-container-low)]">
              View recommendations
            </button>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
