// ACL: Types for VisionTech AI flow

export type OnboardingData = {
  nickname: string;
  skills: string[];
  interests: string[];
  goals: string[];
  level: string;
};

export type AIInsightResponse = {
  summary: string;
  skill_gaps: string[];
  next_steps: string[];
};