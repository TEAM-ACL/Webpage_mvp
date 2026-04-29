// ACL: learning progress API service

import type {
  LearningProgressItem,
  LearningProgressResponse,
  LearningStatus,
} from "../types/learning";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export async function getLearningProgress(): Promise<LearningProgressResponse> {
  const response = await fetch(`${API_BASE_URL}/learning-progress`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Learning progress request failed: ${errorText}`);
  }

  const data: LearningProgressResponse = await response.json();
  return data;
}

export async function createLearningProgress(payload: {
  title: string;
  platform: string;
  resource_url: string;
}): Promise<LearningProgressItem> {
  const response = await fetch(`${API_BASE_URL}/learning-progress`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      status: "not_started",
      progress_percent: 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Learning progress creation failed: ${errorText}`);
  }

  const data: LearningProgressItem = await response.json();
  return data;
}

export async function updateLearningProgress(
  id: string,
  payload: {
    status?: LearningStatus;
    progress_percent?: number;
  },
): Promise<LearningProgressItem> {
  const response = await fetch(`${API_BASE_URL}/learning-progress/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Learning progress update failed: ${errorText}`);
  }

  const data: LearningProgressItem = await response.json();
  return data;
}

