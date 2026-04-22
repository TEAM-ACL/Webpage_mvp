import { createContext, useContext, useEffect, useRef, useState, type JSX, type ReactNode } from "react";
import { api } from "../lib/api";
import type { AuthSessionResponse, ProfileState } from "../lib/api";
import type {
  AIGenerationReadinessResponse,
  AIRecommendationActionState,
  AIRecommendationEventsResponse,
  AIRecommendationItem,
  AIRecommendationEventType,
  AIStateResponse,
  AIInsightResponse,
  AIRecommendationsResponse,
  AIMatchesResponse,
} from "../types/ai";
import {
  generateAIRecommendations,
  getAIGenerationReadiness,
  getAIRecommendationEvents,
  getAIState,
  generateAIInsight,
  getLatestAIInsight,
  getAIRecommendations,
  getAIMatches,
  recordAIRecommendationEvent,
} from "../services/aiService";
import { toUserMessage } from "../lib/userErrors";

// ACL: result contract for intelligence actions to support lightweight UI feedback
export type IntelligenceActionResult = {
  success: boolean;
  message: string;
};

// ACL: lightweight action history for intelligence sections
export type IntelligenceSectionAction = {
  status: "success" | "error" | "info";
  message: string;
  timestamp: string;
};

function getErrorMessage(error: unknown): string {
  return toUserMessage(error, "Something went wrong. Please try again.");
}

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
  aiInsightIsCached: boolean;
  aiInsightLastAction: IntelligenceSectionAction | null;
  recommendations: AIRecommendationsResponse | null;
  recommendationsLoading: boolean;
  recommendationsError: string | null;
  recommendationsUpdatedAt: string | null;
  recommendationsLastAction: IntelligenceSectionAction | null;
  matches: AIMatchesResponse | null;
  matchesLoading: boolean;
  matchesError: string | null;
  matchesUpdatedAt: string | null;
  matchesLastAction: IntelligenceSectionAction | null;
  intelligenceRefreshing: boolean;
  intelligenceUpdatedAt: string | null;
  intelligenceLastAction: IntelligenceSectionAction | null;
  aiState: AIStateResponse | null;
  aiStateLoading: boolean;
  aiStateError: string | null;
  aiReadiness: AIGenerationReadinessResponse | null;
  aiReadinessLoading: boolean;
  aiReadinessError: string | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  profileError: string | null;
  bootstrap: () => Promise<void>;
  refreshProfile: () => Promise<ProfileState | null>;
  loadAIState: () => Promise<AIStateResponse | null>;
  loadAIReadiness: () => Promise<AIGenerationReadinessResponse | null>;
  refreshAIInsight: () => Promise<IntelligenceActionResult>;
  loadLatestAIInsight: () => Promise<IntelligenceActionResult>;
  loadRecommendations: () => Promise<IntelligenceActionResult>;
  refreshRecommendations: () => Promise<IntelligenceActionResult>;
  loadMatches: () => Promise<IntelligenceActionResult>;
  refreshIntelligence: () => Promise<IntelligenceActionResult>;
  recordRecommendationEvent: (payload: {
    recommendation_id: string;
    pathway_id: string;
    event_type: AIRecommendationEventType;
    metadata?: Record<string, unknown>;
  }) => Promise<IntelligenceActionResult>;
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
  // ACL: track whether current AI insight is reused from cache
  const [aiInsightIsCached, setAIInsightIsCached] = useState<boolean>(false);
  const [aiInsightLastAction, setAIInsightLastAction] = useState<IntelligenceSectionAction | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [recommendationsUpdatedAt, setRecommendationsUpdatedAt] = useState<string | null>(null);
  const [recommendationsLastAction, setRecommendationsLastAction] = useState<IntelligenceSectionAction | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [matchesUpdatedAt, setMatchesUpdatedAt] = useState<string | null>(null);
  const [matchesLastAction, setMatchesLastAction] = useState<IntelligenceSectionAction | null>(null);
  const [intelligenceRefreshing, setIntelligenceRefreshing] = useState(false);
  const [intelligenceUpdatedAt, setIntelligenceUpdatedAt] = useState<string | null>(null);
  const [intelligenceLastAction, setIntelligenceLastAction] = useState<IntelligenceSectionAction | null>(null);
  const [aiState, setAIState] = useState<AIStateResponse | null>(null);
  const [aiStateLoading, setAIStateLoading] = useState(false);
  const [aiStateError, setAIStateError] = useState<string | null>(null);
  const [aiReadiness, setAIReadiness] = useState<AIGenerationReadinessResponse | null>(null);
  const [aiReadinessLoading, setAIReadinessLoading] = useState(false);
  const [aiReadinessError, setAIReadinessError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  // ACL: prevent duplicate intelligence requests from overlapping clicks/effects
  const aiInsightRequestInFlight = useRef(false);
  const recommendationsRequestInFlight = useRef(false);
  const matchesRequestInFlight = useRef(false);
  const intelligenceRefreshInFlight = useRef(false);

  const buildRecommendationActionStateMap = (
    response: AIRecommendationEventsResponse,
  ): Record<string, AIRecommendationActionState> => {
    const initialState = (): AIRecommendationActionState => ({
      viewed: false,
      clicked: false,
      saved: false,
      dismissed: false,
      started: false,
      completed: false,
      last_event_type: null,
    });

    return response.events.reduce<Record<string, AIRecommendationActionState>>((acc, event) => {
      if (!acc[event.pathway_id]) {
        acc[event.pathway_id] = initialState();
      }
      const current = acc[event.pathway_id];
      current[event.event_type] = true;
      current.last_event_type = event.event_type;
      return acc;
    }, {});
  };

  const hydrateRecommendationActions = async (
    data: AIRecommendationsResponse,
  ): Promise<AIRecommendationsResponse> => {
    try {
      if (!data.recommendation_id) {
        return data;
      }

      const eventsPayload = await getAIRecommendationEvents(data.recommendation_id);
      const actionStateByPathway = buildRecommendationActionStateMap(eventsPayload);
      const enriched = data.recommendations.map((item) => {
        const actionState = actionStateByPathway[item.pathway_id];
        if (!actionState) {
          return item;
        }
        return {
          ...item,
          action_state: actionState,
          event_type: actionState.last_event_type ?? undefined,
          is_completed: actionState.completed || item.is_completed === true || item.completed === true,
        };
      });

      return {
        ...data,
        recommendations: enriched as AIRecommendationItem[],
      };
    } catch {
      // Keep recommendations usable even if event hydration fails.
      return data;
    }
  };

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
      setAIInsightIsCached(false);
      setAIInsightLastAction(null);
      setRecommendations(null);
      setRecommendationsError(null);
      setRecommendationsUpdatedAt(null);
      setRecommendationsLastAction(null);
      setMatches(null);
      setMatchesError(null);
      setMatchesUpdatedAt(null);
      setMatchesLastAction(null);
      setIntelligenceUpdatedAt(null);
      setIntelligenceLastAction(null);
      setAIState(null);
      setAIStateError(null);
      setAIReadiness(null);
      setAIReadinessError(null);
      aiInsightRequestInFlight.current = false;
      recommendationsRequestInFlight.current = false;
      matchesRequestInFlight.current = false;
      intelligenceRefreshInFlight.current = false;
      setProfileError(getErrorMessage(err));
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  const loadAIState = async (): Promise<AIStateResponse | null> => {
    setAIStateLoading(true);
    setAIStateError(null);
    try {
      const state = await getAIState();
      setAIState(state);
      return state;
    } catch (err) {
      setAIState(null);
      setAIStateError(getErrorMessage(err));
      return null;
    } finally {
      setAIStateLoading(false);
    }
  };

  const loadAIReadiness = async (): Promise<AIGenerationReadinessResponse | null> => {
    setAIReadinessLoading(true);
    setAIReadinessError(null);
    try {
      const readiness = await getAIGenerationReadiness();
      setAIReadiness(readiness);
      return readiness;
    } catch (err) {
      setAIReadiness(null);
      setAIReadinessError(getErrorMessage(err));
      return null;
    } finally {
      setAIReadinessLoading(false);
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
      setError(getErrorMessage(err));
      setProfile(null);
      setOnboardingStage(null);
      setOnboardingComplete(null);
      setProfileLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // ACL: refresh AI insight using persisted backend profile as source of truth
  const refreshAIInsight = async (): Promise<IntelligenceActionResult> => {
    if (aiInsightRequestInFlight.current) {
      return {
        success: false,
        message: "AI insight refresh is already in progress.",
      };
    }

    aiInsightRequestInFlight.current = true;
    setAIInsightLoading(true);
    setAIInsightError(null);

    try {
      const readiness = await loadAIReadiness();
      const canGenerateInsight = readiness?.profile_insight.can_generate ?? false;
      if (!canGenerateInsight) {
        const blockedMessage =
          readiness?.profile_insight.message || "AI insight generation is currently blocked.";
        setAIInsightError(blockedMessage);
        return {
          success: false,
          message: blockedMessage,
        };
      }

      const actionTimestamp = new Date().toISOString();
      const insight = await generateAIInsight();
      setAIInsight(insight);
      setAIInsightUpdatedAt(actionTimestamp);
      setAIInsightSource("fresh");
      setAIInsightIsCached(false);
      setAIInsightLastAction({
        status: "success",
        message: "Refreshed successfully.",
        timestamp: actionTimestamp,
      });
      return {
        success: true,
        message: "AI insight refreshed successfully.",
      };
    } catch (error) {
      const message = getErrorMessage(error);
      const actionTimestamp = new Date().toISOString();
      setAIInsight(null);
      setAIInsightError(message);
      setAIInsightSource(null);
      setAIInsightIsCached(false);
      setAIInsightLastAction({
        status: "error",
        message: "Refresh failed.",
        timestamp: actionTimestamp,
      });
      return {
        success: false,
        message: "AI insight refresh failed.",
      };
    } finally {
      setAIInsightLoading(false);
      aiInsightRequestInFlight.current = false;
    }
  };

  // ACL: load latest saved AI insight from backend without forcing regeneration
  const loadLatestAIInsight = async (): Promise<IntelligenceActionResult> => {
    if (aiInsightRequestInFlight.current) {
      return {
        success: false,
        message: "AI insight retrieval is already in progress.",
      };
    }

    aiInsightRequestInFlight.current = true;
    setAIInsightLoading(true);
    setAIInsightError(null);

    try {
      const actionTimestamp = new Date().toISOString();
      const insight = await getLatestAIInsight();
      setAIInsight(insight);
      setAIInsightUpdatedAt(insight ? actionTimestamp : null);
      setAIInsightSource(insight ? "saved" : null);
      setAIInsightIsCached(Boolean(insight));
      if (insight) {
        setAIInsightLastAction({
          status: "success",
          message: "Loaded saved insight.",
          timestamp: actionTimestamp,
        });
        return {
          success: true,
          message: "Saved AI insight loaded successfully.",
        };
      }
      setAIInsightLastAction({
        status: "info",
        message: "No saved insight found yet.",
        timestamp: actionTimestamp,
      });
      return {
        success: true,
        message: "No saved AI insight is available yet.",
      };
    } catch (error) {
      const message = getErrorMessage(error);
      const actionTimestamp = new Date().toISOString();
      setAIInsight(null);
      setAIInsightError(message);
      setAIInsightSource(null);
      setAIInsightIsCached(false);
      setAIInsightLastAction({
        status: "error",
        message: "Saved insight retrieval failed.",
        timestamp: actionTimestamp,
      });
      return {
        success: false,
        message: "Saved AI insight could not be loaded.",
      };
    } finally {
      setAIInsightLoading(false);
      aiInsightRequestInFlight.current = false;
    }
  };

  // ACL: load AI recommendations for the authenticated user
  const loadRecommendations = async (): Promise<IntelligenceActionResult> => {
    if (recommendationsRequestInFlight.current) {
      return {
        success: false,
        message: "Recommendations are already loading.",
      };
    }

    recommendationsRequestInFlight.current = true;
    setRecommendationsLoading(true);
    setRecommendationsError(null);

    try {
      const actionTimestamp = new Date().toISOString();
      const data = await getAIRecommendations();
      const hydratedData = await hydrateRecommendationActions(data);
      setRecommendations(hydratedData);
      setRecommendationsUpdatedAt(actionTimestamp);
      setRecommendationsLastAction({
        status: "success",
        message: "Recommendations loaded successfully.",
        timestamp: actionTimestamp,
      });
      return {
        success: true,
        message: "Recommendations loaded successfully.",
      };
    } catch (error) {
      const message = getErrorMessage(error);
      const actionTimestamp = new Date().toISOString();
      setRecommendations(null);
      setRecommendationsError(message);
      setRecommendationsLastAction({
        status: "error",
        message: "Recommendations failed to load.",
        timestamp: actionTimestamp,
      });
      return {
        success: false,
        message: "Recommendations failed to load.",
      };
    } finally {
      setRecommendationsLoading(false);
      recommendationsRequestInFlight.current = false;
    }
  };

  const refreshRecommendations = async (): Promise<IntelligenceActionResult> => {
    if (recommendationsRequestInFlight.current) {
      return {
        success: false,
        message: "Recommendations are already loading.",
      };
    }

    recommendationsRequestInFlight.current = true;
    setRecommendationsLoading(true);
    setRecommendationsError(null);

    try {
      const readiness = await loadAIReadiness();
      const canGenerateRecommendations = readiness?.recommendations.can_generate ?? false;
      if (!canGenerateRecommendations) {
        const blockedMessage =
          readiness?.recommendations.message || "Recommendations generation is currently blocked.";
        setRecommendationsError(blockedMessage);
        return {
          success: false,
          message: blockedMessage,
        };
      }

      const actionTimestamp = new Date().toISOString();
      const data = await generateAIRecommendations();
      const hydratedData = await hydrateRecommendationActions(data);
      setRecommendations(hydratedData);
      setRecommendationsUpdatedAt(actionTimestamp);
      setRecommendationsLastAction({
        status: "success",
        message: "Recommendations refreshed successfully.",
        timestamp: actionTimestamp,
      });
      return {
        success: true,
        message: "Recommendations refreshed successfully.",
      };
    } catch (error) {
      const message = getErrorMessage(error);
      const actionTimestamp = new Date().toISOString();
      setRecommendations(null);
      setRecommendationsError(message);
      setRecommendationsLastAction({
        status: "error",
        message: "Recommendations refresh failed.",
        timestamp: actionTimestamp,
      });
      return {
        success: false,
        message: "Recommendations failed to refresh.",
      };
    } finally {
      setRecommendationsLoading(false);
      recommendationsRequestInFlight.current = false;
    }
  };

  // ACL: load backend-driven matches for the authenticated user
  const loadMatches = async (): Promise<IntelligenceActionResult> => {
    if (matchesRequestInFlight.current) {
      return {
        success: false,
        message: "Smart matching is already loading.",
      };
    }

    matchesRequestInFlight.current = true;
    setMatchesLoading(true);
    setMatchesError(null);

    try {
      const actionTimestamp = new Date().toISOString();
      const data = await getAIMatches();
      setMatches(data);
      setMatchesUpdatedAt(actionTimestamp);
      setMatchesLastAction({
        status: "success",
        message: "Smart matches loaded successfully.",
        timestamp: actionTimestamp,
      });
      return {
        success: true,
        message: "Smart matches loaded successfully.",
      };
    } catch (error) {
      const message = getErrorMessage(error);
      const actionTimestamp = new Date().toISOString();
      setMatches(null);
      setMatchesError(message);
      setMatchesLastAction({
        status: "error",
        message: "Smart matches failed to load.",
        timestamp: actionTimestamp,
      });
      return {
        success: false,
        message: "Smart matches failed to load.",
      };
    } finally {
      setMatchesLoading(false);
      matchesRequestInFlight.current = false;
    }
  };

  // ACL: refresh all intelligence sections together for the authenticated user
  const refreshIntelligence = async (): Promise<IntelligenceActionResult> => {
    if (intelligenceRefreshInFlight.current) {
      return {
        success: false,
        message: "Full intelligence refresh is already in progress.",
      };
    }

    intelligenceRefreshInFlight.current = true;
    setIntelligenceRefreshing(true);

    try {
      const results = await Promise.all([
        refreshAIInsight(),
        refreshRecommendations(),
        loadMatches(),
      ]);
      const successCount = results.filter((result) => result.success).length;
      const actionTimestamp = new Date().toISOString();
      setIntelligenceUpdatedAt(actionTimestamp);
      if (successCount === results.length) {
        setIntelligenceLastAction({
          status: "success",
          message: "Full refresh completed successfully.",
          timestamp: actionTimestamp,
        });
        return {
          success: true,
          message: "Full intelligence refresh completed successfully.",
        };
      }
      if (successCount === 0) {
        setIntelligenceLastAction({
          status: "error",
          message: "Full refresh failed.",
          timestamp: actionTimestamp,
        });
        return {
          success: false,
          message: "Full intelligence refresh failed.",
        };
      }
      setIntelligenceLastAction({
        status: "info",
        message: `Full refresh completed with partial success (${successCount}/${results.length}).`,
        timestamp: actionTimestamp,
      });
      return {
        success: true,
        message: `Full intelligence refresh completed with partial success (${successCount}/${results.length}).`,
      };
    } finally {
      setIntelligenceRefreshing(false);
      intelligenceRefreshInFlight.current = false;
    }
  };

  const recordRecommendationEvent = async (payload: {
    recommendation_id: string;
    pathway_id: string;
    event_type: AIRecommendationEventType;
    metadata?: Record<string, unknown>;
  }): Promise<IntelligenceActionResult> => {
    try {
      await recordAIRecommendationEvent(payload);
      return {
        success: true,
        message: "Recommendation action recorded.",
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
      };
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
      setAIInsightIsCached(false);
      setAIInsightLastAction(null);
      setRecommendations(null);
      setRecommendationsError(null);
      setRecommendationsLoading(false);
      setRecommendationsUpdatedAt(null);
      setRecommendationsLastAction(null);
      setMatches(null);
      setMatchesError(null);
      setMatchesLoading(false);
      setMatchesUpdatedAt(null);
      setMatchesLastAction(null);
      setIntelligenceRefreshing(false);
      setIntelligenceUpdatedAt(null);
      setIntelligenceLastAction(null);
      setAIState(null);
      setAIStateLoading(false);
      setAIStateError(null);
      setAIReadiness(null);
      setAIReadinessLoading(false);
      setAIReadinessError(null);
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
        aiInsightIsCached,
        aiInsightLastAction,
        recommendations,
        recommendationsUpdatedAt,
        recommendationsLastAction,
        matches,
        matchesUpdatedAt,
        matchesLastAction,
        aiInsightLoading,
        aiInsightError,
        recommendationsLoading,
        recommendationsError,
        matchesLoading,
        matchesError,
        intelligenceUpdatedAt,
        intelligenceLastAction,
        aiState,
        aiStateLoading,
        aiStateError,
        aiReadiness,
        aiReadinessLoading,
        aiReadinessError,
        loading,
        profileLoading,
        error,
        profileError,
        bootstrap,
        refreshProfile: fetchProfile,
        loadAIState,
        loadAIReadiness,
        refreshAIInsight,
        loadLatestAIInsight,
        loadRecommendations,
        refreshRecommendations,
        loadMatches,
        intelligenceRefreshing,
        refreshIntelligence,
        recordRecommendationEvent,
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
