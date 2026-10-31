export type DevelopmentStepStatus = "not_started" | "in_progress" | "completed" | "skipped";
export type DevelopmentPlanEvaluationStatus = "not_started" | "in_progress" | "needs_attention" | "ready_for_match_refresh";

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
  verification_status: "not_submitted" | "pending" | "verified" | "changes_requested";
  review_note: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  promoted_to_profile_by: string | null;
  promoted_to_profile_at: string | null;
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
  evaluation_status: DevelopmentPlanEvaluationStatus;
  evaluation_summary: string;
  evaluated_at: string;
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
