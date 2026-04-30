// ACL: VisionTech project tracking types

export type ProjectStatus =
  | "idea"
  | "planning"
  | "in_progress"
  | "completed"
  | "paused";

export interface UserProject {
  id: string;
  title: string;
  description: string;
  category: string;
  skills_used: string[];
  status: ProjectStatus;
  progress_percent: number;
  github_url?: string | null;
  demo_url?: string | null;
  documentation_url?: string | null;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

export interface UserProjectsResponse {
  items: UserProject[];
}

