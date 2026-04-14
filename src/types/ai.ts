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
