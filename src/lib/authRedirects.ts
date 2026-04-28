const DEFAULT_PRODUCTION_APP_URL = "https://visiontechai.vercel.app";

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function getRedirectBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_AUTH_REDIRECT_BASE_URL as string | undefined;
  if (configuredBaseUrl && configuredBaseUrl.trim()) {
    return trimTrailingSlashes(configuredBaseUrl.trim());
  }

  const { hostname, origin } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  // Vercel preview/project deployment URLs can produce dead-end auth links.
  if (!isLocalhost && hostname.endsWith("-projects.vercel.app")) {
    return DEFAULT_PRODUCTION_APP_URL;
  }

  return trimTrailingSlashes(origin);
}

export function getEmailConfirmationRedirectUrl(): string {
  return `${getRedirectBaseUrl()}/auth/callback`;
}

export function getPasswordResetRedirectUrl(): string {
  return `${getRedirectBaseUrl()}/reset-password`;
}

