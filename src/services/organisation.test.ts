import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("organisation service tenant identity", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
    vi.stubGlobal("sessionStorage", { getItem: () => null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("does not send a configuration mutation for fallback organisation data", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const {
      buildFallbackActiveOrganisation,
      saveOrganisationConfiguration,
    } = await import("./organisation");
    const fallback = buildFallbackActiveOrganisation();

    await expect(
      saveOrganisationConfiguration(fallback.id, {
        branding: fallback.branding,
        settings: fallback.settings,
      }),
    ).rejects.toThrow(/still loading/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends configuration mutations with the verified organisation identifier", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ branding: {}, settings: { draft_version: 1 } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const {
      buildFallbackActiveOrganisation,
      saveOrganisationConfiguration,
    } = await import("./organisation");
    const defaults = buildFallbackActiveOrganisation();

    await saveOrganisationConfiguration("  organisation-123  ", {
      branding: defaults.branding,
      settings: defaults.settings,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/configuration",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("rejects a malformed active-organisation response instead of inventing an ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ name: "Organisation without an ID" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getActiveOrganisation } = await import("./organisation");

    await expect(getActiveOrganisation()).rejects.toThrow(/still loading/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
