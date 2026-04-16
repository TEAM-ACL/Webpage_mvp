import type { JSX } from "react";
import { useState } from "react";
import { Lock, ArrowRight, ArrowLeft, User, AtSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, storeSession } from "../lib/api";
import { setOnboardingComplete } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp(): JSX.Element {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const friendlyError = (message: string) => {
    if (message.toLowerCase().includes("failed to fetch")) {
      return "Can't reach the server. Check your connection or try again in a moment.";
    }
    if (message.toLowerCase().includes("timeout")) {
      return "The request timed out. Please retry.";
    }
    return message || "Unable to create account. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!cleanFirstName) {
      setError("First name is required.");
      return;
    }
    if (cleanFirstName.length > 100 || cleanLastName.length > 100) {
      setError("First name and last name must be 100 characters or fewer.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password.length > 128) {
      setError("Password must be 128 characters or fewer.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("Please accept the terms to continue.");
      return;
    }
    setError(null);
    setSuccess(null);
    setVerificationEmail(null);
    setLoading(true);
    try {
      const session = await api.register({
        email: cleanEmail,
        password,
        display_name: `${cleanFirstName} ${cleanLastName}`.trim() || cleanEmail,
        first_name: cleanFirstName,
        last_name: cleanLastName || undefined,
      });
      if (!session.access_token) {
        setSuccess("Account created. Please check your email and verify your address before logging in.");
        setVerificationEmail(cleanEmail);
        return;
      }

      storeSession(session);
      setUser(session.user);
      setOnboardingComplete(false);
      navigate("/onboarding");
    } catch (err) {
      setError(friendlyError((err as Error).message));
    } finally {
      // Clear sensitive data from memory after submission
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    setError(null);
    setSuccess(null);
    setResending(true);
    try {
      await api.resendVerificationEmail(verificationEmail, `${window.location.origin}/auth/callback`);
      setSuccess("Verification email resent. Please check your inbox.");
    } catch (err) {
      setError(friendlyError((err as Error).message));
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full">
      {/* Left Side */}
      <section className="relative hidden md:flex flex-col justify-between p-16 overflow-hidden bg-[#1f0954] text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
              <Zap className="text-white h-5 w-5 fill-current" />
            </div>
            <Link to="/" className="font-headline font-bold text-2xl tracking-tighter text-white">VisionTech</Link>
          </div>
          <div className="max-w-md">
            <h1 className="font-headline text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Join the next paradigm shift
            </h1>
            <p className="text-white/80 font-sans text-lg leading-relaxed">
              Where artificial intelligence meets curated human intuition. Step into the future of endless possibilities.
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="p-8 rounded-xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10">
            <span className="text-white/70 text-4xl mb-4 block font-serif">"</span>
            <blockquote className="text-white font-sans italic text-xl leading-snug mb-4">
              The world needs dreamers and the world needs doers. But above all,  what the world needs most are dreamers that do.
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white text-[#1f0954] flex items-center justify-center font-headline font-bold">SBB</div>
              <div>
                <cite className="not-italic block font-headline font-bold text-white">Sarah Ban Breathnach</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side */}
      <section className="flex flex-col justify-center items-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" /> Back home
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2 mb-12">
            <Link to="/" className="font-headline font-bold text-3xl tracking-tighter text-primary">VisionTech</Link>
          </div>
          <div className="mb-10">
            <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-2">Begin your evolution</h2>
            <p className="text-on-surface-variant font-sans opacity-70">
              Create your workstation and start curating with AI precision.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">First Name</label>
                <div className="relative">
                  <input
                    className="w-full px-5 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                    placeholder="Alex"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Last Name</label>
                <div className="relative">
                  <input
                    className="w-full px-5 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                    placeholder="Sterling"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Email Address</label>
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                  placeholder="visiontech@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Password</label>
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface placeholder:text-on-surface-variant/40 transition-all pr-12"
                  placeholder="••••••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Lock className="absolute right-11 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-secondary transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Confirm Password</label>
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface placeholder:text-on-surface-variant/40 transition-all pr-12"
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Lock className="absolute right-11 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-secondary transition-colors"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <input
                className="mt-1 rounded border-surface-container-high text-primary focus:ring-primary h-4 w-4"
                id="terms"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label className="text-sm text-on-surface-variant leading-tight" htmlFor="terms">
                I agree to the{" "}
                <Link className="text-primary font-semibold hover:underline" to="#">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="text-primary font-semibold hover:underline" to="#">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                {success}
              </p>
            )}
            {verificationEmail && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full text-sm font-semibold text-primary border border-primary/30 rounded-lg px-4 py-2 hover:bg-primary/5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {resending ? "Resending..." : "Resend verification email"}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#1f0954] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white font-headline font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Create Account"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          <div className="mt-12 text-center">
            <p className="text-on-surface-variant font-sans">
              Already have an account?
              <Link className="text-secondary font-bold hover:text-primary transition-colors ml-1" to="/login">
                Sign in
              </Link>
            </p>
          </div>
          <div className="mt-16 pt-8 border-t border-surface-container-high flex justify-between items-center text-[10px] font-label uppercase tracking-widest text-on-surface-variant/40">
            <span>© 2026 VISIONTECH AI</span>
            <div className="flex gap-4">
              <Link className="hover:text-primary" to="#">
                Status
              </Link>
              <Link className="hover:text-primary" to="#">
                Security
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

