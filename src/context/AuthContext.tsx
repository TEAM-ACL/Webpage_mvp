import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import { api } from "../lib/api";
import type { AuthSessionResponse, ProfileState } from "../lib/api";
import type { AIInsightResponse } from "../types/ai";
import { generateAIInsight, getLatestAIInsight } from "../services/aiService";

type AuthContextValue = {
  user: AuthSessionResponse["user"] | null;
  profile: ProfileState["profile"] | null;
  onboardingStage: string | null;
  onboardingComplete: boolean | null;
  aiInsight: AIInsightResponse | null;
  aiInsightLoading: boolean;
  aiInsightError: string | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  profileError: string | null;
  bootstrap: () => Promise<void>;
  refreshProfile: () => Promise<ProfileState | null>;
  refreshAIInsight: () => Promise<AIInsightResponse | null>;
  loadLatestAIInsight: () => Promise<AIInsightResponse | null>;
  setAIInsight: (insight: AIInsightResponse | null) => void;
  setUser: (user: AuthSessionResponse["user"] | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthSessionResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileState["profile"] | null>(null);
  const [onboardingStage, setOnboardingStage] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [aiInsight, setAIInsight] = useState<AIInsightResponse | null>(null);
  const [aiInsightLoading, setAIInsightLoading] = useState(false);
  const [aiInsightError, setAIInsightError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = async (): Promise<ProfileState | null> => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const prof = await api.getMyProfile();
      setProfile(prof.profile);
      setOnboardingStage(prof.onboardingStage);
      setOnboardingComplete(prof.isOnboardingComplete);
      return prof;
    } catch (err) {
  setProfile(null);
  setOnboardingStage(null);
  setOnboardingComplete(null);
  setAIInsight(null);
  setAIInsightError(null);
  setProfileError((err as Error).message);
  return null;
} finally {
      setProfileLoading(false);
    }
  };

  const bootstrap = async () => {
    setLoading(true);
    setError(null);
    setAIInsightError(null);
    try {
      const me = await api.me();
      setUser(me as AuthSessionResponse["user"]);
      await fetchProfile();
    } catch (err) {
      setUser(null);
      setError((err as Error).message);
      setProfile(null);
      setOnboardingStage(null);
      setOnboardingComplete(null);
      setProfileLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // ACL: refresh AI insight using persisted backend profile as source of truth
const refreshAIInsight = async (): Promise<AIInsightResponse | null> => {
  setAIInsightLoading(true);
  setAIInsightError(null);

  try {
    const insight = await generateAIInsight();
    setAIInsight(insight);
    return insight;
  } catch (err) {
    setAIInsight(null);
    setAIInsightError((err as Error).message);
    return null;
  } finally {
    setAIInsightLoading(false);
  }
};

  // ACL: load latest saved AI insight from backend without forcing regeneration
  const loadLatestAIInsight = async (): Promise<AIInsightResponse | null> => {
    setAIInsightLoading(true);
    setAIInsightError(null);

    try {
      const insight = await getLatestAIInsight();
      setAIInsight(insight);
      return insight;
    } catch (err) {
      setAIInsight(null);
      setAIInsightError((err as Error).message);
      return null;
    } finally {
      setAIInsightLoading(false);
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
      setOnboardingStage(null);
      setOnboardingComplete(null);
      setAIInsight(null);
      setAIInsightError(null);
      setAIInsightLoading(false);
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
        onboardingStage,
        onboardingComplete,
        aiInsight,
        aiInsightLoading,
        aiInsightError,
        loading,
        profileLoading,
        error,
        profileError,
        bootstrap,
        refreshProfile: fetchProfile,
        refreshAIInsight,
        loadLatestAIInsight,
        setAIInsight,
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
