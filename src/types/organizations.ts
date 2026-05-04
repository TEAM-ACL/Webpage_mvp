// ACL: VisionTech organization system types

export type OrganizationType =
  | "university"
  | "bootcamp"
  | "company"
  | "community"
  | "innovation_hub"
  | "training_center";

export type OrganizationMemberRole =
  | "owner"
  | "admin"
  | "mentor"
  | "member"
  | "student"
  | "recruiter";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  description: string;
  website?: string | null;
  created_at?: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationMemberRole;
  joined_at: string;
}

export interface OrganizationAnalytics {
  members: number;
  projects: number;
  completed_projects: number;
  learning_items: number;
  completed_learning_items: number;
  top_skills: string[];
}
