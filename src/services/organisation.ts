import { getAccessToken } from "../lib/api";
import type {
  AssignMemberToCohortRequest,
  CreateMemberInterventionRequest,
  CreateOrganisationCohortRequest,
  InstitutionalAIInsightResponse,
  ActiveOrganisation,
  InviteOrganisationMemberRequest,
  OrganisationBranding,
  OrganisationBrandingUpdate,
  OrganisationConfiguration,
  OrganisationCohortOverview,
  OrganisationMember,
  OrganisationMemberInterventionRecord,
  OrganisationMemberOpportunityRecommendationRecord,
  OrganisationOverviewResponse,
  OrganisationReportResponse,
  PublicOrganisationProfile,
  OrganisationSettings,
  OrganisationSettingsUpdate,
  OrganisationSummaryResponse,
} from "../types/organisation";
import { mockInstitutionalInsight } from "../data/mockInstitutionalInsight";
import { FALLBACK_ORGANISATION_SLUG, slugifyOrganisationName } from "../config/organisationTenant";
import {
  FALLBACK_ORGANISATION_ID,
  requireResolvedOrganisationId,
} from "../lib/organisationIdentity";

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
    members: true,
    cohorts: true,
    interventions: true,
    opportunities: true,
    reports: true,
    settings: true,
  },
  terminologyConfig: {},
  configurationStatus: "published" as const,
  publishedAt: null,
  publishedBy: null,
  draftVersion: 0,
  publishedVersion: null,
  updatedAt: null,
  updatedBy: null,
};

type ActiveOrganisationBackendResponse = {
  id: string;
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
    configuration_status: ActiveOrganisation["settings"]["configurationStatus"];
    draft_version: number;
    published_version: number | null;
    published_at: string | null;
    published_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
  }> | null;
};

type OrganisationBrandingBackendResponse = NonNullable<ActiveOrganisationBackendResponse["branding"]>;
type OrganisationSettingsBackendResponse = NonNullable<ActiveOrganisationBackendResponse["settings"]>;

type OrganisationConfigurationBackendResponse = {
  branding: OrganisationBrandingBackendResponse;
  settings: OrganisationSettingsBackendResponse;
};

type PublicOrganisationBackendResponse = {
  id: string;
  name: string;
  slug: string;
  organisation_type: string | null;
  description: string | null;
  logo_url: string | null;
  branding?: OrganisationBrandingBackendResponse | null;
  settings?: OrganisationSettingsBackendResponse | null;
};

function mapActiveOrganisation(data: ActiveOrganisationBackendResponse): ActiveOrganisation {
  const name = data.name || "Organisation";
  return {
    id: requireResolvedOrganisationId(data.id),
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
    settings: mapOrganisationSettings(data.settings),
  };
}

function mapOrganisationBranding(data: OrganisationBrandingBackendResponse | null | undefined): OrganisationBranding {
  return {
    logoUrl: data?.logo_url ?? null,
    faviconUrl: data?.favicon_url ?? null,
    primaryColour: data?.primary_colour || defaultBranding.primaryColour,
    secondaryColour: data?.secondary_colour || defaultBranding.secondaryColour,
    accentColour: data?.accent_colour || defaultBranding.accentColour,
    backgroundColour: data?.background_colour || defaultBranding.backgroundColour,
    textColour: data?.text_colour || defaultBranding.textColour,
    fontFamily: data?.font_family || defaultBranding.fontFamily,
    borderRadius: data?.border_radius || defaultBranding.borderRadius,
    themeMode: data?.theme_mode || defaultBranding.themeMode,
    loginBannerUrl: data?.login_banner_url ?? null,
    dashboardBannerUrl: data?.dashboard_banner_url ?? null,
  };
}

function mapOrganisationSettings(data: OrganisationSettingsBackendResponse | null | undefined): OrganisationSettings {
  return {
    welcomeHeading: data?.welcome_heading ?? null,
    welcomeMessage: data?.welcome_message ?? null,
    navigationConfig: data?.navigation_config || defaultSettings.navigationConfig,
    homepageConfig: data?.homepage_config || defaultSettings.homepageConfig,
    featureFlags: data?.feature_flags || defaultSettings.featureFlags,
    terminologyConfig: data?.terminology_config || defaultSettings.terminologyConfig,
    configurationStatus: data?.configuration_status || defaultSettings.configurationStatus,
    draftVersion: data?.draft_version ?? defaultSettings.draftVersion,
    publishedVersion: data?.published_version ?? defaultSettings.publishedVersion,
    publishedAt: data?.published_at ?? null,
    publishedBy: data?.published_by ?? null,
    updatedAt: data?.updated_at ?? null,
    updatedBy: data?.updated_by ?? null,
  };
}

