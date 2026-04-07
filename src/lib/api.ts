const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(
  path: string,
  {
    method = "GET",
    body,
    token,
  }: {
    method?: HttpMethod;
    body?: unknown;
    token?: string | null;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    // allow httpOnly cookie-based sessions set by the API
    credentials: "include",
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data?.error?.message || data?.detail || data?.message || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message || "Request failed");
  }

  // handle empty responses
  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

export type AuthSessionResponse = {
  access_token: string | null;
  refresh_token: string | null;
  token_type: string | null;
  expires_in: number | null;
  user: {
    id: string;
    email: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  };
};

export const api = {
  login(email: string, password: string) {
    return request<AuthSessionResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },
  register(payload: { email: string; password: string; display_name?: string | null; first_name?: string | null; last_name?: string | null }) {
    return request<AuthSessionResponse>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },
  logout() {
    return request<void>("/auth/logout", { method: "POST" });
  },
};

export function storeSession(session: AuthSessionResponse) {
  // Prefer secure httpOnly cookies on the backend; only persist non-sensitive user metadata.
  sessionStorage.setItem("user", JSON.stringify(session.user));
}

export function clearSession() {
  sessionStorage.removeItem("user");
}
