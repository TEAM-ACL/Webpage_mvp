// ACL: Service for fetching AI insight from persisted backend profile

import type { AIInsightResponse, AIRecommendationsResponse } from "../types/ai";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export async function generateAIInsight(): Promise<AIInsightResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/profile`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${errorText}`);
  }

  const data: AIInsightResponse = await response.json();
  return data;
}

// ACL: Service for fetching the latest saved AI insight from backend
export async function getLatestAIInsight(): Promise<AIInsightResponse | null> {
  const response = await fetch(`${API_BASE_URL}/ai/insight`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Latest AI insight request failed: ${errorText}`);
  }

  const data: AIInsightResponse = await response.json();
  return data;
}

// ACL: Service for fetching AI recommendations from backend
export async function getAIRecommendations(): Promise<AIRecommendationsResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI recommendations request failed: ${errorText}`);
  }

  const data: AIRecommendationsResponse = await response.json();
  return data;
}