export function buildFallbackActiveOrganisation(input?: {
  name?: string | null;
  slug?: string | null;
  organisationType?: string | null;
  role?: string | null;
}): ActiveOrganisation {
  const name = input?.name || "Organisation";
  return {
    id: FALLBACK_ORGANISATION_ID,
    name,
    slug: input?.slug || slugifyOrganisationName(name) || FALLBACK_ORGANISATION_SLUG,
    organisationType: input?.organisationType || "Training Provider",
    description: null,
    websiteUrl: null,
    status: "active",
    role: (input?.role as ActiveOrganisation["role"]) || "organisation_admin",
    branding: {
      logoUrl: null,
      faviconUrl: null,
      ...defaultBranding,
      loginBannerUrl: null,
      dashboardBannerUrl: null,
    },
    settings: {
      ...defaultSettings,
      navigationConfig: [],
      homepageConfig: [],
      featureFlags: { ...defaultSettings.featureFlags },
      terminologyConfig: {},
    },
  };
}

export async function getActiveOrganisation(slug?: string | null): Promise<ActiveOrganisation> {
  const endpoint = slug ? `/organisations/slug/${encodeURIComponent(slug)}` : "/organisations/current";
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to resolve active organisation."));
  }

  return mapActiveOrganisation((await response.json()) as ActiveOrganisationBackendResponse);
}

export async function getPublicOrganisationProfile(slug: string): Promise<PublicOrganisationProfile> {
  const response = await fetch(`${API_BASE_URL}/organisations/public/${encodeURIComponent(slug)}`, {
    method: "GET",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to load organisation profile.");
  }

  const data = (await response.json()) as PublicOrganisationBackendResponse;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    organisationType: data.organisation_type,
    description: data.description,
    logoUrl: data.logo_url,
    branding: mapOrganisationBranding(data.branding),
    settings: mapOrganisationSettings(data.settings),
  };
}

function organisationDataEndpoint(path: string, organisationId?: string | null): string {
  const cleanPath = path.replace(/^\/+/, "");
  const cleanOrganisationId = organisationId?.trim();
  if (!cleanOrganisationId) {
    return `/organisations/current/${cleanPath}`;
  }
  return `/organisations/${encodeURIComponent(cleanOrganisationId)}/${cleanPath}`;
}

