/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import Onboarding from './pages/Onboarding';
import Admin from './pages/Admin';
import Network from './pages/Network';
import Organisation from './pages/Organisation';
import OrganisationMembers from './pages/organisation/OrganisationMembers';
import OrganisationPlaceholder from './pages/organisation/OrganisationPlaceholder';
import About from './pages/About';
import Platform from './pages/Platform';
import Pricing from './pages/Pricing';
import Login from './pages/login';
import AdminLogin from './pages/AdminLogin';
import SignUp from './pages/signup';
import OrganizationAuth from './pages/OrganizationAuth';
import OrganizationLogin from './pages/OrganizationLogin';
import OrganizationSignup from './pages/OrganizationSignup';
import PublicOrganisationEntry from './pages/PublicOrganisationEntry';
import Intelligence from './pages/Intelligence';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { OrganisationProvider, useOrganisation } from './context/OrganisationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ResetPassword from './pages/ResetPassword';
import { RequireAdmin, RequireAuth, RequireOnboardingComplete, RequireOrganisationAdmin, RedirectIfOnboarded } from './components/ProtectedRoute';
import { hasOrganisationDashboardAccessForUser } from './lib/auth';

function AuthHashBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(window.location.search);
    const readParam = (key: string): string | null => hashParams.get(key) ?? queryParams.get(key);

    const accessToken = readParam('access_token');
    const refreshToken = readParam('refresh_token');
    const callbackType = readParam('type');
    const callbackError = readParam('error');
    const callbackErrorCode = readParam('error_code');
    const callbackErrorDescription = readParam('error_description');

    if (callbackError || callbackErrorCode) {
      const nextParams = new URLSearchParams();
      if (callbackError) nextParams.set('error', callbackError);
      if (callbackErrorCode) nextParams.set('error_code', callbackErrorCode);
      if (callbackErrorDescription) nextParams.set('error_description', callbackErrorDescription);
      if (callbackType) nextParams.set('type', callbackType);

      const recoveryErrorTarget = `/reset-password?${nextParams.toString()}`;
      const callbackErrorTarget = `/auth/callback?${nextParams.toString()}`;

      if (callbackType === 'recovery' && location.pathname !== '/reset-password') {
        navigate(recoveryErrorTarget, { replace: true });
        return;
      }

      if (location.pathname !== '/auth/callback') {
        navigate(callbackErrorTarget, { replace: true });
      }
      return;
    }

    if (!accessToken && !refreshToken) {
      return;
    }

    if (accessToken) {
      sessionStorage.setItem('access_token', accessToken);
    }
    if (refreshToken) {
      sessionStorage.setItem('refresh_token', refreshToken);
    }

    if (callbackType === 'recovery' && location.pathname !== '/reset-password') {
      navigate('/reset-password', { replace: true });
      return;
    }

    if (location.pathname !== '/auth/callback') {
      navigate('/auth/callback', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}

function OrganisationIndexRedirect() {
  const { organisationBasePath } = useOrganisation();
  return <Navigate to={organisationBasePath} replace />;
}

function TenantLoginRedirect() {
  const { organisationSlug = '' } = useParams();
  const redirectTo = organisationSlug ? `/org/${organisationSlug}/continue` : '/intelligence';
  return <Navigate to={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} replace />;
}

function TenantSignupRedirect() {
  const { organisationSlug = '' } = useParams();
  const redirectTo = organisationSlug ? `/org/${organisationSlug}/continue` : '/intelligence';
  const queryParams = new URLSearchParams({ organisationSlug, redirectTo });
  return <Navigate to={`/signup?${queryParams.toString()}`} replace />;
}

function TenantAccessContinuation() {
  const { organisationSlug = '' } = useParams();
  const { user, profile, loading, profileLoading, onboardingComplete } = useAuth();

  if (loading || profileLoading) return <></>;
  if (!user) {
    return <Navigate to={organisationSlug ? `/org/${organisationSlug}/login` : '/login'} replace />;
  }

  const role = profile?.role || user.role;
  if (hasOrganisationDashboardAccessForUser(role, user.email)) {
    return <Navigate to={organisationSlug ? `/organisation/${organisationSlug}` : '/organisation'} replace />;
  }

  if (onboardingComplete === false) {
    const redirectTo = organisationSlug ? `/org/${organisationSlug}/continue` : '/intelligence';
    return <Navigate to="/onboarding" replace state={{ redirectTo }} />;
  }

  return <Navigate to={organisationSlug ? `/intelligence?organisationSlug=${encodeURIComponent(organisationSlug)}` : '/intelligence'} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <OrganisationProvider>
              <AuthHashBridge />
              <div className="min-h-screen flex flex-col">
            <Routes>
            {/* Standalone layouts (no global header/footer) */}
            <Route path="/login" element={<RedirectIfOnboarded><Login /></RedirectIfOnboarded>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/organization-auth" element={<RedirectIfOnboarded redirectTo="/organisation"><OrganizationAuth /></RedirectIfOnboarded>} />
            <Route path="/organization-login" element={<RedirectIfOnboarded redirectTo="/organisation"><OrganizationLogin /></RedirectIfOnboarded>} />
            <Route path="/organization-signup" element={<RedirectIfOnboarded redirectTo="/organisation"><OrganizationSignup /></RedirectIfOnboarded>} />
            <Route path="/org/:organisationSlug" element={<PublicOrganisationEntry />} />
            <Route path="/org/:organisationSlug/login" element={<TenantLoginRedirect />} />
            <Route path="/org/:organisationSlug/signup" element={<TenantSignupRedirect />} />
            <Route path="/org/:organisationSlug/continue" element={<TenantAccessContinuation />} />
            <Route path="/signup" element={<RedirectIfOnboarded><SignUp /></RedirectIfOnboarded>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Dashboard pages use shared shell internally */}
            <Route
              path="/intelligence"
              element={
                <RequireOnboardingComplete>
                  <Intelligence />
                </RequireOnboardingComplete>
              }
            />
            <Route
              path="/workspace"
              element={
                <RequireAuth>
                  <Workspace />
                </RequireAuth>
              }
            />
            <Route
              path="/network"
              element={
                <RequireAuth>
                  <Network />
                </RequireAuth>
              }
            />
            <Route
              path="/organizations"
              element={
                <Navigate to="/organisation" replace />
              }
            />
            <Route
              path="/organisation"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationIndexRedirect />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/:organisationSlug"
              element={
                <RequireOrganisationAdmin>
                  <Organisation />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/members"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationIndexRedirect />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/:organisationSlug/members"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationMembers />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/cohorts"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationIndexRedirect />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/:organisationSlug/cohorts"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationPlaceholder moduleKey="cohorts" />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/interventions"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationIndexRedirect />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/:organisationSlug/interventions"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationPlaceholder moduleKey="interventions" />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/opportunities"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationIndexRedirect />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/:organisationSlug/opportunities"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationPlaceholder moduleKey="opportunities" />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/reports"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationIndexRedirect />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/:organisationSlug/reports"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationPlaceholder moduleKey="reports" />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/settings"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationIndexRedirect />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/organisation/:organisationSlug/settings"
              element={
                <RequireOrganisationAdmin>
                  <OrganisationPlaceholder moduleKey="settings" />
                </RequireOrganisationAdmin>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              }
            />

            {/* Other pages share the main layout */}
            <Route
              path="*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow pt-24 pb-16">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/platform" element={<Platform />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/about" element={<About />} />
                      <Route
                        path="/onboarding"
                        element={
                          <RequireAuth>
                            <Onboarding />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <RequireAuth>
                            <Profile />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <RequireAuth>
                            <Profile />
                          </RequireAuth>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
            </Routes>
              </div>
            </OrganisationProvider>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
