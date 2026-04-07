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

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Standalone layouts (no global header/footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Other pages share the main layout */}
          <Route
            path="*"
            element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow pt-24 pb-16">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/workspace" element={<Workspace />} />
                    <Route path="/network" element={<Network />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/intelligence" element={<Intelligence />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}





