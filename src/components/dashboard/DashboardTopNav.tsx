"use client";

import { useMemo } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOnboardingProfile, isAdmin as checkAdmin } from "../../lib/auth";

type NavItem = { label: string; href: string };

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export default function DashboardTopNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const onboardingProfile = useMemo(() => getOnboardingProfile<{ preferredNickname?: string }>(), []);

  const navItems: NavItem[] = [
    { label: "Intelligence", href: "/intelligence" },
    { label: "Workspace", href: "/workspace" },
    { label: "Network", href: "/network" },
  ];

  if (user && checkAdmin()) {
    navItems.push({ label: "Admin", href: "/admin" });
  }

  const displayName = onboardingProfile?.preferredNickname || user?.display_name || user?.email || "User";
  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-outline-variant)] bg-[color:rgba(255,255,255,0.9)] backdrop-blur">
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
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]">
            <Bell className="h-4 w-4" />
          </button>

          <Link
            to="/profile"
            className="inline-flex items-center gap-3 rounded-2xl border border-[var(--color-outline-variant)] bg-white px-3 py-2 transition hover:bg-[var(--color-surface-container-low)]"
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
