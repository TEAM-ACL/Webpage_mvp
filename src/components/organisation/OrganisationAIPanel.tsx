import type { JSX } from "react";
import { BrainCircuit, ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import type { InstitutionalAIInsight, InstitutionalRecommendedAction } from "../../types/organisation";

type OrganisationAIPanelProps = {
  contextLabel: string;
  title?: string;
  insight: InstitutionalAIInsight | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  prompts: string[];
  selectedPrompt: string | null;
  response: string | null;
  onPromptSelect: (prompt: string) => void;
  onRefresh: () => void;
  onActionSelect: (action: InstitutionalRecommendedAction) => void;
};

export default function OrganisationAIPanel({
  contextLabel,
  title = "VisionTech AI Copilot",
  insight,
  isLoading,
  isRefreshing,
  error,
  prompts,
  selectedPrompt,
  response,
  onPromptSelect,
  onRefresh,
  onActionSelect,
}: OrganisationAIPanelProps): JSX.Element {
  const primaryAction = insight?.recommendedActions[0] ?? null;

  return (
    <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-950 via-[#1f0954] to-indigo-950 text-white shadow-xl shadow-indigo-100/60">
      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-indigo-200">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-200">{contextLabel}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Ask focused institutional questions, refresh AI insight, and route recommended actions into the correct organisation workflow.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing" : "Refresh AI"}
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">AI Executive Signal</p>
            <p className="mt-3 text-sm leading-6 text-slate-100">
              {isLoading
                ? "Loading institutional intelligence from the backend..."
                : insight?.summary
                  || "AI insight is not available yet. Refresh AI to generate an institution-level recommendation."}
            </p>
            {error && (
              <p className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                AI backend warning: {error}
              </p>
            )}
          </div>

          {primaryAction && (
            <article className="mt-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Recommended Action</p>
              <h3 className="mt-2 font-black tracking-tight">{primaryAction.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{primaryAction.description}</p>
              <button
                type="button"
                onClick={() => onActionSelect(primaryAction)}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-indigo-50"
              >
                Review recommendation
                <ChevronRight className="h-4 w-4" />
              </button>
            </article>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-950">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-black">Ask AI about this module</p>
          </div>
          <div className="mt-4 grid gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPromptSelect(prompt)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedPrompt === prompt
                    ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">AI Response</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {response || "Select a prompt to generate a practical, module-specific recommendation from the latest institutional insight."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
