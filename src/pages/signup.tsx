import type { JSX } from "react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, AtSign, BriefcaseBusiness, Building2, Check, Circle, Lock, Sparkles, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, storeSession } from "../lib/api";
import { setOnboardingComplete } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { toUserMessage } from "../lib/userErrors";
import { getEmailConfirmationRedirectUrl } from "../lib/authRedirects";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasLowercase = (value: string) => /[a-z]/.test(value);
const hasSpecialCharacter = (value: string) => /[^A-Za-z0-9]/.test(value);
const emailConfirmationRedirectUrl = getEmailConfirmationRedirectUrl();
const duplicateEmailMessage = "This email is already registered. Try signing in or resending verification.";
const isSafeRedirect = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const isAlreadyRegisteredError = (message: string): boolean => {
  const lower = message.toLowerCase();
  return (
    lower.includes("already registered")
    || lower.includes("already exists")
    || lower.includes("user already")
    || lower.includes("duplicate key")
    || lower.includes("email has already been taken")
    || lower.includes("email already in use")
  );
};

export default function SignUp(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useToast();
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
  const [showTalentForm, setShowTalentForm] = useState(false);
  const meetsMinLength = password.length >= 12;
  const meetsMaxLength = password.length <= 128;
  const meetsUppercase = hasUppercase(password);
  const meetsLowercase = hasLowercase(password);
  const meetsSpecialCharacter = hasSpecialCharacter(password);

  const friendlyError = (message: string) => toUserMessage(message, "Unable to create account. Please try again.");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!emailRegex.test(cleanEmail)) {
      const message = "Please enter a valid email address.";
      setError(message);
      showError(message);
      return;
    }
    if (!cleanFirstName) {
      const message = "First name is required.";
      setError(message);
      showError(message);
      return;
    }
    if (cleanFirstName.length > 100 || cleanLastName.length > 100) {
      const message = "First name and last name must be 100 characters or fewer.";
      setError(message);
      showError(message);
      return;
    }
    if (password.length < 12) {
      const message = "Password must be at least 12 characters.";
      setError(message);
      showError(message);
      return;
    }
    if (password.length > 128) {
      const message = "Password must be 128 characters or fewer.";
      setError(message);
      showError(message);
      return;
    }
    if (!hasUppercase(password) || !hasLowercase(password) || !hasSpecialCharacter(password)) {
      const message = "Password must include uppercase, lowercase, and at least one special character.";
      setError(message);
      showError(message);
      return;
    }
    if (password !== confirmPassword) {
      const message = "Passwords do not match.";
      setError(message);
      showError(message);
      return;
    }
    if (!agree) {
      const message = "Please accept the terms to continue.";
      setError(message);
      showError(message);
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
        redirect_to: emailConfirmationRedirectUrl,
      });

      if (!session.access_token) {
        const message = "Account created. Please check your email and verify your address before logging in.";
        setSuccess(message);
        showSuccess(message);
        setVerificationEmail(cleanEmail);
        return;
      }

      storeSession(session);
      setUser(session.user);
      setOnboardingComplete(false);
      const state = location.state as { redirectTo?: string } | null;
      const queryParams = new URLSearchParams(location.search);
      const redirectTo = state?.redirectTo ?? queryParams.get("redirectTo");
      navigate("/onboarding", isSafeRedirect(redirectTo) ? { state: { redirectTo } } : undefined);
    } catch (err) {
      const rawMessage = (err as Error).message || "";
      const message = isAlreadyRegisteredError(rawMessage)
        ? duplicateEmailMessage
        : friendlyError(rawMessage);
      setError(message);
      showError(message);
      if (isAlreadyRegisteredError(rawMessage)) {
        setVerificationEmail(cleanEmail);
      }
    } finally {
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
      await api.resendVerificationEmail(verificationEmail, emailConfirmationRedirectUrl);
      const message = "Verification email resent. Please check your inbox.";
      setSuccess(message);
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
          <p className="font-label text-xs font-black uppercase tracking-[0.28em] text-[#d8cffc]">VisionTech AI Community</p>
          <h1 className="mt-5 font-headline text-5xl font-black leading-tight tracking-tight">
            Transform ambition into direction, evidence, and opportunity.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/78">
            Join a guided intelligence platform built for talent growth and organisational impact — without fragmented tools or unclear next steps.
          </p>
        </div>
        <div className="relative grid gap-3 text-sm font-semibold text-white/80">
          {["AI-guided career clarity", "Project evidence and readiness", "Mentors, networks, and opportunities"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-[#d8cffc]" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 md:px-10 lg:px-16">
        <div className="w-full max-w-lg">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <Link to="/" className="font-headline text-2xl font-bold tracking-tighter text-primary lg:hidden">VisionTech</Link>
          </div>

          {!showTalentForm ? (
            <>
              <div className="mb-8">
                <p className="font-label text-xs font-black uppercase tracking-[0.24em] text-primary">Choose Your Path</p>
                <h2 className="mt-3 font-headline text-4xl font-black tracking-tight text-on-surface">
                  Select how you want to join VisionTech.
                </h2>
                <p className="mt-4 text-base leading-7 text-on-surface-variant">
                  One community for talent growth, AI-guided readiness, and institutional progress.
                </p>
              </div>

              <div className="divide-y divide-surface-container-high overflow-hidden rounded-3xl border border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setShowTalentForm(true)}
                  className="group flex w-full items-center gap-4 bg-white p-5 text-left transition hover:bg-primary/5"
                >
                  <BriefcaseBusiness className="h-6 w-6 shrink-0 text-primary" />
                  <span className="flex-1">
                    <span className="block font-headline text-xl font-bold text-primary">Register as a Talent</span>
                    <span className="mt-1 block text-sm leading-6 text-on-surface-variant">
                      Build your AI pathway, evidence, mentors, and opportunity readiness.
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
                </button>
                <Link to="/organization-auth" className="group flex items-center gap-4 bg-white p-5 transition hover:bg-primary/5">
                  <Building2 className="h-6 w-6 shrink-0 text-primary" />
                  <span className="flex-1">
                    <span className="block font-headline text-xl font-bold text-primary">Register as an Organisation</span>
                    <span className="mt-1 block text-sm leading-6 text-on-surface-variant">
                      Support members, monitor readiness, coordinate interventions, and measure impact.
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
                </Link>
              </div>

              <p className="mt-8 text-center text-sm text-on-surface-variant">
                Already have an account?
                <Link className="ml-1 font-bold text-secondary transition-colors hover:text-primary" to="/login">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setShowTalentForm(false)}
                  className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" /> Change path
                </button>
                <p className="font-label text-xs font-black uppercase tracking-[0.24em] text-primary">Talent Registration</p>
                <h2 className="mt-3 font-headline text-4xl font-black tracking-tight text-on-surface">Create your talent account</h2>
                <p className="mt-4 text-base leading-7 text-on-surface-variant">
                  Start with your profile, generate AI guidance, and turn your next step into measurable progress.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput label="First Name" value={firstName} onChange={setFirstName} placeholder="Alex" icon={<User className="h-5 w-5" />} required />
                  <TextInput label="Last Name" value={lastName} onChange={setLastName} placeholder="Sterling" icon={<User className="h-5 w-5" />} />
                </div>
                <TextInput label="Email Address" value={email} onChange={setEmail} placeholder="visiontech@example.com" type="email" icon={<AtSign className="h-5 w-5" />} required />
                <PasswordInput label="Password" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                <div className="rounded-xl border border-surface-container-high bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
                  <p className="mb-1 font-semibold">Use a valid password:</p>
                  <PasswordRule met={meetsMinLength} text="At least 12 characters" />
                  <PasswordRule met={meetsMaxLength} text="No more than 128 characters" />
                  <PasswordRule met={meetsUppercase} text="At least one uppercase letter (A-Z)" />
                  <PasswordRule met={meetsLowercase} text="At least one lowercase letter (a-z)" />
                  <PasswordRule met={meetsSpecialCharacter} text="At least one special character (e.g. ! @ # $ %)" />
                </div>
                <PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} placeholder="Confirm your password" />
                <div className="flex items-start gap-3 py-2">
                  <input
                    className="mt-1 h-4 w-4 rounded border-surface-container-high text-primary focus:ring-primary"
                    id="terms"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <label className="text-sm leading-tight text-on-surface-variant" htmlFor="terms">
                    I agree to the <Link className="font-semibold text-primary hover:underline" to="#">Terms of Service</Link> and <Link className="font-semibold text-primary hover:underline" to="#">Privacy Policy</Link>.
                  </label>
                </div>
                {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
                {success && <p className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}
                {verificationEmail && (
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
                  {loading ? "Creating..." : "Create Talent Account"}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-on-surface-variant">
                Already have an account?
                <Link className="ml-1 font-bold text-secondary transition-colors hover:text-primary" to="/login">
                  Sign in
                </Link>
              </p>
            </>
          )}

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

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  icon: JSX.Element;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 font-label text-sm font-semibold text-on-surface-variant">{label}</label>
      <div className="relative">
        <input
          className="w-full rounded-xl border-none bg-surface-container-high px-5 py-4 pr-12 text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:bg-white focus:ring-2 focus:ring-secondary/20"
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">{icon}</span>
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder = "••••••••••••",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 font-label text-sm font-semibold text-on-surface-variant">{label}</label>
      <div className="relative">
        <input
          className="w-full rounded-xl border-none bg-surface-container-high px-5 py-4 pr-16 text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:bg-white focus:ring-2 focus:ring-secondary/20"
          placeholder={placeholder}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={12}
        />
        <Lock className="absolute right-11 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/40" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-secondary">
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <p className={`flex items-center gap-2 ${met ? "text-green-700" : ""}`}>
      {met ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
      <span>{text}</span>
    </p>
  );
}
