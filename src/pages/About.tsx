import type { JSX } from "react";
import { motion } from "motion/react";
import { Layers, Brain, Zap } from "lucide-react";

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
              The Mission
            </span>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-[1.1] tracking-tighter text-primary">
              The Future of Curation is Human + AI
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
              VisionTech's mission is to close the gap between education and employability by delivering
              personalized learning and career pathways, leveraging AI-driven insights to inform skill development.
            </p>
            <div className="flex items-center space-x-4">
              <div className="h-px w-12 bg-outline-variant" />
              <span className="font-label text-sm text-on-surface-variant/60 italic">
                Est. 2024 Laboratory Prototype
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

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-sky-500 font-bold">Vision</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">
              Become the global intelligence layer for human innovation.
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Enable individuals and organisations to discover, connect, and build high-impact solutions through AI-driven capability understanding.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-sky-500 font-bold">Mission</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">
              Develop the AI-powered innovation intelligence platform.
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Analyse human skills, potential, and collaboration compatibility to form stronger teams, accelerate innovation, and improve how talent and ideas become successful ventures.
            </p>
          </div>
        </div>
      </section>

      {/* About VisionTech */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8 space-y-6 text-slate-800">
          <p className="font-label text-[11px] uppercase tracking-[0.3em] text-sky-500 font-bold">About VisionTech</p>
          <div className="space-y-4 text-slate-700 leading-relaxed">
            <p>
              Where AI innovation meets strategic insight - beyond community programming. VisionTech improves how people discover opportunities, form teams, and build impactful solutions. Traditional platforms optimise for resumes or generic networking; VisionTech uses AI to understand capability beyond static credentials.
            </p>
            <p>
              By analysing skills, behaviour, learning progress, and collaboration fit, the platform recommends innovation partners and co-founders, personalised growth pathways, project opportunities, and emerging innovation areas aligned to user strengths.
            </p>
            <p>
              We transform fragmented talent ecosystems into structured innovation networks, reducing friction between ideas and execution for organisations, investors, and builders.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-surface-container-low py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-5 space-y-8">
              <h2 className="text-4xl font-headline font-bold text-primary tracking-tight">Our Story</h2>
              <div className="space-y-6 text-lg text-on-surface-variant leading-relaxed">
                <p>
                  What began as a <span className="text-secondary font-bold">living laboratory</span> for semantic
                  research has evolved into a global pulse of innovation intelligence.
                </p>
                <p>
                  VisionTech was founded on a singular premise: that information abundance shouldn't lead to
                  cognitive fatigue. We built a system that filters noise through the lens of human intent.
                </p>
                <p>
                  Today, we are a network of creators, technologists, and thinkers using asymmetric flow to redefine how
                  knowledge is discovered and deployed.
                </p>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl bg-white">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBj4yoSlN388ZVDh41SVrqcoLTThT0-zelo7c1-ysfiGI1tKmaP8MAXouwsbFF9eJRhQh-i7PRIegSmXOsjfB7M_HFanG_x0t9U9xlBTBGq1Xf2HU4MoZ22mWswWhTp4ch2ctqdUqDLDPMyF6eLVG8d28TYUBPFOGH31lGk0f1CXzjekS_M11vOZqCyUkzNSONRWap2X6C5rlZo4WJ95oYKYkvZE_P1Sgv1X5JHwQ31tjoNUBrrCybKv-vd-N-u19FbQzzj0nSoZVtZ"
                    alt="Tech Research"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="bg-primary text-white p-8 rounded-3xl shadow-xl">
                  <p className="text-4xl font-headline font-bold">500TB+</p>
                  <p className="text-xs font-label uppercase tracking-widest opacity-70 mt-1">Daily Synthesis</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-secondary-container text-secondary p-8 rounded-3xl shadow-xl">
                  <p className="text-4xl font-headline font-bold">12ms</p>
                  <p className="text-xs font-label uppercase tracking-widest opacity-70 mt-1">Latency Target</p>
                </div>
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl bg-white">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTu26Zs0VG30tG6bH7QtIrpmmjV7u5Qn0ywvvvkkHSSpkGfq7LSLJtm-9DwC9A3IX5Z1xKsTgiXgl2D-TiR1pJBvSj-ZJCDJ-Lhgtn-sDgLN7YMtfU1TKdcXlx8Nk3OUMe6WuCyzRlmM-hYqIORMMpSgCSDhWtqH7V40FFECsTfw7jZzhJvMFq47kXDPnxjm_awK1XFwj2GR1AmZ9H85bGmD-duWdKT6gpxjgey8i2yFTPFj8qMLd2DhLknGOF1cBQRNuc_mAq5Wcf"
                    alt="Network"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Engine Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-tertiary font-bold mb-4 block">
              The Engine
            </span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">
              Asymmetric Intelligence
            </h2>
            <p className="mt-6 text-on-surface-variant text-lg leading-relaxed">
              Our embedding engine goes beyond keywords. It identifies the latent patterns between human capability and
              market opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Vector Embeddings",
                desc: "Multidimensional mapping of concepts allows the AI to understand the 'spirit' of a query, not just the letters.",
                icon: <Layers className="w-8 h-8" />,
                color: "bg-secondary/10 text-secondary",
              },
              {
                title: "Neural Matching",
                desc: "Connecting individuals to opportunities based on cognitive affinity and historical trajectory.",
                icon: <Brain className="w-8 h-8" />,
                color: "bg-tertiary/10 text-tertiary",
              },
              {
                title: "Kinetic Synthesis",
                desc: "A self-optimizing loop where human interaction refines the AI's understanding of relevance.",
                icon: <Zap className="w-8 h-8" />,
                color: "bg-primary/10 text-primary",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-[0_12px_40px_rgba(25,28,29,0.04)] border border-outline-variant/10"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-headline font-bold mb-4 text-primary">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-surface-container-low py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl font-headline font-bold text-primary tracking-tight">Our Core Values</h2>
              <p className="mt-4 text-on-surface-variant text-lg">
                The ethical scaffolding that supports our innovation engine.
              </p>
            </div>
            <div className="text-right">
              <p className="font-label text-[10px] uppercase tracking-widest text-outline-variant font-bold">Code of Conduct v2.4</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-outline-variant/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
            {[
              {
                num: "01",
                title: "Radical Curiosity",
                desc: "We never accept the surface-level answer. Discovery requires deep, persistent questioning of the status quo.",
              },
              {
                num: "02",
                title: "Algorithmic Integrity",
                desc: "Transparency in logic is our priority. We design AI systems that are explainable, fair, and rigorously audited.",
              },
              {
                num: "03",
                title: "Human-Centric Innovation",
                desc: "Technology is a servant to the human spirit. If it doesn't empower a person, it doesn't belong in our stack.",
              },
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-12 flex flex-col space-y-6">
                <span className="text-7xl font-headline font-black text-outline-variant/10">{value.num}</span>
                <h3 className="text-2xl font-headline font-bold text-primary">{value.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
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
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{member.name}</p>
                    <p className="text-sm text-[#1f0954]">{member.title}</p>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{member.description}</p>
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
