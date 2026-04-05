import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Search, Linkedin, Instagram, Youtube } from 'lucide-react';
import { cn } from '../lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Intelligence', path: '/intelligence' },
    { name: 'Workspace', path: '/workspace' },
    { name: 'Network', path: '/network' },
    { name: 'Admin', path: '/admin' },
    { name: 'About', path: '/about' },
    
  ];

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
            <Link to="/onboarding">
              <img
                alt="User Profile"
                className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIYUDHKTNyKPp5XA4Df-fOlyFdKT21sSrQgrYXMHP3BuQrSm8ZjheScD3S2RRJS04yvBS5aRzE2YKpX6Z1ToqzY2ZLFZ7hJ6BPvDsWBRthykOwNqu475mHb55jS727aghKuWrZ__-uhl0l5apmuWd98XUZpde1oMSGORsiudoGelr-nCJ_FzWzIDNT3scdUBR9NZzZkR6ejwSq11BYlQWsLf8t4fqOq0fjychvEgX1yBZGLF2aPCCfyW7q792utoL53e7bxiWZXX_y"
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
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
        </div>
      </nav>

      {/* Mobile Nav */}
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




