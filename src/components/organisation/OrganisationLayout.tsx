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
  const { organisation } = useOrganisation();
  const branding = organisation?.branding;
  const settings = organisation?.settings;
  const shellStyle = {
    background: branding
      ? `linear-gradient(135deg, ${branding.backgroundColour} 0%, #f8fafc 58%, #ffffff 100%)`
      : undefined,
  } as CSSProperties;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900" style={shellStyle}>
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
