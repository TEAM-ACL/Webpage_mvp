import type { FormEvent, JSX } from "react";
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
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

const journeySteps = [
  { title: "Profile", body: "Tell VisionTech your goals, strengths, interests, and context.", icon: Users },
  { title: "AI Intelligence", body: "Generate guidance that explains where you are and what to do next.", icon: BrainCircuit },
  { title: "Gap Analysis", body: "See skill, evidence, confidence, and opportunity-readiness gaps.", icon: Target },
  { title: "Action Workspace", body: "Turn recommendations into projects, tasks, learning, and progress.", icon: Rocket },
  { title: "Network", body: "Find mentors, collaborators, peers, and support communities.", icon: Network },
  { title: "Opportunities", body: "Match with internships, jobs, competitions, funding, and growth routes.", icon: BriefcaseBusiness },
];

const productModules = [
  {
    title: "Intelligence",
    subtitle: "Personalised AI insight",
    body: "Understand strengths, skill gaps, career direction, readiness, and next steps from one evolving dashboard.",
    icon: BrainCircuit,
    href: "/intelligence",
    accent: "bg-violet-500",
  },
  {
    title: "Workspace",
    subtitle: "Guidance into action",
    body: "Convert AI recommendations into measurable tasks, projects, evidence, learning actions, and weekly progress.",
    icon: Rocket,
    href: "/workspace",
    accent: "bg-indigo-500",
  },
  {
    title: "Network",
    subtitle: "Mentors, peers, and support",
    body: "Discover mentors, collaborators, communities, and relationships connected to your goals and next actions.",
    icon: Network,
    href: "/network",
    accent: "bg-sky-500",
  },
  {
    title: "Organisation",
    subtitle: "Institutional visibility",
    body: "Help teams understand cohort readiness, track interventions, review progress, and measure real outcomes.",
    icon: Building2,
    href: "/organisation",
    accent: "bg-slate-900",
  },
];

const fragmentedSolutionCards = [
  {
    title: "Learning platforms",
    body: "Show content, but rarely explain which pathway fits the learner's goal.",
  },
  {
    title: "Job boards",
    body: "List vacancies, but do not help users build readiness or evidence.",
  },
  {
    title: "Networks",
    body: "Expose people, but often leave users unsure who to contact or why.",
  },
  {
    title: "VisionTech AI",
    body: "Connects diagnosis, action, projects, support, and opportunities into one guided journey.",
  },
];

const opportunityTypes = [
  "Jobs",
  "Internships",
  "Mentors",
  "Scholarships",
  "Competitions",
  "Funding",
  "Research",
  "Volunteer roles",
  "Accelerators",
];

const outcomeStats = [
  { value: "1", label: "guided intelligence journey" },
  { value: "6", label: "connected growth modules" },
  { value: "24/7", label: "AI guidance availability" },
  { value: "360°", label: "individual + institutional view" },
];

const audienceCards = [
  {
    title: "Clear Next Steps",
    body: "VisionTech AI turns your profile and activity into simple suggestions, helping beginners understand what action to take without needing to figure everything out alone.",
    icon: GraduationCap,
    points: ["Personal AI insight", "Workspace actions", "Matched opportunities", "Guided progress"],
    href: "/signup",
  },
  {
    title: "From Insight to Action",
    body: "The platform does more than show information. It helps you learn, build, collaborate, and move forward step by step in a practical way.",
    icon: Building2,
    points: ["Cohort visibility", "Readiness analytics", "Intervention tracking", "Institutional reports"],
    href: "/organization-auth",
  },
];

const trustItems = [
  "Privacy-conscious profile intelligence",
  "Administrator decisions stay human-led",
  "Designed for learners, institutions, and opportunity partners",
  "Built for measurable readiness and impact reporting",
];

