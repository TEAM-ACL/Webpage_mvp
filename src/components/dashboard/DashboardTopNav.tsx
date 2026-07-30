"use client";

import { Bell, ChevronDown, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrganisation } from "../../context/OrganisationContext";
import { useTheme } from "../../context/ThemeContext";
import { hasOrganisationDashboardAccess, isAdmin as checkAdmin } from "../../lib/auth";
import { getTenantSlugFromSearch, withTenantQuery } from "../../lib/tenantNavigation";

type NavItem = { label: string; href: string };

function isActive(pathname: string, href: string) {
  const hrefPathname = href.split("?")[0];
  return hrefPathname === "/organisation" || hrefPathname.split("/").length === 3
    ? pathname === hrefPathname || pathname === "/organizations"
    : pathname === hrefPathname;
}

export default function DashboardTopNav() {
  const { pathname, search } = useLocation();
  const { user, profile } = useAuth();
  const { getOrganisationPath, navigationItems } = useOrganisation();
  const { isDark, toggleMode } = useTheme();
  const isOrganisationArea = pathname.startsWith("/organisation") || pathname.startsWith("/organizations");
  const activeTenantSlug = getTenantSlugFromSearch(search);

  const navItems: NavItem[] = isOrganisationArea
    ? navigationItems.map((item) => ({
        label: item.label,
        href: getOrganisationPath(item.path),
      }))
    : [
        { label: "Intelligence", href: withTenantQuery("/intelligence", activeTenantSlug) },
        { label: "Workspace", href: withTenantQuery("/workspace", activeTenantSlug) },
        { label: "Network", href: withTenantQuery("/network", activeTenantSlug) },
      ];

  const role = profile?.role || user?.role;
  if (!isOrganisationArea && user && hasOrganisationDashboardAccess(role)) {
    navItems.push({ label: "Organisation", href: getOrganisationPath() });
  }

  if (!isOrganisationArea && user && checkAdmin()) {
    navItems.push({ label: "Admin", href: "/admin" });
  }

  const displayName = profile?.preferredNickname || user?.display_name || user?.email || "User";
  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-outline-variant)] bg-[color:var(--color-surface-container-lowest)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-sm font-bold text-white">
              VT
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-[var(--color-on-surface)]">VisionTech</p>
              <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">Intelligence Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]">
            <Bell className="h-4 w-4" />
          </button>

          <Link
            to="/profile"
            className="inline-flex items-center gap-3 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-3 py-2 transition hover:bg-[var(--color-surface-container-low)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">{displayName}</p>
              <p className="text-xs text-[var(--color-on-surface-variant)]">User Profile</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[var(--color-on-surface-variant)]" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}
