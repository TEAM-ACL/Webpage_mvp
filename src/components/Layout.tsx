import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CreditCard,
  Home as HomeIcon,
  Info,
  Instagram,
  LayoutDashboard,
  Linkedin,
  LogIn,
  Menu,
  Network,
  Search,
  Settings,
  UserPlus,
  X,
  Youtube,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Platform', path: '/platform', icon: LayoutDashboard },
    { name: 'Pricing', path: '/pricing', icon: CreditCard },
    ...(user
      ? [
        { name: 'Intelligence', path: '/intelligence', icon: BarChart3 },
        { name: 'Workspace', path: '/workspace', icon: Zap },
        { name: 'Network', path: '/network', icon: Network },
      ]
      : []),
    { name: 'About', path: '/about', icon: Info },
  ];

  // Hide auth CTAs when user is logged in, or on onboarding/profile pages.
  const hideAuthCtas = !!user || location.pathname.startsWith("/onboarding") || location.pathname.startsWith("/profile");

  return (
    <header className="fixed top-0 w-full z-50 shadow-[0_12px_40px_rgba(25,28,29,0.08)]" style={{ backgroundColor: '#1f0954' }}>
      <nav className="flex justify-between items-center px-6 md:px-8 h-20 w-full max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-white font-headline">
          VisionTech
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-headline tracking-tight transition-all duration-300",
                  isActive
                    ? "text-white font-bold border-b-2 border-white"
                    : "text-white/70 font-medium hover:text-white"
                )}
              >
                {item.name}
              </Link>
            );
          })}
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
          
          {user && (
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
                      onClick={() => { toggleMode(); }}
                      type="button"
                    >
                      <span>Theme</span>
                      <span className="text-xs font-semibold">{isDark ? "Dark" : "Light"}</span>
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
          )}

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
                  "inline-flex items-center gap-3 text-base font-headline tracking-tight transition-colors",
                  location.pathname === item.path ? "text-white font-semibold" : "text-white/80 hover:text-white"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
            {!hideAuthCtas && (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  className="inline-flex flex-1 items-center justify-center gap-2 text-white bg-white/10 hover:bg-white/20 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex flex-1 items-center justify-center gap-2 text-[#1f0954] bg-white hover:bg-slate-100 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Sign up
                </Link>
              </div>
            )}
            {user && (
              <button
                type="button"
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex-1 text-center text-white/80 border border-white/20 hover:border-white/40 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Platform", to: "/platform" },
    { label: "Pricing", to: "/pricing" },
    { label: "About", to: "/about" },
  ];

  const productLinks = [
    { label: "AI Intelligence", to: "/intelligence" },
    { label: "Action Workspace", to: "/workspace" },
    { label: "Network", to: "/network" },
    { label: "Organisation Dashboard", to: "/organisation" },
  ];

  const audienceLinks = [
    { label: "For Learners", to: "/signup" },
    { label: "For Organisations", to: "/organization-auth" },
    { label: "Admin Access", to: "/admin/login" },
    { label: "Profile Setup", to: "/onboarding" },
  ];

  const legalLinks = ["Privacy Policy", "Terms of Service", "AI Ethics", "Security"];

  return (
    <footer className="w-full border-t border-outline-variant/0 bg-[#1f0954] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 gap-10 mb-14 lg:grid-cols-[1.45fr_1fr_1fr_1fr_1.15fr]">
          <div>
            <Link to="/" className="inline-flex text-2xl font-bold tracking-tighter text-white font-headline mb-5">
              VisionTech
            </Link>
            <p className="text-white/80 max-w-sm font-sans leading-relaxed">
              AI-powered career intelligence for learners, mentors, and organisations turning potential into opportunity readiness.
            </p>
            <div className="flex gap-3 mt-6">
              <a className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center justify-center text-white" href="#" aria-label="VisionTech on LinkedIn">
                <Linkedin className="w-4 h-4" aria-hidden="true" />
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center justify-center text-white" href="#" aria-label="VisionTech on Instagram">
                <Instagram className="w-4 h-4" aria-hidden="true" />
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center justify-center text-white" href="#" aria-label="VisionTech on YouTube">
                <Youtube className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-white mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm font-medium text-white/70">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link className="hover:text-white transition-colors" to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-white mb-6">Products</h4>
            <ul className="space-y-3 text-sm font-medium text-white/70">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link className="hover:text-white transition-colors" to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-white mb-6">For Users</h4>
            <ul className="space-y-3 text-sm font-medium text-white/70">
              {audienceLinks.map((link) => (
                <li key={link.to}>
                  <Link className="hover:text-white transition-colors" to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-white mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm font-medium text-white/80">
              <li>
                <span className="block text-white/50 text-xs uppercase tracking-widest mb-1">Email</span>
                <a className="text-white hover:text-white/80 transition-colors" href="mailto:hello@visiontech.ai">hello@visiontech.ai</a>
              </li>
              <li>
                <span className="block text-white/50 text-xs uppercase tracking-widest mb-1">Partnerships</span>
                <Link className="text-white/80 hover:text-white transition-colors" to="/organization-auth">Create an organisation account</Link>
              </li>
              <li>
                <span className="block text-white/50 text-xs uppercase tracking-widest mb-1">Support</span>
                <Link className="text-white/80 hover:text-white transition-colors" to="/login">Sign in for account help</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-6 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-headline text-xl font-bold tracking-tight text-white">Ready to turn insight into progress?</p>
            <p className="text-sm text-white/70 mt-1">Start with your AI pathway, then build evidence in the workspace.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#1f0954] hover:bg-white/90 transition-colors text-center" to="/signup">
              Get Started
            </Link>
            <Link className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors text-center" to="/organization-auth">
              Organisation Access
            </Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center pt-8 border-t border-white/10 font-label text-[11px] uppercase tracking-widest">
          <span className="text-white/60">© 2026 VisionTech AI. Empowering the future.</span>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {legalLinks.map((link) => (
              <a key={link} className="text-white/60 hover:text-white transition-opacity" href="#">{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
