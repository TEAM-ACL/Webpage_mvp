import type { JSX } from "react";
import { useState } from "react";
import { ArrowLeft, Building2, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, storeSession } from "../lib/api";
import { setAdminFlag } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { toUserMessage } from "../lib/userErrors";
import { getEmailConfirmationRedirectUrl } from "../lib/authRedirects";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailConfirmationRedirectUrl = getEmailConfirmationRedirectUrl();

export default function OrganizationSignup(): JSX.Element {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { setUser } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOrgName = organizationName.trim();
    if (!cleanOrgName) {
      const message = "Organization name is required.";
      setError(message);
      showError(message);
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      const message = "Please enter a valid work email address.";
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
    if (password !== confirmPassword) {
      const message = "Passwords do not match.";
      setError(message);
      showError(message);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const session = await api.register({
        email: cleanEmail,
        password,
        display_name: cleanOrgName,
        first_name: cleanOrgName,
        redirect_to: emailConfirmationRedirectUrl,
      });

      if (!session.access_token) {
        showSuccess("Organization account created. Verify your email, then sign in.");
        navigate("/organization-login", { replace: true, state: { email: cleanEmail } });
        return;
      }

      storeSession(session);
      setUser(session.user);
      setAdminFlag(false);
      navigate("/organizations");
    } catch (err) {
      const message = toUserMessage(err, "Unable to create organization account right now.");
      setError(message);
      showError(message);
    } finally {
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      <header className="fixed top-0 w-full z-50 glass-panel flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-4">
          <Link to="/organization-auth" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Organization Access
          </Link>
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">VisionTech</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-20 px-6">
        <div className="w-full max-w-lg bg-white/70 backdrop-blur-3xl rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/20">
          <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-3">Organization Sign Up</h1>
            <p className="text-on-surface-variant font-sans opacity-70 leading-relaxed">
              Create an organization account to post and manage opportunities.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Organization Name</span>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                <input
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface"
                  placeholder="Acme Institute"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Work Email</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface"
                  type="email"
                  placeholder="team@company.com"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Password</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface"
                  type="password"
                  minLength={12}
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Confirm Password</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface"
                  type="password"
                  minLength={12}
                  required
                />
              </div>
            </label>

            {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f0954] hover:bg-black disabled:opacity-60 text-white py-4 rounded-xl font-headline font-bold text-lg"
            >
              {loading ? "Creating..." : "Create Organization Account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

