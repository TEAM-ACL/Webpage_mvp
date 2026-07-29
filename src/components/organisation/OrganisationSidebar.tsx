import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  X,
} from "lucide-react";
import { useOrganisation } from "../../context/OrganisationContext";

type OrganisationSidebarProps = {
  organisationName: string;
  organisationType: string;
  administratorRole: string;
  status: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function OrganisationSidebar({
  organisationName,
  organisationType,
  administratorRole,
  status,
  isOpen,
  onClose,
}: OrganisationSidebarProps): JSX.Element {
  const { getOrganisationPath, navigationItems } = useOrganisation();

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
          <NavLink
            to="/"
            aria-label="Go to VisionTech homepage"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-primary)] hover:text-white"
            onClick={onClose}
          >
            <Home className="h-4 w-4" />
          </NavLink>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              Organisation
            </p>
            <h2 className="mt-2 text-lg font-bold text-[var(--color-on-surface)]">
              {organisationName}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{organisationType}</p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-[var(--color-outline-variant)] p-2 text-[var(--color-on-surface)] lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-[var(--color-surface-container-low)] p-4">
          <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">Access</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">{administratorRole}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-700">{status}</p>
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
                      ? "bg-[var(--color-primary)] text-white"
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
