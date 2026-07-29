import { getAccessToken } from "../lib/api";
import type {
  AssignMemberToCohortRequest,
  CreateMemberInterventionRequest,
  InstitutionalAIInsightResponse,
  ActiveOrganisation,
  InviteOrganisationMemberRequest,
  OrganisationMember,
  OrganisationOverviewResponse,
  OrganisationSummaryResponse,
} from "../types/organisation";
import { mockInstitutionalInsight } from "../data/mockInstitutionalInsight";
import { DEFAULT_ORGANISATION_SLUG, slugifyOrganisationName } from "../config/organisationTenant";

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

const defaultBranding = {
  primaryColour: "#1f0954",
  secondaryColour: "#2563eb",
  accentColour: "#7c3aed",
  backgroundColour: "#ffffff",
  textColour: "#111827",
  fontFamily: "Inter",
  borderRadius: "medium" as const,
  themeMode: "light" as const,
};

const defaultSettings = {
  navigationConfig: [],
  homepageConfig: [],
  featureFlags: {
    cohorts: true,
    interventions: true,
    opportunities: true,
    reports: true,
    settings: true,
  },
  terminologyConfig: {},
};

type ActiveOrganisationBackendResponse = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  organisation_type?: string | null;
  description?: string | null;
  website_url?: string | null;
  status?: "active" | "paused" | "archived" | null;
  role?: ActiveOrganisation["role"] | null;
  branding?: Partial<{
    logo_url: string | null;
    favicon_url: string | null;
    primary_colour: string;
    secondary_colour: string;
    accent_colour: string;
    background_colour: string;
    text_colour: string;
    font_family: string;
    border_radius: ActiveOrganisation["branding"]["borderRadius"];
    theme_mode: ActiveOrganisation["branding"]["themeMode"];
    login_banner_url: string | null;
    dashboard_banner_url: string | null;
  }> | null;
  settings?: Partial<{
    welcome_heading: string | null;
    welcome_message: string | null;
    navigation_config: ActiveOrganisation["settings"]["navigationConfig"];
    homepage_config: ActiveOrganisation["settings"]["homepageConfig"];
    feature_flags: Record<string, boolean>;
    terminology_config: Record<string, string>;
  }> | null;
};

function mapActiveOrganisation(data: ActiveOrganisationBackendResponse): ActiveOrganisation {
  const name = data.name || "VisionTech Demo Organisation";
  return {
    id: data.id || "mock-organisation-001",
    name,
    slug: data.slug || slugifyOrganisationName(name),
    organisationType: data.organisation_type || "Training Provider",
    description: data.description || null,
    websiteUrl: data.website_url || null,
    status: data.status || "active",
    role: data.role || "organisation_admin",
    branding: {
      logoUrl: data.branding?.logo_url ?? null,
      faviconUrl: data.branding?.favicon_url ?? null,
      primaryColour: data.branding?.primary_colour || defaultBranding.primaryColour,
      secondaryColour: data.branding?.secondary_colour || defaultBranding.secondaryColour,
      accentColour: data.branding?.accent_colour || defaultBranding.accentColour,
      backgroundColour: data.branding?.background_colour || defaultBranding.backgroundColour,
      textColour: data.branding?.text_colour || defaultBranding.textColour,
      fontFamily: data.branding?.font_family || defaultBranding.fontFamily,
      borderRadius: data.branding?.border_radius || defaultBranding.borderRadius,
      themeMode: data.branding?.theme_mode || defaultBranding.themeMode,
      loginBannerUrl: data.branding?.login_banner_url ?? null,
      dashboardBannerUrl: data.branding?.dashboard_banner_url ?? null,
    },
    settings: {
      welcomeHeading: data.settings?.welcome_heading ?? null,
      welcomeMessage: data.settings?.welcome_message ?? null,
      navigationConfig: data.settings?.navigation_config || defaultSettings.navigationConfig,
      homepageConfig: data.settings?.homepage_config || defaultSettings.homepageConfig,
      featureFlags: data.settings?.feature_flags || defaultSettings.featureFlags,
      terminologyConfig: data.settings?.terminology_config || defaultSettings.terminologyConfig,
    },
  };
}

export function buildFallbackActiveOrganisation(input?: {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  organisationType?: string | null;
  role?: string | null;
}): ActiveOrganisation {
  const name = input?.name || "VisionTech Demo Organisation";
  return mapActiveOrganisation({
    id: input?.id || "mock-organisation-001",
    name,
    slug: input?.slug || slugifyOrganisationName(name) || DEFAULT_ORGANISATION_SLUG,
    organisation_type: input?.organisationType || "Training Provider",
    role: input?.role as ActiveOrganisation["role"],
  });
}

export async function getActiveOrganisation(slug?: string | null): Promise<ActiveOrganisation> {
  const endpoint = slug ? `/organisations/slug/${encodeURIComponent(slug)}` : "/organisations/current";
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to resolve active organisation.");
  }

  return mapActiveOrganisation((await response.json()) as ActiveOrganisationBackendResponse);
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

export async function getInstitutionalAIInsight(): Promise<InstitutionalAIInsightResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/organisations/current/ai-insight`, {
      method: "GET",
      credentials: "include",
      headers: organisationHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Unable to load institutional AI insight");
    }

    return (await response.json()) as InstitutionalAIInsightResponse;
  } catch (error) {
    if (error instanceof TypeError) {
      return { insight: mockInstitutionalInsight };
    }
    throw error;
  }
}

export async function refreshInstitutionalAIInsight(): Promise<InstitutionalAIInsightResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/organisations/current/ai-insight/refresh`, {
      method: "POST",
      credentials: "include",
      headers: organisationHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Unable to refresh institutional AI insight");
    }

    return (await response.json()) as InstitutionalAIInsightResponse;
  } catch (error) {
    if (error instanceof TypeError) {
      return {
        insight: {
          ...mockInstitutionalInsight,
          id: `mock-insight-${Date.now()}`,
          generatedAt: new Date().toISOString(),
        },
      };
    }
    throw error;
  }
}
