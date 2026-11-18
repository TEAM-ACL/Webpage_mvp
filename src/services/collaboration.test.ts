import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

describe("collaboration service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { location: { search: "" } });
    fetchMock.mockReset();
    fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));
  });

  it("sends the explicit tenant with a collaboration request", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: "request-1" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }));
    const { sendCollaborationRequest } = await import("./collaboration");

    await sendCollaborationRequest({
      organisation_id: "org-1",
      project_id: "project-1",
      target_user_id: "user-2",
      message: "Pair on the API.",
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      organisation_id: "org-1",
      project_id: "project-1",
      target_user_id: "user-2",
      message: "Pair on the API.",
    });
  });

  it("loads active connections for the explicit tenant", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const { getCollaborationConnections } = await import("./collaboration");

    await getCollaborationConnections("org/1");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/collaboration/connections?organisation_id=org%2F1",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("scopes incoming and outgoing lists to the active organisation", async () => {
    const { getIncomingCollaborationRequests, getOutgoingCollaborationRequests } = await import("./collaboration");

    await getIncomingCollaborationRequests("org/1");
    await getOutgoingCollaborationRequests("org/1");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/collaboration/incoming?organisation_id=org%2F1",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://api.example.test/collaboration/outgoing?organisation_id=org%2F1",
    );
  });

  it("submits an accept or decline decision", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: "request-1" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const { respondToCollaborationRequest } = await import("./collaboration");

    await respondToCollaborationRequest("request/1", "accepted");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/collaboration/request/request%2F1",
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ status: "accepted" });
  });
});
