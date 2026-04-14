const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BackendProfileResponse = {
  profile?: Record<string, unknown>;
  onboarding_stage?: string | null;
  is_onboarding_complete?: boolean | null;
};

export type Profile = {
  preferredNickname?: string | null;
  fullName?: string | null;
  fieldOfInterest?: string | null;
  experienceLevel?: string | null;
  preferredWorkStyle?: string | null;
  region?: string | null;
  country?: string | null;
  otherFieldDetail?: string | null;
  otherRegionDetail?: string | null;
  goals: string[];
  interests: string[];
  skills: string[];
};

export type ProfileState = {
  profile: Profile | null;
  onboardingStage: string | null;
  isOnboardingComplete: boolean | null;
};

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
  const bearer = token ?? getAccessToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

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

function mapBackendProfile(resp: BackendProfileResponse): ProfileState {
  const src = resp.profile ?? {};
  const snake = (key: string) => (src as Record<string, unknown>)[key];
  const coerceStrArr = (val: unknown): string[] => (Array.isArray(val) ? val.map((v) => String(v)) : []);

  const profile: Profile = {
    preferredNickname: (snake("preferred_nickname") as string) ?? (snake("preferredNickname") as string) ?? null,
    fullName: (snake("full_name") as string) ?? (snake("fullName") as string) ?? null,
    fieldOfInterest: (snake("field_of_interest") as string) ?? (snake("fieldOfInterest") as string) ?? null,
    experienceLevel: (snake("experience_level") as string) ?? (snake("experienceLevel") as string) ?? null,
    preferredWorkStyle: (snake("preferred_work_style") as string) ?? (snake("preferredWorkStyle") as string) ?? null,
    region: (snake("region") as string) ?? null,
    country: (snake("country") as string) ?? null,
    otherFieldDetail: (snake("other_field_detail") as string) ?? null,
    otherRegionDetail: (snake("other_region_detail") as string) ?? null,
    goals: coerceStrArr(snake("goals") ?? []),
    interests: coerceStrArr(snake("interests") ?? []),
    skills: coerceStrArr(snake("skills") ?? []),
  };

  return {
    profile,
    onboardingStage: resp.onboarding_stage ?? null,
    isOnboardingComplete: resp.is_onboarding_complete ?? null,
  };
}

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
    const token = getAccessToken();
    return request<void>("/auth/logout", { method: "POST", token });
  },
  me() {
    const token = getAccessToken();
    return request("/auth/me", { token });
  },
  getMyProfile() {
    return request<BackendProfileResponse>("/me/profile").then(mapBackendProfile);
  },
  saveOnboardingProfile(payload: unknown) {
    return request<BackendProfileResponse>("/me/profile/onboarding", {
      method: "PUT",
      body: payload,
    }).then(mapBackendProfile);
  },
  requestPasswordReset(email: string, redirect_to?: string) {
    return request<MessageResponse>("/auth/password-reset/request", {
      method: "POST",
      body: { email, redirect_to },
    });
  },
  confirmPasswordReset(new_password: string, access_token: string) {
    return request<MessageResponse>("/auth/password-reset/confirm", {
      method: "POST",
      token: access_token,
      body: { new_password },
    });
  },
};

export function storeSession(session: AuthSessionResponse) {
  // Cache tokens when provided (for bearer fallback) and user profile
  if (session.access_token) sessionStorage.setItem("access_token", session.access_token);
  if (session.refresh_token) sessionStorage.setItem("refresh_token", session.refresh_token);
  sessionStorage.setItem("user", JSON.stringify(session.user));
}

export function clearSession() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem("access_token");
}

type MessageResponse = { message: string };
