import type { JSX } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Rocket,
  Target,
  ChartColumnBig,
  Globe,
  Handshake,
} from "lucide-react";

type PlatformFeature = {
  title: string;
  description: string;
  icon: JSX.Element;
};

type PathwayStep = {
  step: string;
  title: string;
  description: string;
};

const platformFeatures: PlatformFeature[] = [
  {
    title: "AI Career Intelligence",
    description:
      "Receive intelligent pathway analysis, career direction, and growth recommendations tailored to your skills, interests, goals, and current level.",
    icon: <BrainCircuit className="h-8 w-8 text-[#d8cffc]" />,
  },
  {
    title: "Smart Learning Pathways",
    description:
      "VisionTech AI sources and recommends the best external courses, certifications, and growth resources based on your chosen pathway.",
    icon: <Rocket className="h-8 w-8 text-[#d8cffc]" />,
  },
  {
    title: "Skill and Opportunity Matching",
    description:
      "Connect users to internships, projects, jobs, mentors, communities, and opportunities aligned with their profile and ambitions.",
    icon: <Target className="h-8 w-8 text-[#d8cffc]" />,
  },
  {
    title: "Personal Growth Dashboard",
    description:
      "Track your development journey, project progress, milestones, strengths, and improvement areas from one intelligent workspace.",
    icon: <ChartColumnBig className="h-8 w-8 text-[#d8cffc]" />,
  },
  {
    title: "Multi-Career Ecosystem",
    description:
      "VisionTech is not limited to technology careers. Users can transition from any industry into another with guided support.",
    icon: <Globe className="h-8 w-8 text-[#d8cffc]" />,
  },
  {
    title: "Collaboration and Networking",
    description:
      "Build connections with like-minded learners, teams, volunteers, founders, institutions, and innovators globally.",
    icon: <Handshake className="h-8 w-8 text-[#d8cffc]" />,
  },
];

const pathwaySteps: PathwayStep[] = [
  {
    step: "01",
    title: "Create Your Profile",
    description:
      "Users complete intelligent onboarding covering skills, interests, goals, personality traits, preferred learning style, and aspirations.",
  },
  {
    step: "02",
    title: "AI Pathway Analysis",
    description:
      "VisionTech AI analyzes user data to identify strengths, skill gaps, career alignment, and growth opportunities.",
  },
  {
    step: "03",
    title: "Receive Recommendations",
    description:
      "Users receive personalized career pathways, project ideas, external learning resources, certifications, and opportunity suggestions.",
  },
  {
    step: "04",
    title: "Track and Grow",
    description:
      "Users monitor progress, update achievements, complete projects, and continuously refine their pathway with AI guidance.",
  },
];

export default function Platform(): JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f3ff] via-[#ede4ff] to-[#daccfb] text-[#1f0954] overflow-hidden">
      <section className="relative border-b border-[#d8cffc]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(216,207,252,0.45),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.5),transparent_30%)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#bca8ff]/60 bg-white/75 text-[#3a1f85] text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#7458da]" />
              AI-Powered Innovation Intelligence Platform
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
              Build Your Future With
              <span className="block text-[#4a2aa3]">VisionTech AI</span>
            </h1>

            <p className="text-[#1f0954]/80 text-lg leading-8 max-w-2xl mb-9">
              VisionTech AI is an intelligent growth ecosystem that helps users discover career pathways,
              transition into new industries, identify skill gaps, and access opportunities using advanced AI-driven analysis.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="px-7 py-3 rounded-xl bg-white text-[#1f0954] font-semibold transition hover:bg-white/90">
                Get Started
              </Link>
              <a
                href="#features"
                className="px-7 py-3 rounded-xl border border-[#7458da]/45 text-[#3a1f85] hover:bg-[#f2ebff] transition"
              >
                Explore Platform
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-[#1f0954] text-white border border-white/20 rounded-[28px] p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Intelligence Snapshot</h3>
                  <p className="text-white/70 text-sm mt-1">Personalized AI insight overview</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs border border-emerald-300/30">
                  Live AI Analysis
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl p-5 border border-white/10 bg-[#140a3f]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Career Match</h4>
                    <span className="text-[#d8cffc] text-sm">92%</span>
                  </div>
                  <div className="w-full bg-white/15 h-3 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#d8cffc] to-[#bda9ff]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5 border border-white/10 bg-[#140a3f]">
                    <p className="text-white/70 text-sm mb-2">Recommended Path</p>
                    <h4 className="font-semibold">Cloud Security</h4>
                  </div>
                  <div className="rounded-2xl p-5 border border-white/10 bg-[#140a3f]">
                    <p className="text-white/70 text-sm mb-2">Skill Gap</p>
                    <h4 className="font-semibold">DevOps Automation</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-center mb-14">
          <p className="text-[#5c3bb8] font-semibold mb-4 uppercase tracking-[0.3em] text-sm">Platform Features</p>
          <h2 className="text-4xl lg:text-5xl font-black mb-6">Everything Needed For Intelligent Growth</h2>
          <p className="text-[#1f0954]/75 max-w-3xl mx-auto text-lg leading-8">
            VisionTech AI combines intelligent guidance, opportunity discovery, pathway analysis,
            networking, and progress tracking into one unified ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {platformFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white/90 border border-[#d8cffc] rounded-3xl p-7 shadow-sm hover:border-[#9f85f0] hover:shadow-md transition"
            >
              <div className="mb-5">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-[#2f1576]">{feature.title}</h3>
              <p className="text-[#1f0954]/85 leading-7 text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d8cffc] bg-gradient-to-b from-[#2a1167] to-[#1f0954] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#d8cffc] font-semibold mb-4 uppercase tracking-[0.3em] text-sm">How It Works</p>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-8">
                Intelligent Pathway Guidance Built Around The User
              </h2>
              <p className="text-white/75 text-lg leading-8">
                The VisionTech ecosystem is designed to understand the user deeply before delivering
                intelligent recommendations and opportunities.
              </p>
            </div>

            <div className="space-y-5">
              {pathwaySteps.map((item) => (
                <div key={item.step} className="flex gap-5 bg-white/10 border border-white/15 rounded-3xl p-5">
                  <div className="min-w-[58px] h-[58px] rounded-xl bg-[#d8cffc]/20 border border-[#d8cffc]/30 flex items-center justify-center text-[#efe8ff] font-black text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-white/75 leading-7">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="rounded-[34px] p-10 lg:p-14 bg-gradient-to-r from-[#1f0954] to-[#3a1f85] text-white border border-[#d8cffc]/30 shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[#d8cffc] font-semibold mb-4 uppercase tracking-[0.3em] text-sm">Vision Statement</p>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-7">
                Helping People Navigate Their Future Intelligently
              </h2>
              <p className="text-white/85 text-lg leading-8 mb-8">
                VisionTech AI exists to bridge the gap between ambition and opportunity by providing intelligent guidance,
                personalized growth systems, and access to global learning and career opportunities.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-[#1f0954] font-semibold hover:bg-white/90 transition">
                Join VisionTech <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
