import { getAccessToken } from "../lib/api";
import type { OrganisationSummaryResponse } from "../types/organisation";

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
