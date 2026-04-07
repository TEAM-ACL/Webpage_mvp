import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { getOnboardingComplete, getUser, isAuthenticated, isAdmin } from "../lib/auth";

type Props = { children: JSX.Element };

export function RequireAuth({ children }: Props): JSX.Element {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

export function RequireOnboardingComplete({ children }: Props): JSX.Element {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!getOnboardingComplete()) return <Navigate to="/onboarding" replace />;
  return children;
}

export function RequireAdmin({ children }: Props): JSX.Element {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/intelligence" replace />;
  return children;
}

export function RedirectIfOnboarded({ children }: Props): JSX.Element {
  const user = getUser();
  if (user && getOnboardingComplete()) return <Navigate to="/intelligence" replace />;
  return children;
}
