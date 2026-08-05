export const FALLBACK_ORGANISATION_ID = "mock-organisation-001";

const UNRESOLVED_ORGANISATION_MESSAGE =
  "Organisation details are still loading. Wait for the organisation to finish loading, then try again.";

export function requireResolvedOrganisationId(value: string | null | undefined): string {
  const organisationId = value?.trim();
  if (!organisationId || organisationId === FALLBACK_ORGANISATION_ID) {
    throw new Error(UNRESOLVED_ORGANISATION_MESSAGE);
  }
  return organisationId;
}

export function createOrganisationAccessState<T>(
  resolvedOrganisation: T | null,
  fallbackOrganisation: T,
): { organisation: T | null; displayOrganisation: T } {
  return {
    organisation: resolvedOrganisation,
    displayOrganisation: resolvedOrganisation ?? fallbackOrganisation,
  };
}
