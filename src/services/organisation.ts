import { getAccessToken } from "../lib/api";
import type {
  AssignMemberToCohortRequest,
  CreateMemberInterventionRequest,
  InviteOrganisationMemberRequest,
  OrganisationMember,
  OrganisationOverviewResponse,
  OrganisationSummaryResponse,
} from "../types/organisation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

function organisationHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function getOrganisationSummary(): Promise<OrganisationSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/organisations/current/summary`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Organisation summary request failed: ${errorText}`);
  }

  return (await response.json()) as OrganisationSummaryResponse;
}

export async function getOrganisationOverview(): Promise<OrganisationOverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/organisations/current/overview`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to load organisation information");
  }

  return (await response.json()) as OrganisationOverviewResponse;
}

const mockMembers: OrganisationMember[] = [
  {
    id: "member-1",
    fullName: "Sarah James",
    email: "sarah.james@example.com",
    goal: "Cloud Support Engineer",
    cohortName: "Cloud Career Cohort",
    readinessScore: 68,
    pathwayProgress: 45,
    lastActiveAt: "2026-07-09T10:00:00Z",
    status: "active",
    needsSupport: false,
    currentPathway: "Cloud support readiness",
    skillGaps: ["Troubleshooting notes", "Interview confidence"],
    activeProjects: ["Cloud support portfolio"],
    overdueTasks: 1,
    recentActivity: ["Completed onboarding", "Started workspace project"],
    assignedOpportunities: ["Junior Cloud Support Sprint"],
    openInterventions: [],
  },
  {
    id: "member-2",
    fullName: "Jayden Smith",
    email: "jayden.smith@example.com",
    goal: "Digital Skills Bootcamp",
    cohortName: "Digital Skills Bootcamp",
    readinessScore: 42,
    pathwayProgress: 31,
    lastActiveAt: "2026-06-25T14:30:00Z",
    status: "inactive",
    needsSupport: true,
    currentPathway: "Digital workplace foundation",
    skillGaps: ["Workspace consistency", "Project evidence"],
    activeProjects: [],
    overdueTasks: 4,
    recentActivity: ["Missed two workspace tasks"],
    assignedOpportunities: [],
    openInterventions: ["No activity for 16 days"],
  },
  {
    id: "member-3",
    fullName: "Priya Nair",
    email: "priya.nair@example.com",
    goal: "Graduate Employability",
    cohortName: "Graduate Employability Cohort",
    readinessScore: 81,
    pathwayProgress: 76,
    lastActiveAt: "2026-07-10T09:15:00Z",
    status: "active",
    needsSupport: false,
    currentPathway: "Interview and opportunity readiness",
    skillGaps: ["Advanced portfolio evidence"],
    activeProjects: ["Graduate evidence portfolio"],
    overdueTasks: 0,
    recentActivity: ["Completed interview readiness stage"],
    assignedOpportunities: ["Graduate mentorship circle"],
    openInterventions: [],
  },
  {
    id: "member-4",
    fullName: "Lewis Carter",
    email: "lewis.carter@example.com",
    goal: "Software Project Portfolio",
    cohortName: null,
    readinessScore: 24,
    pathwayProgress: 12,
    lastActiveAt: null,
    status: "invited",
    needsSupport: true,
    currentPathway: "Onboarding",
    skillGaps: ["Complete profile", "Choose career goal"],
    activeProjects: [],
    overdueTasks: 0,
    recentActivity: ["Invitation sent"],
    assignedOpportunities: [],
    openInterventions: ["Incomplete onboarding"],
  },
];

function mapBackendMember(member: {
  user_id: string;
  name: string;
  email: string;
  goal: string | null;
  cohort: string | null;
  readiness_score: number;
  progress_percent: number;
  last_active_at: string | null;
  status: "on_track" | "needs_support" | "inactive" | "incomplete_onboarding";
}): OrganisationMember {
  return {
    id: member.user_id,
    fullName: member.name,
    email: member.email,
    goal: member.goal,
    cohortName: member.cohort,
    readinessScore: member.readiness_score,
    pathwayProgress: member.progress_percent,
    lastActiveAt: member.last_active_at,
    status: member.status === "inactive" ? "inactive" : "active",
    needsSupport: member.status !== "on_track",
    currentPathway: member.cohort || "Individual pathway",
    skillGaps: member.status === "on_track" ? ["Project evidence"] : ["Readiness support", "Project evidence"],
    activeProjects: member.progress_percent > 0 ? ["Workspace project evidence"] : [],
    overdueTasks: member.status === "inactive" ? 3 : 0,
    recentActivity: member.last_active_at ? ["Recent pathway activity"] : ["No recent activity"],
    assignedOpportunities: [],
    openInterventions: member.status === "needs_support" ? ["Needs support"] : [],
  };
}

export async function getOrganisationMembers(): Promise<OrganisationMember[]> {
  const response = await fetch(`${API_BASE_URL}/organisations/current/members`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    return mockMembers;
  }

  const body = (await response.json()) as { items?: Array<Parameters<typeof mapBackendMember>[0]> };
  return body.items?.map(mapBackendMember) ?? mockMembers;
}

export async function getOrganisationMemberById(memberId: string): Promise<OrganisationMember | null> {
  const members = await getOrganisationMembers();
  return members.find((member) => member.id === memberId) ?? null;
}

export async function inviteOrganisationMember(
  payload: InviteOrganisationMemberRequest,
): Promise<OrganisationMember> {
  return {
    id: `invited-${Date.now()}`,
    fullName: payload.fullName,
    email: payload.email,
    goal: payload.goal,
    cohortName: payload.cohortName,
    readinessScore: 0,
    pathwayProgress: 0,
    lastActiveAt: null,
    status: "invited",
    needsSupport: false,
    currentPathway: "Invitation pending",
    skillGaps: [],
    activeProjects: [],
    overdueTasks: 0,
    recentActivity: ["Invitation created"],
    assignedOpportunities: [],
    openInterventions: [],
  };
}

export async function updateOrganisationMember(
  memberId: string,
  updates: Partial<OrganisationMember>,
): Promise<{ memberId: string; updates: Partial<OrganisationMember> }> {
  return { memberId, updates };
}

export async function assignMemberToCohort(
  memberId: string,
  payload: AssignMemberToCohortRequest,
): Promise<{ memberId: string; cohortName: string }> {
  return { memberId, cohortName: payload.cohortName };
}

export async function createMemberIntervention(
  memberId: string,
  payload: CreateMemberInterventionRequest,
): Promise<{ memberId: string; interventionId: string; recommendedAction: string }> {
  return {
    memberId,
    interventionId: `intervention-${Date.now()}`,
    recommendedAction: payload.recommendedAction,
  };
}
