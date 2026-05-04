// ACL: VisionTech admin API service

import type {
  AdminActivityResponse,
  AdminSummaryResponse,
  AdminSystemHealthResponse,
} from "../types/admin";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

async function adminRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Admin request failed (${path}): ${errorText}`);
  }

  return (await response.json()) as T;
}

export async function getAdminSummary(): Promise<AdminSummaryResponse> {
  return adminRequest<AdminSummaryResponse>("/admin/summary");
}

export async function getAdminActivity(): Promise<AdminActivityResponse> {
  return adminRequest<AdminActivityResponse>("/admin/activity");
}

export async function getAdminSystemHealth(): Promise<AdminSystemHealthResponse> {
  return adminRequest<AdminSystemHealthResponse>("/admin/system-health");
}
