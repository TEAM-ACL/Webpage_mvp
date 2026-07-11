import { useState, type FormEvent, type JSX } from "react";
import type { InviteOrganisationMemberRequest } from "../../types/organisation";

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (payload: InviteOrganisationMemberRequest) => Promise<void>;
};

export default function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
}: InviteMemberModalProps): JSX.Element | null {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [cohortName, setCohortName] = useState("");

  if (!isOpen) return null;

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
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="Full name" className="w-full rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="Email address" className="w-full rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm" />
          <input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Goal, e.g. Cloud Support Engineer" className="w-full rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm" />
          <input value={cohortName} onChange={(event) => setCohortName(event.target.value)} placeholder="Cohort name" className="w-full rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm" />
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" className="rounded-2xl border border-[var(--color-outline-variant)] px-4 py-3 text-sm font-semibold" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white">
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
