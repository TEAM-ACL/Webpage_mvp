/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import Onboarding from './pages/Onboarding';
import Admin from './pages/Admin';
import Network from './pages/Network';
import About from './pages/About';
import Login from './pages/login';
import AdminLogin from './pages/AdminLogin';
import SignUp from './pages/signup';
import Intelligence from './pages/Intelligence';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ResetPassword from './pages/ResetPassword';
import { RequireAdmin, RequireAuth, RequireOnboardingComplete, RedirectIfOnboarded } from './components/ProtectedRoute';

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

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AuthHashBridge />
          <div className="min-h-screen flex flex-col">
            <Routes>
            {/* Standalone layouts (no global header/footer) */}
            <Route path="/login" element={<RedirectIfOnboarded><Login /></RedirectIfOnboarded>} />
            <Route path="/admin-login" element={<RedirectIfOnboarded><AdminLogin /></RedirectIfOnboarded>} />
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
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
