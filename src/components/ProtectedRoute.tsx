import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  hasOrganisationDashboardAccessForUser,
  hasOrganisationManagementMembership,
  isAdmin,
} from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { useOrganisation } from "../context/OrganisationContext";

type Props = { children: JSX.Element };
type RedirectIfOnboardedProps = Props & {
  redirectTo?: string;
};

const isSafeInternalRedirect = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

export function RequireAuth({ children }: Props): JSX.Element {
  const location = useLocation();
  const { user, loading } = useAuth();
  if (loading) return <></>;
  if (!user) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }
  return children;
}

export function RequireOnboardingComplete({ children }: Props): JSX.Element {
  const { user, loading, profileLoading, onboardingComplete } = useAuth();
  if (loading || profileLoading) return <></>;
  if (!user) return <Navigate to="/login" replace />;
  // Only redirect when onboarding is explicitly incomplete.
  // `null` can happen transiently when profile state fails to hydrate (common on mobile cookie/session edge cases).
  if (onboardingComplete === false) {
    return (
      <Navigate
        to="/onboarding"
        replace
        state={{ reminder: "Please finish onboarding to access Intelligence." }}
      />
    );
  }
  return children;
}

export function RequireAdmin({ children }: Props): JSX.Element {
  const { user, loading } = useAuth();
  if (loading) return <></>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-base font-semibold text-red-800">You do not have permission to access this page.</p>
          <p className="mt-2 text-sm text-red-700">Admin access is required for this route.</p>
        </div>
      </div>
    );
  }
  return children;
}

export function RequireOrganisationAdmin({ children }: Props): JSX.Element {
  const location = useLocation();
  const { user, profile, loading, profileLoading } = useAuth();
  const {
    organisation,
    isLoading: organisationLoading,
    error: organisationError,
    refreshOrganisation,
  } = useOrganisation();
  if (loading || profileLoading) return <></>;
  if (!user) {
    const redirectTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/admin/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  const role = profile?.role || user.role;
  const hasAccountAccess = hasOrganisationDashboardAccessForUser(role, user.email);
  const hasMembershipAccess = hasOrganisationManagementMembership(organisation?.role);

  if (!hasAccountAccess && organisationLoading) return <></>;
  if (hasAccountAccess || hasMembershipAccess) return children;

  if (organisationError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
        <div className="mx-auto max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Organisation Unavailable</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight">We could not verify your organisation access.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{organisationError}</p>
          <button
            type="button"
            onClick={() => void refreshOrganisation()}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-amber-950 px-4 text-sm font-black text-white transition hover:bg-amber-900"
          >
            Retry organisation loading
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Organisation Access Required</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight">This account is not an organisation administrator yet.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Ask an organisation owner or platform administrator to grant an owner, admin, or organisation_admin membership before opening the organisation dashboard.
        </p>
      </div>
    </main>
  );
}

export function RedirectIfOnboarded({
  children,
  redirectTo = "/intelligence",
}: RedirectIfOnboardedProps): JSX.Element {
  const location = useLocation();
  const { user, loading, profileLoading, onboardingComplete } = useAuth();
  if (loading || profileLoading) return <></>;
  const queryRedirectTo = new URLSearchParams(location.search).get("redirectTo");
  const resolvedRedirectTo = isSafeInternalRedirect(queryRedirectTo) ? queryRedirectTo : redirectTo;
  if (user && onboardingComplete) return <Navigate to={resolvedRedirectTo} replace />;
  return children;
}
