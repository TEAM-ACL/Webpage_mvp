export type OrganisationHomepageWidgetType =
  | "metrics"
  | "ai_insight"
  | "ai_assistant"
  | "health_priority"
  | "cohorts_support"
  | "opportunities_activity";

export type OrganisationHomepageWidgetDefinition = {
  id: string;
  type: OrganisationHomepageWidgetType;
  label: string;
  description: string;
  enabled: boolean;
  position: number;
};

export const APPROVED_ORGANISATION_HOMEPAGE_WIDGETS: OrganisationHomepageWidgetDefinition[] = [
  {
    id: "metrics",
    type: "metrics",
    label: "Organisation Summary",
    description: "Top-level participation, readiness, cohort, support, and opportunity metrics.",
    enabled: true,
    position: 1,
  },
  {
    id: "ai-insight",
    type: "ai_insight",
    label: "AI Insight",
    description: "Latest institutional AI summary, evidence, and recommended actions.",
    enabled: true,
    position: 2,
  },
  {
    id: "ai-assistant",
    type: "ai_assistant",
    label: "AI Command Assistant",
    description: "Prompt-driven administrator guidance for the active organisation.",
    enabled: true,
    position: 3,
  },
  {
    id: "health-priority",
    type: "health_priority",
    label: "Health & Priorities",
    description: "Organisation health indicators and priority administrator actions.",
    enabled: true,
    position: 4,
  },
  {
    id: "cohorts-support",
    type: "cohorts_support",
    label: "Cohorts & Support",
    description: "Cohort performance and members requiring support.",
    enabled: true,
    position: 5,
  },
  {
    id: "opportunities-activity",
    type: "opportunities_activity",
    label: "Opportunities & Activity",
    description: "Opportunity signals and recent organisation activity.",
    enabled: true,
    position: 6,
  },
];

export const approvedOrganisationHomepageWidgetTypes = new Set(
  APPROVED_ORGANISATION_HOMEPAGE_WIDGETS.map((widget) => widget.type),
);
