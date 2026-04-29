// ACL: VisionTech learning tracker types

export type LearningStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export interface LearningProgressItem {
  id: string;
  title: string;
  platform: string;
  resource_url: string;
  status: LearningStatus;
  progress_percent: number;
  created_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface LearningProgressResponse {
  items: LearningProgressItem[];
}

