import type {
  Organization,
  OrganizationAnalytics,
  OrganizationMember,
  OrganizationType,
} from "../types/organizations";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export async function createOrganization(payload: {
  name: string;
  type: OrganizationType;
  description: string;
  website?: string;
}): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/organizations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Organization creation failed: ${errorText}`);
  }
  return (await response.json()) as Organization;
}

export async function getOrganizations(): Promise<Organization[]> {
  const response = await fetch(`${API_BASE_URL}/organizations`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Organizations request failed: ${errorText}`);
  }
  const data = (await response.json()) as { items?: Organization[] } | Organization[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getOrganizationDetails(id: string): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Organization detail request failed: ${errorText}`);
  }
  return (await response.json()) as Organization;
}

export async function joinOrganization(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/organizations/${id}/join`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Join organization failed: ${errorText}`);
  }
}

export async function getOrganizationMembers(id: string): Promise<OrganizationMember[]> {
  const response = await fetch(`${API_BASE_URL}/organizations/${id}/members`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Organization members request failed: ${errorText}`);
  }
  const data = (await response.json()) as { items?: OrganizationMember[] } | OrganizationMember[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getOrganizationAnalytics(id: string): Promise<OrganizationAnalytics> {
  const response = await fetch(`${API_BASE_URL}/organizations/${id}/analytics`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Organization analytics request failed: ${errorText}`);
  }
  return (await response.json()) as OrganizationAnalytics;
}
