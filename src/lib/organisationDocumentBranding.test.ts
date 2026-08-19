import { describe, expect, it } from "vitest";

import {
  applyPublicOrganisationDocumentBranding,
  faviconType,
} from "./organisationDocumentBranding";
import type { PublicOrganisationProfile } from "../types/organisation";

class FakeElement {
  attributes = new Map<string, string>();
  dataset: Record<string, string> = {};
  parent: FakeHead | null = null;

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  remove(): void {
    this.parent?.removeChild(this);
  }
}

class FakeHead {
  children: FakeElement[] = [];

  appendChild(element: FakeElement): FakeElement {
    if (!this.children.includes(element)) {
      this.children.push(element);
      element.parent = this;
    }
    return element;
  }

  removeChild(element: FakeElement): void {
    this.children = this.children.filter((child) => child !== element);
    element.parent = null;
  }
}

class FakeDocument {
  title = "VisionTechai";
  head = new FakeHead();

  createElement(): FakeElement {
    return new FakeElement();
  }

  querySelector(): FakeElement | null {
    return this.head.children.find((child) => child.getAttribute("rel") === "icon") ?? null;
  }
}

const profile: PublicOrganisationProfile = {
  id: "organisation-1",
  name: "University of Bolton",
  slug: "university-of-bolton",
  organisationType: "university",
  description: null,
  logoUrl: null,
  branding: {
    logoUrl: "https://example.com/logo.png",
    faviconUrl: "https://example.com/favicon.svg",
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
  },
  settings: {
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
  },
};

describe("organisation document branding", () => {
  it("applies and restores public organisation title and favicon", () => {
    const fakeDocument = new FakeDocument();

    const restore = applyPublicOrganisationDocumentBranding(
      profile,
      fakeDocument as unknown as Document,
    );

    expect(fakeDocument.title).toBe("University of Bolton | VisionTech");
    expect(fakeDocument.head.children).toHaveLength(1);
    expect(fakeDocument.head.children[0].getAttribute("href")).toBe("https://example.com/favicon.svg");
    expect(fakeDocument.head.children[0].getAttribute("type")).toBe("image/svg+xml");

    restore();

    expect(fakeDocument.title).toBe("VisionTechai");
    expect(fakeDocument.head.children).toHaveLength(0);
  });

  it("preserves a pre-existing favicon when restoring", () => {
    const fakeDocument = new FakeDocument();
    const existingIcon = new FakeElement();
    existingIcon.setAttribute("rel", "icon");
    existingIcon.setAttribute("href", "/favicon.ico");
    existingIcon.setAttribute("type", "image/x-icon");
    fakeDocument.head.appendChild(existingIcon);

    const restore = applyPublicOrganisationDocumentBranding(
      profile,
      fakeDocument as unknown as Document,
    );

    expect(existingIcon.getAttribute("href")).toBe("https://example.com/favicon.svg");

    restore();

    expect(fakeDocument.head.children).toEqual([existingIcon]);
    expect(existingIcon.getAttribute("href")).toBe("/favicon.ico");
    expect(existingIcon.getAttribute("type")).toBe("image/x-icon");
  });

  it("falls back to the organisation logo when no favicon is configured", () => {
    const fakeDocument = new FakeDocument();

    applyPublicOrganisationDocumentBranding(
      {
        ...profile,
        branding: {
          ...profile.branding,
          faviconUrl: null,
        },
      },
      fakeDocument as unknown as Document,
    );

    expect(fakeDocument.head.children[0].getAttribute("href")).toBe("https://example.com/logo.png");
  });

  it("maps favicon URLs to image MIME types", () => {
    expect(faviconType("https://example.com/favicon.ico")).toBe("image/x-icon");
    expect(faviconType("https://example.com/favicon.webp")).toBe("image/webp");
    expect(faviconType("https://example.com/favicon.jpeg")).toBe("image/jpeg");
    expect(faviconType("https://example.com/favicon.png")).toBe("image/png");
  });
});
