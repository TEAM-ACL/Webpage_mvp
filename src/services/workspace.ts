import type {
  WorkspaceActionResponse,
  WorkspaceFocusActionRequest,
  WorkspaceLearningActionRequest,
  WorkspaceStateResponse,
  WorkspaceTaskActionRequest,
} from "../types/workspace";
import { getAccessToken } from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

function workspaceHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function getWorkspaceState(): Promise<WorkspaceStateResponse> {
  const response = await fetch(`${API_BASE_URL}/workspace/state`, {
    method: "GET",
    credentials: "include",
    headers: workspaceHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Workspace state request failed: ${errorText}`);
  }

  return (await response.json()) as WorkspaceStateResponse;
}

async function postWorkspaceAction<TPayload>(
  path: string,
  payload: TPayload,
): Promise<WorkspaceActionResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: workspaceHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Workspace action request failed: ${errorText}`);
  }

  return (await response.json()) as WorkspaceActionResponse;
}

export async function startWorkspaceFocus(
  payload: WorkspaceFocusActionRequest = { action: "start" },
): Promise<WorkspaceActionResponse> {
  return postWorkspaceAction("/workspace/focus/actions", payload);
}

export async function runWorkspaceTaskAction(
  taskId: string,
  payload: WorkspaceTaskActionRequest,
): Promise<WorkspaceActionResponse> {
  return postWorkspaceAction(
    `/workspace/tasks/${encodeURIComponent(taskId)}/actions`,
    payload,
  );
}

export async function runWorkspaceLearningAction(
  actionId: string,
  payload: WorkspaceLearningActionRequest,
): Promise<WorkspaceActionResponse> {
  return postWorkspaceAction(
    `/workspace/learning-actions/${encodeURIComponent(actionId)}/actions`,
    payload,
  );
}
