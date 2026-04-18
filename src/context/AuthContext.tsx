import { createContext, useContext, useEffect, useRef, useState, type JSX, type ReactNode } from "react";
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
  aiInsightLoading: boolean;
  aiInsightError: string | null;
  aiInsightUpdatedAt: string | null;
  aiInsightSource: "saved" | "fresh" | null;
  recommendations: AIRecommendationsResponse | null;
  recommendationsLoading: boolean;
  recommendationsError: string | null;
  recommendationsUpdatedAt: string | null;
  matches: AIMatchesResponse | null;
  matchesLoading: boolean;
  matchesError: string | null;
  matchesUpdatedAt: string | null;
  intelligenceRefreshing: boolean;
  intelligenceUpdatedAt: string | null;
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
  const [aiInsightUpdatedAt, setAIInsightUpdatedAt] = useState<string | null>(null);
  const [aiInsightSource, setAIInsightSource] = useState<"saved" | "fresh" | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [recommendationsUpdatedAt, setRecommendationsUpdatedAt] = useState<string | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [matchesUpdatedAt, setMatchesUpdatedAt] = useState<string | null>(null);
  const [intelligenceRefreshing, setIntelligenceRefreshing] = useState(false);
  const [intelligenceUpdatedAt, setIntelligenceUpdatedAt] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  // ACL: prevent duplicate intelligence requests from overlapping clicks/effects
  const aiInsightRequestInFlight = useRef(false);
  const recommendationsRequestInFlight = useRef(false);
  const matchesRequestInFlight = useRef(false);
  const intelligenceRefreshInFlight = useRef(false);

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
      setAIInsightUpdatedAt(null);
      setAIInsightSource(null);
      setRecommendations(null);
      setRecommendationsError(null);
      setRecommendationsUpdatedAt(null);
      setMatches(null);
      setMatchesError(null);
      setMatchesUpdatedAt(null);
      setIntelligenceUpdatedAt(null);
      aiInsightRequestInFlight.current = false;
      recommendationsRequestInFlight.current = false;
      matchesRequestInFlight.current = false;
      intelligenceRefreshInFlight.current = false;
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
    if (aiInsightRequestInFlight.current) {
      return aiInsight;
    }

    aiInsightRequestInFlight.current = true;
    setAIInsightLoading(true);
    setAIInsightError(null);

    try {
      const insight = await generateAIInsight();
      setAIInsight(insight);
      setAIInsightUpdatedAt(new Date().toISOString());
      setAIInsightSource("fresh");
      return insight;
    } catch (err) {
      setAIInsight(null);
      setAIInsightError((err as Error).message);
      setAIInsightSource(null);
      return null;
    } finally {
      setAIInsightLoading(false);
      aiInsightRequestInFlight.current = false;
    }
  };

  // ACL: load latest saved AI insight from backend without forcing regeneration
  const loadLatestAIInsight = async (): Promise<AIInsightResponse | null> => {
    if (aiInsightRequestInFlight.current) {
      return aiInsight;
    }

    aiInsightRequestInFlight.current = true;
    setAIInsightLoading(true);
    setAIInsightError(null);

    try {
      const insight = await getLatestAIInsight();
      setAIInsight(insight);
      setAIInsightUpdatedAt(insight ? new Date().toISOString() : null);
      setAIInsightSource(insight ? "saved" : null);
      return insight;
    } catch (err) {
      setAIInsight(null);
      setAIInsightError((err as Error).message);
      setAIInsightSource(null);
      return null;
    } finally {
      setAIInsightLoading(false);
      aiInsightRequestInFlight.current = false;
    }
  };

  // ACL: load AI recommendations for the authenticated user
  const loadRecommendations = async (): Promise<AIRecommendationsResponse | null> => {
    if (recommendationsRequestInFlight.current) {
      return recommendations;
    }

    recommendationsRequestInFlight.current = true;
    setRecommendationsLoading(true);
    setRecommendationsError(null);

    try {
      const data = await getAIRecommendations();
      setRecommendations(data);
      setRecommendationsUpdatedAt(new Date().toISOString());
      return data;
    } catch (err) {
      setRecommendations(null);
      setRecommendationsError((err as Error).message);
      return null;
    } finally {
      setRecommendationsLoading(false);
      recommendationsRequestInFlight.current = false;
    }
  };

  // ACL: load backend-driven matches for the authenticated user
  const loadMatches = async (): Promise<AIMatchesResponse | null> => {
    if (matchesRequestInFlight.current) {
      return matches;
    }

    matchesRequestInFlight.current = true;
    setMatchesLoading(true);
    setMatchesError(null);

    try {
      const data = await getAIMatches();
      setMatches(data);
      setMatchesUpdatedAt(new Date().toISOString());
      return data;
    } catch (err) {
      setMatches(null);
      setMatchesError((err as Error).message);
      return null;
    } finally {
      setMatchesLoading(false);
      matchesRequestInFlight.current = false;
    }
  };

  // ACL: refresh all intelligence sections together for the authenticated user
  const refreshIntelligence = async (): Promise<void> => {
    if (intelligenceRefreshInFlight.current) {
      return;
    }

    intelligenceRefreshInFlight.current = true;
    setIntelligenceRefreshing(true);

    try {
      await Promise.all([
        refreshAIInsight(),
        loadRecommendations(),
        loadMatches(),
      ]);

      setIntelligenceUpdatedAt(new Date().toISOString());
    } finally {
      setIntelligenceRefreshing(false);
      intelligenceRefreshInFlight.current = false;
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
      setAIInsightUpdatedAt(null);
      setAIInsightSource(null);
      setRecommendations(null);
      setRecommendationsError(null);
      setRecommendationsLoading(false);
      setRecommendationsUpdatedAt(null);
      setMatches(null);
      setMatchesError(null);
      setMatchesLoading(false);
      setMatchesUpdatedAt(null);
      setIntelligenceRefreshing(false);
      setIntelligenceUpdatedAt(null);
      aiInsightRequestInFlight.current = false;
      recommendationsRequestInFlight.current = false;
      matchesRequestInFlight.current = false;
      intelligenceRefreshInFlight.current = false;
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
        aiInsightUpdatedAt,
        aiInsightSource,
        recommendations,
        recommendationsUpdatedAt,
        matches,
        matchesUpdatedAt,
        aiInsightLoading,
        aiInsightError,
        recommendationsLoading,
        recommendationsError,
        matchesLoading,
        matchesError,
        intelligenceUpdatedAt,
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
