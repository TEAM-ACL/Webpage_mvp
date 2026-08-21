import { useState, type CSSProperties, type JSX, type ReactNode } from "react";
import { useOrganisation } from "../../context/OrganisationContext";
import { useTheme } from "../../context/ThemeContext";
import {
  buildOrganisationThemeVariables,
  resolveOrganisationRadiusClass,
} from "../../lib/organisationTheme";
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
  const { isDark } = useTheme();
  const branding = displayOrganisation.branding;
  const settings = displayOrganisation.settings;
  const organisationLogoUrl = branding?.logoUrl || displayOrganisation.logoUrl;
  const shellStyle = {
    ...buildOrganisationThemeVariables(branding, { mode: isDark ? "dark" : "light" }),
    "--color-primary": "var(--organisation-action)",
    "--color-secondary": "var(--organisation-secondary-action)",
    backgroundImage: "radial-gradient(circle at 92% 4%, color-mix(in srgb, var(--organisation-primary) 11%, transparent), transparent 34%), linear-gradient(135deg, var(--color-surface), var(--color-surface-container-low) 58%, var(--color-surface))",
    fontFamily: branding?.fontFamily,
  } as CSSProperties;
  const radiusClass = resolveOrganisationRadiusClass(branding?.borderRadius);

  return (
    <main className={`min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] ${radiusClass}`} style={shellStyle}>
      <div className="lg:flex">
        <OrganisationSidebar
          organisationName={organisationName}
          organisationType={organisationType}
          administratorRole={administratorRole}
          status={status}
          logoUrl={organisationLogoUrl}
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
            logoUrl={organisationLogoUrl}
            bannerUrl={branding?.dashboardBannerUrl}
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
