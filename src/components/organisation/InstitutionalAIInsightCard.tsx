import type { JSX } from "react";
import { Sparkles } from "lucide-react";
import type {
  InstitutionalAIInsight,
  InstitutionalRecommendedAction,
  InsightPriority,
} from "../../types/organisation";

type InstitutionalAIInsightCardProps = {
  insight: InstitutionalAIInsight | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onActionSelect: (action: InstitutionalRecommendedAction) => void;
};

function getPriorityClasses(priority: InsightPriority): string {
  switch (priority) {
    case "critical":
      return "border-red-500/30 bg-red-500/10 text-red-700";
    case "high":
      return "border-orange-500/30 bg-orange-500/10 text-orange-700";
    case "medium":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700";
    default:
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
  }
}

function formatGeneratedTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently generated";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function InstitutionalAIInsightCard({
  insight,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
  onActionSelect,
}: InstitutionalAIInsightCardProps): JSX.Element {
  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-48 rounded bg-[var(--color-surface-container-low)]" />
          <div className="h-4 w-full rounded bg-[var(--color-surface-container-low)]" />
          <div className="h-4 w-4/5 rounded bg-[var(--color-surface-container-low)]" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-2xl bg-[var(--color-surface-container-low)]" />
            <div className="h-20 rounded-2xl bg-[var(--color-surface-container-low)]" />
            <div className="h-20 rounded-2xl bg-[var(--color-surface-container-low)]" />
          </div>
        </div>
      </section>
    );
  }

  if (error && !insight) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-700">Institutional AI insight unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-red-900/80">{error}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-4 rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!insight) {
    return (
      <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[var(--color-primary)]">VisionTech Institutional AI</p>
        <h2 className="mt-2 text-xl font-bold text-[var(--color-on-surface)]">
          Generate your first institutional insight
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
          VisionTech AI will analyse member activity, progress, readiness, projects,
          skill gaps, and support requirements.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="mt-5 rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? "Generating insight..." : "Generate AI Insight"}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">VisionTech Institutional AI</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--color-on-surface)]">
              Organisation Intelligence
            </h2>
            <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
              Generated {formatGeneratedTime(insight.generatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getPriorityClasses(
              insight.priority,
            )}`}
          >
            {insight.priority} priority
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-2xl border border-[var(--color-outline-variant)] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Showing the latest available insight. Refresh failed: {error}
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-[var(--color-surface-container-low)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">AI Summary</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
          {insight.summary}
        </p>
      </div>

      {insight.mainConcern && (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-[var(--color-on-surface)]">Priority concern</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">
            {insight.mainConcern}
          </p>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold text-[var(--color-on-surface)]">Supporting Evidence</h3>
          <span className="text-xs text-[var(--color-on-surface-variant)]">
            Confidence: {insight.confidenceScore}%
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insight.evidence.map((item) => (
            <article key={`${item.label}-${item.value}`} className="rounded-2xl border border-[var(--color-outline-variant)] p-4">
              <p className="text-xs text-[var(--color-on-surface-variant)]">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-[var(--color-on-surface)]">{item.value}</p>
              {item.explanation && (
                <p className="mt-2 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                  {item.explanation}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-[var(--color-on-surface)]">Recommended Actions</h3>
        <div className="mt-3 space-y-3">
          {insight.recommendedActions.map((action) => (
            <article
              key={action.id}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--color-outline-variant)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-[var(--color-on-surface)]">{action.title}</h4>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs capitalize ${getPriorityClasses(
                      action.priority,
                    )}`}
                  >
                    {action.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                  {action.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onActionSelect(action)}
                className="shrink-0 rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white"
              >
                Review Action
              </button>
            </article>
          ))}
        </div>
      </div>

      <p className="mt-6 border-t border-[var(--color-outline-variant)] pt-4 text-xs leading-5 text-[var(--color-on-surface-variant)]">
        AI recommendations support administrator decisions. They do not automatically
        change member records or apply interventions.
      </p>
    </section>
  );
}
