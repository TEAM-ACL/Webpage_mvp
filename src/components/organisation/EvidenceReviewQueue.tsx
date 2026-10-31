import { useCallback, useEffect, useState } from "react";
import {
  getEvidenceReviewQueue,
  promoteVerifiedSkill,
  reviewDevelopmentEvidence,
} from "../../services/developmentPlans";
import type { EvidenceReviewQueue as Queue } from "../../types/developmentPlan";

type Props = { organisationId: string };

export default function EvidenceReviewQueue({ organisationId }: Props) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setQueue(await getEvidenceReviewQueue(organisationId));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load evidence reviews.");
    }
  }, [organisationId]);

  useEffect(() => { void load(); }, [load]);

  async function review(index: number, decision: "verified" | "changes_requested") {
    const item = queue?.items[index];
    if (!item) return;
    const note = (notes[item.step.id] ?? "").trim();
    if (!note) return;
    setBusy(item.step.id);
    setError(null);
    try {
      await reviewDevelopmentEvidence(
        organisationId, item.opportunity_id, item.learner_id, item.step.id,
        { expectedVersion: item.plan_version, decision, note },
      );
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to review evidence.");
    } finally {
      setBusy(null);
    }
  }

  async function promote(index: number) {
    const item = queue?.items[index];
    if (!item) return;
    setBusy(item.step.id);
    setError(null);
    try {
      await promoteVerifiedSkill(
        organisationId, item.opportunity_id, item.learner_id, item.step.id, item.plan_version,
      );
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to promote verified skill.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[var(--color-on-surface)]">Evidence review queue</h2>
          <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">Review learner submissions before verified skills affect opportunity matching.</p>
        </div>
        <button type="button" onClick={() => void load()} className="rounded-xl border px-3 py-2 text-xs font-bold">Refresh</button>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {!queue ? <p className="mt-4 text-sm text-slate-500">Loading evidence reviews...</p> : null}
      {queue?.items.length === 0 ? <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">No evidence is waiting for action.</p> : null}
      <div className="mt-4 space-y-3">
        {queue?.items.map((item, index) => (
          <article key={`${item.plan_id}-${item.step.id}`} className="rounded-2xl border border-[var(--color-outline-variant)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-black text-[var(--color-on-surface)]">{item.step.gap}</p>
                <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">Learner {item.learner_id} · {item.goal}</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {item.step.verification_status === "pending" ? "Needs review" : "Ready to promote"}
              </span>
            </div>
            <p className="mt-3 rounded-xl bg-[var(--color-surface-container-low)] p-3 text-sm text-[var(--color-on-surface)]">{item.step.evidence}</p>
            {item.step.verification_status === "pending" ? (
              <>
                <textarea value={notes[item.step.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [item.step.id]: event.target.value }))}
                  placeholder="Record what you checked and why" className="mt-3 min-h-20 w-full rounded-xl border border-[var(--color-outline-variant)] bg-transparent p-3 text-sm" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy === item.step.id || !(notes[item.step.id] ?? "").trim()} onClick={() => void review(index, "verified")} className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Verify evidence</button>
                  <button type="button" disabled={busy === item.step.id || !(notes[item.step.id] ?? "").trim()} onClick={() => void review(index, "changes_requested")} className="rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold text-amber-800 disabled:opacity-40">Request changes</button>
                </div>
              </>
            ) : queue.can_promote ? (
              <button type="button" disabled={busy === item.step.id} onClick={() => void promote(index)} className="mt-3 rounded-xl bg-[var(--organisation-action)] px-4 py-2 text-xs font-bold text-[var(--organisation-on-action)] disabled:opacity-40">Add verified skill to profile</button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
