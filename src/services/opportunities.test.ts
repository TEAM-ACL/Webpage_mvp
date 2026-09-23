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
});
