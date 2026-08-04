import { describe, expect, it } from "vitest";

import { hasOrganisationManagementMembership } from "./auth";

describe("organisation membership access", () => {
  it.each(["owner", "admin", "organisation_admin", "organization_admin"])(
    "allows the %s membership role to manage an organisation",
    (role) => {
      expect(hasOrganisationManagementMembership(role)).toBe(true);
    },
  );

  it.each(["member", "mentor", "analyst", null, undefined])(
    "does not elevate the %s membership role",
    (role) => {
      expect(hasOrganisationManagementMembership(role)).toBe(false);
    },
  );
});
