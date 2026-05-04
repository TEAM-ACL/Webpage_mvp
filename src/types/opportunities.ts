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
  created_at?: string;
}
