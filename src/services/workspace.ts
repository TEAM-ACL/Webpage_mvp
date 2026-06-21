import type {
  WorkspaceActionResponse,
  WorkspaceFocusActionRequest,
  WorkspaceLearningActionRequest,
  WorkspaceStateResponse,
  WorkspaceTaskActionRequest,
} from "../types/workspace";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export async function getWorkspaceState(): Promise<WorkspaceStateResponse> {
  const response = await fetch(`${API_BASE_URL}/workspace/state`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
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
