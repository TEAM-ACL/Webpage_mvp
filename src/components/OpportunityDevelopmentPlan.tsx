import { useState } from "react";
import { CheckCircle2, ExternalLink, LoaderCircle } from "lucide-react";
import { generateDevelopmentPlan, updateDevelopmentStep } from "../services/developmentPlans";
import type { DevelopmentPlan, DevelopmentStepStatus } from "../types/developmentPlan";

type Props = {
  organisationId: string;
  opportunityId: string;
};

export default function OpportunityDevelopmentPlan({ organisationId, opportunityId }: Props) {
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createOrReview(regenerate = false) {
    setBusy("plan");
    setError(null);
    try {
      const result = await generateDevelopmentPlan(organisationId, opportunityId, {
        regenerate,
        expectedVersion: regenerate ? plan?.version : undefined,
      });
      setPlan(result);
      setEvidence(Object.fromEntries(result.steps.map((step) => [step.id, step.evidence])));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your plan.");
    } finally {
      setBusy(null);
    }
  }

  async function save(stepId: string, status: DevelopmentStepStatus) {
    if (!plan) return;
    setBusy(stepId);
    setError(null);
    try {
      setPlan(await updateDevelopmentStep(organisationId, opportunityId, stepId, {
        expectedVersion: plan.version,
        status,
        evidence: evidence[stepId] ?? "",
      }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save progress.");
    } finally {
      setBusy(null);
    }
  }

  if (!plan) {
    return (
      <div className="mt-3">
        <button type="button" onClick={() => void createOrReview()} disabled={busy === "plan"}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-800 disabled:opacity-60">
          {busy === "plan" ? <LoaderCircle size={14} className="animate-spin" /> : null}
          Improve my match
        </button>
        {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <section className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-indigo-950">Your development plan</p>
          <p className="mt-1 text-[11px] text-indigo-800">{plan.progress_percent}% complete · {plan.goal}</p>
        </div>
        {plan.needs_review ? (
          <button type="button" onClick={() => void createOrReview(true)} disabled={busy === "plan"}
            className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-bold text-amber-800 disabled:opacity-60">
            Review plan
          </button>
        ) : null}
      </div>
      {plan.needs_review ? <p className="mt-2 text-[11px] text-amber-800">Your profile, opportunity, or matching data changed. Refresh matches, then review this plan.</p> : null}
      <div className="mt-3 space-y-2">
        {plan.steps.map((step, index) => (
          <article key={step.id} className="rounded-lg border border-indigo-100 bg-white p-3">
            <div className="flex items-start gap-2">
              {step.status === "completed" ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" /> : <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">{index + 1}</span>}
              <div>
                <p className="text-xs font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-600">{step.rationale}</p>
                {step.resource ? (
                  <a href={step.resource.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:underline">
                    {step.resource.title} · {step.resource.provider} <ExternalLink size={11} />
                  </a>
                ) : null}
              </div>
            </div>
            <textarea value={evidence[step.id] ?? ""} onChange={(event) => setEvidence((current) => ({ ...current, [step.id]: event.target.value }))}
              placeholder="Add an evidence note or portfolio link"
              className="mt-3 min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-400" />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => void save(step.id, "in_progress")} disabled={busy === step.id}
                className="rounded-full border border-indigo-200 px-3 py-1 text-[11px] font-bold text-indigo-700 disabled:opacity-60">Start</button>
              <button type="button" onClick={() => void save(step.id, "completed")} disabled={busy === step.id || !(evidence[step.id] ?? "").trim()}
                className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white disabled:opacity-40">Complete</button>
              <button type="button" onClick={() => void save(step.id, "skipped")} disabled={busy === step.id}
                className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-500 disabled:opacity-60">Skip</button>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-4 text-slate-500">Progress is self-reported. Completing a step does not automatically verify a skill.</p>
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </section>
  );
}
