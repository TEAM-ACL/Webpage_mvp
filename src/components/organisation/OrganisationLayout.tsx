import { useState, type JSX, type ReactNode } from "react";
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
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="lg:flex">
        <OrganisationSidebar
          organisationName={organisationName}
          organisationType={organisationType}
          administratorRole={administratorRole}
          status={status}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <section className="min-w-0 flex-1 p-4 lg:p-8">
          <OrganisationHeader
            title={title}
            description={description}
            actions={actions}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          {children}
        </section>
      </div>
    </main>
  );
}
