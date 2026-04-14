import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import { api } from "../lib/api";
import type { AuthSessionResponse, ProfileState } from "../lib/api";

type AuthContextValue = {
  user: AuthSessionResponse["user"] | null;
  profile: ProfileState["profile"] | null;
  onboardingComplete: boolean | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  profileError: string | null;
  bootstrap: () => Promise<void>;
  refreshProfile: () => Promise<ProfileState | null>;
  setUser: (user: AuthSessionResponse["user"] | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthSessionResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileState["profile"] | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = async (): Promise<ProfileState | null> => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const prof = await api.getMyProfile();
      setProfile(prof.profile);
      setOnboardingComplete(prof.isOnboardingComplete);
      return prof;
    } catch (err) {
      setProfile(null);
      setOnboardingComplete(null);
      setProfileError((err as Error).message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  const bootstrap = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await api.me();
      setUser(me as AuthSessionResponse["user"]);
      await fetchProfile();
    } catch (err) {
      setUser(null);
      setError((err as Error).message);
      setProfile(null);
      setOnboardingComplete(null);
      setProfileLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // best-effort
    } finally {
      setUser(null);
      setProfile(null);
      setOnboardingComplete(null);
    }
  };

  useEffect(() => {
    void bootstrap();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        onboardingComplete,
        loading,
        profileLoading,
        error,
        profileError,
        bootstrap,
        refreshProfile: fetchProfile,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
