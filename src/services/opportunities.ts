import type {
  Opportunity,
  OpportunityApplicationStage,
  OpportunityMatchRefreshPayload,
  OpportunityMatchRun,
  OpportunityStatus,
  OpportunityType,
} from "../types/opportunities";
import { tenantAwareHeaders } from "../lib/tenantRequest";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const opportunityHeaders = () => tenantAwareHeaders({ "Content-Type": "application/json" });

type OpportunityMatchRequestOptions = {
  organisationId?: string | null;
};

type OrganisationOpportunityMatchResponse = {
  organisation_id: string;
  user_id: string;
  generated_at: string | null;
  match_run_id?: string | null;
  status?: "empty" | "ready" | "stale";
  stale_reasons?: string[];
  profile_version?: string | null;
  policy_name: string;
  policy_version: string;
  items: Array<{
    opportunity_id: string;
    title: string;
    description?: string | null;
    required_skills?: string[];
    opportunity_type?: OpportunityType | null;
    status?: OpportunityStatus | null;
    closing_date?: string | null;
    external_url?: string | null;
    source_name?: string;
    source_checked_at?: string | null;
    source_freshness?: "current" | "stale" | "unverified";
    source_age_days?: number | null;
    created_at?: string | null;
    match_score: number;
    matched_strengths: string[];
    missing_requirements: string[];
    improvement_actions: string[];
    explanation_factors: Array<{
      signal: string;
      label: string;
      value: unknown;
      weight: number;
    }>;
    engagement_state?: "saved" | "dismissed" | null;
    engagement_updated_at?: string | null;
    application_stage?: OpportunityApplicationStage | null;
    application_note?: string;
    application_updated_at?: string | null;
  }>;
};

