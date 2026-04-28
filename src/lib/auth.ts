import { clearSession } from "./api";

const USER_KEY = "user";
const ONBOARDING_KEY = "onboarding_complete";
const ADMIN_KEY = "is_admin";
const ONBOARDING_PROFILE_KEY = "onboarding_profile";

type StoredUser = {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role?: string | null;
};

export function getUser(): StoredUser | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getUser();
}

export function setOnboardingComplete(done: boolean): void {
  sessionStorage.setItem(ONBOARDING_KEY, done ? "true" : "false");
}

export function getOnboardingComplete(): boolean {
  return sessionStorage.getItem(ONBOARDING_KEY) === "true";
}

export function setAdminFlag(value: boolean): void {
  sessionStorage.setItem(ADMIN_KEY, value ? "true" : "false");
}

export function isAdmin(): boolean {
  if (sessionStorage.getItem(ADMIN_KEY) === "true") return true;
  const user = getUser();
  const role = user?.role?.toLowerCase();
  if (role === "admin" || role === "super_admin" || role === "superadmin") {
    return true;
  }
  return user?.email?.toLowerCase().endsWith("@visiontech.ai") ?? false;
}

export function signOut(): void {
  clearSession();
  setOnboardingComplete(false);
  setAdminFlag(false);
  sessionStorage.removeItem(ONBOARDING_PROFILE_KEY);
}

export function setOnboardingProfile(profile: unknown): void {
  try {
    sessionStorage.setItem(ONBOARDING_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage errors
  }
}

export function getOnboardingProfile<T = unknown>(): T | null {
  const raw = sessionStorage.getItem(ONBOARDING_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
