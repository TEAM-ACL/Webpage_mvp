// ACL: Service for sending onboarding data to backend AI endpoint

import type { OnboardingData, AIInsightResponse } from "../types/ai";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export async function generateAIInsight(
  payload?: OnboardingData
): Promise<AIInsightResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/profile`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${errorText}`);
  }

  const data: AIInsightResponse = await response.json();
  return data;
}
