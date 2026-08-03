import { APPROVED_ORGANISATION_HOMEPAGE_WIDGETS } from "../config/organisationHomepageWidgets";
import {
  DEFAULT_ORGANISATION_NAVIGATION,
  type OrganisationNavigationKey,
} from "../config/organisationTenant";
import type {
  OrganisationBranding,
  OrganisationConfiguration,
  OrganisationHomepageSection,
  OrganisationNavigationConfigItem,
  OrganisationSettings,
} from "../types/organisation";

const requiredNavigationKeys = new Set<OrganisationNavigationKey>(["overview", "settings"]);
const terminologyKeys = new Set(["members", "cohorts", "opportunities", "interventions"]);
const supportedAssetExtensions = [".gif", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".webp"];

export function normaliseOrganisationSettingsForSave(
  settings: OrganisationSettings,
): OrganisationSettings {
  const configuredNavigation = new Map(
    settings.navigationConfig.map((item) => [item.key, item]),
  );
  const navigationConfig = DEFAULT_ORGANISATION_NAVIGATION.map((defaultItem) => {
    const configured = configuredNavigation.get(defaultItem.key);
    const enabled = requiredNavigationKeys.has(defaultItem.key)
      || (settings.featureFlags[defaultItem.key] ?? configured?.enabled ?? defaultItem.enabled);
    return {
      key: defaultItem.key,
      label: configured?.label.trim() || defaultItem.label,
      path: defaultItem.path,
      enabled,
      order: configured?.order ?? defaultItem.order,
    } satisfies OrganisationNavigationConfigItem;
  })
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({ ...item, order: index + 1 }));

  const configuredHomepage = new Map(
    settings.homepageConfig.map((section) => [section.id, section]),
  );
  const homepageConfig = APPROVED_ORGANISATION_HOMEPAGE_WIDGETS.map((defaultWidget) => {
    const configured = configuredHomepage.get(defaultWidget.id);
    return {
      id: defaultWidget.id,
      type: defaultWidget.type,
      enabled: configured?.enabled ?? defaultWidget.enabled,
      position: configured?.position ?? defaultWidget.position,
      heading: trimOptional(configured?.heading),
      description: trimOptional(configured?.description),
      config: configured?.config || {},
    } satisfies OrganisationHomepageSection;
  })
    .sort((left, right) => left.position - right.position)
    .map((section, index) => ({ ...section, position: index + 1 }));

  return {
    ...settings,
    welcomeHeading: trimOptional(settings.welcomeHeading),
    welcomeMessage: trimOptional(settings.welcomeMessage),
    navigationConfig,
    homepageConfig,
    featureFlags: Object.fromEntries(
      navigationConfig.map((item) => [item.key, item.enabled]),
    ),
    terminologyConfig: Object.fromEntries(
      Object.entries(settings.terminologyConfig)
        .filter(([key, value]) => terminologyKeys.has(key) && value.trim())
        .map(([key, value]) => [key, value.trim()]),
    ),
  };
}

export function normaliseOrganisationBrandingForSave(
  branding: OrganisationBranding,
): OrganisationBranding {
  return {
    ...branding,
    logoUrl: trimOptional(branding.logoUrl),
    faviconUrl: trimOptional(branding.faviconUrl),
    loginBannerUrl: trimOptional(branding.loginBannerUrl),
    dashboardBannerUrl: trimOptional(branding.dashboardBannerUrl),
    primaryColour: branding.primaryColour.toLowerCase(),
    secondaryColour: branding.secondaryColour.toLowerCase(),
    accentColour: branding.accentColour.toLowerCase(),
    backgroundColour: branding.backgroundColour.toLowerCase(),
    textColour: branding.textColour.toLowerCase(),
  };
}

export function validateOrganisationConfiguration(
  configuration: OrganisationConfiguration,
): string | null {
  const branding = normaliseOrganisationBrandingForSave(configuration.branding);
  const colours = [
    branding.primaryColour,
    branding.secondaryColour,
    branding.accentColour,
    branding.backgroundColour,
    branding.textColour,
  ];
  if (colours.some((colour) => !/^#[0-9a-f]{6}$/i.test(colour))) {
    return "Brand colours must use six-digit hex values such as #1f0954.";
  }
  if (contrastRatio(branding.backgroundColour, branding.textColour) < 4.5) {
    return "Background and text colours need a WCAG AA contrast ratio of at least 4.5:1.";
  }

  for (const assetUrl of [
    branding.logoUrl,
    branding.faviconUrl,
    branding.loginBannerUrl,
    branding.dashboardBannerUrl,
  ]) {
    if (!assetUrl) continue;
    try {
      const parsed = new URL(assetUrl);
      const isSupportedProtocol = parsed.protocol === "https:" || parsed.protocol === "http:";
      const path = parsed.pathname.toLowerCase();
      if (!isSupportedProtocol || !supportedAssetExtensions.some((extension) => path.endsWith(extension))) {
        return "Brand assets must use an HTTP(S) URL for a supported image file.";
      }
    } catch {
      return "Brand assets must use a valid absolute URL.";
    }
  }

  return null;
}

export function editableConfigurationFingerprint(
  configuration: OrganisationConfiguration,
): string {
  const settings = normaliseOrganisationSettingsForSave(configuration.settings);
  return JSON.stringify({
    branding: normaliseOrganisationBrandingForSave(configuration.branding),
    settings: {
      welcomeHeading: settings.welcomeHeading,
      welcomeMessage: settings.welcomeMessage,
      navigationConfig: settings.navigationConfig,
      homepageConfig: settings.homepageConfig,
      featureFlags: settings.featureFlags,
      terminologyConfig: settings.terminologyConfig,
    },
  });
}

function trimOptional(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

function contrastRatio(first: string, second: string): number {
  const luminance = (colour: string): number => {
    const channels = [1, 3, 5].map((index) => Number.parseInt(colour.slice(index, index + 2), 16) / 255);
    const linear = channels.map((channel) => (
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    ));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((left, right) => right - left);
  return (lighter + 0.05) / (darker + 0.05);
}
