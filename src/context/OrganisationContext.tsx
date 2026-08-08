import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { buildOrganisationPath, normaliseNavigation, slugifyOrganisationName } from "../config/organisationTenant";
import { buildOrganisationThemeVariables } from "../lib/organisationTheme";
import { createOrganisationAccessState } from "../lib/organisationIdentity";
import { useAuth } from "./AuthContext";
import {
  buildFallbackActiveOrganisation,
  getActiveOrganisation,
} from "../services/organisation";
import type { ActiveOrganisation, OrganisationConfiguration } from "../types/organisation";

type OrganisationContextValue = {
  /** The organisation verified by the API for the current route. Never contains fallback data. */
  organisation: ActiveOrganisation | null;
  /** Read-only organisation data used to keep the application shell stable while resolving. */
  displayOrganisation: ActiveOrganisation;
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
  const isOrganisationRoute = location.pathname.startsWith("/organisation");
  const tenantLookupKey = routeSlug ? `slug:${routeSlug}` : "current";
  const [resolution, setResolution] = useState<{
    lookupKey: string | null;
    organisation: ActiveOrganisation | null;
  }>({ lookupKey: null, organisation: null });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<{
    lookupKey: string | null;
    message: string | null;
  }>({ lookupKey: null, message: null });
  const requestSequence = useRef(0);

  const resolvedOrganisation =
    resolution.lookupKey === tenantLookupKey ? resolution.organisation : null;
  const error = loadError.lookupKey === tenantLookupKey ? loadError.message : null;

  const refreshOrganisation = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (!user || !isOrganisationRoute) {
      setResolution({ lookupKey: null, organisation: null });
      setLoadError({ lookupKey: null, message: null });
      setIsLoading(false);
      return;
    }

    setResolution((current) => ({
      lookupKey: tenantLookupKey,
      organisation: current.lookupKey === tenantLookupKey ? current.organisation : null,
    }));
    setIsLoading(true);
    setLoadError({ lookupKey: tenantLookupKey, message: null });

    try {
      const resolvedOrganisation = await getActiveOrganisation(routeSlug);
      if (requestId !== requestSequence.current) return;
      setResolution((current) => ({
        lookupKey: tenantLookupKey,
        organisation: preserveNewerConfiguration(
          current.lookupKey === tenantLookupKey ? current.organisation : null,
          resolvedOrganisation,
        ),
      }));
    } catch (loadError) {
      if (requestId !== requestSequence.current) return;
      setLoadError({
        lookupKey: tenantLookupKey,
        message: loadError instanceof Error
          ? loadError.message
          : "Unable to load organisation configuration.",
      });
    } finally {
      if (requestId === requestSequence.current) {
        setIsLoading(false);
      }
    }
  }, [
    isOrganisationRoute,
    routeSlug,
    tenantLookupKey,
    user,
  ]);

  useEffect(() => {
    void refreshOrganisation();
  }, [refreshOrganisation]);

  const fallbackOrganisation = useMemo(
    () => buildFallbackActiveOrganisation({
      name: profile?.organisationName,
      slug: activeSlug,
      role: profile?.role || user?.role,
    }),
    [activeSlug, profile?.organisationName, profile?.role, user?.role],
  );
  const { organisation, displayOrganisation } = createOrganisationAccessState(
    resolvedOrganisation,
    fallbackOrganisation,
  );
  const organisationIsLoading =
    isLoading || (Boolean(user) && isOrganisationRoute && resolution.lookupKey !== tenantLookupKey);

  const navigationItems = useMemo(
    () => normaliseNavigation(
      displayOrganisation.settings.navigationConfig,
      displayOrganisation.settings.featureFlags,
    ),
    [displayOrganisation.settings.featureFlags, displayOrganisation.settings.navigationConfig],
  );

  const isModuleEnabled = useCallback(
    (key: string) => key === "overview" || key === "settings" || displayOrganisation.settings.featureFlags[key] !== false,
    [displayOrganisation.settings.featureFlags],
  );

  const themeVariables = useMemo(
    () => buildOrganisationThemeVariables(displayOrganisation.branding),
    [displayOrganisation.branding],
  );

  const applyOrganisationConfiguration = useCallback(
    (configuration: OrganisationConfiguration) => {
      setResolution((current) => {
        if (current.lookupKey !== tenantLookupKey || !current.organisation) {
          return current;
        }
        return {
          ...current,
          organisation: {
            ...current.organisation,
            branding: configuration.branding,
            settings: configuration.settings,
          },
        };
      });
      setLoadError({ lookupKey: tenantLookupKey, message: null });
    },
    [tenantLookupKey],
  );

  const value = useMemo<OrganisationContextValue>(
    () => ({
      organisation,
      displayOrganisation,
      isLoading: organisationIsLoading,
      error,
      navigationItems,
      organisationBasePath: buildOrganisationPath(displayOrganisation.slug),
      activeSlug: displayOrganisation.slug,
      getOrganisationPath: (path = "") => buildOrganisationPath(displayOrganisation.slug, path),
      isModuleEnabled,
      refreshOrganisation,
      applyOrganisationConfiguration,
    }),
    [applyOrganisationConfiguration, displayOrganisation, error, organisationIsLoading, isModuleEnabled, navigationItems, organisation, refreshOrganisation],
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
