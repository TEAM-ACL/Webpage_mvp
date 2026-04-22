// ACL: Service for fetching AI insight from persisted backend profile

import type {
  AIGenerationReadinessResponse,
  AIRecommendationEventType,
  AIRecommendationEventsResponse,
  AIStateResponse,
  AIInsightResponse,
  AIRecommendationsResponse,
  AIMatchesResponse,
} from "../types/ai";

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
    body: JSON.stringify({ force_refresh: true }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${errorText}`);
  }

  const data: AIInsightResponse = await response.json();
  return data;
}

export async function getAIState(): Promise<AIStateResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/state`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI state request failed: ${errorText}`);
  }

  const data: AIStateResponse = await response.json();
  return data;
}

export async function getAIGenerationReadiness(): Promise<AIGenerationReadinessResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/readiness`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI readiness request failed: ${errorText}`);
  }

  const data: AIGenerationReadinessResponse = await response.json();
  return data;
}

// ACL: Service for fetching the latest saved AI insight from backend
export async function getLatestAIInsight(): Promise<AIInsightResponse | null> {
  const response = await fetch(`${API_BASE_URL}/ai/profile`, {
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

export async function generateAIRecommendations(): Promise<AIRecommendationsResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ force_refresh: true }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI recommendations generation failed: ${errorText}`);
  }

  const data: AIRecommendationsResponse = await response.json();
  return data;
}

// ACL: Service for fetching backend-driven matches
export async function getAIMatches(): Promise<AIMatchesResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/match`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI matches request failed: ${errorText}`);
  }

  const data: AIMatchesResponse = await response.json();
  return data;
}

export async function getAIRecommendationEvents(
  recommendationId: string,
): Promise<AIRecommendationEventsResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/recommendations/${recommendationId}/events`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI recommendation events request failed: ${errorText}`);
  }

  const data: AIRecommendationEventsResponse = await response.json();
  return data;
}

export async function recordAIRecommendationEvent(payload: {
  recommendation_id: string;
  pathway_id: string;
  event_type: AIRecommendationEventType;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ai/recommendations/events`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      metadata: payload.metadata ?? { surface: "dashboard" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI recommendation event record failed: ${errorText}`);
  }
}
