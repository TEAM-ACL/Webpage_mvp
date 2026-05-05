import type { FormEvent, JSX } from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Users, CheckCircle2, ChevronDown, Sparkles, Rocket, BrainCircuit } from "lucide-react";
import OnboardingWalkthroughSlideshow from "../components/home/OnboardingWalkthroughSlideshow";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { joinWaitlist } from "../services/waitlist";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const featureCards = [
  {
    icon: BrainCircuit,
    title: "Intelligence That Adapts",
    body: "Your recommendations and pathways evolve as your profile grows, so guidance stays relevant.",
  },
  {
    icon: Users,
    title: "Collaboration by Design",
    body: "Find high-fit contributors by skills, goals, and momentum so teams form with less friction.",
  },
  {
    icon: Rocket,
    title: "Faster Execution Loops",
    body: "Turn ideas into action with clear next steps and confidence signals for smarter decisions.",
  },
];

const advancedFeatureItems = [
  {
    title: "Unified Intelligence Layer",
    body: "Bring profile signal, matching logic, and pathway guidance into one operating view.",
  },
  {
    title: "Fast Team Decision Support",
    body: "Surface high-fit collaborators and actionable recommendations without slowing workflow.",
  },
  {
    title: "Scale-Ready Experience",
    body: "Designed to stay clear and responsive as users, use cases, and data volume grow.",
  },
  {
    title: "Low-Friction Operations",
    body: "Simple controls and guided actions reduce complexity while preserving advanced capability.",
  },
];

const steps = [
  { title: "Create your account", body: "Sign up and unlock your personal innovation workspace." },
  { title: "Map your profile", body: "Add goals, interests, and strengths to shape your intelligence graph." },
  { title: "Activate intelligence", body: "Generate insights, recommendations, and smart collaborator matches." },
  { title: "Execute with clarity", body: "Track progress, reduce guesswork, and move from concept to outcome." },
];

const faqs = [
  { q: "What is VisionTech?", a: "VisionTech is a digital platform that helps individuals navigate technology careers through structured learning pathways and intelligent guidance." },
  { q: "Who is VisionTech for?", a: "Students, graduates, career changers, and anyone looking to grow in their field without a clear plan." },
  { q: "Do I need prior experience in technology?", a: "No. VisionTech supports users at all levels, from beginners to those specializing or advancing their skills." },
  { q: "How are pathways created?", a: "Pathways are designed from industry requirements and structured learning progressions, combined with intelligent recommendation logic." },
  { q: "Is VisionTech free to use?", a: "The MVP version provides core features for free, with premium features planned as the platform evolves." },
  { q: "How does VisionTech use AI?", a: "AI provides guidance and recommendations based on your goals, helping you make informed decisions about learning and career paths." },
  { q: "Can VisionTech help me get a job?", a: "Yes, by guiding you through the right skills and matching you to relevant opportunities and collaborators, improving readiness for real outcomes." },
];

