import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Search, Linkedin, Instagram, Youtube, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { signOut } from '../lib/auth';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      sessionStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      sessionStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // best-effort
    } finally {
      signOut();
      navigate("/login");
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Intelligence', path: '/intelligence' },
    { name: 'Workspace', path: '/workspace' },
    { name: 'Network', path: '/network' },
    { name: 'Admin', path: '/admin' },
    { name: 'About', path: '/about' },
  ];

  // Hide auth CTA buttons on onboarding (user just signed up/logged in) to reduce redundancy.
  const hideAuthCtas = location.pathname.startsWith("/onboarding");

  return (
    <header className="fixed top-0 w-full z-50 shadow-[0_12px_40px_rgba(25,28,29,0.08)]" style={{ backgroundColor: '#1f0954' }}>
      <nav className="flex justify-between items-center px-6 md:px-8 h-20 w-full max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-white font-headline">
          VisionTech
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-headline tracking-tight transition-all duration-300",
                location.pathname === item.path
                  ? "text-white font-bold border-b-2 border-white"
                  : "text-white/70 font-medium hover:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="relative hidden lg:block">
            <input
              className="bg-white/10 text-white placeholder-white/70 border-none rounded-full px-5 py-2 text-sm focus:ring-2 focus:ring-secondary w-64 transition-all"
              placeholder="Search..."
              type="text"
            />
            <Search className="absolute right-4 top-2.5 w-4 h-4 text-white/60" />
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 text-white/70 hover:text-white transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIYUDHKTNyKPp5XA4Df-fOlyFdKT21sSrQgrYXMHP3BuQrSm8ZjheScD3S2RRJS04yvBS5aRzE2YKpX6Z1ToqzY2ZLFZ7hJ6BPvDsWBRthykOwNqu475mHb55jS727aghKuWrZ__-uhl0l5apmuWd98XUZpde1oMSGORsiudoGelr-nCJ_FzWzIDNT3scdUBR9NZzZkR6ejwSq11BYlQWsLf8t4fqOq0fjychvEgX1yBZGLF2aPCCfyW7q792utoL53e7bxiWZXX_y"
                  referrerPolicy="no-referrer"
                />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white/95 text-on-surface shadow-2xl border border-white/40 backdrop-blur-lg py-2 z-50">
                  <Link className="block px-4 py-2 hover:bg-surface-container-high rounded-xl" to="/profile" onClick={() => setProfileOpen(false)}>
                    Profile
                  </Link>
                  <Link className="block px-4 py-2 hover:bg-surface-container-high rounded-xl" to="/settings" onClick={() => setProfileOpen(false)}>
                    Settings
                  </Link>
                  <Link className="block px-4 py-2 hover:bg-surface-container-high rounded-xl" to="/onboarding" onClick={() => setProfileOpen(false)}>
                    My Pathway
                  </Link>
                  <Link className="block px-4 py-2 hover:bg-surface-container-high rounded-xl" to="/workspace" onClick={() => setProfileOpen(false)}>
                    Workspace
                  </Link>
                  <Link className="block px-4 py-2 hover:bg-surface-container-high rounded-xl" to="/network" onClick={() => setProfileOpen(false)}>
                    Network
                  </Link>
                  <button
                    className="flex w-full items-center justify-between px-4 py-2 hover:bg-surface-container-high rounded-xl"
                    onClick={() => { toggleTheme(); }}
                    type="button"
                  >
                    <span>Theme</span>
                    <span className="text-xs font-semibold">{darkMode ? "Dark" : "Light"}</span>
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl"
                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                    type="button"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>

          {!hideAuthCtas && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-white hover:text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-white/30"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-white/15 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-white/30"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1f0954] border-t border-white/10 shadow-lg">
          <div className="px-6 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-base font-headline tracking-tight transition-colors",
                  location.pathname === item.path ? "text-white font-semibold" : "text-white/80 hover:text-white"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!hideAuthCtas && (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  className="flex-1 text-center text-white bg-white/10 hover:bg-white/20 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center text-[#1f0954] bg-white hover:bg-slate-100 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex-1 text-center text-white/80 border border-white/20 hover:border-white/40 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant/0 bg-[#1f0954] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold tracking-tighter text-white font-headline mb-6">VisionTech</div>
            <p className="text-white/80 max-w-sm font-sans leading-relaxed">
              Engineering the next era of collaborative intelligence. Our platform bridges the gap between raw data and creative execution.
            </p>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm font-medium text-white/70">
              <li><a className="hover:text-white transition-colors" href="#">Intelligence Suite</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Network Access</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Workspace Tools</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm font-medium text-white/70">
              <li><a className="hover:text-white transition-colors" href="#">API Documentation</a></li>
              <li><a className="hover:text-white transition-colors" href="#">AI Ethics Charter</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Innovation Reports</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-white mb-6">Contact</h4>
            <ul className="space-y-3 text-sm font-medium text-white/80">
              <li>Email: <span className="text-white">hello@visiontech.ai</span></li>
              <li>Address: <span className="text-white">123 Innovation Way, London, UK</span></li>
              <li className="text-white/70 text-xs">Partnerships, pilots, and enterprise programs welcome.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-white mb-6">Social</h4>
            <ul className="flex flex-wrap gap-4 text-sm font-medium text-white/80 items-center">
              <li>
                <a className="hover:text-white transition-colors inline-flex items-center gap-2" href="#">
                  <Linkedin className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors inline-flex items-center gap-2" href="#">
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">Instagram</span>
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors inline-flex items-center gap-2" href="#">
                  <Youtube className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">YouTube</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/10 font-label text-[11px] uppercase tracking-widest">
          <span className="text-white/60 mb-4 md:mb-0">© 2026 VISIONTECH AI. EMPOWERING THE FUTURE.</span>
          <div className="flex space-x-8">
          <a className="text-white/60 hover:text-white transition-opacity" href="#">Privacy Policy</a>
            <a className="text-white/60 hover:text-white transition-opacity" href="#">Terms of Service</a>
            <a className="text-white/60 hover:text-white transition-opacity" href="#">AI Ethics</a>
            <a className="text-white/60 hover:text-white transition-opacity" href="#">API Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
