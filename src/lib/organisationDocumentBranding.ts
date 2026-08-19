import type { PublicOrganisationProfile } from "../types/organisation";

type FaviconLink = HTMLLinkElement & {
  dataset: DOMStringMap;
};

const DEFAULT_TITLE = "VisionTechai";

export function applyPublicOrganisationDocumentBranding(
  profile: PublicOrganisationProfile,
  documentRef: Document = document,
): () => void {
  const previousTitle = documentRef.title || DEFAULT_TITLE;
  const existingIcon = documentRef.querySelector<HTMLLinkElement>("link[rel='icon']");
  const previousIconHref = existingIcon?.getAttribute("href") ?? null;
  const previousIconType = existingIcon?.getAttribute("type") ?? null;
  const createdIcon = existingIcon ? null : createFaviconLink(documentRef);
  const icon = existingIcon ?? createdIcon;
  const faviconUrl = profile.branding.faviconUrl || profile.branding.logoUrl || profile.logoUrl;

  documentRef.title = `${profile.name} | VisionTech`;

  if (icon && faviconUrl) {
    icon.setAttribute("href", faviconUrl);
    icon.setAttribute("type", faviconType(faviconUrl));
    documentRef.head.appendChild(icon);
  }

  return () => {
    documentRef.title = previousTitle;
    if (!icon) return;
    if (createdIcon) {
      createdIcon.remove();
      return;
    }
    if (previousIconHref) {
      icon.setAttribute("href", previousIconHref);
    } else {
      icon.removeAttribute("href");
    }
    if (previousIconType) {
      icon.setAttribute("type", previousIconType);
    } else {
      icon.removeAttribute("type");
    }
  };
}

export function faviconType(url: string): string {
  const path = safePathname(url).toLowerCase();
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  return "image/png";
}

function createFaviconLink(documentRef: Document): FaviconLink {
  const link = documentRef.createElement("link") as FaviconLink;
  link.setAttribute("rel", "icon");
  link.dataset.organisationFavicon = "true";
  return link;
}

function safePathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
