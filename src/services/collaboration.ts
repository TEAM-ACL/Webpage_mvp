import type {
  CollaborationConnectionListResponse,
  CollaborationRequestItem,
  CollaborationRequestListResponse,
  CollaborationRequestStatus,
} from "../types/collaboration";
import { tenantAwareHeaders } from "../lib/tenantRequest";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const collaborationHeaders = () => tenantAwareHeaders({ "Content-Type": "application/json" });

export async function getCollaborationConnections(
  organisationId: string,
): Promise<CollaborationConnectionListResponse> {
  const query = new URLSearchParams({ organisation_id: organisationId });
  const response = await fetch(`${API_BASE_URL}/collaboration/connections?${query}`, {
    method: "GET",
    credentials: "include",
    headers: collaborationHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Collaboration connections failed: ${errorText}`);
  }
  return (await response.json()) as CollaborationConnectionListResponse;
}

export async function sendCollaborationRequest(payload: {
  organisation_id: string;
  project_id: string;
  target_user_id: string;
  message: string;
}): Promise<CollaborationRequestItem> {
  const response = await fetch(`${API_BASE_URL}/collaboration/request`, {
    method: "POST",
    credentials: "include",
    headers: collaborationHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Collaboration request failed: ${errorText}`);
  }

  return (await response.json()) as CollaborationRequestItem;
}

export async function getIncomingCollaborationRequests(
  organisationId: string,
): Promise<CollaborationRequestListResponse> {
  const query = new URLSearchParams({ organisation_id: organisationId });
  const response = await fetch(`${API_BASE_URL}/collaboration/incoming?${query}`, {
    method: "GET",
    credentials: "include",
    headers: collaborationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Incoming collaboration requests failed: ${errorText}`);
  }

  return (await response.json()) as CollaborationRequestListResponse;
}

export async function getOutgoingCollaborationRequests(
  organisationId: string,
): Promise<CollaborationRequestListResponse> {
  const query = new URLSearchParams({ organisation_id: organisationId });
  const response = await fetch(`${API_BASE_URL}/collaboration/outgoing?${query}`, {
    method: "GET",
    credentials: "include",
    headers: collaborationHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Outgoing collaboration requests failed: ${errorText}`);
  }

  return (await response.json()) as CollaborationRequestListResponse;
}

export async function respondToCollaborationRequest(
  requestId: string,
  status: CollaborationRequestStatus,
): Promise<CollaborationRequestItem> {
  const response = await fetch(`${API_BASE_URL}/collaboration/request/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    credentials: "include",
    headers: collaborationHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Collaboration response update failed: ${errorText}`);
  }

  return (await response.json()) as CollaborationRequestItem;
}
