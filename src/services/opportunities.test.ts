import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("opportunities service tenant match adapter", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
    vi.stubGlobal("sessionStorage", { getItem: () => null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("maps enriched tenant opportunity matches without loading opportunities separately", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        organisation_id: "organisation-123",
        user_id: "user-1",
        generated_at: "2026-09-23T10:00:00Z",
        policy_name: "rule_based_opportunity_matching",
        policy_version: "2026-09-14.v1",
        items: [
          {
            opportunity_id: "opportunity-1",
            title: "Junior Cloud Internship",
            description: "Support cloud service tickets and build portfolio evidence.",
            required_skills: ["Cloud support", "SQL"],
            opportunity_type: "internship",
            status: "open",
            closing_date: "2026-10-01",
            external_url: "https://example.com/opportunity",
            match_score: 91,
            matched_strengths: ["Matches required skill: Cloud support"],
            missing_requirements: ["SQL"],
            improvement_actions: ["Add evidence or complete an external resource for SQL."],
            explanation_factors: [
              {
                signal: "required_skill_match",
                label: "Profile skills match required opportunity skills",
                value: ["Cloud support"],
                weight: 12,
              },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getOpportunityMatches } = await import("./opportunities");

    const matchRun = await getOpportunityMatches({ organisationId: " organisation-123 " });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/organisation-123/opportunity-matches",
      expect.objectContaining({ method: "GET" }),
    );
    expect(matchRun.items[0]).toMatchObject({
      id: "opportunity-1",
      organization_id: "organisation-123",
      title: "Junior Cloud Internship",
      description: "Support cloud service tickets and build portfolio evidence.",
      required_skills: ["Cloud support", "SQL"],
      opportunity_type: "internship",
      status: "open",
      match_score: 91,
      confidence: "high",
      reason: "Matches required skill: Cloud support",
      source_name: "Organisation opportunities",
      source_url: "https://example.com/opportunity",
      expires_at: "2026-10-01",
    });
    expect(matchRun.items[0].match_factors).toEqual([
      {
        label: "Profile skills match required opportunity skills",
        score: 12,
        evidence: "Cloud support",
        weight: 12,
      },
    ]);
  });

  it("keeps legacy tenant match payloads renderable", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        organisation_id: "organisation-123",
        user_id: "user-1",
        generated_at: "2026-09-23T10:00:00Z",
        policy_name: "rule_based_opportunity_matching",
        policy_version: "2026-09-14.v1",
        items: [
          {
            opportunity_id: "opportunity-legacy",
            title: "Portfolio Sprint",
            match_score: 62,
            matched_strengths: [],
            missing_requirements: [],
            improvement_actions: [],
            explanation_factors: [],
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getOpportunityMatches } = await import("./opportunities");

    const matchRun = await getOpportunityMatches({ organisationId: "organisation-123" });

    expect(matchRun.items[0]).toMatchObject({
      id: "opportunity-legacy",
      description: "",
      required_skills: [],
      opportunity_type: "project",
      status: "open",
      confidence: "medium",
      source_url: null,
      expires_at: null,
    });
  });

  it("preserves saved run identity and stale metadata on retrieval", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      organisation_id: "org-1", user_id: "user-1", match_run_id: "saved-run-1",
      generated_at: "2026-10-30T10:00:00Z", status: "stale",
      profile_version: "profile-v1", stale_reasons: ["profile_changed"], items: [],
    }) });
    vi.stubGlobal("fetch", fetchMock);
    const { getOpportunityMatches } = await import("./opportunities");
    expect(await getOpportunityMatches({ organisationId: "org-1" })).toMatchObject({
      match_run_id: "saved-run-1", status: "stale", profile_version: "profile-v1",
      stale_reasons: ["profile_changed"],
    });
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });

  it("represents a missing saved run without inventing an identifier", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      organisation_id: "org-1", user_id: "user-1", match_run_id: null,
      generated_at: null, status: "empty", items: [],
    }) }));
    const { getOpportunityMatches } = await import("./opportunities");
    const result = await getOpportunityMatches({ organisationId: "org-1" });
    expect(result).toMatchObject({ status: "empty", items: [] });
    expect(result.match_run_id).toBeUndefined();
    expect(result.generated_at).toBeUndefined();
  });

  it.each([true, false])("uses POST for tenant refresh with force_refresh=%s", async (forceRefresh) => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      organisation_id: "org-1", user_id: "user-1", match_run_id: "new-run",
      generated_at: "2026-10-30T10:00:00Z", status: "ready", items: [],
    }) });
    vi.stubGlobal("fetch", fetchMock);
    const { generateOpportunityMatches } = await import("./opportunities");
    const result = await generateOpportunityMatches(
      { force_refresh: forceRefresh }, { organisationId: " org-1 " },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/org-1/opportunity-matches",
      expect.objectContaining({ method: "POST", credentials: "include", body: JSON.stringify({ force_refresh: forceRefresh }) }),
    );
    expect(result.match_run_id).toBe("new-run");
  });

  it("surfaces refresh failures without a fallback generation or GET", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, text: async () => "Membership inactive" });
    vi.stubGlobal("fetch", fetchMock);
    const { generateOpportunityMatches } = await import("./opportunities");
    await expect(generateOpportunityMatches({}, { organisationId: "org-1" })).rejects.toThrow("Membership inactive");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("persists a saved opportunity and returns the updated match list", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      organisation_id: "org-1", user_id: "user-1", status: "ready", items: [{
        opportunity_id: "opportunity-1", title: "Cloud placement", match_score: 80,
        matched_strengths: [], missing_requirements: [], improvement_actions: [],
        explanation_factors: [], engagement_state: "saved",
      }],
    }) });
    vi.stubGlobal("fetch", fetchMock);
    const { setOpportunityEngagement } = await import("./opportunities");

    const result = await setOpportunityEngagement("org-1", "opportunity/1", "saved");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/org-1/opportunity-matches/opportunity%2F1/engagement",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ state: "saved" }) }),
    );
    expect(result.items[0].engagement_state).toBe("saved");
  });
});
