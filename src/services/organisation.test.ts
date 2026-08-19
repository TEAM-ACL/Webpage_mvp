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

  it("surfaces the backend reason when an account has no active organisation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({
        error: {
          code: "not_found",
          message: "No active organisation is connected to this account.",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getActiveOrganisation } = await import("./organisation");

    await expect(getActiveOrganisation()).rejects.toThrow(
      "No active organisation is connected to this account.",
    );
  });

  it("loads intervention records from the tenant readback endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "intervention-1",
            organisation_id: "organisation-123",
            user_id: "member-1",
            type: "low_readiness",
            reason: "Needs support.",
            recommended_action: "Assign a project.",
            risk_level: "medium",
            status: "open",
            created_at: null,
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getOrganisationMemberInterventions } = await import("./organisation");

    const records = await getOrganisationMemberInterventions(" organisation-123 ");

    expect(records).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/interventions",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("loads opportunity recommendation records from the tenant readback endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "opportunity-recommendation-1",
            organisation_id: "organisation-123",
            user_id: "member-1",
            title: "Recommended opportunity",
            note: null,
            status: "recommended",
            created_at: null,
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getOrganisationOpportunityRecommendations } = await import("./organisation");

    const records = await getOrganisationOpportunityRecommendations(" organisation-123 ");

    expect(records).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/opportunity-recommendations",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("loads report summaries from the tenant report endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        organisation_id: "organisation-123",
        organisation_name: "VisionTech Pilot Institution",
        generated_at: "2026-08-19T10:00:00Z",
        title: "Tenant progress report",
        summary: "Report summary.",
        metrics: [],
        highlights: [],
        csv_rows: [],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getOrganisationReportSummary } = await import("./organisation");

    const report = await getOrganisationReportSummary(" organisation-123 ");

    expect(report.title).toBe("Tenant progress report");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/reports/summary",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("loads cohorts from the tenant cohort endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            cohort_id: "cohort-1",
            name: "Digital Skills Cohort",
            member_count: 0,
            average_completion: 0,
            average_readiness: 0,
            start_date: null,
            end_date: null,
            status: "active",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getOrganisationCohorts } = await import("./organisation");

    const cohorts = await getOrganisationCohorts(" organisation-123 ");

    expect(cohorts).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/cohorts",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("creates cohorts against the tenant cohort endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        cohort_id: "cohort-1",
        name: "Digital Skills Cohort",
        member_count: 0,
        average_completion: 0,
        average_readiness: 0,
        start_date: null,
        end_date: null,
        status: "active",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { createOrganisationCohort } = await import("./organisation");

    await createOrganisationCohort(" organisation-123 ", {
      name: "Digital Skills Cohort",
      description: "Created from members.",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/cohorts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Digital Skills Cohort",
          description: "Created from members.",
          status: "active",
        }),
      }),
    );
  });

  it("loads tenant opportunities from the organisation endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "opportunity-1",
            organisation_id: "organisation-123",
            title: "Junior Cloud Internship",
            description: "Support cloud operations.",
            required_skills: ["Cloud"],
            opportunity_type: "internship",
            status: "open",
            closing_date: null,
            external_url: null,
            created_at: null,
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getOrganisationOpportunities } = await import("./organisation");

    const opportunities = await getOrganisationOpportunities(" organisation-123 ");

    expect(opportunities).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/opportunities",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("creates tenant opportunities against the organisation endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "opportunity-1",
        organisation_id: "organisation-123",
        title: "Junior Cloud Internship",
        description: "Support cloud operations.",
        required_skills: ["Cloud"],
        opportunity_type: "internship",
        status: "open",
        closing_date: null,
        external_url: null,
        created_at: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { createOrganisationOpportunity } = await import("./organisation");

    await createOrganisationOpportunity(" organisation-123 ", {
      title: "Junior Cloud Internship",
      description: "Support cloud operations.",
      requiredSkills: ["Cloud"],
      opportunityType: "internship",
      externalUrl: "https://example.com/opportunity",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/opportunities",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "Junior Cloud Internship",
          description: "Support cloud operations.",
          required_skills: ["Cloud"],
          opportunity_type: "internship",
          status: "open",
          external_url: "https://example.com/opportunity",
        }),
      }),
    );
  });

  it("resets organisation branding against the tenant branding endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        logo_url: null,
        favicon_url: null,
        primary_colour: "#1f0954",
        secondary_colour: "#2563eb",
        accent_colour: "#7c3aed",
        background_colour: "#ffffff",
        text_colour: "#111827",
        font_family: "Inter",
        border_radius: "medium",
        theme_mode: "light",
        login_banner_url: null,
        dashboard_banner_url: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { resetOrganisationBranding } = await import("./organisation");

    const branding = await resetOrganisationBranding(" organisation-123 ");

    expect(branding.primaryColour).toBe("#1f0954");
    expect(branding.logoUrl).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/branding/reset",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
