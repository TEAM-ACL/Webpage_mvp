import type { JSX } from "react";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { api, storeSession } from "../lib/api";

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await api.login(email, password);
      storeSession(session);
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-secondary/5 rounded-full blur-[100px]" />

      <header className="fixed top-0 w-full z-50 glass-panel flex justify-between items-center px-8 h-20">
        <div className="text-2xl font-bold tracking-tighter text-primary font-headline">VisionTech</div>
        <div className="flex items-center gap-4">
          <span className="text-on-surface-variant font-medium text-sm hidden sm:inline">New here?</span>
          <Link
            to="/signup"
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative"
        >
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2rem] p-8 md:p-12 shadow-2xl relative z-10 border border-white/20">
            <div className="mb-10 text-left">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-3">Welcome back</h1>
              <p className="text-on-surface-variant font-sans opacity-70 leading-relaxed">
                Enter your credentials to access your intelligence workspace
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-secondary transition-colors h-5 w-5" />
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:bg-white transition-all text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Password
                  </label>
                  <button type="button" className="font-label text-xs font-bold text-secondary hover:underline transition-all">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-secondary transition-colors h-5 w-5" />
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 focus:bg-[#1f0954] transition-all text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1f0954] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-container-high" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-on-surface-variant/40 font-label font-bold tracking-widest">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SocialButton label="Google" icon="https://www.google.com/favicon.ico" />
              <SocialButton label="LinkedIn" icon="https://www.linkedin.com/favicon.ico" />
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full border-t border-surface-container-high bg-surface-container-low flex flex-col md:flex-row justify-between items-center px-12 py-8">
        <div className="mb-4 md:mb-0">
          <span className="font-headline font-bold text-primary">VisionTech</span>
          <p className="text-on-surface-variant/60 font-sans text-xs mt-1">© 2026 VisionTech AI. All rights reserved.</p>
        </div>
        <div className="flex gap-8">
          <Link className="text-on-surface-variant/60 hover:text-primary transition-colors font-sans text-sm" to="#">
            Privacy Policy
          </Link>
          <Link className="text-on-surface-variant/60 hover:text-primary transition-colors font-sans text-sm" to="#">
            Terms of Service
          </Link>
          <Link className="text-on-surface-variant/60 hover:text-primary transition-colors font-sans text-sm" to="#">
            Security
          </Link>
          <Link className="text-on-surface-variant/60 hover:text-primary transition-colors font-sans text-sm" to="#">
            Status
          </Link>
        </div>
      </footer>
    </div>
  );
}

function SocialButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button className="flex items-center justify-center gap-3 bg-surface-container-low border border-surface-container-high py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all active:scale-95">
      <img alt={label} className="w-5 h-5" src={icon} referrerPolicy="no-referrer" />
      <span className="font-label font-bold text-sm text-on-surface-variant">{label}</span>
    </button>
  );
}
