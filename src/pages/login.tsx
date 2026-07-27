import type { JSX } from "react";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Lock, Mail, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, storeSession } from "../lib/api";
import { setAdminFlag } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { toUserMessage } from "../lib/userErrors";
import { getEmailConfirmationRedirectUrl } from "../lib/authRedirects";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailConfirmationRedirectUrl = getEmailConfirmationRedirectUrl();

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useToast();
  const { setUser, refreshProfile, onboardingComplete } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);

  useEffect(() => {
    const state = location.state as { email?: string; password?: string; verificationMessage?: string } | null;
    if (state?.email) setEmail(state.email);
    if (state?.password) setPassword(state.password);
    if (state?.verificationMessage) {
      setNotice(state.verificationMessage);
      showSuccess(state.verificationMessage);
    }
  }, [location.state, showSuccess]);

  const isVerificationError = (message: string) => {
    const lower = message.toLowerCase();
    return lower.includes("not confirmed") || lower.includes("verify") || lower.includes("confirmation");
  };

  const friendlyError = (message: string) => {
    if (isVerificationError(message)) {
      return "Please verify your email before logging in. Check your inbox for the verification link.";
    }
    return toUserMessage(message, "Unable to sign in. Please try again.");
  };

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
    setNotice(null);
    setShowResendVerification(false);
    setLoading(true);

    try {
      const session = await api.login(cleanEmail, password);
      storeSession(session);
      setUser(session.user);
      setAdminFlag(false);

      const prof = await refreshProfile();
      const onboardingStage = (session.user.onboarding_stage ?? "").toLowerCase();
      const doneFromSession = onboardingStage === "assessment_completed";
      const explicitIncomplete = prof?.isOnboardingComplete === false;
      const done = explicitIncomplete
        ? false
        : (prof?.isOnboardingComplete ?? doneFromSession ?? onboardingComplete ?? true);
      const state = location.state as { redirectTo?: string } | null;
      const redirectTo = state?.redirectTo;
      const isSafeInternalRedirect = typeof redirectTo === "string" && redirectTo.startsWith("/");

      if (isSafeInternalRedirect) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate(done ? "/intelligence" : "/onboarding");
      }
    } catch (err) {
      const message = (err as Error).message;
      setShowResendVerification(isVerificationError(message));
      const friendly = friendlyError(message);
      setError(friendly);
      showError(friendly);
    } finally {
      setPassword("");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      const message = "Enter a valid email before resending verification.";
      setError(message);
      showError(message);
      return;
    }

    setError(null);
    setNotice(null);
    setResending(true);

    try {
      await api.resendVerificationEmail(cleanEmail, emailConfirmationRedirectUrl);
      const message = "Verification email sent. Please check your inbox.";
      setNotice(message);
      showSuccess(message);
    } catch (err) {
      const message = friendlyError((err as Error).message);
      setError(message);
      showError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-[#12063a] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(216,207,252,0.24),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(96,165,250,0.14),transparent_32%)]" />
        <Link to="/" className="relative inline-flex items-center gap-3 font-headline text-2xl font-bold tracking-tighter text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/10">
            <Sparkles className="h-5 w-5" />
          </span>
          VisionTech
        </Link>
        <div className="relative max-w-xl">
          <p className="font-label text-xs font-black uppercase tracking-[0.28em] text-[#d8cffc]">Welcome Back</p>
          <h1 className="mt-5 font-headline text-5xl font-black leading-tight tracking-tight">
            Continue your intelligence journey.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/78">
            Return to your AI insight, workspace actions, network, and opportunity readiness from one focused account.
          </p>
        </div>
        <Link to="/organization-auth" className="relative inline-flex w-fit items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white">
          Organisation access <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 md:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <Link to="/" className="font-headline text-2xl font-bold tracking-tighter text-primary lg:hidden">VisionTech</Link>
          </div>

          <div className="mb-8">
            <p className="font-label text-xs font-black uppercase tracking-[0.24em] text-primary">Talent Login</p>
            <h2 className="mt-3 font-headline text-4xl font-black tracking-tight text-on-surface">Sign in to VisionTech</h2>
            <p className="mt-4 text-base leading-7 text-on-surface-variant">
              Access your intelligence, workspace, network, and opportunity guidance.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="ml-1 font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/40" />
                <input
                  className="w-full rounded-xl border-none bg-surface-container-high py-4 pl-12 pr-4 text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:bg-white focus:ring-2 focus:ring-secondary/20"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password</label>
                <Link to="/forgot-password" className="font-label text-xs font-bold text-secondary transition-all hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/40" />
                <input
                  className="w-full rounded-xl border-none bg-surface-container-high py-4 pl-12 pr-16 text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:bg-white focus:ring-2 focus:ring-secondary/20"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-secondary">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            {notice && <p className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}
            {showResendVerification && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? "Resending..." : "Resend verification email"}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f0954] px-6 py-4 font-headline text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 space-y-4 text-center text-sm text-on-surface-variant">
            <p>
              New to VisionTech?
              <Link className="ml-1 font-bold text-secondary transition-colors hover:text-primary" to="/signup">
                Create account
              </Link>
            </p>
            <Link to="/organization-auth" className="inline-flex items-center justify-center gap-2 font-semibold text-primary hover:underline lg:hidden">
              <Building2 className="h-4 w-4" /> Organisation access
            </Link>
          </div>

          <div className="mt-10 flex justify-between border-t border-surface-container-high pt-6 text-[10px] font-label uppercase tracking-widest text-on-surface-variant/40">
            <span>© 2026 VisionTech AI</span>
            <Link className="hover:text-primary" to="#">
              Security
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
