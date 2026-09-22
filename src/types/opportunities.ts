// ACL: VisionTech opportunity types

export type OpportunityType =
  | "internship"
  | "project"
  | "hackathon"
  | "training"
  | "collaboration"
  | "job";

export type OpportunityStatus =
  | "open"
  | "closed"
  | "paused";

export interface Opportunity {
  id: string;
  organization_id?: string;
  title: string;
  description: string;
  required_skills: string[];
  opportunity_type: OpportunityType;
  status: OpportunityStatus;
  match_score?: number;
  confidence?: "high" | "medium" | "low";
  reason?: string;
  matched_strengths?: string[];
  missing_requirements?: string[];
  recommended_actions?: string[];
  match_factors?: OpportunityMatchFactor[];
  source_name?: string | null;
  source_url?: string | null;
  last_checked_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
}

export type OpportunityMatchFactor = {
  label: string;
  score?: number | null;
  evidence?: string | null;
  weight?: number | null;
};

export type OpportunityMatchRun = {
  match_run_id?: string;
  generated_at?: string;
  profile_insight_id?: string | null;
  profile_version?: string | null;
  items: Opportunity[];
};

export type OpportunityMatchRefreshPayload = {
  force_refresh?: boolean;
  opportunity_ids?: string[];
};
