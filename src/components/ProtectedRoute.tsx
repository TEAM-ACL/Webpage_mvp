import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

type Props = { children: JSX.Element };

export function RequireAuth({ children }: Props): JSX.Element {
  const { user, loading } = useAuth();
  if (loading) return <></>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireOnboardingComplete({ children }: Props): JSX.Element {
  const { user, loading, profileLoading, onboardingComplete } = useAuth();
  if (loading || profileLoading) return <></>;
  if (!user) return <Navigate to="/login" replace />;
  if (!onboardingComplete) {
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
  if (!isAdmin()) return <Navigate to="/intelligence" replace />;
  return children;
}

export function RedirectIfOnboarded({ children }: Props): JSX.Element {
  const { user, loading, profileLoading, onboardingComplete } = useAuth();
  if (loading || profileLoading) return <></>;
  if (user && onboardingComplete) return <Navigate to="/intelligence" replace />;
  return children;
}
