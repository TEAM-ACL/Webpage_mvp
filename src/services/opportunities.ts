import type { Opportunity, OpportunityStatus, OpportunityType } from "../types/opportunities";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

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
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Opportunities request failed: ${errorText}`);
  }
  const data = (await response.json()) as { items?: Opportunity[] } | Opportunity[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getRecommendedOpportunities(): Promise<Opportunity[]> {
  const response = await fetch(`${API_BASE_URL}/opportunities/recommended`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Recommended opportunities request failed: ${errorText}`);
  }
  const data = (await response.json()) as { items?: Opportunity[] } | Opportunity[];
  return Array.isArray(data) ? data : (data.items ?? []);
}
