export function toUserMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";

  if (!raw) return fallback;

  const message = raw.trim();
  const lower = message.toLowerCase();

  if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
    return "We couldn't reach the server. Check your internet connection and try again.";
  }

  if (lower.includes("timeout")) {
    return "The request took too long. Please try again.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Email or password is incorrect. Please try again.";
  }

  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Please verify your email address before continuing.";
  }

  if (lower.includes("token") && lower.includes("expired")) {
    return "Your session has expired. Please sign in again.";
  }

  if (
    lower.includes("duplicate key")
    || lower.includes("already exists")
    || lower.includes("already registered")
    || lower.includes("user already registered")
  ) {
    return "That account already exists. Try signing in instead.";
  }

  if (lower.includes("permission denied") || lower.includes("forbidden")) {
    return "You don't have permission to do that action.";
  }

  if (lower.includes("unauthorized")) {
    return "Please sign in and try again.";
  }

  if (lower.includes("not found")) {
    return "We couldn't find what you were looking for.";
  }

  if (lower.includes("latest ai insight request failed:")
    || lower.includes("ai recommendations request failed:")
    || lower.includes("ai matches request failed:")
    || lower.includes("ai request failed:")) {
    const cleaned = message.replace(/^.*failed:\s*/i, "").trim();
    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  // Remove noisy API validation suffixes like "(body.email: invalid format)"
  const withoutLocSuffix = message.replace(/\s*\([^)]+\.\w+:\s*[^)]+\)\s*$/i, "").trim();
  if (withoutLocSuffix.length > 0 && withoutLocSuffix.length <= 220) {
    return withoutLocSuffix;
  }

  return fallback;
}
