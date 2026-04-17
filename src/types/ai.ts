// ACL: Types for VisionTech AI flow

export type OnboardingData = {
  nickname?: string;
  skills?: string[];
  interests?: string[];
  goals?: string[];
  level?: string;
  force_refresh?: boolean;
};

export type AIInsightResponse = {
  summary: string;
  skill_gaps: string[];
  next_steps: string[];
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
