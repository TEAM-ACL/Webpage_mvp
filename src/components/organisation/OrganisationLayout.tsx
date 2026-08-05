import { useState, type CSSProperties, type JSX, type ReactNode } from "react";
import { useOrganisation } from "../../context/OrganisationContext";
import OrganisationHeader from "./OrganisationHeader";
import OrganisationSidebar from "./OrganisationSidebar";

type OrganisationLayoutProps = {
  organisationName: string;
  organisationType: string;
  administratorRole: string;
  status?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function OrganisationLayout({
  organisationName,
  organisationType,
  administratorRole,
  status = "Active",
  title,
  description,
  actions,
  children,
}: OrganisationLayoutProps): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { displayOrganisation } = useOrganisation();
  const branding = displayOrganisation.branding;
  const settings = displayOrganisation.settings;
  const shellStyle = {
    background: branding
      ? `linear-gradient(135deg, ${branding.backgroundColour} 0%, color-mix(in srgb, ${branding.backgroundColour} 72%, #ffffff) 58%, var(--color-surface-container-lowest) 100%)`
      : undefined,
    color: branding?.textColour,
    fontFamily: branding?.fontFamily,
  } as CSSProperties;
  const radiusClass = resolveRadiusClass(branding?.borderRadius);

  return (
    <main className={`min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] ${radiusClass}`} style={shellStyle}>
      <div className="lg:flex">
        <OrganisationSidebar
          organisationName={organisationName}
          organisationType={organisationType}
          administratorRole={administratorRole}
          status={status}
          logoUrl={branding?.logoUrl}
          primaryColour={branding?.primaryColour}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <section className="min-w-0 flex-1 p-4 lg:p-8">
          <OrganisationHeader
            title={title}
            description={description}
            actions={actions}
            organisationName={organisationName}
            organisationType={organisationType}
            logoUrl={branding?.logoUrl}
            bannerUrl={branding?.dashboardBannerUrl}
            brandColour={branding?.primaryColour}
            accentColour={branding?.accentColour}
            welcomeHeading={settings?.welcomeHeading}
            welcomeMessage={settings?.welcomeMessage}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          {children}
        </section>
      </div>
    </main>
  );
}

function resolveRadiusClass(borderRadius?: string): string {
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
