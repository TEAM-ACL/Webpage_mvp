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
export type RecommendationItem = {
  id: string;
  title: string;
  type: string;
  level: string;
  reason: string;
};

// ACL: Recommendation response for Intelligence page
export type AIRecommendationsResponse = {
  recommended_resources: RecommendationItem[];
  recommended_projects: RecommendationItem[];
};
