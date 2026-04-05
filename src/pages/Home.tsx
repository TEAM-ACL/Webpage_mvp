import type { JSX, ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, Users, CheckCircle2, ChevronDown } from "lucide-react";

type SocialLink = {
  label: string;
  href: string;
};

const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "YouTube", href: "#" },
];

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
};

function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <section
      id={id}
      className="py-16 px-6 md:px-12 lg:px-16 bg-white text-slate-800 border-t border-slate-200"
    >
      <div className="max-w-6xl mx-auto space-y-4">
        <p className="font-label text-[11px] uppercase tracking-[0.3em] text-[#1f0954] font-bold">
          {eyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">{title}</h2>
        <div className="text-slate-700 leading-relaxed space-y-4">{children}</div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section
        id="home"
        className="relative bg-gradient-to-br from-white via-[#efe8ff] to-white py-24 px-6 md:px-12 lg:px-16 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <p className="font-label text-xs uppercase tracking-[0.35em] text-[#1f0954] font-bold">
              Innovation Intelligence
            </p>
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight leading-[0.95] text-slate-900">
              The intelligence layer for <span className="text-[#1f0954]">human innovation</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl font-sans leading-relaxed">
              VisionTech maps skills, potential, and collaboration fit so innovators, teams, and organisations
              can discover each other, form the right squads, and deliver faster.
            </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/signup"
                  className="bg-[#1f0954] hover:bg-black text-white px-8 py-4 rounded-xl font-headline font-semibold shadow-lg transition"
                >
                  Join VisionTech
                </a>
                <a
                  href="/intelligence"
                  className="border border-slate-200 text-slate-800 px-8 py-4 rounded-xl font-headline font-semibold hover:border-[#1f0954] transition"
                >
                  Get Started
                </a>
                <a
                  href="/about#team"
                  className="border border-slate-200 text-slate-800 px-8 py-4 rounded-xl font-headline font-semibold hover:border-[#1f0954] transition"
                >
                  Meet the Team
                </a>
              </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              {["Capability Graphs", "AI Matching", "Collaboration Fit", "Innovation Pathways"].map((pill) => (
                <span key={pill} className="bg-[#f2ecff] border border-[#d8cffc] text-[#1f0954] px-3 py-1 rounded-full">
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-[#d8cffc]/60 blur-3xl rounded-full" />
            <div className="relative bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                <span>Innovation Graph</span>
                <span className="bg-[#f2ecff] text-[#1f0954] px-2 py-1 rounded-full border border-[#d8cffc]">
                  Live Preview
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-[#f7f3ff] border border-[#e8ddff] rounded-xl p-4">
                  <p className="text-slate-500 text-xs">Capability Coverage</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900">87%</p>
                  <p className="text-xs text-[#1f0954] mt-1">+12% vs last week</p>
                </div>
                <div className="bg-[#f7f3ff] border border-[#e8ddff] rounded-xl p-4">
                  <p className="text-slate-500 text-xs">Collaboration Fit</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900">92%</p>
                  <p className="text-xs text-[#1f0954] mt-1">High cohesion</p>
                </div>
                <div className="bg-[#f7f3ff] border border-[#e8ddff] rounded-xl p-4 col-span-2">
                  <p className="text-slate-500 text-xs mb-2">Suggested Partners</p>
                  <div className="flex flex-wrap gap-2">
                    {["Product Strategist", "AI Engineer", "Cloud Architect", "Data Scientist"].map((role) => (
                      <span
                        key={role}
                        className="px-3 py-1 rounded-full bg-[#f2ecff] border border-[#d8cffc] text-[#1f0954] text-xs"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section
        id="solution"
        className="py-20 px-6 md:px-12 lg:px-16 bg-white border-t border-slate-200"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-3">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-[#1f0954] font-bold">Solution</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">
              A smarter way to navigate technology careers.
            </h2>
            <p className="text-slate-700 leading-relaxed">
              VisionTech connects structured learning, guided pathways, and AI recommendations so you always know the next best step.
            </p>
          </div>
          <a
            href="/about#problem"
            className="block rounded-2xl border border-[#d8cffc] bg-[#f7f3ff] p-8 shadow-[0_20px_60px_rgba(31,9,84,0.08)] hover:shadow-[0_24px_70px_rgba(31,9,84,0.12)] transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-label text-xs uppercase tracking-[0.25em] text-[#1f0954]">Explore</p>
                <h3 className="text-2xl font-headline font-bold text-slate-900 mt-2">The problem VisionTech solves</h3>
              </div>
              <ArrowRight className="w-5 h-5 text-[#1f0954]" />
            </div>
            <p className="text-slate-700 leading-relaxed">
              See how VisionTech tackles fragmented learning, unclear pathways, and inaccessible opportunities with an integrated, intelligent guide.
            </p>
          </a>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 md:px-12 lg:px-16 bg-surface-container-low border-t border-slate-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-3 text-center">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-[#1f0954] font-bold">How it works</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">
              Start your journey in four simple steps
            </h2>
            <p className="text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Move from intent to action with a guided flow that keeps you focused on the next best move.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Create an Account", body: "Sign up and access your personalized dashboard." },
              { title: "Select Your Goals", body: "Tell us your interests, preferred skills, and career direction." },
              { title: "Receive Your Pathway", body: "Get a structured learning and development plan tailored to your profile." },
              { title: "Track Your Progress", body: "Monitor growth, stay on track, and move closer to real opportunities." },
            ].map((step, idx) => (
              <div
                key={step.title}
                className="bg-white border border-[#e6defc] rounded-2xl p-6 shadow-sm flex gap-4"
              >
                <div className="h-12 w-12 rounded-full bg-[#1f0954] text-white flex items-center justify-center font-headline font-bold">
                  {idx + 1}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-headline font-bold text-slate-900">{step.title}</h3>
                  <p className="text-slate-700 leading-relaxed text-sm">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6 md:px-12 lg:px-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2 text-center">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-[#1f0954] font-bold">FAQs</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">Your questions, answered</h2>
          </div>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 overflow-hidden">
            {[
              { q: "What is VisionTech?", a: "VisionTech is a digital platform that helps individuals navigate technology careers through structured learning pathways and intelligent guidance." },
              { q: "Who is VisionTech for?", a: "Students, graduates, career changers, and anyone looking to grow in their field without a clear plan." },
              { q: "Do I need prior experience in technology?", a: "No. VisionTech supports users at all levels, from beginners to those specializing or advancing their skills." },
              { q: "How are pathways created?", a: "Pathways are designed from industry requirements and structured learning progressions, combined with intelligent recommendation logic." },
              { q: "Is VisionTech free to use?", a: "The MVP version provides core features for free, with premium features planned as the platform evolves." },
              { q: "How does VisionTech use AI?", a: "AI provides guidance and recommendations based on your goals, helping you make informed decisions about learning and career paths." },
              { q: "Can VisionTech help me get a job?", a: "Yes—by guiding you through the right skills and matching you to relevant opportunities and collaborators, improving readiness for real outcomes." },
            ].map((item, idx) => (
              <details key={item.q} className="group bg-white">
                <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 text-slate-900 font-semibold hover:bg-[#f7f3ff]">
                  <span>{`${idx + 1}. ${item.q}`}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-slate-700 leading-relaxed text-sm bg-[#faf9ff] border-t border-slate-100">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-6 md:px-12 lg:px-16 bg-[#0b1b2d] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.05),transparent_30%)]" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <p className="font-label text-[11px] uppercase tracking-[0.3em] text-white/70 font-bold">Call to action</p>
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Start building your future today</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Take the first step toward a structured and guided technology journey. Join VisionTech for clarity, direction, and opportunities designed for your growth.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/signup"
              className="bg-white text-[#0b1b2d] px-8 py-4 rounded-xl font-headline font-semibold shadow-lg hover:bg-slate-100 transition"
            >
              Join VisionTech
            </a>
            <a
              href="/onboarding"
              className="border border-white/50 text-white px-8 py-4 rounded-xl font-headline font-semibold hover:border-white transition"
            >
              Get Started
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
            <CheckCircle2 className="w-4 h-4" />
            <span>No experience required. Start from where you are and grow with guidance.</span>
          </div>
        </div>
      </section>

      <section
        id="waitlist"
        className="relative overflow-hidden py-20 px-6 md:px-12 lg:px-16 bg-white border-t border-slate-200"
      >
        {/* sky-blue spiral / strand effect using gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-80 w-80 bg-gradient-to-br from-[#d8cffc] via-white to-transparent rounded-full blur-3xl opacity-80" />
          <div className="absolute right-[-10%] bottom-0 h-96 w-96 bg-gradient-to-br from-[#efe8ff] via-[#d8cffc] to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,9,84,0.08),transparent_35%),radial-gradient(circle_at_80%_40%,rgba(31,9,84,0.06),transparent_30%),radial-gradient(circle_at_40%_80%,rgba(31,9,84,0.05),transparent_28%)]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <p className="font-label text-[11px] uppercase tracking-[0.3em] text-[#1f0954] font-bold">
            Access
          </p>
          <h3 className="text-3xl md:text-4xl font-headline font-bold text-[#0b1b2d]">Join the waitlist</h3>
          <p className="text-[#0b1b2d] leading-relaxed">
            Be the first to try VisionTech. We're onboarding design partners, venture studios, and innovation teams
            shaping the future of collaboration intelligence.
          </p>
          <form className="mt-4 grid gap-3 md:grid-cols-[2fr,1fr]">
            <input
              type="email"
              name="email"
              required
              placeholder="Work email"
              className="bg-white border border-[#d8cffc] rounded-lg px-4 py-3 text-sm text-[#0b1b2d] placeholder-slate-500 focus:outline-none focus:border-[#1f0954] focus:ring-2 focus:ring-[#d8cffc]"
            />
            <button
              type="submit"
              className="bg-[#0b1b2d] hover:bg-black text-white rounded-lg px-6 py-3 text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-[#1f0954]/25"
            >
              Request Access <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-3 text-xs text-[#0b1b2d]/80">
            <Users className="w-4 h-4 text-[#1f0954]" />
            <span>We'll reach out with onboarding steps and pilot options.</span>
          </div>
        </div>
      </section>
      
    </div>
  );
}
