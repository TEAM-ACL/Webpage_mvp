import { describe, expect, it } from "vitest";

import {
  editableConfigurationFingerprint,
  normaliseOrganisationSettingsForSave,
  validateOrganisationConfiguration,
} from "./organisationConfiguration";
import type {
  OrganisationBranding,
  OrganisationConfiguration,
  OrganisationSettings,
} from "../types/organisation";

const branding: OrganisationBranding = {
  logoUrl: "https://example.com/logo.png",
  faviconUrl: null,
  primaryColour: "#1f0954",
  secondaryColour: "#2563eb",
  accentColour: "#7c3aed",
  backgroundColour: "#ffffff",
  textColour: "#111827",
  fontFamily: "Inter",
  borderRadius: "medium",
  themeMode: "light",
  loginBannerUrl: null,
  dashboardBannerUrl: null,
};

function settings(overrides: Partial<OrganisationSettings> = {}): OrganisationSettings {
  return {
    welcomeHeading: null,
    welcomeMessage: null,
    navigationConfig: [],
    homepageConfig: [],
    featureFlags: {},
    terminologyConfig: {},
    configurationStatus: "published",
    draftVersion: 0,
    publishedVersion: null,
    publishedAt: null,
    publishedBy: null,
    ...overrides,
  };
}

describe("organisation configuration", () => {
  it("normalises approved navigation and widget order into unique positions", () => {
    const result = normaliseOrganisationSettingsForSave(settings({
      navigationConfig: [
        { key: "members", label: "Students", path: "members", enabled: true, order: 1 },
        { key: "overview", label: "Overview", path: "", enabled: true, order: 1 },
      ],
      homepageConfig: [
        { id: "metrics", type: "metrics", enabled: true, position: 2 },
        { id: "ai-insight", type: "ai_insight", enabled: true, position: 2 },
      ],
    }));

    expect(result.navigationConfig).toHaveLength(7);
    expect(result.navigationConfig.map((item) => item.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(result.navigationConfig.find((item) => item.key === "members")?.label).toBe("Students");
    expect(result.homepageConfig).toHaveLength(6);
    expect(result.homepageConfig.map((item) => item.position)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("rejects unsafe branding before a save request is sent", () => {
    const configuration: OrganisationConfiguration = {
      branding: {
        ...branding,
        logoUrl: "javascript:alert(1)",
        textColour: "#fefefe",
      },
      settings: settings(),
    };

    expect(validateOrganisationConfiguration(configuration)).toMatch(/contrast ratio/i);
  });

  it("does not treat server publication metadata as an editable change", () => {
    const first = { branding, settings: settings({ draftVersion: 2 }) };
    const second = {
      branding,
      settings: settings({
        draftVersion: 8,
        publishedVersion: 4,
        publishedAt: "2026-08-03T18:00:00Z",
      }),
    };

    expect(editableConfigurationFingerprint(first)).toBe(editableConfigurationFingerprint(second));
  });
});
