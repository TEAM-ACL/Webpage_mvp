import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import { api } from "../lib/api";
import type { AuthSessionResponse, ProfileState } from "../lib/api";
import type {
  AIInsightResponse,
  AIRecommendationsResponse,
  AIMatchesResponse,
} from "../types/ai";
import {
  generateAIInsight,
  getLatestAIInsight,
  getAIRecommendations,
  getAIMatches,
} from "../services/aiService";

type AuthContextValue = {
  user: AuthSessionResponse["user"] | null;
  profile: ProfileState["profile"] | null;
  onboardingStage: string | null;
  onboardingComplete: boolean | null;
  aiInsight: AIInsightResponse | null;
  recommendations: AIRecommendationsResponse | null;
  matches: AIMatchesResponse | null;
  aiInsightLoading: boolean;
  aiInsightError: string | null;
  recommendationsLoading: boolean;
  recommendationsError: string | null;
  matchesLoading: boolean;
  matchesError: string | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  profileError: string | null;
  bootstrap: () => Promise<void>;
  refreshProfile: () => Promise<ProfileState | null>;
  refreshAIInsight: () => Promise<AIInsightResponse | null>;
  loadLatestAIInsight: () => Promise<AIInsightResponse | null>;
  loadRecommendations: () => Promise<AIRecommendationsResponse | null>;
  loadMatches: () => Promise<AIMatchesResponse | null>;
  intelligenceRefreshing: boolean;
  refreshIntelligence: () => Promise<void>;
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
  const [recommendations, setRecommendations] = useState<AIRecommendationsResponse | null>(null);
  const [matches, setMatches] = useState<AIMatchesResponse | null>(null);
  const [aiInsightLoading, setAIInsightLoading] = useState(false);
  const [aiInsightError, setAIInsightError] = useState<string | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [intelligenceRefreshing, setIntelligenceRefreshing] = useState(false);
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
      setRecommendations(null);
      setRecommendationsError(null);
      setMatches(null);
      setMatchesError(null);
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

  // ACL: load AI recommendations for the authenticated user
  const loadRecommendations = async (): Promise<AIRecommendationsResponse | null> => {
    setRecommendationsLoading(true);
    setRecommendationsError(null);

    try {
      const data = await getAIRecommendations();
      setRecommendations(data);
      return data;
    } catch (err) {
      setRecommendations(null);
      setRecommendationsError((err as Error).message);
      return null;
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // ACL: load backend-driven matches for the authenticated user
  const loadMatches = async (): Promise<AIMatchesResponse | null> => {
    setMatchesLoading(true);
    setMatchesError(null);

    try {
      const data = await getAIMatches();
      setMatches(data);
      return data;
    } catch (err) {
      setMatches(null);
      setMatchesError((err as Error).message);
      return null;
    } finally {
      setMatchesLoading(false);
    }
  };

  // ACL: refresh all intelligence sections together for the authenticated user
  const refreshIntelligence = async (): Promise<void> => {
    setIntelligenceRefreshing(true);

    try {
      await Promise.all([
        refreshAIInsight(),
        loadRecommendations(),
        loadMatches(),
      ]);
    } finally {
      setIntelligenceRefreshing(false);
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
      setRecommendations(null);
      setRecommendationsError(null);
      setRecommendationsLoading(false);
      setMatches(null);
      setMatchesError(null);
      setMatchesLoading(false);
      setIntelligenceRefreshing(false);
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
        recommendations,
        matches,
        aiInsightLoading,
        aiInsightError,
        recommendationsLoading,
        recommendationsError,
        matchesLoading,
        matchesError,
        loading,
        profileLoading,
        error,
        profileError,
        bootstrap,
        refreshProfile: fetchProfile,
        refreshAIInsight,
        loadLatestAIInsight,
        loadRecommendations,
        loadMatches,
        intelligenceRefreshing,
        refreshIntelligence,
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
