export type OrganisationSummaryMetric = {
  label: string;
  value: string;
  note: string;
};

export type OrganisationMemberProgress = {
  id: string;
  name: string;
  goal: string;
  pathwayStage: string;
  readinessScore: number;
  lastActivity: string;
  status: "On track" | "Needs support" | "Inactive" | "Incomplete onboarding";
};

export type OrganisationCohort = {
  id: string;
  name: string;
  members: number;
  averageCompletion: number;
  averageReadiness: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Planning" | "Completed";
};

export type OrganisationSupportSignal = {
  id: string;
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
};

export type OrganisationActivityItem = {
  id: string;
  label: string;
  detail: string;
  time: string;
};

export interface OrganisationSummary {
  organisationId: string;
  organisationName: string;
  organisationType: string | null;
  totalMembers: number;
  activeMembers: number;
  activeCohorts: number;
  averageReadiness: number;
  membersNeedingSupport: number;
}

export interface OrganisationActivity {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface OrganisationOverviewResponse {
  summary: OrganisationSummary;
  recentActivity: OrganisationActivity[];
}

export type OrganisationResponse = {
  id: string;
  name: string;
  organisation_type: string | null;
  description: string | null;
  logo_url: string | null;
  status: "active" | "paused" | "archived";
  created_at?: string | null;
  updated_at?: string | null;
};

export type OrganisationMemberOverview = {
  user_id: string;
  name: string;
  email: string;
  goal: string | null;
  cohort: string | null;
  readiness_score: number;
  progress_percent: number;
  last_active_at: string | null;
  status: "on_track" | "needs_support" | "inactive" | "incomplete_onboarding";
};

export type OrganisationCohortOverview = {
  cohort_id: string;
  name: string;
  member_count: number;
  average_completion: number;
  average_readiness: number;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "planning" | "completed" | "archived";
};

export type OrganisationBackendActivityItem = {
  activity_id: string;
  label: string;
  detail: string;
  occurred_at: string;
};

export type OrganisationInsightResponse = {
  title: string;
  message: string;
  source: "derived" | "placeholder";
};

export type OrganisationSummaryResponse = {
  organisation: OrganisationResponse;
  total_members: number;
  active_members: number;
  active_cohorts: number;
  average_readiness: number;
  pathway_completion: number;
  members_needing_support: number;
  members: OrganisationMemberOverview[];
  cohorts: OrganisationCohortOverview[];
  recent_activity: OrganisationBackendActivityItem[];
  common_skill_gaps: string[];
  insight: OrganisationInsightResponse;
};
