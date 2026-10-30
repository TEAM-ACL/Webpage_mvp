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
});
