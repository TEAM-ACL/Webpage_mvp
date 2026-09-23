import type {
  Opportunity,
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
  generated_at: string;
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
    return getOrganisationOpportunityMatches(options.organisationId);
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

async function getOrganisationOpportunityMatches(organisationId: string): Promise<OpportunityMatchRun> {
  const cleanOrganisationId = organisationId.trim();
  const matchesResponse = await fetch(
    `${API_BASE_URL}/organisations/${encodeURIComponent(cleanOrganisationId)}/opportunity-matches`,
    {
      method: "GET",
      credentials: "include",
      headers: opportunityHeaders(),
    },
  );

  if (!matchesResponse.ok) {
    const errorText = await matchesResponse.text();
    throw new Error(`Organisation opportunity matches request failed: ${errorText}`);
  }

  const matches = (await matchesResponse.json()) as OrganisationOpportunityMatchResponse;

  return {
    match_run_id: `${matches.organisation_id}:${matches.user_id}:${matches.generated_at}`,
    generated_at: matches.generated_at,
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
        source_name: "Organisation opportunities",
        source_url: match.external_url ?? null,
        expires_at: match.closing_date ?? null,
        created_at: match.created_at ?? null,
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
