// ACL: VisionTech project tracking API service

import type {
  ProjectStatus,
  UserProject,
  UserProjectsResponse,
} from "../types/projects";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export async function getUserProjects(): Promise<UserProjectsResponse> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Projects request failed: ${errorText}`);
  }

  const data: UserProjectsResponse = await response.json();
  return data;
}

export async function createUserProject(payload: {
  title: string;
  description: string;
  category: string;
  skills_used: string[];
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
}): Promise<UserProject> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      status: "idea",
      progress_percent: 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Project creation failed: ${errorText}`);
  }

  const data: UserProject = await response.json();
  return data;
}

export async function updateUserProject(
  id: string,
  payload: {
    status?: ProjectStatus;
    progress_percent?: number;
    github_url?: string;
    demo_url?: string;
    documentation_url?: string;
  },
): Promise<UserProject> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Project update failed: ${errorText}`);
  }

  const data: UserProject = await response.json();
  return data;
}

export async function deleteUserProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Project deletion failed: ${errorText}`);
  }
}

