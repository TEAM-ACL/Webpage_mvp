import type { InstitutionalAIInsight } from "../types/organisation";

export const mockInstitutionalInsight: InstitutionalAIInsight = {
  id: "mock-insight-001",
  organisationId: "mock-organisation-001",
  summary:
    "Member engagement is stable, but practical project completion remains below the expected level. Most members are progressing through their pathways, although project evidence requires attention.",
  mainConcern:
    "Fourteen members have no completed practical project, reducing their opportunity readiness.",
  priority: "high",
  confidenceScore: 87,
  evidence: [
    {
      label: "Active members",
      value: "42 of 51",
      explanation: "Members active within the last 30 days.",
    },
    {
      label: "Project completion",
      value: "38%",
      explanation: "This is currently the weakest readiness area.",
    },
    {
      label: "Members needing support",
      value: "9",
      explanation: "Members with inactivity, overdue tasks, or low progress.",
    },
  ],
  recommendedActions: [
    {
      id: "mock-action-001",
      title: "Create a practical project cohort",
      description:
        "Group members who need project evidence into a four-week practical challenge.",
      actionType: "create_cohort",
      priority: "high",
    },
    {
      id: "mock-action-002",
      title: "Review members requiring support",
      description: "Review members with low activity or overdue tasks.",
      actionType: "review_members",
      priority: "high",
    },
    {
      id: "mock-action-003",
      title: "Share suitable opportunities",
      description:
        "Recommend opportunities to members whose readiness scores meet the eligibility criteria.",
      actionType: "share_opportunity",
      priority: "medium",
    },
  ],
  generatedAt: new Date().toISOString(),
};
