import type { CSSProperties } from "react";
import type { OrganisationBranding } from "../types/organisation";

type OrganisationThemeOptions = {
  prefix?: "organisation" | "tenant";
};

export function buildOrganisationThemeVariables(
  branding: OrganisationBranding | null | undefined,
  { prefix = "organisation" }: OrganisationThemeOptions = {},
): CSSProperties {
  const primaryColour = branding?.primaryColour || "#1f0954";
  const secondaryColour = branding?.secondaryColour || "#2563eb";
  const accentColour = branding?.accentColour || "#7c3aed";
  const backgroundColour = branding?.backgroundColour || "#f8fafc";
  const textColour = branding?.textColour || readableTextColour(backgroundColour);
  const isDarkBrand = branding?.themeMode === "dark" || isDarkColour(backgroundColour);

  return {
    [`--${prefix}-primary`]: primaryColour,
    [`--${prefix}-secondary`]: secondaryColour,
    [`--${prefix}-accent`]: accentColour,
    [`--${prefix}-background`]: backgroundColour,
    [`--${prefix}-text`]: textColour,
    [`--${prefix}-on-primary`]: readableTextColour(primaryColour),
    "--color-primary": primaryColour,
    "--color-secondary": secondaryColour,
    "--color-surface": backgroundColour,
    "--color-on-surface": textColour,
    "--color-on-surface-variant": isDarkBrand ? "rgba(248,250,252,0.78)" : "rgba(51,65,85,0.82)",
    "--color-surface-container-lowest": isDarkBrand ? "rgba(15,23,42,0.94)" : "rgba(255,255,255,0.94)",
    "--color-surface-container-low": isDarkBrand ? "rgba(30,41,59,0.82)" : "rgba(248,250,252,0.9)",
    "--color-surface-container-high": isDarkBrand ? "rgba(51,65,85,0.9)" : "rgba(241,245,249,0.95)",
    "--color-outline-variant": isDarkBrand ? "rgba(226,232,240,0.18)" : "rgba(148,163,184,0.28)",
  } as CSSProperties;
}

export function readableTextColour(backgroundColour: string): string {
  return isDarkColour(backgroundColour) ? "#ffffff" : "#0f172a";
}

export function isDarkColour(colour: string): boolean {
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
