import type { WorkspaceStateResponse } from "../types/workspace";

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
