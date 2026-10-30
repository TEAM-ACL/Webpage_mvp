export type DevelopmentStepStatus = "not_started" | "in_progress" | "completed" | "skipped";

export type DevelopmentResource = {
  id: string;
  title: string;
  provider: string;
  url: string;
  resource_type: "tutorial" | "learning_path" | "certification";
  skills_covered: string[];
  level: string;
  prerequisites: string[];
  duration_minutes: number | null;
  cost_note: string | null;
  source_checked_on: string;
};

export type DevelopmentStep = {
  id: string;
  title: string;
  gap: string;
  kind: "external_learning" | "project" | "mentor_review";
  rationale: string;
  resource: DevelopmentResource | null;
  status: DevelopmentStepStatus;
  evidence: string;
  completed_at: string | null;
};

export type DevelopmentPlan = {
  id: string;
  organisation_id: string;
  user_id: string;
  opportunity_id: string;
  goal: string;
  gaps: string[];
  steps: DevelopmentStep[];
  archived_steps: DevelopmentStep[];
  version: number;
  needs_review: boolean;
  review_reasons: string[];
  completed_steps: number;
  skipped_steps: number;
  progress_percent: number;
  next_step_id: string | null;
  created_at: string;
  updated_at: string;
};
