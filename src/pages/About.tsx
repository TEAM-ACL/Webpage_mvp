import type { JSX } from "react";
import { motion } from "motion/react";

type TeamMember = {
  name: string;
  title: string;
  focus: string[];
  description: string;
};

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

export default function About(): JSX.Element {
  return (
    <div className="pt-4">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 silent-grid opacity-20 -z-10" />
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-8"
          >
            <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary font-bold">
              About VisionTech
            </span>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-[1.1] tracking-tighter text-primary">
              Empowering the next generation through intelligent technology pathways
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
              VisionTech is built to bridge the gap between learning and opportunity, guiding individuals toward meaningful careers through structured pathways, data-driven insights, and accessible innovation.
            </p>
            <div className="flex items-center space-x-4">
              <div className="h-px w-12 bg-outline-variant" />
              <span className="font-label text-sm text-on-surface-variant/60 italic">
                Est. 2026 Mvp Prototype
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-surface-container-low rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBraHS9FDy6yFZBEleRQvWwZtRtcOFP0hsJRY5DaaClFLGCbatrnpRlxCrW8XLFb-k7H3uU8UXfE3uVZ2vzeXNswJZxyLYsWTEDFtJL1dzzmwSjMelF0k-GzJxNzt3ABut4uY_X2b7XUN5ghnx_UynHBUYaoLQq9P1M7sHnqradGIWbW2junKtitQfMh9OJWojL23lY9VHOUADBd5dTtC8nGclM1qq1pw4ecJO8rr7XPSCYsQpsEm5jrZaXEKeEXU-lXscEwF_x672B"
                alt="Abstract AI Visualization"
                className="w-full h-full object-cover mix-blend-overlay opacity-80 transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* VisionTech Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-sky-500 font-bold">VisionTech story</p>
            <h2 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">
              Built to make innovation inevitable
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              VisionTech was created from a simple but powerful observation: talented people want technology careers but
              lack structured guidance on where to begin or how to progress.
            </p>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Learning resources are abundant yet fragmented, overwhelming, and disconnected from real opportunities.
              Many spend years studying without clarity, direction, or measurable progress toward employment.
            </p>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              VisionTech brings learning, career guidance, and opportunities into one intelligent ecosystem. By combining
              cloud technologies, structured pathways, and data-driven insights, we move users from ambition to achievement
              through clear, guided progression.
            </p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
            {[
              { label: "Prototype", detail: "Launched in 2026 as a working MVP to validate intelligent pathways and human–AI collaboration in guiding users toward technology opportunities." },
              { label: "Early pilots", detail: "Initial concept development and validation began in 2025 through practical experimentation with structured learning pathways and recommendation logic." },
              { label: "Now", detail: "An emerging intelligence platform connecting user capabilities with relevant opportunities through data-driven insights and guided progression." },
            ].map((item) => (
              <div key={item.label} className="p-6 rounded-2xl bg-surface-container-low shadow-sm border border-outline-variant/20">
                <p className="font-label text-xs uppercase tracking-[0.25em] text-primary mb-2">{item.label}</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Motivation */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-secondary font-bold">Founder motivation</p>
            <h3 className="text-3xl md:text-4xl font-headline font-bold text-primary">From lived experience to designed access</h3>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Having navigated academic advancement, professional transitions, and hands-on technical development across cloud
              computing, IT support, and digital platforms, our founder recognized a recurring challenge: people are willing to
              learn but lack direction, mentorship, and practical guidance aligned with industry needs.
            </p>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              This inspired VisionTech - to simplify the journey into technology careers while making opportunities accessible
              to individuals regardless of background. The motivation is rooted in service, innovation, and the belief that
              technology can be a powerful equalizer when knowledge and opportunity are made accessible.
            </p>
          </div>
          <div className="lg:col-span-6 rounded-[2rem] overflow-hidden shadow-xl bg-white">
            <img
              src="https://images.pexels.com/photos/4467010/pexels-photo-4467010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Founder motivation" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Problem We Solve */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8 space-y-10">
          <div className="space-y-4 max-w-4xl">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-tertiary font-bold">The problem VisionTech solves</p>
            <h3 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">Navigating technology careers is overwhelming without a guide</h3>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Learning paths are unclear, content is disconnected from outcomes, and opportunities remain hidden for those without guidance or networks.
              Career transitions into technology lack a structured support system.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Learning paths are unclear and often overwhelming.",
              "Educational content is disconnected from real career outcomes.",
              "Individuals struggle to identify which skills align with their goals.",
              "Opportunities remain inaccessible without guidance or networks.",
              "Career transitions into technology lack structured support systems.",
            ].map((item) => (
              <div key={item} className="p-6 bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant/20">
                <p className="text-sm text-on-surface-variant leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-sky-500 font-bold">Vision</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">
              To become a globally accessible platform that empowers individuals to unlock their potential through technology.
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Enable inclusive participation in the digital economy by creating pathways toward sustainable careers.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-sky-500 font-bold">Mission</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">
              Bridge the gap between education and employability with structured, intelligent, and accessible technology pathways.
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Guide individuals toward relevant skills, use data and AI for informed career decisions, reduce barriers to entry,
              empower youth and underserved communities through innovation, and turn learning into measurable opportunity and growth.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl font-headline font-bold text-primary tracking-tight">Core values</h2>
              <p className="mt-4 text-on-surface-variant text-lg">
                The guardrails that keep our innovation engine accountable to people.
              </p>
            </div>
            <div className="text-right">
              <p className="font-label text-[10px] uppercase tracking-widest text-outline-variant font-bold">Version 2026</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Accessibility",
                desc: "Technology opportunities should not be limited by geography, background, or starting point. Guidance and pathways stay open to anyone willing to grow.",
              },
              {
                title: "Innovation",
                desc: "Embrace modern cloud, AI, and data-driven systems to create smarter, more effective learning experiences.",
              },
              {
                title: "Empowerment",
                desc: "Help individuals take control of their development with structured support, mentorship, and informed decision-making.",
              },
              {
                title: "Ethical AI",
                desc: "Build AI responsibly and transparently-recommendations assist users, protect privacy, and keep fairness at the core.",
              },
            ].map((value, idx) => (
              <div
                key={value.title}
                className="bg-surface-container-low p-8 rounded-[1.75rem] shadow-sm border border-outline-variant/30 flex flex-col space-y-4"
              >
                <span className="text-sm font-label uppercase tracking-[0.25em] text-outline-variant">{`0${idx + 1}`}</span>
                <h3 className="text-2xl font-headline font-bold text-primary">{value.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Commitment */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-6xl mx-auto px-8 text-center space-y-4">
          <p className="font-label text-[11px] uppercase tracking-[0.3em] text-secondary font-bold">Our commitment</p>
          <h3 className="text-3xl md:text-4xl font-headline font-bold text-primary">Learning should always lead to opportunity</h3>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            VisionTech is committed to building a future where learning leads to opportunity, innovation drives inclusion, and
            technology becomes a bridge rather than a barrier. Through continuous improvement and community collaboration, we
            aim to create lasting impact for individuals and society.
          </p>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section id="team" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-[#1f0954] font-bold mb-4 block">
              The Curators
            </span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-[#1f0954] tracking-tight">Meet the Team</h2>
            <p className="mt-6 text-on-surface-variant text-lg">
              A multidisciplinary collective dedicated to bridging the gap between human potential and machine intelligence.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-slate-200 bg-[#1f0954] p-6 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white/100">{member.name}</p>
                    <p className="text-sm text-white/100">{member.title}</p>
                  </div>
                </div>
                <p className="text-white/100 text-sm leading-relaxed">{member.description}</p>
                <div className="flex flex-wrap gap-2">
                  {member.focus.map((area) => (
                    <span
                      key={area}
                      className="text-xs px-3 py-1 rounded-full border border-[#d8cffc] bg-[#f2ecff] text-[#1f0954]"
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
    </div>
  );
}

