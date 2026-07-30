import type {
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

export async function sendCollaborationRequest(payload: {
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

export async function getIncomingCollaborationRequests(): Promise<CollaborationRequestListResponse> {
  const response = await fetch(`${API_BASE_URL}/collaboration/incoming`, {
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

export async function getOutgoingCollaborationRequests(): Promise<CollaborationRequestListResponse> {
  const response = await fetch(`${API_BASE_URL}/collaboration/outgoing`, {
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
  const response = await fetch(`${API_BASE_URL}/collaboration/request/${requestId}`, {
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
