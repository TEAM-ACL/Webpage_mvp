/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import Onboarding from './pages/Onboarding';
import Admin from './pages/Admin';
import Network from './pages/Network';
import About from './pages/About';
import Login from './pages/login';
import SignUp from './pages/signup';
import Intelligence from './pages/Intelligence';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider } from './context/AuthContext';
import ResetPassword from './pages/ResetPassword';
import { RequireAdmin, RequireAuth, RequireOnboardingComplete, RedirectIfOnboarded } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Standalone layouts (no global header/footer) */}
            <Route path="/login" element={<RedirectIfOnboarded><Login /></RedirectIfOnboarded>} />
            <Route path="/signup" element={<RedirectIfOnboarded><SignUp /></RedirectIfOnboarded>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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
  );
}