export async function getOrganisationSummary(organisationId?: string | null): Promise<OrganisationSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("summary", organisationId)}`, {
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

export async function getOrganisationOverview(organisationId?: string | null): Promise<OrganisationOverviewResponse> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("overview", organisationId)}`, {
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

export async function saveOrganisationConfiguration(
  organisationId: string,
  configuration: OrganisationConfiguration,
): Promise<OrganisationConfiguration> {
  return requestOrganisationConfiguration(
    organisationId,
    "PATCH",
    "/configuration",
    configurationPayload(configuration),
  );
}

export async function publishOrganisationConfiguration(
  organisationId: string,
  configuration: OrganisationConfiguration,
): Promise<OrganisationConfiguration> {
  return requestOrganisationConfiguration(
    organisationId,
    "POST",
    "/configuration/publish",
    configurationPayload(configuration),
  );
}

export async function restorePublishedOrganisationConfiguration(
  organisationId: string,
  expectedVersion: number,
): Promise<OrganisationConfiguration> {
  return requestOrganisationConfiguration(
    organisationId,
    "POST",
    "/configuration/restore",
    { expected_version: expectedVersion },
  );
}

async function requestOrganisationConfiguration(
  organisationId: string,
  method: "PATCH" | "POST",
  path: string,
  body: Record<string, unknown>,
): Promise<OrganisationConfiguration> {
  const resolvedOrganisationId = requireResolvedOrganisationId(organisationId);
  const response = await fetch(
    `${API_BASE_URL}/organisations/${encodeURIComponent(resolvedOrganisationId)}${path}`,
    {
      method,
      credentials: "include",
      headers: organisationHeaders(),
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to update organisation configuration."));
  }

  const data = (await response.json()) as OrganisationConfigurationBackendResponse;
  return {
    branding: mapOrganisationBranding(data.branding),
    settings: mapOrganisationSettings(data.settings),
  };
}

function configurationPayload(configuration: OrganisationConfiguration): Record<string, unknown> {
  const { branding, settings } = configuration;
  return {
    expected_version: settings.draftVersion,
    branding: {
      logo_url: branding.logoUrl,
      favicon_url: branding.faviconUrl,
      primary_colour: branding.primaryColour,
      secondary_colour: branding.secondaryColour,
      accent_colour: branding.accentColour,
      background_colour: branding.backgroundColour,
      text_colour: branding.textColour,
      font_family: branding.fontFamily,
      border_radius: branding.borderRadius,
      theme_mode: branding.themeMode,
      login_banner_url: branding.loginBannerUrl,
      dashboard_banner_url: branding.dashboardBannerUrl,
    },
    settings: {
      welcome_heading: settings.welcomeHeading,
      welcome_message: settings.welcomeMessage,
      navigation_config: settings.navigationConfig,
      homepage_config: settings.homepageConfig,
      feature_flags: settings.featureFlags,
      terminology_config: settings.terminologyConfig,
    },
  };
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  if (!text) return fallback;
  try {
    const payload = JSON.parse(text) as {
      detail?: string;
      message?: string;
      error?: { message?: string };
    };
    return payload.error?.message || payload.detail || payload.message || fallback;
  } catch {
    return text;
  }
}

export async function updateOrganisationBranding(
  organisationId: string,
  payload: OrganisationBrandingUpdate,
): Promise<OrganisationBranding> {
  const response = await fetch(`${API_BASE_URL}/organisations/${encodeURIComponent(organisationId)}/branding`, {
    method: "PATCH",
    credentials: "include",
    headers: organisationHeaders(),
    body: JSON.stringify({
      logo_url: payload.logoUrl,
      favicon_url: payload.faviconUrl,
      primary_colour: payload.primaryColour,
      secondary_colour: payload.secondaryColour,
      accent_colour: payload.accentColour,
      background_colour: payload.backgroundColour,
      text_colour: payload.textColour,
      font_family: payload.fontFamily,
      border_radius: payload.borderRadius,
      theme_mode: payload.themeMode,
      login_banner_url: payload.loginBannerUrl,
      dashboard_banner_url: payload.dashboardBannerUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to update organisation branding.");
  }

  return mapOrganisationBranding((await response.json()) as OrganisationBrandingBackendResponse);
}

export async function updateOrganisationSettings(
  organisationId: string,
  payload: OrganisationSettingsUpdate,
): Promise<OrganisationSettings> {
  const response = await fetch(`${API_BASE_URL}/organisations/${encodeURIComponent(organisationId)}/settings`, {
    method: "PATCH",
    credentials: "include",
    headers: organisationHeaders(),
    body: JSON.stringify({
      welcome_heading: payload.welcomeHeading,
      welcome_message: payload.welcomeMessage,
      navigation_config: payload.navigationConfig,
      homepage_config: payload.homepageConfig,
      feature_flags: payload.featureFlags,
      terminology_config: payload.terminologyConfig,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to update organisation settings.");
  }

  return mapOrganisationSettings((await response.json()) as OrganisationSettingsBackendResponse);
}

export async function publishOrganisationSettings(organisationId: string): Promise<OrganisationSettings> {
  const response = await fetch(`${API_BASE_URL}/organisations/${encodeURIComponent(organisationId)}/settings/publish`, {
    method: "POST",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to publish organisation settings.");
  }

  return mapOrganisationSettings((await response.json()) as OrganisationSettingsBackendResponse);
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
  membership_status?: "active" | "invited" | "suspended" | "removed" | null;
}): OrganisationMember {
  const status = member.membership_status === "invited"
    ? "invited"
    : member.status === "inactive"
      ? "inactive"
      : member.membership_status === "suspended"
        ? "suspended"
        : "active";

  return {
    id: member.user_id,
    fullName: member.name,
    email: member.email,
    goal: member.goal,
    cohortName: member.cohort,
    readinessScore: member.readiness_score,
    pathwayProgress: member.progress_percent,
    lastActiveAt: member.last_active_at,
    status,
    needsSupport: status === "active" && member.status !== "on_track",
    currentPathway: member.cohort || "Individual pathway",
    skillGaps: member.status === "on_track" ? ["Project evidence"] : ["Readiness support", "Project evidence"],
    activeProjects: member.progress_percent > 0 ? ["Workspace project evidence"] : [],
    overdueTasks: member.status === "inactive" ? 3 : 0,
    recentActivity: member.last_active_at ? ["Recent pathway activity"] : ["No recent activity"],
    assignedOpportunities: [],
    openInterventions: member.status === "needs_support" ? ["Needs support"] : [],
  };
}

export async function getOrganisationMembers(organisationId?: string | null): Promise<OrganisationMember[]> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("members", organisationId)}`, {
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
  organisationId: string,
  payload: InviteOrganisationMemberRequest,
): Promise<OrganisationMember> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("members", organisationId)}`, {
    method: "POST",
    credentials: "include",
    headers: organisationHeaders(),
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      goal: payload.goal,
      cohort_name: payload.cohortName,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to invite organisation member.");
  }

  return mapBackendMember((await response.json()) as Parameters<typeof mapBackendMember>[0]);
}

export async function updateOrganisationMember(
  memberId: string,
  updates: Partial<OrganisationMember>,
): Promise<{ memberId: string; updates: Partial<OrganisationMember> }> {
  return { memberId, updates };
}

export async function getOrganisationCohorts(organisationId: string): Promise<OrganisationCohortOverview[]> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("cohorts", organisationId)}`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to load organisation cohorts.");
  }

  const body = (await response.json()) as { items?: OrganisationCohortOverview[] };
  return body.items ?? [];
}

export async function createOrganisationCohort(
  organisationId: string,
  payload: CreateOrganisationCohortRequest,
): Promise<OrganisationCohortOverview> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("cohorts", organisationId)}`, {
    method: "POST",
    credentials: "include",
    headers: organisationHeaders(),
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: payload.status ?? "active",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to create organisation cohort.");
  }

  return (await response.json()) as OrganisationCohortOverview;
}

export async function recommendMemberOpportunity(
  organisationId: string,
  memberId: string,
  payload: { title: string; note?: string | null },
): Promise<{ id: string; title: string; status: string }> {
  const response = await fetch(
    `${API_BASE_URL}${organisationDataEndpoint(`members/${encodeURIComponent(memberId)}/opportunity-recommendations`, organisationId)}`,
    {
      method: "POST",
      credentials: "include",
      headers: organisationHeaders(),
      body: JSON.stringify({
        title: payload.title,
        note: payload.note,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to recommend opportunity.");
  }

  return (await response.json()) as { id: string; title: string; status: string };
}

export async function assignMemberToCohort(
  organisationId: string,
  memberId: string,
  payload: AssignMemberToCohortRequest,
): Promise<OrganisationMember> {
  const response = await fetch(
    `${API_BASE_URL}${organisationDataEndpoint(`members/${encodeURIComponent(memberId)}/cohort`, organisationId)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: organisationHeaders(),
      body: JSON.stringify({
        cohort_name: payload.cohortName,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to assign member to cohort.");
  }

  return mapBackendMember((await response.json()) as Parameters<typeof mapBackendMember>[0]);
}

export async function createMemberIntervention(
  organisationId: string,
  memberId: string,
  payload: CreateMemberInterventionRequest,
): Promise<{ memberId: string; interventionId: string; recommendedAction: string }> {
  const response = await fetch(
    `${API_BASE_URL}${organisationDataEndpoint(`members/${encodeURIComponent(memberId)}/interventions`, organisationId)}`,
    {
      method: "POST",
      credentials: "include",
      headers: organisationHeaders(),
      body: JSON.stringify({
        type: payload.type,
        reason: payload.reason,
        recommended_action: payload.recommendedAction,
        risk_level: payload.riskLevel,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to create member intervention.");
  }

  const data = (await response.json()) as { id: string; recommended_action: string };
  return {
    memberId,
    interventionId: data.id,
    recommendedAction: data.recommended_action,
  };
}

export async function getOrganisationMemberInterventions(
  organisationId: string,
): Promise<OrganisationMemberInterventionRecord[]> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("interventions", organisationId)}`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to load member interventions.");
  }

  const body = (await response.json()) as { items?: OrganisationMemberInterventionRecord[] };
  return body.items ?? [];
}

export async function getOrganisationOpportunityRecommendations(
  organisationId: string,
): Promise<OrganisationMemberOpportunityRecommendationRecord[]> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("opportunity-recommendations", organisationId)}`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to load opportunity recommendations.");
  }

  const body = (await response.json()) as { items?: OrganisationMemberOpportunityRecommendationRecord[] };
  return body.items ?? [];
}

export async function getOrganisationReportSummary(
  organisationId: string,
): Promise<OrganisationReportResponse> {
  const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("reports/summary", organisationId)}`, {
    method: "GET",
    credentials: "include",
    headers: organisationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to load organisation report.");
  }

  return (await response.json()) as OrganisationReportResponse;
}

export async function getInstitutionalAIInsight(organisationId?: string | null): Promise<InstitutionalAIInsightResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("ai-insight", organisationId)}`, {
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

export async function refreshInstitutionalAIInsight(organisationId?: string | null): Promise<InstitutionalAIInsightResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${organisationDataEndpoint("ai-insight/refresh", organisationId)}`, {
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
