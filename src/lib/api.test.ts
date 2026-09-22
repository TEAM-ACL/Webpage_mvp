import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { api, storeSession, clearSession, type AuthSessionResponse } from "./api";

const mockSession: AuthSessionResponse = {
  access_token: "access",
  refresh_token: "refresh",
  token_type: "bearer",
  expires_in: 3600,
  user: {
    id: "123",
    email: "user@example.com",
    display_name: "User Example",
    first_name: "User",
    last_name: "Example",
  },
};

describe("session storage helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());
    vi.stubGlobal("sessionStorage", createStorage());
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores tokens and user when present", () => {
    storeSession(mockSession);
    expect(sessionStorage.getItem("access_token")).toBe("access");
    expect(sessionStorage.getItem("refresh_token")).toBe("refresh");
    expect(sessionStorage.getItem("user")).toContain("user@example.com");
  });

  it("clears stale token storage when the backend uses HttpOnly cookies", () => {
    sessionStorage.setItem("access_token", "stale-access");
    sessionStorage.setItem("refresh_token", "stale-refresh");
    storeSession({ ...mockSession, access_token: null, refresh_token: null });
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("user")).toContain("user@example.com");
  });

  it("refreshes an expired cookie session and retries the protected request", async () => {
    const refreshedSession = { ...mockSession, access_token: null, refresh_token: null };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse(401, { detail: "Access token validation failed." }))
      .mockResolvedValueOnce(mockResponse(200, refreshedSession))
      .mockResolvedValueOnce(mockResponse(200, mockSession.user));
    vi.stubGlobal("fetch", fetchMock);

    const user = await api.me();

    expect(user).toEqual(mockSession.user);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/auth\/refresh$/);
    expect(fetchMock.mock.calls[2][0]).toMatch(/\/auth\/me$/);
  });

  it.each(["me", "logout"] as const)("drops the stale bearer token when retrying %s", async (action) => {
    storeSession(mockSession);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockResponse(401, { detail: "Expired access token" }))
      .mockResolvedValueOnce(mockResponse(200, { ...mockSession, access_token: null, refresh_token: null }))
      .mockResolvedValueOnce(mockResponse(200, mockSession.user));
    vi.stubGlobal("fetch", fetchMock);

    await api[action]();

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer access");
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBeUndefined();
    expect(fetchMock.mock.calls[2][1].credentials).toBe("include");
  });

  it("shares one refresh between concurrent unauthorized requests", async () => {
    let resolveRefresh!: (response: ReturnType<typeof mockResponse>) => void;
    const refresh = new Promise<ReturnType<typeof mockResponse>>((resolve) => { resolveRefresh = resolve; });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockResponse(401, {}))
      .mockResolvedValueOnce(mockResponse(401, {}))
      .mockReturnValueOnce(refresh)
      .mockResolvedValue(mockResponse(200, mockSession.user));
    vi.stubGlobal("fetch", fetchMock);

    const requests = [api.me(), api.me()];
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    resolveRefresh(mockResponse(200, { ...mockSession, access_token: null, refresh_token: null }));
    await expect(Promise.all(requests)).resolves.toEqual([mockSession.user, mockSession.user]);
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith("/auth/refresh"))).toHaveLength(1);
  });

  it("clears cached credentials when refresh is rejected without retrying", async () => {
    storeSession(mockSession);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockResponse(401, { detail: "Session expired" }))
      .mockResolvedValueOnce(mockResponse(401, { detail: "Invalid refresh token" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.me()).rejects.toThrow("Session expired");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("user")).toBeNull();
  });

  it("does not keep retrying when the refreshed request is unauthorized", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockResponse(401, {}))
      .mockResolvedValueOnce(mockResponse(200, { ...mockSession, access_token: null, refresh_token: null }))
      .mockResolvedValueOnce(mockResponse(401, { detail: "Still unauthorized" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.me()).rejects.toThrow("Still unauthorized");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not refresh after invalid login credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(401, { detail: "Invalid credentials" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.login("user@example.com", "wrong")).rejects.toThrow("Invalid credentials");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("clears all session data", () => {
    storeSession(mockSession);
    clearSession();
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("user")).toBeNull();
  });
});

function mockResponse(status: number, body: unknown): Pick<Response, "status" | "ok" | "statusText" | "json"> {
  return {
    status,
    ok: status >= 200 && status < 300,
    statusText: status === 401 ? "Unauthorized" : "OK",
    json: async () => body,
  };
}

function createStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}
