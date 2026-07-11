import { useState, type JSX, type ReactNode } from "react";
import DashboardShell from "../dashboard/DashboardShell";
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

  return (
    <DashboardShell>
      <div className="lg:flex lg:gap-6">
        <OrganisationSidebar
          organisationName={organisationName}
          organisationType={organisationType}
          administratorRole={administratorRole}
          status={status}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1">
          <OrganisationHeader
            title={title}
            description={description}
            actions={actions}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          {children}
        </main>
      </div>
    </DashboardShell>
  );
}
