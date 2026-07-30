import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileText,
  Home,
  LifeBuoy,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useOrganisation } from "../../context/OrganisationContext";

type OrganisationSidebarProps = {
  organisationName: string;
  organisationType: string;
  administratorRole: string;
  status: string;
  logoUrl?: string | null;
  primaryColour?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function OrganisationSidebar({
  organisationName,
  organisationType,
  administratorRole,
  status,
  logoUrl,
  primaryColour = "#1f0954",
  isOpen,
  onClose,
}: OrganisationSidebarProps): JSX.Element {
  const { getOrganisationPath, navigationItems } = useOrganisation();
  const initials = organisationName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close organisation navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 transform border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-xl transition lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <NavLink
              to="/"
              onClick={onClose}
              aria-label="Go to VisionTech homepage"
              title="Go to homepage"
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--organisation-card-radius,1rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)]"
            >
              <Home className="h-4 w-4" />
            </NavLink>
            <div
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-black text-white shadow-sm"
              style={{ backgroundColor: primaryColour, color: "var(--organisation-on-primary)" }}
            >
              {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : initials || "VT"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                Organisation
              </p>
              <h2 className="mt-2 truncate text-lg font-bold text-[var(--color-on-surface)]">
                {organisationName}
              </h2>
              <p className="mt-1 truncate text-sm text-[var(--color-on-surface-variant)]">{organisationType}</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl border border-[var(--color-outline-variant)] p-2 text-[var(--color-on-surface)] lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-[var(--organisation-card-radius,1rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4">
          <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">Access</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">{administratorRole}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-500">{status}</p>
        </div>

        <nav className="mt-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const href = getOrganisationPath(item.path);
            return (
              <NavLink
                key={item.key}
                to={href}
                end={item.path === ""}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[var(--color-primary)] text-[var(--organisation-on-primary)]"
                      : "text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
