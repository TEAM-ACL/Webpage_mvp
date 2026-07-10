import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasOrganisationDashboardAccess, isAdmin } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

type Props = { children: JSX.Element };

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
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || profileLoading) return <></>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const role = profile?.role || user.role;
  if (!hasOrganisationDashboardAccess(role)) {
    return <Navigate to="/intelligence" replace />;
  }

  return children;
}

export function RedirectIfOnboarded({ children }: Props): JSX.Element {
  const { user, loading, profileLoading, onboardingComplete } = useAuth();
  if (loading || profileLoading) return <></>;
  if (user && onboardingComplete) return <Navigate to="/intelligence" replace />;
  return children;
}
