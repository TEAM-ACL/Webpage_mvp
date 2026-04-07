import { describe, it, expect, beforeEach, vi } from "vitest";
import { storeSession, clearSession, type AuthSessionResponse } from "./api";

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
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores tokens and user when present", () => {
    storeSession(mockSession);
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("user")).toContain("user@example.com");
  });

  it("skips token storage when tokens are null", () => {
    storeSession({ ...mockSession, access_token: null, refresh_token: null });
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("user")).toContain("user@example.com");
  });

  it("clears all session data", () => {
    storeSession(mockSession);
    clearSession();
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
    expect(sessionStorage.getItem("user")).toBeNull();
  });
});
