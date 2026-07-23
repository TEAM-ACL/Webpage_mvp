import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { JSX, ReactNode } from "react";
import OrganisationAIPanel from "../../components/organisation/OrganisationAIPanel";
import OrganisationLayout from "../../components/organisation/OrganisationLayout";
import OrganisationMetricCard from "../../components/organisation/OrganisationMetricCard";
import { useAuth } from "../../context/AuthContext";
import {
  organisationModules,
  type OrganisationModuleAction,
  type OrganisationModuleContent,
  type OrganisationModuleKey,
  type OrganisationModuleItem,
} from "../../data/organisationModules";
import { getInstitutionalAIInsight, refreshInstitutionalAIInsight } from "../../services/organisation";
import type { InstitutionalAIInsight, InstitutionalRecommendedAction } from "../../types/organisation";

type OrganisationPlaceholderProps = {
  moduleKey: OrganisationModuleKey;
};

const outlineButton =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-bold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";
const primaryButton =
  "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:opacity-90";

export default function OrganisationPlaceholder({ moduleKey }: OrganisationPlaceholderProps): JSX.Element {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const content = organisationModules[moduleKey];
  const [insight, setInsight] = useState<InstitutionalAIInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [isAiRefreshing, setIsAiRefreshing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const loadInsight = useCallback(async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await getInstitutionalAIInsight();
      setInsight(response.insight);
    } catch (error) {
      setAiError(readError(error, "Unable to load institutional AI insight."));
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedPrompt(null);
    void loadInsight();
  }, [loadInsight, moduleKey]);

  function handleAction(action: OrganisationModuleAction): void {
    navigate(action.href);
  }

  async function handleRefreshInsight(): Promise<void> {
    setIsAiRefreshing(true);
    setAiError(null);
    try {
      const response = await refreshInstitutionalAIInsight();
      setInsight(response.insight);
    } catch (error) {
      setAiError(readError(error, "Unable to refresh institutional AI insight."));
    } finally {
      setIsAiRefreshing(false);
      setIsAiLoading(false);
    }
  }

  function handleInsightAction(action: InstitutionalRecommendedAction): void {
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

  const promptResponse = selectedPrompt ? buildPromptResponse(content, selectedPrompt, insight) : null;

  return (
    <OrganisationLayout
      organisationName={profile?.organisationName || "VisionTech Organisation"}
      organisationType="Training Provider"
      administratorRole={formatRole(profile?.role || user?.role || "Platform Administrator")}
      title={content.title}
      description={content.description}
      actions={
        <>
          {content.secondaryAction && (
            <button type="button" className={outlineButton} onClick={() => handleAction(content.secondaryAction!)}>
              {content.secondaryAction.label}
            </button>
          )}
          <button type="button" className={primaryButton} onClick={() => handleAction(content.primaryAction)}>
            {content.primaryAction.label}
          </button>
        </>
      }
    >
      <OrganisationModuleView content={content} onAction={handleAction} />
      <div className="mt-6">
        <OrganisationAIPanel
          contextLabel={`${content.title} Intelligence`}
          insight={insight}
          isLoading={isAiLoading}
          isRefreshing={isAiRefreshing}
          error={aiError}
          prompts={content.aiPrompts}
          selectedPrompt={selectedPrompt}
          response={promptResponse}
          onPromptSelect={setSelectedPrompt}
          onRefresh={() => void handleRefreshInsight()}
          onActionSelect={handleInsightAction}
        />
      </div>
    </OrganisationLayout>
  );
}

function OrganisationModuleView({
  content,
  onAction,
}: {
  content: OrganisationModuleContent;
  onAction: (action: OrganisationModuleAction) => void;
}): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {content.metrics.map((metric) => (
          <OrganisationMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            note={metric.note}
            tone={metric.tone}
          />
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl shadow-slate-200/60">
        <div className="grid gap-6 p-6 text-white lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">{content.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">{content.focusTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{content.focusDescription}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Recommended Admin Action</p>
            <button
              type="button"
              onClick={() => onAction(content.focusAction)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-indigo-50"
            >
              {content.focusAction.label}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{content.title}</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">{content.itemsTitle}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{content.itemsDescription}</p>
            </div>
            <button
              type="button"
              onClick={() => onAction(content.primaryAction)}
              className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
            >
              {content.primaryAction.label}
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {content.items.map((item) => (
              <ModuleItemCard key={item.title} item={item} onAction={onAction} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{content.workflowTitle}</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">How this tab works</h2>
          <div className="mt-6 space-y-5">
            {content.workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Step {index + 1}</p>
                    <h3 className="mt-1 font-bold text-slate-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function ModuleItemCard({
  item,
  onAction,
}: {
  item: OrganisationModuleItem;
  onAction: (action: OrganisationModuleAction) => void;
}): JSX.Element {
  return (
    <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black tracking-tight text-slate-950">{item.title}</h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
          <p className="mt-2 text-sm font-semibold text-indigo-700">{item.meta}</p>
        </div>
        <button
          type="button"
          onClick={() => onAction(item.action)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          {item.action.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {typeof item.progress === "number" && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
            <span>Progress</span>
            <span>{item.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => renderTag(tag))}</div>
    </article>
  );
}

function renderTag(tag: string): ReactNode {
  return (
    <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
      {tag}
    </span>
  );
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildPromptResponse(
  content: OrganisationModuleContent,
  prompt: string,
  insight: InstitutionalAIInsight | null,
): string {
  const baseResponse = content.aiResponses[prompt] || "Use the latest institutional insight to prioritise practical administrator action.";
  if (!insight?.mainConcern) {
    return baseResponse;
  }
  return `${baseResponse} Current AI concern: ${insight.mainConcern}`;
}

function readError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
