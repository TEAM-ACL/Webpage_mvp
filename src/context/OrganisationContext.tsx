import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { buildOrganisationPath, normaliseNavigation, slugifyOrganisationName } from "../config/organisationTenant";
import { useAuth } from "./AuthContext";
import {
  buildFallbackActiveOrganisation,
  getActiveOrganisation,
} from "../services/organisation";
import type { ActiveOrganisation } from "../types/organisation";

type OrganisationContextValue = {
  organisation: ActiveOrganisation | null;
  isLoading: boolean;
  error: string | null;
  navigationItems: ReturnType<typeof normaliseNavigation>;
  organisationBasePath: string;
  activeSlug: string;
  getOrganisationPath: (path?: string) => string;
  isModuleEnabled: (key: string) => boolean;
  refreshOrganisation: () => Promise<void>;
};

const OrganisationContext = createContext<OrganisationContextValue | undefined>(undefined);

type OrganisationProviderProps = {
  children: ReactNode;
};

export function OrganisationProvider({ children }: OrganisationProviderProps): JSX.Element {
  const location = useLocation();
  const { profile, user } = useAuth();
  const routeSlug = getOrganisationSlugFromPath(location.pathname);
  const fallbackSlug = slugifyOrganisationName(profile?.organisationName);
  const activeSlug = routeSlug || fallbackSlug;
  const [organisation, setOrganisation] = useState<ActiveOrganisation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshOrganisation = useCallback(async () => {
    if (!user || !location.pathname.startsWith("/organisation")) {
      setOrganisation(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const resolvedOrganisation = await getActiveOrganisation(routeSlug);
      setOrganisation(resolvedOrganisation);
    } catch (loadError) {
      setOrganisation(
        buildFallbackActiveOrganisation({
          id: profile?.organisationId,
          name: profile?.organisationName,
          slug: activeSlug,
          role: profile?.role || user.role,
        }),
      );
      setError(loadError instanceof Error ? loadError.message : "Unable to load organisation configuration.");
    } finally {
      setIsLoading(false);
    }
  }, [
    activeSlug,
    location.pathname,
    profile?.organisationId,
    profile?.organisationName,
    profile?.role,
    routeSlug,
    user,
  ]);

  useEffect(() => {
    void refreshOrganisation();
  }, [refreshOrganisation]);

  const currentOrganisation =
    organisation ||
    buildFallbackActiveOrganisation({
      id: profile?.organisationId,
      name: profile?.organisationName,
      slug: activeSlug,
      role: profile?.role || user?.role,
    });

  const navigationItems = useMemo(
    () => normaliseNavigation(
      currentOrganisation.settings.navigationConfig,
      currentOrganisation.settings.featureFlags,
    ),
    [currentOrganisation.settings.featureFlags, currentOrganisation.settings.navigationConfig],
  );

  const isModuleEnabled = useCallback(
    (key: string) => key === "overview" || key === "settings" || currentOrganisation.settings.featureFlags[key] !== false,
    [currentOrganisation.settings.featureFlags],
  );

  const themeVariables = useMemo(
    () => {
      const branding = currentOrganisation.branding;
      const backgroundColour = branding.backgroundColour || "#f8fafc";
      const textColour = branding.textColour || readableTextColour(backgroundColour);
      const isDarkBrand = branding.themeMode === "dark" || isDarkColour(backgroundColour);

      return {
        "--organisation-primary": branding.primaryColour,
        "--organisation-secondary": branding.secondaryColour,
        "--organisation-accent": branding.accentColour,
        "--organisation-background": backgroundColour,
        "--organisation-text": textColour,
        "--organisation-on-primary": readableTextColour(branding.primaryColour),
        "--color-primary": branding.primaryColour,
        "--color-secondary": branding.secondaryColour,
        "--color-surface": backgroundColour,
        "--color-on-surface": textColour,
        "--color-on-surface-variant": isDarkBrand ? "rgba(248,250,252,0.78)" : "rgba(51,65,85,0.82)",
        "--color-surface-container-lowest": isDarkBrand ? "rgba(15,23,42,0.94)" : "rgba(255,255,255,0.94)",
        "--color-surface-container-low": isDarkBrand ? "rgba(30,41,59,0.82)" : "rgba(248,250,252,0.9)",
        "--color-surface-container-high": isDarkBrand ? "rgba(51,65,85,0.9)" : "rgba(241,245,249,0.95)",
        "--color-outline-variant": isDarkBrand ? "rgba(226,232,240,0.18)" : "rgba(148,163,184,0.28)",
      } as CSSProperties;
    },
    [currentOrganisation.branding],
  );

  const value = useMemo<OrganisationContextValue>(
    () => ({
      organisation: currentOrganisation,
      isLoading,
      error,
      navigationItems,
      organisationBasePath: buildOrganisationPath(currentOrganisation.slug),
      activeSlug: currentOrganisation.slug,
      getOrganisationPath: (path = "") => buildOrganisationPath(currentOrganisation.slug, path),
      isModuleEnabled,
      refreshOrganisation,
    }),
    [currentOrganisation, error, isLoading, isModuleEnabled, navigationItems, refreshOrganisation],
  );

  return (
    <OrganisationContext.Provider value={value}>
      <div style={themeVariables}>{children}</div>
    </OrganisationContext.Provider>
  );
}

export function useOrganisation(): OrganisationContextValue {
  const context = useContext(OrganisationContext);
  if (!context) {
    throw new Error("useOrganisation must be used within OrganisationProvider");
  }
  return context;
}

function getOrganisationSlugFromPath(pathname: string): string | null {
  const [, root, maybeSlug] = pathname.split("/");
  if (root !== "organisation") {
    return null;
  }

  if (!maybeSlug || isLegacyOrganisationSection(maybeSlug)) {
    return null;
  }

  return maybeSlug;
}

function isLegacyOrganisationSection(segment: string): boolean {
  return ["members", "cohorts", "interventions", "opportunities", "reports", "settings"].includes(segment);
}

function readableTextColour(backgroundColour: string): string {
  return isDarkColour(backgroundColour) ? "#ffffff" : "#0f172a";
}

function isDarkColour(colour: string): boolean {
  const hex = colour.trim().replace("#", "");
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hex)) {
    return false;
  }

  const normalized = hex.length === 3
    ? hex.split("").map((part) => `${part}${part}`).join("")
    : hex;
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance < 0.5;
}