export async function createOpportunity(payload: {
  organization_id?: string;
  title: string;
  description: string;
  required_skills: string[];
  opportunity_type: OpportunityType;
  status: OpportunityStatus;
}): Promise<Opportunity> {
  const response = await fetch(`${API_BASE_URL}/opportunities`, {
    method: "POST",
    credentials: "include",
    headers: opportunityHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Opportunity creation failed: ${errorText}`);
  }
  return (await response.json()) as Opportunity;
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const response = await fetch(`${API_BASE_URL}/opportunities`, {
    method: "GET",
    credentials: "include",
    headers: opportunityHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Opportunities request failed: ${errorText}`);
  }
  const data = (await response.json()) as { items?: Opportunity[] } | Opportunity[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getRecommendedOpportunities(): Promise<Opportunity[]> {
  const matchRun = await getOpportunityMatches();
  return matchRun.items;
}

export async function getOpportunityMatches(
  options: OpportunityMatchRequestOptions = {},
): Promise<OpportunityMatchRun> {
  if (options.organisationId) {
    return getOrganisationOpportunityMatches(options.organisationId);
  }

  const response = await fetch(`${API_BASE_URL}/opportunities/recommended`, {
    method: "GET",
    credentials: "include",
    headers: opportunityHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Recommended opportunities request failed: ${errorText}`);
  }
  const data = (await response.json()) as OpportunityMatchRun | { items?: Opportunity[] } | Opportunity[];
  if (Array.isArray(data)) {
    return { items: data };
  }
  return {
    ...data,
    items: data.items ?? [],
  };
}

export async function generateOpportunityMatches(
  payload: OpportunityMatchRefreshPayload = { force_refresh: true },
  options: OpportunityMatchRequestOptions = {},
): Promise<OpportunityMatchRun> {
  if (options.organisationId) {
    return getOrganisationOpportunityMatches(options.organisationId, payload);
  }

  const response = await fetch(`${API_BASE_URL}/opportunities/recommended`, {
    method: "POST",
    credentials: "include",
    headers: opportunityHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Opportunity matching refresh failed: ${errorText}`);
  }
  const data = (await response.json()) as OpportunityMatchRun | { items?: Opportunity[] } | Opportunity[];
  if (Array.isArray(data)) {
    return { items: data };
  }
  return {
    ...data,
    items: data.items ?? [],
  };
}

async function getOrganisationOpportunityMatches(
  organisationId: string,
  refresh?: OpportunityMatchRefreshPayload,
): Promise<OpportunityMatchRun> {
  const cleanOrganisationId = organisationId.trim();
  const matchesResponse = await fetch(
    `${API_BASE_URL}/organisations/${encodeURIComponent(cleanOrganisationId)}/opportunity-matches`,
    {
      method: refresh ? "POST" : "GET",
      credentials: "include",
      headers: opportunityHeaders(),
      ...(refresh ? { body: JSON.stringify({ force_refresh: refresh.force_refresh ?? false }) } : {}),
    },
  );

  if (!matchesResponse.ok) {
    const errorText = await matchesResponse.text();
    throw new Error(`Organisation opportunity matches request failed: ${errorText}`);
  }

  const matches = (await matchesResponse.json()) as OrganisationOpportunityMatchResponse;
  return normaliseOrganisationMatches(matches);
}

export async function setOpportunityEngagement(
  organisationId: string,
  opportunityId: string,
  state: "saved" | "dismissed" | null,
): Promise<OpportunityMatchRun> {
  const response = await fetch(
    `${API_BASE_URL}/organisations/${encodeURIComponent(organisationId.trim())}/opportunity-matches/${encodeURIComponent(opportunityId)}/engagement`,
    {
      method: "PUT",
      credentials: "include",
      headers: opportunityHeaders(),
      body: JSON.stringify({ state }),
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Opportunity engagement update failed: ${errorText}`);
  }
  return normaliseOrganisationMatches(
    (await response.json()) as OrganisationOpportunityMatchResponse,
  );
}

export async function setOpportunityApplication(
  organisationId: string,
  opportunityId: string,
  stage: OpportunityApplicationStage | null,
  note = "",
): Promise<OpportunityMatchRun> {
  const response = await fetch(
    `${API_BASE_URL}/organisations/${encodeURIComponent(organisationId.trim())}/opportunity-matches/${encodeURIComponent(opportunityId)}/application`,
    {
      method: "PUT",
      credentials: "include",
      headers: opportunityHeaders(),
      body: JSON.stringify({ stage, note }),
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Opportunity application update failed: ${errorText}`);
  }
  return normaliseOrganisationMatches(
    (await response.json()) as OrganisationOpportunityMatchResponse,
  );
}

function normaliseOrganisationMatches(matches: OrganisationOpportunityMatchResponse): OpportunityMatchRun {
  return {
    match_run_id: matches.match_run_id ?? (matches.generated_at
      ? `${matches.organisation_id}:${matches.user_id}:${matches.generated_at}` : undefined),
    generated_at: matches.generated_at ?? undefined,
    profile_version: matches.profile_version,
    status: matches.status,
    stale_reasons: matches.stale_reasons,
    items: matches.items.map((match) => {
      return {
        id: match.opportunity_id,
        organization_id: matches.organisation_id,
        title: match.title,
        description: match.description ?? "",
        required_skills: match.required_skills ?? [],
        opportunity_type: match.opportunity_type ?? "project",
        status: match.status ?? "open",
        match_score: match.match_score,
        confidence: match.match_score >= 80 ? "high" : match.match_score >= 55 ? "medium" : "low",
        reason: match.matched_strengths[0] ?? "Matched from your profile and this organisation's opportunity data.",
        matched_strengths: match.matched_strengths,
        missing_requirements: match.missing_requirements,
        recommended_actions: match.improvement_actions,
        match_factors: match.explanation_factors.map((factor) => ({
          label: factor.label,
          score: factor.weight,
          evidence: formatOpportunityMatchFactorEvidence(factor.value),
          weight: factor.weight,
        })),
        source_name: match.source_name ?? "Organisation supplied",
        source_url: match.external_url ?? null,
        last_checked_at: match.source_checked_at ?? null,
        source_freshness: match.source_freshness ?? "unverified",
        source_age_days: match.source_age_days ?? null,
        expires_at: match.closing_date ?? null,
        created_at: match.created_at ?? null,
        engagement_state: match.engagement_state ?? null,
        engagement_updated_at: match.engagement_updated_at ?? null,
        application_stage: match.application_stage ?? null,
        application_note: match.application_note ?? "",
        application_updated_at: match.application_updated_at ?? null,
      };
    }),
  };
}

function formatOpportunityMatchFactorEvidence(value: unknown): string | null {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
}
