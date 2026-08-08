import { describe, expect, it } from "vitest";
import type { CSSProperties } from "react";

import type { OrganisationBranding } from "../types/organisation";
import {
  buildOrganisationPortalThemeVariables,
  buildOrganisationThemeVariables,
  colourContrastRatio,
  resolveOrganisationThemeMode,
} from "./organisationTheme";

const branding: OrganisationBranding = {
  logoUrl: null,
  faviconUrl: null,
  primaryColour: "#0a0953",
  secondaryColour: "#9b24eb",
  accentColour: "#40ed74",
  backgroundColour: "#ffffff",
  textColour: "#111827",
  fontFamily: "Inter",
  borderRadius: "medium",
  themeMode: "light",
  loginBannerUrl: null,
  dashboardBannerUrl: null,
};

describe("organisation theme variables", () => {
  it("keeps organisation branding out of global semantic tokens", () => {
    const variables = asVariables(buildOrganisationThemeVariables(branding));

    expect(variables["--organisation-primary"]).toBe("#0a0953");
    expect(variables["--organisation-background"]).toBe("#ffffff");
    expect(variables["--organisation-text"]).toBe("#111827");
    expect(Object.keys(variables).filter((key) => key.startsWith("--color-"))).toEqual([]);
  });

  it("fully namespaces tenant branding", () => {
    const variables = asVariables(buildOrganisationThemeVariables(branding, { prefix: "tenant" }));

    expect(variables["--tenant-primary"]).toBe("#0a0953");
    expect(Object.keys(variables).every((key) => key.startsWith("--tenant-"))).toBe(true);
    expect(Object.keys(variables).some((key) => key.startsWith("--organisation-"))).toBe(false);
  });

  it("derives readable foregrounds for light and dark brand colours", () => {
    const darkPrimary = asVariables(buildOrganisationThemeVariables(branding));
    const lightPrimary = asVariables(buildOrganisationThemeVariables({
      ...branding,
      primaryColour: "#fef08a",
    }));

    expect(darkPrimary["--organisation-on-primary"]).toBe("#ffffff");
    expect(lightPrimary["--organisation-on-primary"]).toBe("#0f172a");
  });

  it("guarantees readable foregrounds for mid-luminance brand colours", () => {
    const variables = asVariables(buildOrganisationThemeVariables({
      ...branding,
      primaryColour: "#777777",
    }));

    expect(colourContrastRatio(
      variables["--organisation-primary"],
      variables["--organisation-on-primary"],
    )).toBeGreaterThanOrEqual(4.5);
  });

  it("derives a dark-mode action colour without changing the raw identity colour", () => {
    const variables = asVariables(buildOrganisationThemeVariables(branding, { mode: "dark" }));

    expect(variables["--organisation-primary"]).toBe("#0a0953");
    expect(variables["--organisation-action"]).not.toBe("#0a0953");
    expect(colourContrastRatio(
      variables["--organisation-action"],
      "#0f1020",
    )).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps action colours readable on mid-luminance tenant surfaces", () => {
    const variables = asVariables(buildOrganisationPortalThemeVariables({
      ...branding,
      primaryColour: "#777777",
      backgroundColour: "#777777",
      textColour: "#000000",
    }));

    expect(colourContrastRatio(
      variables["--tenant-action"],
      variables["--tenant-background"],
    )).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps branded panel endpoints readable against one foreground", () => {
    const variables = asVariables(buildOrganisationThemeVariables(branding, { mode: "dark" }));
    const onPanel = variables["--organisation-on-panel"];

    expect(colourContrastRatio(variables["--organisation-panel-start"], onPanel)).toBeGreaterThanOrEqual(7);
    expect(colourContrastRatio(variables["--organisation-panel-end"], onPanel)).toBeGreaterThanOrEqual(7);
  });

  it.each([
    ["light", "dark", "light"],
    ["dark", "light", "dark"],
    ["system", "light", "light"],
    ["system", "dark", "dark"],
  ] as const)("resolves %s mode against a %s system preference", (configured, system, expected) => {
    expect(resolveOrganisationThemeMode(configured, system)).toBe(expected);
  });

  it("builds an isolated dark tenant surface when saved branding is light", () => {
    const variables = asVariables(buildOrganisationPortalThemeVariables(
      { ...branding, themeMode: "dark" },
      { prefix: "tenant", systemMode: "light" },
    ));

    expect(variables["--tenant-background"]).toBe("#0f1020");
    expect(variables["--tenant-text"]).toBe("#ffffff");
    expect(variables["--tenant-surface-container-low"]).toContain("color-mix");
    expect(Object.keys(variables).filter((key) => key.startsWith("--color-"))).toEqual([]);
  });

  it("uses the system preference only for system-configured tenant themes", () => {
    const lightSystem = asVariables(buildOrganisationPortalThemeVariables(
      { ...branding, themeMode: "system" },
      { prefix: "preview", systemMode: "light" },
    ));
    const darkSystem = asVariables(buildOrganisationPortalThemeVariables(
      { ...branding, themeMode: "system" },
      { prefix: "preview", systemMode: "dark" },
    ));

    expect(lightSystem["--preview-background"]).toBe("#ffffff");
    expect(darkSystem["--preview-background"]).toBe("#0f1020");
  });

  it("does not fade secondary tenant text below AA contrast", () => {
    const variables = asVariables(buildOrganisationPortalThemeVariables({
      ...branding,
      backgroundColour: "#ffffff",
      textColour: "#767676",
    }));

    expect(colourContrastRatio(
      variables["--tenant-on-surface-variant"],
      variables["--tenant-background"],
    )).toBeGreaterThanOrEqual(4.5);
  });

  it("normalises invalid colours to deterministic safe values", () => {
    const variables = asVariables(buildOrganisationThemeVariables({
      ...branding,
      primaryColour: "not-a-colour",
      backgroundColour: "transparent",
      textColour: "invalid",
    }));

    expect(variables["--organisation-primary"]).toBe("#1f0954");
    expect(variables["--organisation-background"]).toBe("#f8fafc");
    expect(variables["--organisation-text"]).toBe("#0f172a");
    expect(Object.values(variables).join(" ")).not.toMatch(/NaN|undefined/);
  });
});

function asVariables(styles: CSSProperties): Record<string, string> {
  return styles as Record<string, string>;
}
