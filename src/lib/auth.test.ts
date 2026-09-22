import { afterEach, describe, expect, it, vi } from "vitest";

import {
  hasOrganisationManagementMembership,
  hasPlatformAdminAccessForUser,
} from "./auth";

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

describe("platform admin access", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(["admin", "super_admin", "superadmin", "platform_admin"])(
    "allows the %s backend role",
    (role) => {
      expect(hasPlatformAdminAccessForUser(role, "person@example.com")).toBe(true);
    },
  );

  it.each(["learner", "organisation_admin", "organization_admin", null, undefined])(
    "does not elevate the %s role",
    (role) => {
      expect(hasPlatformAdminAccessForUser(role, "person@example.com")).toBe(false);
    },
  );

  it("does not grant access based only on the company email domain", () => {
    vi.stubEnv("VITE_BOOTSTRAP_PLATFORM_ADMIN_EMAILS", "");
    expect(hasPlatformAdminAccessForUser("learner", "person@visiontech.ai")).toBe(false);
  });

  it("recognizes explicitly configured bootstrap administrators", () => {
    vi.stubEnv("VITE_BOOTSTRAP_PLATFORM_ADMIN_EMAILS", "admin@example.com");
    expect(hasPlatformAdminAccessForUser("learner", "ADMIN@example.com")).toBe(true);
  });
});
