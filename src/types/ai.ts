// ACL: Types for VisionTech AI flow

export type OnboardingData = {
  nickname?: string;
  skills?: string[];
  interests?: string[];
  goals?: string[];
  level?: string;
  force_refresh?: boolean;
};

export type AIGenerationReadinessStatus =
  | "ready"
  | "blocked"
  | "incomplete_onboarding"
  | "provider_unavailable"
  | "missing_profile_insight"
  | "missing_pathway_catalog";

export type AISectionStatus =
  | "ready"
  | "empty"
  | "blocked"
  | "incomplete_onboarding";

export type AIInsightResponse = {
  summary: string;
  skill_gaps: string[];
  next_steps: string[];
};

export type AIStateResponse = {
  onboarding: {
    status: AISectionStatus;
    onboarding_stage: string | null;
    is_email_verified: boolean;
    message: string | null;
  };
  profile_insight: {
    status: AISectionStatus;
    data: AIInsightResponse | null;
    generated_at: string | null;
    message: string | null;
  };
  recommendations: {
    status: AISectionStatus;
    data: AIRecommendationsResponse | null;
    generated_at: string | null;
    message: string | null;
  };
  matches: {
    status: AISectionStatus;
    data: AIMatchesResponse | null;
    generated_at: string | null;
    message: string | null;
  };
};

export type AIGenerationReadinessResponse = {
  provider: {
    provider: string;
    model: string;
    configured: boolean;
  };
  profile_insight: {
    status: AIGenerationReadinessStatus;
    can_generate: boolean;
    message: string;
  };
  recommendations: {
    status: AIGenerationReadinessStatus;
    can_generate: boolean;
    message: string;
  };
};

export type AIRecommendationEventType =
  | "viewed"
  | "clicked"
  | "saved"
  | "dismissed"
  | "started"
  | "completed";

export type AIRecommendationActionState = {
  viewed: boolean;
  clicked: boolean;
  saved: boolean;
  dismissed: boolean;
  started: boolean;
  completed: boolean;
  last_event_type: AIRecommendationEventType | null;
};

// ACL: Recommendation item returned by backend recommendation engine
export type AIRecommendationItem = {
  pathway_id: string;
  title: string;
  summary: string;
  career_outcome: string;
  skill_level: string;
  match_score: number;
  match_reason: string;
  next_steps: string[];
  // ACL: Optional compatibility fields for completion-aware filtering.
  status?: string;
  event_type?: string;
  is_completed?: boolean;
  completed?: boolean;
  action_state?: AIRecommendationActionState;
};

// ACL: Recommendation response for Intelligence page
export type AIRecommendationsResponse = {
  recommendation_id: string;
  generated_at: string;
  recommendations: AIRecommendationItem[];
};

// ACL: Match item returned by backend matching engine
export type AIMatchItem = {
  id: string;
  name: string;
  role: string;
  match_score: number;
  reason: string;
};

// ACL: Matching response for Intelligence page
export type AIMatchesResponse = {
  matches: AIMatchItem[];
};

export type AIRecommendationEventItem = {
  event_id: string;
  recommendation_id: string;
  pathway_id: string;
  event_type: AIRecommendationEventType;
  metadata: Record<string, unknown>;
  occurred_at: string;
};

export type AIRecommendationEventsResponse = {
  recommendation_id: string;
  events: AIRecommendationEventItem[];
};

export type CustomPathwayStatus =
  | "private"
  | "pending_review"
  | "approved"
  | "rejected"
  | "archived";

export type CustomPathwayItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  desired_outcome: string;
  current_skill_level: string;
  reason_for_interest: string;
  status: CustomPathwayStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type CustomPathwaysListResponse = {
  items: CustomPathwayItem[];
  page: number;
  page_size: number;
  total: number;
};

export type CreateCustomPathwayPayload = {
  title: string;
  description: string;
  desired_outcome: string;
  current_skill_level: string;
  reason_for_interest: string;
};

export type UpdateCustomPathwayPayload = Partial<CreateCustomPathwayPayload>;
