import type { OrganisationMember } from "../types/organisation";

export type OrganisationOverviewMetrics = {
  totalMembers: number;
  activeMembers: number;
  activeCohorts: number;
  averageReadiness: number;
  openInterventions: number;
  activeOpportunities: number;
};

export type OrganisationHealthMetric = {
  label: string;
  value: number;
  tone: "indigo" | "emerald" | "amber" | "sky" | "rose";
};

export type OrganisationPriorityAction = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  actionType: "review_members" | "create_intervention" | "create_cohort" | "review_opportunities";
  affectedCount?: number;
  recommendedResponse: string;
};

export type OrganisationCohortPerformance = {
  id: string;
  name: string;
  memberCount: number;
  averageReadiness: number;
  pathwayCompletion: number;
  needSupport: number;
  status: "Active" | "Planning" | "Completed";
};

export type OrganisationOpportunityActivity = {
  id: string;
  title: string;
  closingLabel: string;
  strongMatches: number;
  expressionsOfInterest: number;
};

export const mockOrganisationMetrics: OrganisationOverviewMetrics = {
  totalMembers: 52,
  activeMembers: 42,
  activeCohorts: 4,
  averageReadiness: 68,
  openInterventions: 9,
  activeOpportunities: 6,
};

export const mockOrganisationHealth: OrganisationHealthMetric[] = [
  { label: "Engagement", value: 82, tone: "indigo" },
  { label: "Readiness", value: 68, tone: "emerald" },
  { label: "Pathway Progress", value: 72, tone: "sky" },
  { label: "Project Evidence", value: 49, tone: "amber" },
  { label: "Opportunity Engagement", value: 63, tone: "rose" },
];

export const mockPriorityActions: OrganisationPriorityAction[] = [
  {
    id: "priority-support",
    title: "Review people needing support",
    description: "Several members show inactivity, overdue actions, or low readiness scores.",
    priority: "high",
    actionType: "review_members",
    affectedCount: 9,
    recommendedResponse: "Create targeted intervention",
  },
  {
    id: "priority-projects",
    title: "Project evidence is below target",
    description: "Engagement is healthy, but practical evidence is not keeping pace.",
    priority: "medium",
    actionType: "create_cohort",
    affectedCount: 18,
    recommendedResponse: "Create project cohort",
  },
  {
    id: "priority-opportunities",
    title: "Opportunities need attention",
    description: "Some opportunities are close to expiry and should be reviewed for matches.",
    priority: "medium",
    actionType: "review_opportunities",
    affectedCount: 3,
    recommendedResponse: "Review opportunities",
  },
];

export const mockCohortPerformance: OrganisationCohortPerformance[] = [
  {
    id: "cohort-cloud",
    name: "Cloud Career Transition",
    memberCount: 24,
    averageReadiness: 68,
    pathwayCompletion: 54,
    needSupport: 5,
    status: "Active",
  },
  {
    id: "cohort-data",
    name: "Data Employability Sprint",
    memberCount: 16,
    averageReadiness: 74,
    pathwayCompletion: 62,
    needSupport: 2,
    status: "Active",
  },
  {
    id: "cohort-foundation",
    name: "Digital Skills Foundation",
    memberCount: 12,
    averageReadiness: 59,
    pathwayCompletion: 47,
    needSupport: 4,
    status: "Planning",
  },
];

export const mockSupportMembers: OrganisationMember[] = [
  {
    id: "support-1",
    fullName: "Sarah James",
    email: "sarah.james@example.com",
    goal: "Cloud Support Engineer",
    cohortName: "Cloud Career Transition",
    readinessScore: 42,
    pathwayProgress: 31,
    lastActiveAt: "2026-07-02T11:00:00Z",
    status: "inactive",
    needsSupport: true,
    openInterventions: ["No activity for 16 days"],
    overdueTasks: 4,
  },
  {
    id: "support-2",
    fullName: "Jayden Smith",
    email: "jayden.smith@example.com",
    goal: "Junior Data Analyst",
    cohortName: "Data Employability Sprint",
    readinessScore: 48,
    pathwayProgress: 36,
    lastActiveAt: "2026-07-08T09:30:00Z",
    status: "active",
    needsSupport: true,
    openInterventions: ["Low project evidence"],
    overdueTasks: 2,
  },
  {
    id: "support-3",
    fullName: "Lewis Carter",
    email: "lewis.carter@example.com",
    goal: "Software Project Portfolio",
    cohortName: null,
    readinessScore: 24,
    pathwayProgress: 12,
    lastActiveAt: null,
    status: "invited",
    needsSupport: true,
    openInterventions: ["Incomplete onboarding"],
    overdueTasks: 0,
  },
];

export const mockOpportunityActivity: OrganisationOpportunityActivity[] = [
  {
    id: "opp-cloud",
    title: "Junior Cloud Internship",
    closingLabel: "Closing in 4 days",
    strongMatches: 12,
    expressionsOfInterest: 7,
  },
  {
    id: "opp-data",
    title: "Data Portfolio Challenge",
    closingLabel: "Closing in 9 days",
    strongMatches: 18,
    expressionsOfInterest: 11,
  },
];

export const mockRecentActivity = [
  {
    id: "activity-1",
    title: "Member joined cohort",
    description: "Priya Nair joined Data Employability Sprint.",
    createdAt: "2026-07-18T09:30:00Z",
  },
  {
    id: "activity-2",
    title: "Intervention created",
    description: "Support review opened for Sarah James.",
    createdAt: "2026-07-17T15:15:00Z",
  },
  {
    id: "activity-3",
    title: "Opportunity published",
    description: "Junior Cloud Internship was added to active opportunities.",
    createdAt: "2026-07-16T12:10:00Z",
  },
];
