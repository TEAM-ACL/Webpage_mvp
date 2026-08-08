import { describe, expect, it } from "vitest";

import {
  FALLBACK_ORGANISATION_SLUG,
  buildVerifiedOrganisationPath,
  slugifyOrganisationName,
} from "./organisationTenant";

describe("organisation tenant paths", () => {
  it("keeps unresolved organisation navigation on the canonical index", () => {
    expect(buildVerifiedOrganisationPath(null)).toBe("/organisation");
    expect(buildVerifiedOrganisationPath(undefined, "settings")).toBe("/organisation");
  });

  it("builds tenant paths only from an API-verified slug", () => {
    expect(buildVerifiedOrganisationPath("visiontech-organisation")).toBe(
      "/organisation/visiontech-organisation",
    );
    expect(buildVerifiedOrganisationPath("visiontech-organisation", "settings")).toBe(
      "/organisation/visiontech-organisation/settings",
    );
  });

  it("uses a non-tenant placeholder when no display name is available", () => {
    expect(slugifyOrganisationName(null)).toBe(FALLBACK_ORGANISATION_SLUG);
  });
});
