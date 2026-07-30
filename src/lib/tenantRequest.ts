export const TENANT_SLUG_HEADER = "X-Organisation-Slug";

export function getActiveTenantSlug(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const tenantSlug = new URLSearchParams(window.location.search).get("organisationSlug");
  return tenantSlug?.trim() || null;
}

export function tenantAwareHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const tenantSlug = getActiveTenantSlug();
  if (!tenantSlug) {
    return headers;
  }

  return {
    ...headers,
    [TENANT_SLUG_HEADER]: tenantSlug,
  };
}
