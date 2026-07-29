import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileText,
  LifeBuoy,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type OrganisationNavigationKey =
  | "overview"
  | "members"
  | "cohorts"
  | "interventions"
  | "opportunities"
  | "reports"
  | "settings";

export type OrganisationNavigationItem = {
  key: OrganisationNavigationKey;
  label: string;
  path: string;
  enabled: boolean;
  order: number;
  icon: LucideIcon;
};

export const DEFAULT_ORGANISATION_SLUG = "visiontech-demo";

export const DEFAULT_ORGANISATION_NAVIGATION: OrganisationNavigationItem[] = [
  { key: "overview", label: "Overview", path: "", enabled: true, order: 1, icon: BarChart3 },
  { key: "members", label: "Members", path: "members", enabled: true, order: 2, icon: Users },
  { key: "cohorts", label: "Cohorts", path: "cohorts", enabled: true, order: 3, icon: Building2 },
  { key: "interventions", label: "Interventions", path: "interventions", enabled: true, order: 4, icon: LifeBuoy },
  { key: "opportunities", label: "Opportunities", path: "opportunities", enabled: true, order: 5, icon: BriefcaseBusiness },
  { key: "reports", label: "Reports", path: "reports", enabled: true, order: 6, icon: FileText },
  { key: "settings", label: "Settings", path: "settings", enabled: true, order: 7, icon: Settings },
];

export function slugifyOrganisationName(name: string | null | undefined): string {
  const slug = (name || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || DEFAULT_ORGANISATION_SLUG;
}

export function buildOrganisationPath(slug: string, path = ""): string {
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `/organisation/${slug}/${cleanPath}` : `/organisation/${slug}`;
}

export function normaliseNavigation(
  configuredItems?: Partial<Omit<OrganisationNavigationItem, "icon">>[],
  featureFlags: Record<string, boolean> = {},
): OrganisationNavigationItem[] {
  const configuredByKey = new Map(
    (configuredItems || []).map((item) => [item.key, item]),
  );
  const alwaysVisibleKeys = new Set<OrganisationNavigationKey>(["overview", "settings"]);

  return DEFAULT_ORGANISATION_NAVIGATION.map((defaultItem) => {
    const configuredItem = configuredByKey.get(defaultItem.key);
    const isEnabledByConfig = configuredItem?.enabled ?? defaultItem.enabled;
    const isEnabledByFeatureFlag = alwaysVisibleKeys.has(defaultItem.key) || featureFlags[defaultItem.key] !== false;
    return {
      ...defaultItem,
      label: configuredItem?.label || defaultItem.label,
      path: configuredItem?.path ?? defaultItem.path,
      enabled: isEnabledByConfig && isEnabledByFeatureFlag,
      order: configuredItem?.order ?? defaultItem.order,
    };
  })
    .filter((item) => item.enabled)
    .sort((left, right) => left.order - right.order);
}
