const tenantAwareUserPaths = new Set(["/intelligence", "/workspace", "/network"]);

export function getTenantSlugFromSearch(search: string): string | null {
  const tenantSlug = new URLSearchParams(search).get("organisationSlug");
  return tenantSlug?.trim() || null;
}

export function withTenantQuery(path: string, organisationSlug: string | null): string {
  if (!organisationSlug) {
    return path;
  }

  const [pathname, queryString] = path.split("?");
  if (!tenantAwareUserPaths.has(pathname)) {
    return path;
  }

  const queryParams = new URLSearchParams(queryString);
  queryParams.set("organisationSlug", organisationSlug);

  return `${pathname}?${queryParams.toString()}`;
}
