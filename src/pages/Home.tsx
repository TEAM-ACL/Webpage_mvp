import type { JSX, ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, MapPin, Mail, Users } from "lucide-react";

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
                href="#waitlist"
                className="bg-[#1f0954] hover:bg-black text-white px-8 py-4 rounded-xl font-headline font-semibold shadow-lg transition"
              >
                Join the Waitlist
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
      
      <section id="contact" className="py-16 px-6 md:px-12 lg:px-16 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-[#1f0954] font-bold">
              Contact
            </p>
            <div className="space-y-3 text-slate-700">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1f0954]" />
                <span>
                  Email: <span className="text-slate-900">hello@visiontech.ai</span>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1f0954]" />
                <span>
                  Address: <span className="text-slate-900">123 Innovation Way, London, UK</span>
                </span>
              </p>
              <p className="text-sm text-slate-600">
                Reach out for partnerships, pilots, or enterprise innovation programs.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-[#1f0954] font-bold">
              Social
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:border-[#1f0954] text-sm text-slate-800 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
