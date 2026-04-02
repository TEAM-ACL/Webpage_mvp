import type { JSX } from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, MapPin, Mail, Users } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
};

type TeamMember = {
  name: string;
  title: string;
  focus: string[];
  description: string;
};

type SocialLink = {
  label: string;
  href: string;
};

const navLinks: NavLink[] = [
  { href: "#home", label: "Home" },
  { href: "#vision", label: "Vision" },
  { href: "#mission", label: "Mission" },
  { href: "#about", label: "About" },
];

const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "YouTube", href: "#" },
];

const team: TeamMember[] = [
  {
    name: "Chidera",
    title: "Founder / Frontend Engineer / Cloud Engineer / Team Lead",
    focus: ["Product Vision", "Frontend", "Cloud Architecture"],
    description:
      "Sets product direction, builds the web experience, and architects scalable cloud delivery.",
  },
  {
    name: "Mac-Collins",
    title: "Co-founder / Software Developer / Backend Engineer / Cloud Engineer",
    focus: ["Platform", "APIs", "Cloud Ops"],
    description:
      "Owns platform foundations, APIs, and cloud reliability so new features ship safely.",
  },
  {
    name: "Franklyn",
    title: "AI Engineer / Data Engineer",
    focus: ["AI Matching", "Data Pipelines", "ML Ops"],
    description:
      "Designs the AI matching models and data pipelines that power recommendations.",
  },
  {
    name: "Trisha",
    title: "Project Manager",
    focus: ["Delivery", "Stakeholders", "Roadmap"],
    description:
      "Coordinates delivery, removes blockers, and keeps roadmap milestones on track.",
  },
];

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <section id={id} className="py-16 px-6 md:px-12 lg:px-16 bg-black text-gray-100 border-t border-white/5">
      <div className="max-w-6xl mx-auto space-y-4">
        <p className="font-label text-[11px] uppercase tracking-[0.3em] text-blue-400 font-bold">
          {eyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-white">{title}</h2>
        <div className="text-gray-300 leading-relaxed space-y-4">{children}</div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-[#050505] text-white min-h-screen">
      {/* In-page nav */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-500 flex items-center justify-center font-bold text-lg">
              VT
            </div>
            <div>
              <p className="text-xs text-gray-400 font-label tracking-[0.2em] uppercase">Innovation</p>
              <p className="font-headline font-semibold text-white">VisionTech</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-5 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="text-gray-300 hover:text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-white/20"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Sign up
            </a>
            <a
              href="#waitlist"
              className="hidden lg:inline-flex border border-white/15 hover:border-blue-400 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Join Waitlist
            </a>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center gap-2 text-sm font-semibold text-gray-200 border border-white/15 px-3 py-2 rounded-lg"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            Menu
          </button>
        </div>
        {isMobileNavOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/90 px-6 pb-6">
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-200 text-sm font-medium hover:text-white"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <a
                  href="/login"
                  className="flex-1 text-center border border-white/20 rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 hover:border-blue-400"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-semibold"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Sign up
                </a>
              </div>
              <a
                href="#waitlist"
                className="text-center border border-white/15 hover:border-blue-400 rounded-lg px-3 py-2 text-sm font-semibold text-gray-200"
                onClick={() => setMobileNavOpen(false)}
              >
                Join Waitlist
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Hero */}
      <section
        id="home"
        className="relative bg-gradient-to-br from-[#0a0a0a] via-[#10102a] to-[#050505] py-24 px-6 md:px-12 lg:px-16 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <p className="font-label text-xs uppercase tracking-[0.35em] text-blue-400 font-bold">
              Innovation Intelligence
            </p>
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight leading-[0.95] text-white">
              The intelligence layer for <span className="text-blue-400">human innovation</span>.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-sans leading-relaxed">
              VisionTech maps skills, potential, and collaboration fit so innovators, teams, and organisations
              can discover each other, form the right squads, and deliver faster.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#waitlist"
                className="gradient-pulse text-white px-8 py-4 rounded-xl font-headline font-semibold shadow-xl"
              >
                Join the Waitlist
              </a>
              <a
                href="#team"
                className="border border-white/20 text-white px-8 py-4 rounded-xl font-headline font-semibold hover:border-blue-400 transition"
              >
                Meet the Team
              </a>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              {["Capability Graphs", "AI Matching", "Collaboration Fit", "Innovation Pathways"].map((pill) => (
                <span key={pill} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full">
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
            <div className="absolute -inset-6 bg-blue-500/15 blur-3xl rounded-full" />
            <div className="relative bg-black border border-gray-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <span>Innovation Graph</span>
                <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded-full border border-blue-900/40">
                  Live Preview
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-xs">Capability Coverage</p>
                  <p className="text-3xl font-bold mt-2 text-white">87%</p>
                  <p className="text-xs text-blue-300 mt-1">+12% vs last week</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-xs">Collaboration Fit</p>
                  <p className="text-3xl font-bold mt-2 text-white">92%</p>
                  <p className="text-xs text-blue-300 mt-1">High cohesion</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 col-span-2">
                  <p className="text-gray-400 text-xs mb-2">Suggested Partners</p>
                  <div className="flex flex-wrap gap-2">
                    {["Product Strategist", "AI Engineer", "Cloud Architect", "Data Scientist"].map((role) => (
                      <span
                        key={role}
                        className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-900/40 text-blue-100 text-xs"
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

      <Section
        id="vision"
        eyebrow="Vision"
        title="Become the global intelligence layer for human innovation."
      >
        <p>
          Enable individuals and organisations to discover, connect, and build high-impact solutions through
          AI-driven capability understanding.
        </p>
      </Section>

      <Section
        id="mission"
        eyebrow="Mission"
        title="Develop the AI-powered innovation intelligence platform."
      >
        <p>
          Analyse human skills, potential, and collaboration compatibility to form stronger teams, accelerate
          innovation, and improve how talent and ideas become successful ventures.
        </p>
      </Section>

      <Section id="about" eyebrow="About" title="About VisionTech">
        <p>
          Where AI innovation meets strategic insight - beyond community programming. VisionTech improves how people
          discover opportunities, form teams, and build impactful solutions. Traditional platforms optimise for resumes
          or generic networking; VisionTech uses AI to understand capability beyond static credentials.
        </p>
        <p>
          By analysing skills, behaviour, learning progress, and collaboration fit, the platform recommends innovation
          partners and co-founders, personalised growth pathways, project opportunities, and emerging innovation areas
          aligned to user strengths.
        </p>
        <p>
          We transform fragmented talent ecosystems into structured innovation networks, reducing friction between ideas
          and execution for organisations, investors, and builders.
        </p>
      </Section>

      <section id="team" className="py-16 px-6 md:px-12 lg:px-16 bg-[#0b0c10] border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-10">
          <div>
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-blue-400 font-bold">
              Meet the Team
            </p>
            <h3 className="text-3xl md:text-4xl font-headline font-bold text-white mt-3">
              People building VisionTech
            </h3>
            <p className="text-gray-400 mt-2">
              Clear swim lanes so partners know who to talk to for product, delivery, and AI systems.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-blue-900/40 bg-gradient-to-br from-[#0f172a] via-[#0b1020] to-[#0b0c10] p-6 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{member.name}</p>
                    <p className="text-sm text-blue-200">{member.title}</p>
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{member.description}</p>
                <div className="flex flex-wrap gap-2">
                  {member.focus.map((area) => (
                    <span
                      key={area}
                      className="text-xs px-3 py-1 rounded-full border border-blue-800/50 bg-blue-900/20 text-blue-100"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 px-6 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-blue-400 font-bold">
              Contact
            </p>
            <h3 className="text-3xl font-headline font-bold text-white">Contact & Social</h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-300" />
                <span>
                  Email: <span className="text-white">hello@visiontech.ai</span>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-300" />
                <span>
                  Address: <span className="text-white">123 Innovation Way, London, UK</span>
                </span>
              </p>
              <p className="text-sm text-gray-400">
                Reach out for partnerships, pilots, or enterprise innovation programs.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-blue-400 font-bold">
              Social
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 rounded-full border border-gray-800 hover:border-blue-400 text-sm text-gray-200 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="waitlist"
        className="py-20 px-6 md:px-12 lg:px-16 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-black border-t border-white/5"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="font-label text-[11px] uppercase tracking-[0.3em] text-blue-300 font-bold">
            Access
          </p>
          <h3 className="text-3xl md:text-4xl font-headline font-bold text-white">Join the waitlist</h3>
          <p className="text-gray-200 leading-relaxed">
            Be the first to try VisionTech. We're onboarding design partners, venture studios, and innovation teams
            shaping the future of collaboration intelligence.
          </p>
          <form className="mt-4 grid gap-3 md:grid-cols-[2fr,1fr]">
            <input
              type="email"
              name="email"
              required
              placeholder="Work email"
              className="bg-white/5 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-3 text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              Request Access <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
            <Users className="w-4 h-4" />
            <span>We'll reach out with onboarding steps and pilot options.</span>
          </div>
        </div>
      </section>
    </div>
  );
}


