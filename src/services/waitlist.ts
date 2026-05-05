import { supabase } from "../lib/supabaseClient";

const WAITLIST_TABLE = "waitlist_signups";

function isDuplicateEmailError(error: unknown): boolean {
  const maybeError = error as { code?: string; message?: string } | null;
  if (!maybeError) return false;
  if (maybeError.code === "23505") return true;
  return maybeError.message?.toLowerCase().includes("duplicate key") ?? false;
}

export async function joinWaitlist(email: string): Promise<{ alreadyJoined: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();

  const { error } = await supabase
    .from(WAITLIST_TABLE)
    .insert({
      email: normalizedEmail,
      source: "marketing_home_waitlist",
      joined_at: new Date().toISOString(),
    });

  if (error) {
    if (isDuplicateEmailError(error)) {
      return { alreadyJoined: true };
    }
    throw new Error(error.message || "Unable to join waitlist right now.");
  }

  return { alreadyJoined: false };
}
