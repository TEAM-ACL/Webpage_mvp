import type { ElementType } from "react";
import DashboardShell from "../components/dashboard/DashboardShell";
import PageHeader from "../components/dashboard/PageHeader";
import SummaryGrid, { type SummaryItem } from "../components/dashboard/SummaryGrid";
import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  Users,
  Plus,
  ArrowRight,
  BookOpen,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";

type Project = { id: number; title: string; description: string; progress: number; status: "Active" | "In Review" | "Completed"; members: number };
type Task = { id: number; title: string; project: string; priority: "Low" | "Medium" | "High"; due: string; status: "To Do" | "In Progress" | "Done" };
type Resource = { id: number; title: string; type: "Guide" | "Document" | "Template" | "Note"; description: string };
type CollaborationItem = { id: number; name: string; action: string; time: string };

const summaryCards: SummaryItem[] = [
  { title: "Active Projects", value: "3", note: "Projects currently being worked on", icon: FolderKanban },
  { title: "Tasks Due", value: "7", note: "Action items that need attention", icon: Clock3 },
  { title: "Completed Tasks", value: "18", note: "Finished tasks across your workspace", icon: CheckCircle2 },
  { title: "Collaborators", value: "5", note: "People connected to your workspaces", icon: Users },
];

const projects: Project[] = [
  { id: 1, title: "Cloud Security Mini Project", description: "Hands-on project focused on identity and access control practice in cloud environments.", progress: 68, status: "Active", members: 2 },
  { id: 2, title: "VisionTech Pathway Research", description: "Organising ideas, notes, and opportunity signals that support pathway recommendations.", progress: 42, status: "In Review", members: 3 },
  { id: 3, title: "Portfolio Readiness Tasks", description: "A structured effort to build practical evidence and project visibility for opportunity readiness.", progress: 90, status: "Completed", members: 1 },
];

const tasks: Task[] = [
  { id: 1, title: "Complete IAM lab notes", project: "Cloud Security Mini Project", priority: "High", due: "Today", status: "In Progress" },
  { id: 2, title: "Upload project documentation", project: "Portfolio Readiness Tasks", priority: "Medium", due: "Tomorrow", status: "To Do" },
  { id: 3, title: "Review AI-generated pathway suggestions", project: "VisionTech Pathway Research", priority: "Medium", due: "This week", status: "To Do" },
  { id: 4, title: "Finish workspace summary update", project: "Cloud Security Mini Project", priority: "Low", due: "This week", status: "Done" },
];

const resources: Resource[] = [
  { id: 1, title: "Cloud IAM Best Practices", type: "Guide", description: "Reference material for access control and permission design." },
  { id: 2, title: "Project Structure Template", type: "Template", description: "Reusable format for breaking projects into stages." },
  { id: 3, title: "Workspace Planning Notes", type: "Note", description: "Personal notes and execution ideas saved from recent sessions." },
  { id: 4, title: "VisionTech MVP Tasks", type: "Document", description: "Working document outlining practical deliverables for the MVP." },
];

const collaborationFeed: CollaborationItem[] = [
  { id: 1, name: "Esther A.", action: "commented on Cloud Security Mini Project", time: "1 hour ago" },
  { id: 2, name: "Daniel K.", action: "joined VisionTech Pathway Research workspace", time: "3 hours ago" },
  { id: 3, name: "Miriam O.", action: "shared a new document in Portfolio Readiness Tasks", time: "Yesterday" },
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

export default function Workspace() {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="VisionTech Workspace"
        title="Build, organise, and execute your work"
        description="Manage projects, track tasks, save resources, and collaborate with people aligned to your pathway."
        actions={
          <>
            <button className={outlineButton}>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Suggestions
            </button>
            <button className={primaryButton}>
              <Plus className="mr-2 h-4 w-4" />
              New Workspace
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
                <p className={`text-sm font-semibold ${subtle}`}>Active Projects</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Your current workspaces</h2>
              </div>
              <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-5 transition hover:border-[var(--color-primary)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">{project.title}</h3>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(project.status)}`}>{project.status}</span>
                      </div>
                      <p className={`mt-2 max-w-2xl text-sm leading-6 ${subtle}`}>{project.description}</p>
                      <div className={`mt-4 flex flex-wrap gap-4 text-sm ${subtle}`}>
                        <span>{project.members} member(s)</span>
                        <span>{project.progress}% complete</span>
                      </div>
                    </div>
                    <button className="inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90">
                      Open
                    </button>
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
                    <th className="pb-2 pr-4 font-medium">Project</th>
                    <th className="pb-2 pr-4 font-medium">Priority</th>
                    <th className="pb-2 pr-4 font-medium">Due</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="rounded-2xl bg-[var(--color-surface-container-low)]">
                      <td className="rounded-l-2xl px-4 py-4 text-sm font-medium text-[var(--color-on-surface)]">{task.title}</td>
                      <td className={`px-4 py-4 text-sm ${subtle}`}>{task.project}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityBadge(task.priority)}`}>{task.priority}</span>
                      </td>
                      <td className={`px-4 py-4 text-sm ${subtle}`}>{task.due}</td>
                      <td className="rounded-r-2xl px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${taskStatusBadge(task.status)}`}>{task.status}</span>
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
                <p className={`text-sm font-semibold ${subtle}`}>Saved Resources</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Helpful items in your workspace</h2>
              </div>
              <button className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)]">
                Open library
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-2xl border border-[var(--color-outline-variant)] p-4 transition hover:border-[var(--color-primary)]">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-3">
                      {resource.type === "Guide" && <BookOpen className="h-5 w-5 text-[var(--color-on-surface)]" />}
                      {resource.type === "Document" && <FileText className="h-5 w-5 text-[var(--color-on-surface)]" />}
                      {resource.type === "Template" && <FolderKanban className="h-5 w-5 text-[var(--color-on-surface)]" />}
                      {resource.type === "Note" && <MessageSquare className="h-5 w-5 text-[var(--color-on-surface)]" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--color-on-surface)]">{resource.title}</h3>
                        <span className="rounded-full bg-[var(--color-surface-container-low)] px-2.5 py-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
                          {resource.type}
                        </span>
                      </div>
                      <p className={`mt-2 text-sm leading-6 ${subtle}`}>{resource.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className={`${card} p-6`}>
            <p className={`text-sm font-semibold ${subtle}`}>Collaboration Feed</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Recent team activity</h2>
            <div className="mt-5 space-y-4">
              {collaborationFeed.map((item) => (
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
            <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">Keep moving</h2>
            <div className="mt-5 space-y-3">
              {[
                { label: "Create project", icon: Plus },
                { label: "Add task", icon: CheckCircle2 },
                { label: "Invite collaborator", icon: Users },
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
            <p className="text-sm font-semibold text-white/80">Workspace Insight</p>
            <h2 className="mt-1 text-xl font-bold">Your execution rhythm is improving</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              You are making stronger progress when tasks are linked directly to your pathway goals. Keep projects small, practical, and outcome-focused.
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
