import type { CSSProperties } from "react";
import type { OrganisationBranding } from "../types/organisation";

type OrganisationThemeOptions = {
  prefix?: "organisation" | "tenant" | "preview" | "publish-preview";
  mode?: ResolvedThemeMode;
  surfaceColour?: string;
};

type OrganisationPortalThemeOptions = OrganisationThemeOptions & {
  systemMode?: ResolvedThemeMode;
};

export type ResolvedThemeMode = "light" | "dark";

const DEFAULT_PRIMARY = "#1f0954";
const DEFAULT_SECONDARY = "#2563eb";
const DEFAULT_ACCENT = "#7c3aed";
const DEFAULT_LIGHT_SURFACE = "#f8fafc";
const DEFAULT_DARK_SURFACE = "#0f1020";

export function buildOrganisationThemeVariables(
  branding: OrganisationBranding | null | undefined,
  {
    prefix = "organisation",
    mode = "light",
    surfaceColour: requestedSurfaceColour,
  }: OrganisationThemeOptions = {},
): CSSProperties {
  const primaryColour = normaliseHexColour(branding?.primaryColour, DEFAULT_PRIMARY);
  const secondaryColour = normaliseHexColour(branding?.secondaryColour, DEFAULT_SECONDARY);
  const accentColour = normaliseHexColour(branding?.accentColour, DEFAULT_ACCENT);
  const backgroundColour = normaliseHexColour(branding?.backgroundColour, DEFAULT_LIGHT_SURFACE);
  const requestedTextColour = normaliseHexColour(
    branding?.textColour,
    readableTextColour(backgroundColour),
  );
  const textColour = ensureReadableTextColour(requestedTextColour, backgroundColour);
  const surfaceColour = normaliseHexColour(
    requestedSurfaceColour,
    mode === "dark" ? DEFAULT_DARK_SURFACE : DEFAULT_LIGHT_SURFACE,
  );
  const actionColour = ensureColourContrast(primaryColour, surfaceColour, 4.5);
  const secondaryActionColour = ensureColourContrast(secondaryColour, surfaceColour, 3);
  const accentForegroundColour = ensureColourContrast(accentColour, surfaceColour, 4.5);
  const panelOnColour = readableTextColour(primaryColour);
  const panelStartColour = ensureBackgroundContrast(primaryColour, panelOnColour, 7);
  const panelEndColour = ensureBackgroundContrast(
    mixHexColours(primaryColour, accentColour, 0.24),
    panelOnColour,
    7,
  );

  return {
    [`--${prefix}-primary`]: primaryColour,
    [`--${prefix}-secondary`]: secondaryColour,
    [`--${prefix}-accent`]: accentColour,
    [`--${prefix}-background`]: backgroundColour,
    [`--${prefix}-text`]: textColour,
    [`--${prefix}-on-primary`]: readableTextColour(primaryColour),
    [`--${prefix}-on-secondary`]: readableTextColour(secondaryColour),
    [`--${prefix}-on-accent`]: readableTextColour(accentColour),
    [`--${prefix}-action`]: actionColour,
    [`--${prefix}-on-action`]: readableTextColour(actionColour),
    [`--${prefix}-action-container`]: `color-mix(in srgb, ${actionColour} 14%, transparent)`,
    [`--${prefix}-secondary-action`]: secondaryActionColour,
    [`--${prefix}-on-secondary-action`]: readableTextColour(secondaryActionColour),
    [`--${prefix}-accent-foreground`]: accentForegroundColour,
    [`--${prefix}-panel-start`]: panelStartColour,
    [`--${prefix}-panel-end`]: panelEndColour,
    [`--${prefix}-on-panel`]: panelOnColour,
  } as CSSProperties;
}

/**
 * Builds a complete, isolated palette for public organisation experiences and
 * draft previews. It deliberately emits only prefixed variables so tenant
 * branding can never replace the authenticated application's neutral tokens.
 */
export function buildOrganisationPortalThemeVariables(
  branding: OrganisationBranding | null | undefined,
  { prefix = "tenant", systemMode = "light" }: OrganisationPortalThemeOptions = {},
): CSSProperties {
  const effectiveMode = resolveOrganisationThemeMode(branding?.themeMode, systemMode);
  const defaultSurface = effectiveMode === "dark" ? DEFAULT_DARK_SURFACE : DEFAULT_LIGHT_SURFACE;
  const configuredSurface = normaliseHexColour(branding?.backgroundColour, defaultSurface);
  const surfaceColour = isDarkColour(configuredSurface) === (effectiveMode === "dark")
    ? configuredSurface
    : defaultSurface;
  const configuredText = normaliseHexColour(
    branding?.textColour,
    readableTextColour(surfaceColour),
  );
  const onSurface = ensureReadableTextColour(configuredText, surfaceColour);
  const onSurfaceVariant = deriveMutedForeground(onSurface, surfaceColour);
  const mixColour = effectiveMode === "dark" ? "#ffffff" : "#0f172a";

  return {
    ...buildOrganisationThemeVariables(branding, {
      prefix,
      mode: effectiveMode,
      surfaceColour,
    }),
    colorScheme: effectiveMode,
    [`--${prefix}-background`]: surfaceColour,
    [`--${prefix}-text`]: onSurface,
    [`--${prefix}-on-surface-variant`]: onSurfaceVariant,
    [`--${prefix}-surface-container-lowest`]: `color-mix(in srgb, ${surfaceColour} ${effectiveMode === "dark" ? 98 : 94}%, ${effectiveMode === "dark" ? mixColour : "#ffffff"})`,
    [`--${prefix}-surface-container-low`]: `color-mix(in srgb, ${surfaceColour} ${effectiveMode === "dark" ? 94 : 96}%, ${mixColour})`,
    [`--${prefix}-surface-container-high`]: `color-mix(in srgb, ${surfaceColour} ${effectiveMode === "dark" ? 87 : 91}%, ${mixColour})`,
    [`--${prefix}-outline-variant`]: `color-mix(in srgb, ${onSurface} 22%, transparent)`,
    [`--${prefix}-error`]: effectiveMode === "dark" ? "#fda4af" : "#be123c",
    [`--${prefix}-error-container`]: effectiveMode === "dark" ? "#4c0519" : "#fff1f2",
  } as CSSProperties;
}

