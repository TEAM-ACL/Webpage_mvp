import { useEffect, useState, type JSX } from "react";
import DashboardShell from "../components/dashboard/DashboardShell";
import PageHeader from "../components/dashboard/PageHeader";
import {
  exportWaitlistCsv,
  getAdminActivity,
  getAdminSummary,
  getAdminSystemHealth,
} from "../services/admin";
import { useToast } from "../context/ToastContext";
import type {
  AdminActivityItem,
  AdminSummaryResponse,
  AdminSystemHealthResponse,
} from "../types/admin";

function MetricCard({ title, value }: { title: string; value: number }): JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function healthClass(value: "healthy" | "degraded" | "down"): string {
  if (value === "healthy") return "text-emerald-700";
  if (value === "degraded") return "text-amber-700";
  return "text-red-700";
}

export default function Admin(): JSX.Element {
  const { showError, showSuccess } = useToast();
  const [summary, setSummary] = useState<AdminSummaryResponse | null>(null);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [health, setHealth] = useState<AdminSystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingWaitlist, setExportingWaitlist] = useState(false);

  const handleExportWaitlist = async (): Promise<void> => {
    setExportingWaitlist(true);
    try {
      const { blob, filename } = await exportWaitlistCsv();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      showSuccess("Waitlist CSV downloaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not export waitlist CSV.";
      showError(message);
    } finally {
      setExportingWaitlist(false);
    }
  };

  const loadAdminData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, activityData, healthData] = await Promise.all([
        getAdminSummary(),
        getAdminActivity(),
        getAdminSystemHealth(),
      ]);
      setSummary(summaryData);
      setActivity(activityData.items ?? []);
      setHealth(healthData);
    } catch {
      setError("Admin dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const refreshAdminData = async (): Promise<void> => {
    setRefreshing(true);
    setError(null);
    try {
      const [summaryData, activityData, healthData] = await Promise.all([
        getAdminSummary(),
        getAdminActivity(),
        getAdminSystemHealth(),
      ]);
      setSummary(summaryData);
      setActivity(activityData.items ?? []);
      setHealth(healthData);
    } catch {
      setError("Admin dashboard data could not be refreshed.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="VisionTech Admin"
        title="Admin Intelligence Dashboard"
        description="Monitor users, onboarding, AI activity, learning, projects, collaboration, and system health."
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void handleExportWaitlist();
              }}
              disabled={exportingWaitlist || loading}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportingWaitlist ? "Exporting..." : "Export Waitlist CSV"}
            </button>
            <button
              type="button"
              onClick={() => {
                void refreshAdminData();
              }}
              disabled={refreshing || loading}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        )}
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading admin dashboard...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error && summary && health ? (
        <main className="space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard title="Total Users" value={summary.users.total} />
            <MetricCard title="Active Users" value={summary.users.active} />
            <MetricCard title="Onboarding Complete" value={summary.users.onboarding_completed} />
            <MetricCard title="Onboarding Incomplete" value={summary.users.onboarding_incomplete} />
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard title="AI Insights Generated" value={summary.ai.insights_generated} />
            <MetricCard title="AI Failed Requests" value={summary.ai.failed_requests} />
            <MetricCard title="Learning Tracked Items" value={summary.learning.tracked_items} />
            <MetricCard title="Learning Completed" value={summary.learning.completed_items} />
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard title="Projects Total" value={summary.projects.total} />
            <MetricCard title="Projects In Progress" value={summary.projects.in_progress} />
            <MetricCard title="Projects Completed" value={summary.projects.completed} />
            <MetricCard title="Collab Pending Requests" value={summary.collaboration.pending_requests} />
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Collab Accepted" value={summary.collaboration.accepted_requests} />
            <MetricCard title="Collab Declined" value={summary.collaboration.declined_requests} />
            <MetricCard title="Open Projects" value={summary.projects.in_progress} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">System Health</h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                API: <span className={healthClass(health.api)}>{health.api}</span>
              </p>
              <p>
                Database: <span className={healthClass(health.database)}>{health.database}</span>
              </p>
              <p>
                AI Provider: <span className={healthClass(health.ai_provider)}>{health.ai_provider}</span>
              </p>
              <p className="text-slate-600">Last checked: {new Date(health.last_checked).toLocaleString()}</p>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <div className="mt-3 space-y-3">
              {activity.length > 0 ? (
                activity.map((item) => (
                  <div key={item.id} className="border-b border-slate-100 pb-2">
                    <p className="text-sm text-slate-800">{item.message}</p>
                    <p className="mt-1 text-xs uppercase text-slate-500">{item.type}</p>
                    <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No recent admin activity.</p>
              )}
            </div>
          </section>
        </main>
      ) : null}

      {!loading && !error && (!summary || !health) ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No admin data available.
        </div>
      ) : null}
    </DashboardShell>
  );
}
