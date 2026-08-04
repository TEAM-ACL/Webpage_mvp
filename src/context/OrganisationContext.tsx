import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { buildOrganisationPath, normaliseNavigation, slugifyOrganisationName } from "../config/organisationTenant";
import { buildOrganisationThemeVariables } from "../lib/organisationTheme";
import { useAuth } from "./AuthContext";
import {
  buildFallbackActiveOrganisation,
  getActiveOrganisation,
} from "../services/organisation";
import type { ActiveOrganisation, OrganisationConfiguration } from "../types/organisation";

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
  applyOrganisationConfiguration: (configuration: OrganisationConfiguration) => void;
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
      setOrganisation((current) => preserveNewerConfiguration(current, resolvedOrganisation));
    } catch (loadError) {
      setOrganisation(null);
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
    () => buildOrganisationThemeVariables(currentOrganisation.branding),
    [currentOrganisation.branding],
  );

  const applyOrganisationConfiguration = useCallback(
    (configuration: OrganisationConfiguration) => {
      setOrganisation((current) => ({
        ...(current || currentOrganisation),
        branding: configuration.branding,
        settings: configuration.settings,
      }));
      setError(null);
    },
    [currentOrganisation],
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
      applyOrganisationConfiguration,
    }),
    [applyOrganisationConfiguration, currentOrganisation, error, isLoading, isModuleEnabled, navigationItems, refreshOrganisation],
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

function preserveNewerConfiguration(
  current: ActiveOrganisation | null,
  resolved: ActiveOrganisation,
): ActiveOrganisation {
  if (!current || current.id !== resolved.id) {
    return resolved;
  }
  if (current.settings.draftVersion <= resolved.settings.draftVersion) {
    return resolved;
  }
  return {
    ...resolved,
    branding: current.branding,
    settings: current.settings,
  };
}