const faqs = [
  {
    q: "What is VisionTech AI?",
    a: "VisionTech AI is an innovation intelligence platform that helps people understand their strengths, follow clearer pathways, build evidence, connect with support, and access relevant opportunities.",
  },
  {
    q: "Who is VisionTech for?",
    a: "It supports students, graduates, career changers, early professionals, mentors, training providers, universities, youth organisations, and opportunity partners.",
  },
  {
    q: "Does VisionTech replace mentors or advisors?",
    a: "No. AI supports better decisions by surfacing insight and next steps, while mentors, institutions, and users remain responsible for final action.",
  },
  {
    q: "What makes VisionTech different?",
    a: "VisionTech connects diagnosis, action, project evidence, networking, opportunities, and institutional analytics instead of leaving those steps fragmented.",
  },
  {
    q: "Can institutions use VisionTech?",
    a: "Yes. Organisation dashboards help teams monitor cohorts, interventions, readiness, opportunities, reports, and AI-guided institutional priorities.",
  },
];

export default function Home(): JSX.Element {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const intelligenceHref = user ? "/intelligence" : "/login";
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const [demoGoal, setDemoGoal] = useState("I want to become a cybersecurity analyst.");

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

  const demoResponse = buildDemoResponse(demoGoal);

  return (
    <div className="min-h-screen bg-[#f8f5ff] text-slate-950">
      <section id="home" className="relative overflow-hidden bg-[#12063a] px-6 pb-16 pt-24 text-white md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(216,207,252,0.28),transparent_32%),radial-gradient(circle_at_84%_18%,rgba(96,165,250,0.16),transparent_32%),linear-gradient(180deg,rgba(18,6,58,0)_0%,rgba(248,245,255,0.05)_100%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-7"
          >
            <motion.p variants={fadeUp} className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-[#d8cffc]">
              AI-Powered Innovation Intelligence Platform
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-headline text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Your AI guide for learning, careers, opportunities and innovation.
            </motion.h1>
            <motion.p variants={fadeUp} className="max-w-2xl text-lg leading-8 text-white/82 md:text-xl">
              Discover your strengths, uncover opportunities, connect with mentors, and receive personalised guidance that grows with you throughout your journey.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <a href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-headline font-bold text-[#1f0954] shadow-xl shadow-black/20 transition hover:bg-[#efe8ff]">
                Start Your Intelligence Journey <ArrowRight className="h-4 w-4" />
              </a>
              <a href={intelligenceHref} className="inline-flex items-center rounded-2xl border border-white/30 px-6 py-4 font-headline font-bold text-white transition hover:border-white hover:bg-white/10">
                Open Intelligence
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="grid gap-3 text-sm text-white/78 sm:grid-cols-3">
              {["Personal AI diagnosis", "Action workspace", "Opportunity ecosystem"].map((label) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2.2rem] bg-gradient-to-br from-indigo-400/25 via-white/10 to-sky-400/20 blur-2xl" />
            <DashboardPreview />
          </motion.div>
        </div>
        <motion.a
          href="#problem"
          className="relative mx-auto mt-12 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Explore <ChevronDown className="h-4 w-4" />
        </motion.a>
      </section>

      <section id="problem" className="border-t border-[#e7deff] bg-white px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-label text-xs font-black uppercase tracking-[0.28em] text-[#1f0954]">The Problem</p>
            <h2 className="mt-4 font-headline text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Young people don't lack potential. They lack direction.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-slate-650">
            <p>
              Millions struggle to discover opportunities, choose the right learning path, find mentors, and understand what to do next.
            </p>
            <p>
              Learning platforms show content. Job boards show vacancies. Networks show people. VisionTech connects the full journey so guidance becomes action.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Unclear pathways", "Hidden opportunities", "Weak project evidence"].map((item) => (
                <div key={item} className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fragmented-tools" className="border-t border-[#ece4ff] bg-[#fffdff] px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl space-y-10">
          <SectionHeader
            eyebrow="Why VisionTech Exists"
            title="Most tools solve one piece. Users need the whole journey."
            description="VisionTech is designed around progression: understand the user, recommend the next action, help them build evidence, and connect them to the right support."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {fragmentedSolutionCards.map((card, cardIndex) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: cardIndex * 0.05 }}
                className={`rounded-3xl border p-6 shadow-sm ${
                  card.title === "VisionTech AI"
                    ? "border-[#1f0954] bg-[#1f0954] text-white shadow-indigo-100"
                    : "border-slate-200 bg-white text-slate-950"
                }`}
              >
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${
                  card.title === "VisionTech AI" ? "text-[#d8cffc]" : "text-slate-400"
                }`}>
                  {cardIndex === fragmentedSolutionCards.length - 1 ? "Connected system" : "Fragmented tool"}
                </p>
                <h3 className="mt-3 font-headline text-2xl font-black tracking-tight">{card.title}</h3>
                <p className={`mt-3 text-sm leading-6 ${
                  card.title === "VisionTech AI" ? "text-white/78" : "text-slate-600"
                }`}>
                  {card.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="advanced" className="relative border-t border-[#e0d4ff] bg-[#f6f0ff] px-6 py-20 md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(216,207,252,0.32),transparent_42%),radial-gradient(circle_at_88%_20%,rgba(178,211,255,0.18),transparent_42%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
              className="space-y-4 text-center"
            >
              <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-[#1f0954]">
                How VisionTech AI Works for You
              </p>
              <h2 className="font-headline text-3xl font-bold text-[#1f0954] md:text-5xl">
                Designed to be clear, actionable, and dynamic.
              </h2>
              <p className="mx-auto max-w-4xl leading-relaxed text-slate-700">
                VisionTech AI is designed to feel simple to use, even if you are new. Each page has a clear purpose,
                from understanding your progress to finding the right people and opportunities.
              </p>
              <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
                {journeySteps.slice(0, 2).map((step) => (
                  <div key={step.title} className="rounded-xl border border-[#e6defc] bg-[#1f0954] p-3">
                    <p className="text-sm font-semibold text-white/90">{step.title}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {journeySteps.map((step, stepIndex) => {
                const Icon = step.icon;
                return (
                  <motion.article
                    key={step.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: stepIndex * 0.04 }}
                    className="relative rounded-3xl border border-[#e2d8ff] bg-white p-5 shadow-sm shadow-indigo-100/50"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f0954] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Step {stepIndex + 1}</p>
                    <h3 className="mt-2 font-headline text-lg font-black text-slate-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="bg-white px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl space-y-10">
          <SectionHeader
            eyebrow="Product Showcase"
            title="Not another career tool. A connected intelligence system."
            description="Each module has a job: diagnose direction, turn guidance into progress, connect people, and help organisations measure impact."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {productModules.map((module) => {
              const Icon = module.icon;
              return (
                <a
                  key={module.title}
                  href={module.href}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white ${module.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{module.subtitle}</p>
                  <h3 className="mt-2 font-headline text-2xl font-black text-slate-950 group-hover:text-[#1f0954]">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{module.body}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-indigo-700">
                    Explore module <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#e7deff] bg-[#fcf9ff] px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-3 text-center">
            <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-[#1f0954]">Opportunity Ecosystem</p>
            <h2 className="font-headline text-3xl font-bold text-slate-900 md:text-4xl">One profile can unlock many routes forward.</h2>
            <p className="mx-auto max-w-3xl leading-relaxed text-slate-700">
              VisionTech should help users discover more than jobs. It connects career direction with mentors, funding, competitions, internships, research, and growth programmes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {opportunityTypes.map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/10 p-5 text-center font-bold backdrop-blur transition hover:bg-white/15">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="audiences" className="bg-[#fbf9ff] px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl space-y-10">
          <SectionHeader
            eyebrow="Built For Both Sides"
            title="Individuals need direction. Organisations need visibility."
            description="VisionTech is strongest when personal growth and institutional support work together."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {audienceCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-[2rem] border border-[#e2d8ff] bg-white p-8 shadow-sm shadow-indigo-100/60">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f0954] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-3xl font-black tracking-tight text-slate-950">{card.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{card.body}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {card.points.map((point) => (
                      <div key={point} className="flex items-center gap-2 rounded-2xl bg-[#f4efff] px-4 py-3 text-sm font-bold text-[#1f0954]">
                        <CheckCircle2 className="h-4 w-4" />
                        {point}
                      </div>
                    ))}
                  </div>
                  <a href={card.href} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-[#1f0954]">
                    Continue <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="ai-demo" className="bg-white px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-label text-xs font-black uppercase tracking-[0.28em] text-[#1f0954]">Interactive AI Demo</p>
            <h2 className="mt-4 font-headline text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Show the transformation before asking users to sign up.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The homepage now demonstrates the kind of guidance users can expect: strengths, missing skills, projects, mentors, and opportunities.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-indigo-100">
            <label className="block text-xs font-black uppercase tracking-[0.22em] text-indigo-200">What are your goals?</label>
            <textarea
              value={demoGoal}
              onChange={(event) => setDemoGoal(event.target.value)}
              className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/40 focus:border-indigo-300"
            />
            <div className="mt-4 rounded-3xl bg-white p-5 text-slate-950">
              <div className="flex items-center gap-2 text-indigo-700">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-black">VisionTech AI Response</p>
              </div>
              <div className="mt-4 grid gap-3">
                {demoResponse.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-[#f4efff] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="outcomes" className="bg-[#f4efff] px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl space-y-10">
          <SectionHeader
            eyebrow="Outcomes Over Features"
            title="The promise is not more dashboards. It is clearer progress."
            description="VisionTech should be judged by the confidence, readiness, evidence, and opportunity access it helps create."
          />
          <div className="grid gap-4 md:grid-cols-4">
            {outcomeStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-[#e2d8ff] bg-white p-6 text-center shadow-sm">
                <p className="font-headline text-4xl font-black text-[#1f0954]">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item} className="flex gap-3 rounded-3xl bg-white p-5 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="vision" className="bg-white px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#e2d8ff] bg-gradient-to-br from-[#1f0954] to-slate-950 p-8 text-center text-white shadow-2xl shadow-indigo-100 md:p-12">
          <Lightbulb className="mx-auto h-10 w-10 text-[#d8cffc]" />
          <h2 className="mt-5 font-headline text-4xl font-black tracking-tight md:text-5xl">
            We believe opportunity should never depend on who you know.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/78">
            Every person deserves intelligent guidance. Every institution deserves actionable insights. VisionTech AI connects both.
          </p>
        </div>
      </section>

      <section className="bg-[#fffdff] px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <SectionHeader eyebrow="FAQs" title="Your questions, answered" description="Quick answers for individuals, institutions, and partners exploring VisionTech." />
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {faqs.map((item, questionIndex) => (
              <details key={item.q} className="group border-b border-slate-200 last:border-b-0">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 font-bold text-slate-900 transition hover:bg-[#f7f3ff]">
                  <span>{`${questionIndex + 1}. ${item.q}`}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-slate-100 bg-[#faf9ff] px-5 pb-5 pt-4 text-sm leading-7 text-slate-700">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1f0954] px-6 py-20 text-white md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_42%,rgba(216,207,252,0.2),transparent_38%)]" />
        <div className="relative mx-auto max-w-5xl space-y-6 text-center">
          <p className="font-label text-xs font-black uppercase tracking-[0.28em] text-white/70">Start Now</p>
          <h2 className="font-headline text-4xl font-black tracking-tight md:text-5xl">Discover your next opportunity.</h2>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-white/80">
            Start with your profile. Let VisionTech identify your direction, recommend next steps, and help you turn potential into measurable progress.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-headline font-bold text-[#1f0954] shadow-lg transition hover:bg-slate-100">
              Start Your Intelligence Journey <Sparkles className="h-4 w-4" />
            </a>
            <a href="/pricing" className="inline-flex items-center rounded-2xl border border-white/50 px-8 py-4 font-headline font-bold text-white transition hover:border-white hover:bg-white/10">
              Explore Plans
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
            <CheckCircle2 className="h-4 w-4" />
            <span>No experience required. Start where you are and grow with guidance.</span>
          </div>
          <div className="pt-3">
            <div className="inline-flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 transition hover:border-white hover:text-white">
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
          <p className="font-label text-xs font-black uppercase tracking-[0.28em] text-[#1f0954]">Access</p>
          <h3 className="font-headline text-3xl font-black text-[#0b1b2d] md:text-4xl">Join the waitlist</h3>
          <p className="leading-relaxed text-[#0b1b2d]">
            Be the first to try VisionTech. We're onboarding design partners, institutions, and opportunity partners shaping the future of guidance intelligence.
          </p>
          <form onSubmit={handleWaitlistSubmit} className="mt-4 grid gap-3 md:grid-cols-[2fr,1fr]">
            <input
              type="email"
              name="email"
              required
              value={waitlistEmail}
              onChange={(event) => setWaitlistEmail(event.target.value)}
              placeholder="Work email"
              className="rounded-2xl border border-[#d8cffc] bg-white px-4 py-3 text-sm text-[#0b1b2d] placeholder-slate-500 focus:border-[#1f0954] focus:outline-none focus:ring-2 focus:ring-[#d8cffc]"
            />
            <button type="submit" disabled={waitlistSubmitting} className="flex items-center justify-center gap-2 rounded-2xl bg-[#1f0954] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#1f0954]/25 transition hover:bg-black disabled:opacity-60">
              {waitlistSubmitting ? "Submitting..." : "Request Access"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          {waitlistMessage ? <p className="text-sm font-semibold text-[#1f0954]">{waitlistMessage}</p> : null}
          <div className="flex items-center justify-center gap-3 text-xs text-[#0b1b2d]/80">
            <Users className="h-4 w-4 text-[#1f0954]" />
            <span>We'll reach out with onboarding steps and pilot options.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardPreview(): JSX.Element {
  return (
    <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-black/35 backdrop-blur-xl">
      <div className="rounded-[1.5rem] bg-[#f8f5ff] p-5 text-slate-950">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">VisionTech Intelligence</p>
            <h3 className="mt-1 font-headline text-xl font-black">Opportunity Readiness Dashboard</h3>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">AI Ready</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-200">AI Summary</p>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Your strongest route is cloud support. Build practical troubleshooting evidence and apply to entry-level technical roles.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-black">Readiness Score</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-headline text-4xl font-black text-[#1f0954]">68%</span>
                <span className="pb-1 text-xs font-bold text-slate-500">ready</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[68%] rounded-full bg-indigo-600" />
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              { icon: Target, label: "Skill gap", value: "Troubleshooting evidence" },
              { icon: Rocket, label: "Next action", value: "Complete one project task" },
              { icon: MessageSquare, label: "Mentor signal", value: "Feedback recommended" },
              { icon: BriefcaseBusiness, label: "Opportunity", value: "Junior Cloud Internship" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4efff] text-[#1f0954]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="text-sm font-black text-slate-900">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-3 text-center">
      <p className="font-label text-xs font-black uppercase tracking-[0.28em] text-[#1f0954]">{eyebrow}</p>
      <h2 className="font-headline text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h2>
      <p className="text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function buildDemoResponse(goal: string): Array<{ label: string; value: string }> {
  const normalizedGoal = goal.toLowerCase();
  const isCybersecurity = normalizedGoal.includes("cyber") || normalizedGoal.includes("security");
  const isData = normalizedGoal.includes("data") || normalizedGoal.includes("analyst");

  if (isCybersecurity) {
    return [
      { label: "Strengths", value: "Curiosity, structured thinking, risk awareness, and problem-solving can transfer well into cybersecurity." },
      { label: "Missing Skills", value: "Networking basics, Linux, security fundamentals, incident response, and practical lab evidence." },
      { label: "Projects", value: "Build a home lab, write an incident report, document a vulnerability scan, and explain remediation steps." },
      { label: "Opportunities", value: "Target SOC trainee roles, cyber internships, cloud security projects, mentors, and beginner CTF communities." },
    ];
  }

  if (isData) {
    return [
      { label: "Strengths", value: "Analytical thinking, communication, curiosity, and pattern recognition can support a data pathway." },
      { label: "Missing Skills", value: "Spreadsheet modelling, SQL, Python basics, dashboarding, and portfolio storytelling." },
      { label: "Projects", value: "Clean a public dataset, build a small dashboard, and write a short insight report with recommendations." },
      { label: "Opportunities", value: "Target data internships, portfolio challenges, mentor reviews, and entry-level analyst communities." },
    ];
  }

  return [
    { label: "Strengths", value: "VisionTech would identify transferable strengths from your profile, experience, interests, and goals." },
    { label: "Missing Skills", value: "The platform would highlight the most important skills and evidence gaps for your chosen pathway." },
    { label: "Projects", value: "You would receive practical project suggestions designed to prove readiness, not just complete learning." },
    { label: "Opportunities", value: "VisionTech would surface mentors, communities, roles, scholarships, and experiences aligned with your direction." },
  ];
}
