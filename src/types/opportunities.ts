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
  recommended_actions?: string[];
  created_at?: string;
}
