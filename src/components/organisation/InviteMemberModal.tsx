import { useMemo, useState, type FormEvent, type JSX } from "react";
import type { InviteOrganisationMemberRequest } from "../../types/organisation";

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (payload: InviteOrganisationMemberRequest) => Promise<void>;
  inviteUrl?: string | null;
  organisationName?: string;
};

export default function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
  inviteUrl,
  organisationName = "this organisation",
}: InviteMemberModalProps): JSX.Element | null {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [cohortName, setCohortName] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const memberInviteMessage = useMemo(
    () =>
      inviteUrl
        ? `You're invited to join ${organisationName} on VisionTech AI. Start here: ${inviteUrl}`
        : "",
    [inviteUrl, organisationName],
  );

  if (!isOpen) return null;

  async function handleCopyInviteLink(): Promise<void> {
    if (!memberInviteMessage) return;

    try {
      await navigator.clipboard.writeText(memberInviteMessage);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onInvite({
      fullName,
      email,
      goal: goal || null,
      cohortName: cohortName || null,
    });
    setFullName("");
    setEmail("");
    setGoal("");
    setCohortName("");
    setCopyState("idle");
    onClose();
  }

  return (
    <>
      <button type="button" aria-label="Close invite modal overlay" className="fixed inset-0 z-40 bg-slate-950/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[var(--color-surface-container-lowest)] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Invite Member</h2>
        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
          Invite a person into this organisation. Their AI insight remains generated from their own profile and activity.
        </p>
        {inviteUrl ? (
          <section className="mt-5 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--organisation-action)]">Tenant invite link</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              Share this branded signup link with members so they land in the correct organisation flow.
            </p>
            <div className="mt-3 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm font-semibold text-[var(--color-on-surface)]">
              {inviteUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="mt-3 rounded-2xl bg-[var(--organisation-action)] px-4 py-2 text-sm font-semibold text-[var(--organisation-on-action)] transition hover:opacity-90"
            >
              {copyState === "copied" ? "Copied invite message" : "Copy invite message"}
            </button>
            {copyState === "failed" ? (
              <p className="mt-2 text-xs font-semibold text-[var(--color-warning)]">
                Copy failed. Select the link above manually.
              </p>
            ) : null}
          </section>
        ) : null}
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="Full name" className="w-full rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="Email address" className="w-full rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm" />
          <input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Goal, e.g. Cloud Support Engineer" className="w-full rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm" />
          <input value={cohortName} onChange={(event) => setCohortName(event.target.value)} placeholder="Cohort name" className="w-full rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm" />
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" className="rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm font-semibold" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="rounded-2xl bg-[var(--organisation-action)] px-4 py-3 text-sm font-semibold text-[var(--organisation-on-action)]">
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
