import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, Search, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Intelligence', path: '/' },
    { name: 'Workspace', path: '/workspace' },
    { name: 'Network', path: '/network' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-panel shadow-[0_12px_40px_rgba(25,28,29,0.04)]">
      <nav className="flex justify-between items-center px-6 md:px-8 h-20 w-full max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">
          NeonCurator
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
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-on-surface-variant font-medium hover:text-primary"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="relative hidden lg:block">
            <input
              className="bg-surface-container-high border-none rounded-full px-5 py-2 text-sm focus:ring-2 focus:ring-secondary w-64 transition-all"
              placeholder="Search..."
              type="text"
            />
            <Search className="absolute right-4 top-2.5 w-4 h-4 text-on-surface-variant/50" />
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <Link to="/onboarding">
              <img
                alt="User Profile"
                className="w-10 h-10 rounded-full border-2 border-secondary/20 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIYUDHKTNyKPp5XA4Df-fOlyFdKT21sSrQgrYXMHP3BuQrSm8ZjheScD3S2RRJS04yvBS5aRzE2YKpX6Z1ToqzY2ZLFZ7hJ6BPvDsWBRthykOwNqu475mHb55jS727aghKuWrZ__-uhl0l5apmuWd98XUZpde1oMSGORsiudoGelr-nCJ_FzWzIDNT3scdUBR9NZzZkR6ejwSq11BYlQWsLf8t4fqOq0fjychvEgX1yBZGLF2aPCCfyW7q792utoL53e7bxiWZXX_y"
                referrerPolicy="no-referrer"
              />
            </Link>
            <button 
              className="md:hidden p-2 text-on-surface-variant"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden glass-panel border-t border-outline-variant/10 p-4 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "block text-lg font-headline tracking-tight p-2 rounded-lg",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-on-surface-variant font-medium"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant/10 bg-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold tracking-tighter text-primary font-headline mb-6">NeonCurator</div>
            <p className="text-on-surface-variant max-w-sm font-sans leading-relaxed">
              Engineering the next era of collaborative intelligence. Our platform bridges the gap between raw data and creative execution.
            </p>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-primary mb-6">Platform</h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant/70">
              <li><a className="hover:text-primary transition-colors" href="#">Intelligence Suite</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Network Access</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Workspace Tools</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-primary mb-6">Resources</h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant/70">
              <li><a className="hover:text-primary transition-colors" href="#">API Documentation</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">AI Ethics Charter</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Innovation Reports</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/10 font-label text-[11px] uppercase tracking-widest">
          <span className="text-on-surface-variant/60 mb-4 md:mb-0">© 2024 NEON CURATOR AI. ENGINEERING THE FUTURE.</span>
          <div className="flex space-x-8">
            <a className="text-on-surface-variant/60 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant/60 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
            <a className="text-on-surface-variant/60 hover:opacity-100 transition-opacity" href="#">AI Ethics</a>
            <a className="text-on-surface-variant/60 hover:opacity-100 transition-opacity" href="#">API Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