export function resolveOrganisationThemeMode(
  configuredMode: OrganisationBranding["themeMode"] | null | undefined,
  systemMode: ResolvedThemeMode,
): ResolvedThemeMode {
  if (configuredMode === "dark") return "dark";
  if (configuredMode === "system") return systemMode;
  return "light";
}

export function readableTextColour(backgroundColour: string): string {
  const normalizedBackground = normaliseHexColour(backgroundColour, DEFAULT_LIGHT_SURFACE);
  const darkText = "#0f172a";
  const lightText = "#ffffff";
  const preferredText = isDarkColour(normalizedBackground) ? lightText : darkText;
  if (colourContrastRatio(normalizedBackground, preferredText) >= 4.5) {
    return preferredText;
  }
  return colourContrastRatio(normalizedBackground, "#000000")
    > colourContrastRatio(normalizedBackground, lightText)
    ? "#000000"
    : lightText;
}

export function isDarkColour(colour: string): boolean {
  const normalized = normaliseHexColour(colour, DEFAULT_LIGHT_SURFACE);
  return relativeLuminance(normalized) < 0.179;
}

export function resolveOrganisationRadiusClass(borderRadius?: string): string {
  if (borderRadius === "small") {
    return "[--organisation-card-radius:0.75rem]";
  }
  if (borderRadius === "large") {
    return "[--organisation-card-radius:1.5rem]";
  }
  if (borderRadius === "rounded") {
    return "[--organisation-card-radius:2rem]";
  }
  return "[--organisation-card-radius:1rem]";
}

function ensureReadableTextColour(textColour: string, backgroundColour: string): string {
  return colourContrastRatio(textColour, backgroundColour) >= 4.5
    ? textColour
    : readableTextColour(backgroundColour);
}

export function colourContrastRatio(firstColour: string, secondColour: string): number {
  const firstLuminance = relativeLuminance(firstColour);
  const secondLuminance = relativeLuminance(secondColour);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureColourContrast(
  foregroundColour: string,
  backgroundColour: string,
  minimumRatio: number,
): string {
  if (colourContrastRatio(foregroundColour, backgroundColour) >= minimumRatio) {
    return foregroundColour;
  }

  const targetColour = readableTextColour(backgroundColour);
  for (let step = 1; step <= 20; step += 1) {
    const candidate = mixHexColours(foregroundColour, targetColour, step / 20);
    if (colourContrastRatio(candidate, backgroundColour) >= minimumRatio) {
      return candidate;
    }
  }
  return targetColour;
}

function deriveMutedForeground(foregroundColour: string, backgroundColour: string): string {
  let lastReadableColour = foregroundColour;
  for (let step = 1; step <= 10; step += 1) {
    const candidate = mixHexColours(foregroundColour, backgroundColour, step / 20);
    if (colourContrastRatio(candidate, backgroundColour) < 4.5) {
      return lastReadableColour;
    }
    lastReadableColour = candidate;
  }
  return lastReadableColour;
}

function ensureBackgroundContrast(
  backgroundColour: string,
  foregroundColour: string,
  minimumRatio: number,
): string {
  if (colourContrastRatio(backgroundColour, foregroundColour) >= minimumRatio) {
    return backgroundColour;
  }

  const targetColour = isDarkColour(foregroundColour) ? "#ffffff" : "#0f172a";
  for (let step = 1; step <= 20; step += 1) {
    const candidate = mixHexColours(backgroundColour, targetColour, step / 20);
    if (colourContrastRatio(candidate, foregroundColour) >= minimumRatio) {
      return candidate;
    }
  }
  return targetColour;
}

function mixHexColours(firstColour: string, secondColour: string, secondWeight: number): string {
  const first = normaliseHexColour(firstColour, DEFAULT_PRIMARY).slice(1);
  const second = normaliseHexColour(secondColour, "#ffffff").slice(1);
  const channels = [0, 2, 4].map((index) => {
    const firstChannel = parseInt(first.slice(index, index + 2), 16);
    const secondChannel = parseInt(second.slice(index, index + 2), 16);
    return Math.round(firstChannel * (1 - secondWeight) + secondChannel * secondWeight)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

function relativeLuminance(colour: string): number {
  const hex = normaliseHexColour(colour, DEFAULT_LIGHT_SURFACE).slice(1);
  const channels = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) => (
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function normaliseHexColour(value: string | null | undefined, fallback: string): string {
  const candidate = value?.trim().replace(/^#/, "");
  if (!candidate || !/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(candidate)) {
    return normaliseHexColour(fallback, DEFAULT_LIGHT_SURFACE);
  }
  const expanded = candidate.length === 3
    ? candidate.split("").map((part) => `${part}${part}`).join("")
    : candidate;
  return `#${expanded.toLowerCase()}`;
}
