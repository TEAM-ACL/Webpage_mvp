import type { SkillEvidence, VerifiedSkill } from "../types/verifiedSkills";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export async function getVerifiedSkills(): Promise<VerifiedSkill[]> {
  const response = await fetch(`${API_BASE_URL}/verified-skills`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Verified skills request failed: ${errorText}`);
  }
  const data = (await response.json()) as { items?: VerifiedSkill[] } | VerifiedSkill[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function refreshVerifiedSkills(): Promise<VerifiedSkill[]> {
  const response = await fetch(`${API_BASE_URL}/verified-skills/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Verified skills refresh failed: ${errorText}`);
  }
  const data = (await response.json()) as { items?: VerifiedSkill[] } | VerifiedSkill[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getSkillEvidence(verifiedSkillId: string): Promise<SkillEvidence[]> {
  const response = await fetch(`${API_BASE_URL}/verified-skills/${verifiedSkillId}/evidence`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Verified skill evidence request failed: ${errorText}`);
  }
  const data = (await response.json()) as { items?: SkillEvidence[] } | SkillEvidence[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

