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

export type MemberStatus = "active" | "inactive" | "invited" | "suspended";

export interface OrganisationMember {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  goal?: string | null;
  cohortName?: string | null;
  readinessScore: number;
  pathwayProgress: number;
  lastActiveAt?: string | null;
  status: MemberStatus;
  needsSupport: boolean;
  currentPathway?: string | null;
  skillGaps?: string[];
  activeProjects?: string[];
  overdueTasks?: number;
  recentActivity?: string[];
  assignedOpportunities?: string[];
  openInterventions?: string[];
}

export interface InviteOrganisationMemberRequest {
  fullName: string;
  email: string;
  cohortName?: string | null;
  goal?: string | null;
}

export interface AssignMemberToCohortRequest {
  cohortName: string;
}

export interface CreateMemberInterventionRequest {
  type: "inactive_member" | "low_readiness" | "incomplete_onboarding" | "overdue_tasks" | "no_active_project" | "low_pathway_progress" | "no_opportunity_engagement";
  reason: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
}

export type InsightPriority = "low" | "medium" | "high" | "critical";

export interface InstitutionalInsightEvidence {
  label: string;
  value: string;
  explanation?: string | null;
}

export interface InstitutionalRecommendedAction {
  id: string;
  title: string;
  description: string;
  actionType:
    | "create_cohort"
    | "create_intervention"
    | "assign_project"
    | "share_resource"
    | "share_opportunity"
    | "review_members";
  priority: InsightPriority;
}

export interface InstitutionalAIInsight {
  id: string;
  organisationId: string;
  summary: string;
  mainConcern: string | null;
  priority: InsightPriority;
  confidenceScore: number;
  evidence: InstitutionalInsightEvidence[];
  recommendedActions: InstitutionalRecommendedAction[];
  generatedAt: string;
}

export interface InstitutionalAIInsightResponse {
  insight: InstitutionalAIInsight;
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

export type OrganisationMembershipRole =
  | "owner"
  | "organisation_admin"
  | "admin"
  | "department_manager"
  | "content_editor"
  | "mentor"
  | "analyst"
  | "member";

export type OrganisationBranding = {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColour: string;
  secondaryColour: string;
  accentColour: string;
  backgroundColour: string;
  textColour: string;
  fontFamily: string;
  borderRadius: "small" | "medium" | "large" | "rounded";
  themeMode: "light" | "dark" | "system";
  loginBannerUrl?: string | null;
  dashboardBannerUrl?: string | null;
};

export type OrganisationBrandingUpdate = Partial<OrganisationBranding>;

export type OrganisationNavigationConfigItem = {
  key: "overview" | "members" | "cohorts" | "interventions" | "opportunities" | "reports" | "settings";
  label: string;
  path: string;
  enabled: boolean;
  order: number;
};

export type OrganisationHomepageSection = {
  id: string;
  type:
    | "metrics"
    | "ai_insight"
    | "ai_assistant"
    | "health_priority"
    | "cohorts_support"
    | "opportunities_activity";
  enabled: boolean;
  position: number;
  heading?: string | null;
  description?: string | null;
  config?: Record<string, unknown>;
};

export type OrganisationSettings = {
  welcomeHeading?: string | null;
  welcomeMessage?: string | null;
  navigationConfig: OrganisationNavigationConfigItem[];
  homepageConfig: OrganisationHomepageSection[];
  featureFlags: Record<string, boolean>;
  terminologyConfig: Record<string, string>;
  configurationStatus: "draft" | "published" | "archived";
  draftVersion: number;
  publishedVersion?: number | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
};

export type OrganisationSettingsUpdate = Partial<
  Pick<
    OrganisationSettings,
    "welcomeHeading" | "welcomeMessage" | "navigationConfig" | "homepageConfig" | "featureFlags" | "terminologyConfig"
  >
>;

export type OrganisationConfiguration = {
  branding: OrganisationBranding;
  settings: OrganisationSettings;
};

export type ActiveOrganisation = {
  id: string;
  name: string;
  slug: string;
  organisationType: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  status: "active" | "paused" | "archived";
  role: OrganisationMembershipRole;
  branding: OrganisationBranding;
  settings: OrganisationSettings;
};

export type PublicOrganisationProfile = {
  id: string;
  name: string;
  slug: string;
  organisationType: string | null;
  description: string | null;
  logoUrl: string | null;
  branding: OrganisationBranding;
  settings: OrganisationSettings;
};