export default function Home(): JSX.Element {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const intelligenceHref = user ? "/intelligence" : "/login";
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);

  async function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = waitlistEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      const message = "Please enter a valid email address.";
      setWaitlistMessage(message);
      showError(message);
      return;
    }

    setWaitlistSubmitting(true);
    setWaitlistMessage(null);

    try {
      const result = await joinWaitlist(email);
      if (result.alreadyJoined) {
        const message = "This email is already on the waitlist.";
        setWaitlistMessage(message);
        showSuccess(message);
      } else {
        const message = "You are on the waitlist. We'll be in touch soon.";
        setWaitlistMessage(message);
        setWaitlistEmail("");
        showSuccess(message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to join waitlist right now.";
      setWaitlistMessage(message);
      showError(message);
    } finally {
      setWaitlistSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f3ff] text-slate-900">
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#12063a] via-[#1a0b4b] to-[#26125f] px-6 pb-20 pt-24 md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(216,207,252,0.24),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_70%_85%,rgba(96,66,170,0.22),transparent_44%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,3,22,0.32)_0%,rgba(10,4,30,0.18)_40%,rgba(10,4,30,0.06)_100%)]" />
        <motion.div
          className="pointer-events-none absolute left-[6%] top-[20%] hidden h-24 w-24 rounded-full border border-[#d8cffc] bg-white/50 md:block"
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute right-[8%] top-[16%] hidden h-16 w-16 rounded-xl border border-[#d8cffc] bg-[#f7f3ff]/90 md:block"
          animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-6 text-center"
          >
            <motion.p variants={fadeUp} className="font-label text-xs font-bold uppercase tracking-[0.35em] text-[#d8cffc]">
              Innovation Intelligence
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-headline text-6xl font-extrabold leading-[0.92] tracking-tight text-white md:text-7xl"
            >
              The intelligence layer for <span className="text-[#d8cffc]">human innovation</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto max-w-2xl font-sans text-lg leading-relaxed text-white/85 md:text-xl">
              VisionTech maps strengths, learning direction, and collaboration fit so individuals and teams can move
              from exploration to execution with confidence.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-headline font-semibold text-[#1f0954] shadow-lg transition hover:bg-white/50"
              >
                Join VisionTech <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={intelligenceHref}
                className="inline-flex items-center rounded-xl border border-white/40 px-8 py-4 font-headline font-semibold text-white transition hover:border-white"
              >
                Open Intelligence
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 text-xs text-white/80">
              {["Capability Graphs", "AI Matching", "Confidence Signals", "Execution Pathways"].map((pill) => (
                <span key={pill} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[#efe8ff] backdrop-blur-sm">
                  {pill}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.a
          href="#how-it-works"
          className="relative mx-auto mt-12 flex w-fit items-center gap-2 rounded-full border border-[#d8cffc] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f0954]"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Explore <ChevronDown className="h-4 w-4" />
        </motion.a>
      </section>

      <section
        id="solution"
        className="border-t border-[#daccfb] bg-[#f0e8ff] px-6 py-20 md:px-12 lg:px-16"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-[#1f0954]">Solution</p>
            <h2 className="font-headline text-3xl font-bold text-slate-900 md:text-4xl">
              A smarter way to navigate technology careers.
            </h2>
            <p className="leading-relaxed text-slate-700">
              VisionTech connects structured learning, guided pathways, and AI recommendations so you always know the
              next best step.
            </p>
          </div>
          <a
            href="/about#problem"
            className="block rounded-2xl border border-[#d8cffc] bg-[#f7f3ff] p-8 shadow-[0_20px_60px_rgba(31,9,84,0.08)] transition hover:shadow-[0_0_0_1px_rgba(216,207,252,0.75),0_0_26px_rgba(116,88,218,0.32),0_24px_70px_rgba(31,9,84,0.14)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-label text-xs uppercase tracking-[0.25em] text-[#1f0954]">Explore</p>
                <h3 className="mt-2 font-headline text-2xl font-bold text-slate-900">The problem VisionTech solves</h3>
              </div>
              <ArrowRight className="h-5 w-5 text-[#1f0954]" />
            </div>
            <p className="leading-relaxed text-slate-700">
              See how VisionTech tackles fragmented learning, unclear pathways, and inaccessible opportunities with an
              integrated, intelligent guide.
            </p>
          </a>
        </div>
      </section>

      <section id="advanced" className="relative border-t border-[#e0d4ff] bg-[#f6f0ff] px-6 py-20 md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(216,207,252,0.32),transparent_42%),radial-gradient(circle_at_88%_20%,rgba(178,211,255,0.18),transparent_42%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr,1.05fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
              className="space-y-4"
            >
              <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-[#1f0954]">
                Advanced Experience
              </p>
              <h2 className="font-headline text-3xl font-bold text-[#1f0954] md:text-5xl">
                Designed to be clear, actionable, and dynamic.
              </h2>
              <p className="max-w-xl leading-relaxed text-slate-700">
                VisionTech combines high-signal intelligence with clean interaction patterns so users can move quickly
                without losing depth.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {featureCards.slice(0, 2).map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#e6defc] bg-[#1f0954] p-3">
                    <p className="text-sm font-semibold text-white/90">{card.title}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {advancedFeatureItems.map((item, idx) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: idx * 0.07 }}
                  whileHover={{ y: -5 }}
                  className="rounded-2xl border border-[#e6defc] bg-[#1f0954] p-5 shadow-sm transition-shadow hover:shadow-[0_0_0_1px_rgba(216,207,252,0.7),0_0_24px_rgba(140,116,236,0.34),0_20px_45px_rgba(31,9,84,0.16)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Feature</p>
                  <h3 className="mt-2 font-headline text-xl font-bold text-white/50">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white">{item.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#e7deff] bg-[#fcf9ff] px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-3 text-center">
            <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-[#1f0954]">How it works</p>
            <h2 className="font-headline text-3xl font-bold text-slate-900 md:text-4xl">Start your journey in four steps</h2>
            <p className="mx-auto max-w-3xl leading-relaxed text-slate-700">
              Move from profile setup to execution with a flow that keeps momentum and removes uncertainty.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                whileHover={{ y: -5 }}
                className="flex gap-4 rounded-2xl border border-[#e6defc] bg-white p-6 shadow-sm transition-shadow hover:shadow-[0_0_0_1px_rgba(216,207,252,0.7),0_0_22px_rgba(120,95,228,0.28),0_22px_42px_rgba(31,9,84,0.12)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1f0954] font-headline font-bold text-white">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <OnboardingWalkthroughSlideshow />

      <section className="border-t border-[#eee7ff] bg-[#fffdff] px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-2 text-center">
            <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-[#1f0954]">FAQs</p>
            <h2 className="font-headline text-3xl font-bold text-slate-900 md:text-4xl">Your questions, answered</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            {faqs.map((item, idx) => (
              <details key={item.q} className="group border-b border-slate-200 bg-white last:border-b-0">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 font-semibold text-slate-900 transition hover:bg-[#f7f3ff]">
                  <span>{`${idx + 1}. ${item.q}`}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-slate-100 bg-[#faf9ff] px-5 pb-5 text-sm leading-relaxed text-slate-700">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#d8cbfb] bg-[#1f0954] px-6 py-20 text-white md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_42%,rgba(216,207,252,0.2),transparent_38%)]" />
        <div className="relative mx-auto max-w-5xl space-y-6 text-center">
          <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">Call to action</p>
          <h2 className="font-headline text-3xl font-bold md:text-4xl">Start building your future today</h2>
          <p className="text-lg leading-relaxed text-white/80">
            Take the first step toward a guided technology journey with clearer decisions, stronger collaboration, and
            measurable progress.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-headline font-semibold text-[#0b1b2d] shadow-lg transition hover:bg-slate-100"
            >
              Join VisionTech <Sparkles className="h-4 w-4" />
            </a>
            <a
              href="/onboarding"
              className="inline-flex items-center rounded-xl border border-white/50 px-8 py-4 font-headline font-semibold text-white transition hover:border-white"
            >
              Get Started
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
            <CheckCircle2 className="h-4 w-4" />
            <span>No experience required. Start where you are and grow with guidance.</span>
          </div>
          <div className="pt-3">
            <div className="inline-flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 transition hover:border-white hover:text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="relative overflow-hidden border-t border-[#dfd4fc] bg-[#f3ecff] px-6 py-20 md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-gradient-to-br from-[#d8cffc] via-white to-transparent opacity-80 blur-3xl" />
          <div className="absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-gradient-to-br from-[#efe8ff] via-[#d8cffc] to-transparent opacity-70 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl space-y-8 text-center">
          <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-[#1f0954]">Access</p>
          <h3 className="font-headline text-3xl font-bold text-[#0b1b2d] md:text-4xl">Join the waitlist</h3>
          <p className="leading-relaxed text-[#0b1b2d]">
            Be the first to try VisionTech. We're onboarding design partners and innovation teams shaping the future of
            collaboration intelligence.
          </p>
          <form onSubmit={handleWaitlistSubmit} className="mt-4 grid gap-3 md:grid-cols-[2fr,1fr]">
            <input
              type="email"
              name="email"
              required
              value={waitlistEmail}
              onChange={(event) => setWaitlistEmail(event.target.value)}
              placeholder="Work email"
              className="rounded-lg border border-[#d8cffc] bg-white px-4 py-3 text-sm text-[#0b1b2d] placeholder-slate-500 focus:border-[#1f0954] focus:outline-none focus:ring-2 focus:ring-[#d8cffc]"
            />
            <button
              type="submit"
              disabled={waitlistSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#1f0954] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1f0954]/25 transition hover:bg-black"
            >
              {waitlistSubmitting ? "Submitting..." : "Request Access"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          {waitlistMessage ? (
            <p className="text-sm text-[#1f0954]">{waitlistMessage}</p>
          ) : null}
          <div className="flex items-center justify-center gap-3 text-xs text-[#0b1b2d]/80">
            <Users className="h-4 w-4 text-[#1f0954]" />
            <span>We'll reach out with onboarding steps and pilot options.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
