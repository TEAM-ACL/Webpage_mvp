import type { JSX } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, Sparkles } from "lucide-react";

export default function OrganizationAuth(): JSX.Element {
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
          <p className="font-label text-xs font-black uppercase tracking-[0.28em] text-[#d8cffc]">Organisation Access</p>
          <h1 className="mt-5 font-headline text-5xl font-black leading-tight tracking-tight">
            Build a clearer talent support system.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/78">
            Give your organisation one environment for member readiness, interventions, insights, opportunities, and measurable impact.
          </p>
        </div>
        <Link to="/signup" className="relative inline-flex w-fit items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white">
          Talent registration <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 md:px-10 lg:px-16">
        <div className="w-full max-w-lg">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <Link to="/" className="font-headline text-2xl font-bold tracking-tighter text-primary lg:hidden">VisionTech</Link>
          </div>

          <div className="mb-8">
            <p className="font-label text-xs font-black uppercase tracking-[0.24em] text-primary">Choose Your Path</p>
            <h2 className="mt-3 font-headline text-4xl font-black tracking-tight text-on-surface">
              Join VisionTech as an organisation.
            </h2>
            <p className="mt-4 text-base leading-7 text-on-surface-variant">
              Create an institutional dashboard or sign in to continue managing talent growth and outcomes.
            </p>
          </div>

          <div className="divide-y divide-surface-container-high overflow-hidden rounded-3xl border border-surface-container-high">
            <Link to="/organization-signup" className="group flex items-center gap-4 bg-white p-5 transition hover:bg-primary/5">
              <Building2 className="h-6 w-6 shrink-0 text-primary" />
              <span className="flex-1">
                <span className="block font-headline text-xl font-bold text-primary">Create Organisation</span>
                <span className="mt-1 block text-sm leading-6 text-on-surface-variant">
                  Set up your dashboard for members, readiness, interventions, and reports.
                </span>
              </span>
              <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
            </Link>
            <Link to="/organization-login" className="group flex items-center gap-4 bg-white p-5 transition hover:bg-primary/5">
              <Building2 className="h-6 w-6 shrink-0 text-primary" />
              <span className="flex-1">
                <span className="block font-headline text-xl font-bold text-primary">Organisation Login</span>
                <span className="mt-1 block text-sm leading-6 text-on-surface-variant">
                  Continue to your institution dashboard and member insights.
                </span>
              </span>
              <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
            </Link>
            <Link to="/signup" className="group flex items-center gap-4 bg-white p-5 transition hover:bg-primary/5 lg:hidden">
              <BriefcaseBusiness className="h-6 w-6 shrink-0 text-primary" />
              <span className="flex-1">
                <span className="block font-headline text-xl font-bold text-primary">Register as Talent</span>
                <span className="mt-1 block text-sm leading-6 text-on-surface-variant">
                  Build your personal AI pathway and opportunity readiness.
                </span>
              </span>
              <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Looking for your personal account?
            <Link className="ml-1 font-bold text-secondary transition-colors hover:text-primary" to="/login">
              Sign in as talent
            </Link>
          </p>

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
