import { describe, expect, it } from "vitest";

import { resolveOrganisationDashboardAccess } from "./organisationAccess";

describe("organisation dashboard access", () => {
  it("waits for an organisation even when the account has platform access", () => {
    expect(resolveOrganisationDashboardAccess({
      hasAccountAccess: true,
      hasMembershipAccess: false,
      isLoading: true,
      error: null,
    })).toBe("loading");
  });

  it("allows a verified owner membership", () => {
    expect(resolveOrganisationDashboardAccess({
      hasAccountAccess: false,
      hasMembershipAccess: true,
      isLoading: false,
      error: null,
    })).toBe("allowed");
  });

  it("surfaces lookup errors before granting an account-level route", () => {
    expect(resolveOrganisationDashboardAccess({
      hasAccountAccess: true,
      hasMembershipAccess: false,
      isLoading: false,
      error: "No active organisation is connected to this account.",
    })).toBe("unavailable");
  });
});
