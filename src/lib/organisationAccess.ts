export type OrganisationDashboardAccess = "allowed" | "denied" | "loading" | "unavailable";

export function resolveOrganisationDashboardAccess(input: {
  hasAccountAccess: boolean;
  hasMembershipAccess: boolean;
  isLoading: boolean;
  error: string | null;
}): OrganisationDashboardAccess {
  if (input.isLoading) return "loading";
  if (input.error) return "unavailable";
  return input.hasAccountAccess || input.hasMembershipAccess ? "allowed" : "denied";
}
