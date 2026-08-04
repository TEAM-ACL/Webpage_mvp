import { describe, expect, it } from "vitest";

import {
  createOrganisationAccessState,
  FALLBACK_ORGANISATION_ID,
  requireResolvedOrganisationId,
} from "./organisationIdentity";

describe("organisation identity", () => {
  it("accepts and normalises a persisted organisation identifier", () => {
    expect(requireResolvedOrganisationId("  organisation-123  ")).toBe("organisation-123");
  });

  it("rejects the UI fallback identifier before a tenant mutation", () => {
    expect(() => requireResolvedOrganisationId(FALLBACK_ORGANISATION_ID)).toThrow(
      /still loading/i,
    );
  });

  it("rejects a missing organisation identifier", () => {
    expect(() => requireResolvedOrganisationId(null)).toThrow(/still loading/i);
    expect(() => requireResolvedOrganisationId("   ")).toThrow(/still loading/i);
  });

  it("keeps fallback display data separate from mutation authority", () => {
    const fallback = { id: FALLBACK_ORGANISATION_ID };
    const state = createOrganisationAccessState(null, fallback);

    expect(state.organisation).toBeNull();
    expect(state.displayOrganisation).toBe(fallback);
  });
});
