import { getAccessToken } from "../lib/api";
import { tenantAwareHeaders } from "../lib/tenantRequest";
import type { DevelopmentPlan, DevelopmentStepStatus } from "../types/developmentPlan";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function headers(): Record<string, string> {
  const result = tenantAwareHeaders({ "Content-Type": "application/json" });
  const token = getAccessToken();
  if (token) result.Authorization = `Bearer ${token}`;
  return result;
}

function endpoint(organisationId: string, opportunityId: string): string {
  return `${API_BASE_URL}/organisations/${encodeURIComponent(organisationId)}/opportunities/${encodeURIComponent(opportunityId)}/development-plan`;
}

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(payload?.detail || "Unable to update the development plan.");
  }
  return await response.json() as T;
}

export async function generateDevelopmentPlan(
  organisationId: string,
  opportunityId: string,
  options: { regenerate?: boolean; expectedVersion?: number } = {},
): Promise<DevelopmentPlan> {
  return read(await fetch(endpoint(organisationId, opportunityId), {
    method: "POST",
    credentials: "include",
    headers: headers(),
    body: JSON.stringify({
      regenerate: options.regenerate ?? false,
      expected_version: options.expectedVersion,
    }),
  }));
}

export async function updateDevelopmentStep(
  organisationId: string,
  opportunityId: string,
  stepId: string,
  payload: { expectedVersion: number; status: DevelopmentStepStatus; evidence: string },
): Promise<DevelopmentPlan> {
  return read(await fetch(`${endpoint(organisationId, opportunityId)}/steps/${encodeURIComponent(stepId)}`, {
    method: "PATCH",
    credentials: "include",
    headers: headers(),
    body: JSON.stringify({
      expected_version: payload.expectedVersion,
      status: payload.status,
      evidence: payload.evidence,
    }),
  }));
}
