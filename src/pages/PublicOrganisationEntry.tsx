import { useEffect, useMemo, useState, type JSX } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Sparkles, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  buildOrganisationPortalThemeVariables,
  resolveOrganisationRadiusClass,
} from "../lib/organisationTheme";
import { getPublicOrganisationProfile } from "../services/organisation";
import type { PublicOrganisationProfile } from "../types/organisation";

export default function PublicOrganisationEntry(): JSX.Element {
  const { organisationSlug = "" } = useParams();
  const { systemMode } = useTheme();
  const [profile, setProfile] = useState<PublicOrganisationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getPublicOrganisationProfile(organisationSlug);
        if (isMounted) {
          setProfile(result);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load this organisation.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (organisationSlug) {
      void loadProfile();
    } else {
      setIsLoading(false);
      setError("Organisation slug is missing.");
    }

    return () => {
      isMounted = false;
    };
  }, [organisationSlug]);

  const branding = profile?.branding;
  const pageStyle = useMemo(
    () => ({
      ...buildOrganisationPortalThemeVariables(branding, { prefix: "tenant", systemMode }),
      fontFamily: branding?.fontFamily,
    }),
    [branding, systemMode],
  );
  const radiusClass = resolveOrganisationRadiusClass(branding?.borderRadius);
  const initials = (profile?.name || "VisionTech")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const redirectTo = profile ? `/org/${profile.slug}/continue` : "/intelligence";
  const loginPath = profile ? `/org/${profile.slug}/login` : "/login";
  const signupPath = profile ? `/org/${profile.slug}/signup` : "/signup";

  return (
    <main className={`min-h-screen bg-[var(--tenant-background)] text-[var(--tenant-text)] ${radiusClass}`} style={pageStyle}>
      <section
        className="relative min-h-screen overflow-hidden px-6 py-8 md:px-12 lg:px-16"
        style={{
          backgroundImage: `radial-gradient(circle at 12% 12%, color-mix(in srgb, var(--tenant-accent) 26%, transparent), transparent 34%), linear-gradient(135deg, var(--tenant-background), var(--tenant-surface-container-lowest) 64%)`,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tenant-text)] transition hover:text-[var(--tenant-action)]">
            <ArrowLeft className="h-4 w-4" />
            VisionTech Home
          </Link>
          <Link to={loginPath} state={{ redirectTo }} className="rounded-[var(--organisation-card-radius,1rem)] border border-[var(--tenant-outline-variant)] bg-[var(--tenant-surface-container-lowest)] px-4 py-2 text-sm font-bold text-[var(--tenant-text)] shadow-sm transition hover:border-[var(--tenant-action)]">
            Sign In
          </Link>
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr]">
          <section>
            {isLoading ? (
              <div className="rounded-[var(--organisation-card-radius,2rem)] border border-[var(--tenant-outline-variant)] bg-[var(--tenant-surface-container-lowest)] p-8 shadow-xl">
                <p className="text-sm font-bold text-[var(--tenant-on-surface-variant)]">Loading organisation experience...</p>
              </div>
            ) : error ? (
              <div className="rounded-[var(--organisation-card-radius,2rem)] border border-[var(--tenant-error)] bg-[var(--tenant-error-container)] p-8 shadow-xl">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--tenant-error)]">Organisation unavailable</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--tenant-text)]">We could not find this organisation page.</h1>
                <p className="mt-4 text-sm leading-6 text-[var(--tenant-on-surface-variant)]">{error}</p>
                <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--tenant-action)] px-5 py-3 text-sm font-black text-[var(--tenant-on-action)]">
                  Return Home <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : profile ? (
              <div className="space-y-7">
                <div className="inline-flex items-center gap-3 rounded-full border border-[var(--tenant-outline-variant)] bg-[var(--tenant-surface-container-lowest)] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--tenant-action)] shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  VisionTech Organisation Portal
                </div>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--organisation-card-radius,1.5rem)] text-lg font-black text-[var(--tenant-on-primary)] shadow-xl" style={{ backgroundColor: "var(--tenant-primary)" }}>
                      {profile.logoUrl || profile.branding.logoUrl ? (
                        <img src={profile.logoUrl || profile.branding.logoUrl || ""} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--tenant-on-surface-variant)]">{profile.organisationType || "Organisation"}</p>
                      <h1 className="text-4xl font-black tracking-tight text-[var(--tenant-text)] md:text-6xl">{profile.name}</h1>
                    </div>
                  </div>
                  <p className="max-w-3xl text-xl leading-9 text-[var(--tenant-on-surface-variant)]">
                    {profile.settings.welcomeMessage || profile.description || "Access your organisation workspace for guided learning, opportunity readiness, support, and measurable progress."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link to={loginPath} state={{ redirectTo }} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--tenant-action)] px-6 py-4 text-sm font-black text-[var(--tenant-on-action)] shadow-xl transition hover:opacity-90">
                    Sign In To Continue <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to={signupPath} state={{ organisationSlug: profile.slug, redirectTo }} className="inline-flex items-center rounded-2xl border border-[var(--tenant-outline-variant)] bg-[var(--tenant-surface-container-lowest)] px-6 py-4 text-sm font-black text-[var(--tenant-text)] transition hover:border-[var(--tenant-action)]">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-[var(--organisation-card-radius,2rem)] border border-[var(--tenant-outline-variant)] bg-[var(--tenant-surface-container-lowest)] p-5 shadow-2xl">
            <div className="rounded-[var(--organisation-card-radius,1.5rem)] p-6 text-[var(--tenant-on-panel)]" style={{ background: "linear-gradient(135deg, var(--tenant-panel-start), var(--tenant-panel-end))" }}>
              <p className="text-xs font-black uppercase tracking-[0.22em] opacity-75">What members can access</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">A branded pathway into VisionTech intelligence.</h2>
              <p className="mt-3 text-sm leading-6 opacity-80">
                Organisations can personalise the experience while members keep the same trusted VisionTech guidance flow.
              </p>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                { icon: Building2, title: "Organisation identity", body: "Logo, colours, welcome content, and purpose-led positioning." },
                { icon: Users, title: "Member workspace", body: "Guided profile, cohorts, interventions, readiness, and support." },
                { icon: CheckCircle2, title: "Tenant-safe access", body: "Members sign in before private organisation data is shown." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="flex gap-4 rounded-[var(--organisation-card-radius,1.5rem)] border border-[var(--tenant-outline-variant)] bg-[var(--tenant-surface-container-low)] p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--tenant-action)] text-[var(--tenant-on-action)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-[var(--tenant-text)]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--tenant-on-surface-variant)]">{item.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
