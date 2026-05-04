import type { JSX } from "react";
import { useState } from "react";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { api, storeSession } from "../lib/api";
import { setAdminFlag } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { toUserMessage } from "../lib/userErrors";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasAdminRole = (role: string | null | undefined): boolean => {
  const normalized = (role || "").toLowerCase();
  return normalized === "admin" || normalized === "super_admin" || normalized === "superadmin";
};
const isAllowedAdminEmail = (value: string): boolean => value.trim().toLowerCase().endsWith("@visiontech.ai");

export default function AdminLogin(): JSX.Element {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      const message = "Please enter a valid email address.";
      setError(message);
      showError(message);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const session = await api.login(cleanEmail, password);
      const hasAdminAccess = hasAdminRole(session.user.role) || isAllowedAdminEmail(session.user.email);
      if (!hasAdminAccess) {
        const message = "This account does not have admin access.";
        setError(message);
        showError(message);
        return;
      }
      storeSession(session);
      setUser(session.user);
      setAdminFlag(true);
      navigate("/admin");
    } catch (err) {
      const message = toUserMessage(err, "Unable to sign in to admin.");
      setError(message);
      showError(message);
    } finally {
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      <header className="fixed top-0 w-full z-50 glass-panel flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-4">
          <Link to="/login" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> User Login
          </Link>
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">VisionTech</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-20 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/20">
            <div className="mb-10 text-left">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-3">Admin Login</h1>
              <p className="text-on-surface-variant font-sans opacity-70 leading-relaxed">
                Sign in with an admin account to access the control centre.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface"
                    placeholder="admin@visiontech.ai"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-16 text-on-surface"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1f0954] hover:bg-black disabled:opacity-60 text-white py-4 rounded-xl font-headline font-bold text-lg"
              >
                {loading ? "Signing in..." : "Sign In as Admin"}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
