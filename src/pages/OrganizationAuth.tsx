import type { JSX } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, BriefcaseBusiness, CheckCircle2, Sparkles } from "lucide-react";

const communityPromises = [
  "AI-guided direction for every journey",
  "Practical progress through projects and actions",
  "Clearer visibility for institutions supporting talent",
];

export default function OrganizationAuth(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#f8f5ff] flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(216,207,252,0.5),transparent_34%),radial-gradient(circle_at_86%_20%,rgba(31,9,84,0.12),transparent_32%)]" />
      <header className="fixed top-0 w-full z-50 glass-panel flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">VisionTech</Link>
        </div>
        <Link
          to="/login"
          className="hidden sm:inline-flex rounded-xl border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
        >
          Already have an account?
        </Link>
      </header>

      <main className="relative flex-grow flex items-center justify-center pt-28 px-6 pb-12">
        <div className="w-full max-w-6xl grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section className="rounded-[2rem] bg-[#1f0954] p-8 text-white shadow-2xl shadow-indigo-100 md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#d8cffc]">
              <Sparkles className="h-4 w-4" />
              Join VisionTech AI
            </div>
            <h1 className="font-headline text-4xl font-black tracking-tight md:text-5xl">
              Select how you want to join the VisionTech AI community.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/80">
              VisionTech AI connects ambition, guidance, action, support, and opportunity so people and organisations can grow with clarity.
            </p>
            <div className="mt-8 grid gap-3">
              {communityPromises.map((promise) => (
                <div key={promise} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/85">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {promise}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl md:p-8">
            <div className="mb-6">
              <p className="font-label text-xs font-black uppercase tracking-[0.24em] text-primary">Choose your pathway</p>
              <h2 className="mt-3 font-headline text-3xl font-black tracking-tight text-on-surface">
                Get started with the right VisionTech environment.
              </h2>
            </div>

            <div className="grid gap-4">
              <Link
                to="/signup"
                className="group rounded-3xl border border-surface-container-high bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f4efff] text-primary transition group-hover:bg-primary group-hover:text-white">
                    <BriefcaseBusiness className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline text-2xl font-black text-on-surface">Register as Talent</h3>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                      Build your AI profile, understand your strengths, discover skill gaps, create project evidence, and connect to mentors and opportunities.
                    </p>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-primary transition group-hover:translate-x-1 sm:block" />
                </div>
              </Link>

              <div className="rounded-3xl border-2 border-primary bg-primary/5 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-headline text-2xl font-black text-on-surface">Register as an Organisation</h3>
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Institutional access</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                      Create an organisation dashboard to support members, monitor readiness, coordinate interventions, and measure real-world impact.
                    </p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        to="/organization-signup"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                      >
                        Create Organisation <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/organization-login"
                        className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary/5"
                      >
                        Organisation Login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
