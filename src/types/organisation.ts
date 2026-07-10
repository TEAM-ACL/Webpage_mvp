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
