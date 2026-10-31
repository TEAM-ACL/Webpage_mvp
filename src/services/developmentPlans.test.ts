import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

describe("development plans service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    fetchMock.mockReset();
  });

  it("creates a plan in the selected organisation and opportunity scope", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "plan-1", version: 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const { generateDevelopmentPlan } = await import("./developmentPlans");

    await generateDevelopmentPlan("org/1", "opportunity 1");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/organisations/org%2F1/opportunities/opportunity%201/development-plan",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ regenerate: false });
  });

  it("sends the current version and evidence when completing a step", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "plan-1", version: 3 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const { updateDevelopmentStep } = await import("./developmentPlans");

    await updateDevelopmentStep("org-1", "opp-1", "step/1", {
      expectedVersion: 2,
      status: "completed",
      evidence: "https://portfolio.example/query",
    });

    expect(fetchMock.mock.calls[0][0]).toContain("/steps/step%2F1");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      expected_version: 2,
      status: "completed",
      evidence: "https://portfolio.example/query",
    });
  });

  it("promotes reviewed evidence with the current plan version", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      plan_id: "plan-1", plan_version: 5, skill: "SQL", verified_skills: ["SQL"],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const { promoteVerifiedSkill } = await import("./developmentPlans");

    await promoteVerifiedSkill("org-1", "opp-1", "learner/1", "step/1", 4);

    expect(fetchMock.mock.calls[0][0]).toContain(
      "/learners/learner%2F1/steps/step%2F1/promote-skill",
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ expected_version: 4 });
  });

  it("loads the tenant review queue", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      organisation_id: "org-1", can_promote: true, items: [],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const { getEvidenceReviewQueue } = await import("./developmentPlans");

    await getEvidenceReviewQueue("org/1");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/organisations/org%2F1/development-evidence-reviews",
    );
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: "GET" }));
  });

  it("submits a reviewer decision with its plan version", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      plan_id: "plan-1", plan_version: 4, step: {},
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const { reviewDevelopmentEvidence } = await import("./developmentPlans");

    await reviewDevelopmentEvidence("org-1", "opp-1", "learner-1", "step-1", {
      expectedVersion: 3, decision: "changes_requested", note: "Add a query result.",
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      expected_version: 3,
      decision: "changes_requested",
      note: "Add a query result.",
    });
  });
});
