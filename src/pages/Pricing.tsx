import type { JSX } from "react";
import { Link } from "react-router-dom";

type PricingPlan = {
  name: string;
  audience: string;
  price: string;
  billing: string;
  description: string;
  badge: string;
  highlight: boolean;
  features: string[];
  button: string;
};

type InstitutionalPlan = {
  name: string;
  audience: string;
  price: string;
  billing: string;
  description: string;
  features: string[];
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Core Platform Access",
    audience: "Young users aged 16 to 35",
    price: "Free",
    billing: "For eligible young users",
    description:
      "Start your growth journey with AI-powered pathway guidance, basic opportunity discovery, and access to personal development tools.",
    badge: "Best for individuals",
    highlight: false,
    features: [
      "Personal onboarding profile",
      "Basic AI pathway insight",
      "Recommended external learning resources",
      "Career and skill direction",
      "Basic progress dashboard",
    ],
    button: "Start for Free",
  },
  {
    name: "Premium User Features",
    audience: "Engaged individual users",
    price: "£4.99 - £9.99",
    billing: "per month",
    description:
      "Unlock deeper AI insights, more advanced pathway recommendations, progress tracking, and stronger personal growth support.",
    badge: "Most accessible upgrade",
    highlight: true,
    features: [
      "Advanced AI pathway analysis",
      "Detailed skill gap breakdown",
      "Priority learning recommendations",
      "Project and milestone tracking",
      "Premium opportunity alerts",
      "Improved profile visibility",
    ],
    button: "Upgrade Plan",
  },
  {
    name: "Employer Talent Matching",
    audience: "SMEs and graduate employers",
    price: "£200 - £500",
    billing: "per match or subscription",
    description:
      "Connect with suitable young talent, career switchers, graduates, and skilled users based on intelligent matching and profile readiness.",
    badge: "For employers",
    highlight: false,
    features: [
      "AI-supported candidate matching",
      "Skill and readiness indicators",
      "Graduate and early-career talent access",
      "Shortlisted candidate profiles",
      "Employer opportunity posting",
    ],
    button: "Match Talent",
  },
];

const institutionalPlans: InstitutionalPlan[] = [
  {
    name: "Institutional Standard",
    audience: "Youth organisations and colleges",
    price: "£99 - £299",
    billing: "per month",
    description:
      "Support learners and young people with structured AI guidance, pathway planning, and progress visibility.",
    features: [
      "Organisation dashboard",
      "Learner pathway visibility",
      "Basic reporting insights",
      "User group management",
      "Support for youth programmes",
    ],
  },
  {
    name: "Institutional Enterprise",
    audience: "Local councils and large providers",
    price: "£500 - £1,500",
    billing: "per month",
    description:
      "Scale intelligent career and opportunity guidance across larger communities, councils, and delivery partners.",
    features: [
      "Advanced institutional dashboard",
      "Multi-group user management",
      "Programme outcome visibility",
      "Priority support and onboarding",
      "Data-led impact reporting",
    ],
  },
  {
    name: "Programme Licensing",
    audience: "Government bodies and large NGOs",
    price: "£5,000 - £20,000",
    billing: "per annum",
    description:
      "License VisionTech AI to support large-scale youth development, employability, reskilling, and opportunity access programmes.",
    features: [
      "Programme-level platform licensing",
      "Custom deployment support",
      "Strategic reporting and insights",
      "Partner programme alignment",
      "Large-scale user onboarding",
    ],
  },
];

const comparisonRows = [
  ["Target users", "Individuals", "Institutions", "Employers", "Government / NGOs"],
  ["AI pathway insight", "Included", "Included", "Talent-focused", "Programme-wide"],
  ["Progress tracking", "Basic to premium", "Organisation level", "Candidate readiness", "Impact reporting"],
  ["Opportunity matching", "Personalized", "Group support", "Employer matching", "Large-scale access"],
  ["Best use case", "Career growth", "Learner support", "Hiring", "Programme delivery"],
];

export default function Pricing(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#f7f3ff] text-[#1f0954] overflow-hidden">
      <section className="relative overflow-hidden bg-[#1f0954] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(188,168,255,0.34),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(116,88,218,0.35),_transparent_38%)]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#7458da]/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full bg-[#9f85f0]/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[#d8cffc] text-sm font-medium mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#bca8ff] shadow-lg shadow-[#bca8ff]/60" />
            Flexible pricing for individuals, institutions, employers, and programme partners
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-tight max-w-5xl mx-auto mb-8">
            Simple Pricing For A Smarter Growth Ecosystem
          </h1>

          <p className="text-[#ede4ff] text-lg lg:text-xl leading-9 max-w-4xl mx-auto mb-12">
            VisionTech AI is designed to remain accessible for young users while creating sustainable revenue through premium features,
            institutional subscriptions, employer talent matching, and programme licensing.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="px-8 py-4 rounded-2xl bg-white text-[#1f0954] font-bold hover:bg-[#ede4ff] transition-all duration-300 shadow-2xl shadow-black/20">
              Start Free
            </Link>
            <a href="#institutional-plans" className="px-8 py-4 rounded-2xl border border-white/25 text-white hover:bg-white/10 transition-all duration-300">
              View Institutional Plans
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[32px] p-8 border transition-all duration-500 ${
                plan.highlight
                  ? "bg-[#1f0954] text-white border-[#7458da] shadow-2xl shadow-[#7458da]/30 scale-[1.02]"
                  : "bg-white text-[#1f0954] border-[#d8cffc] shadow-xl shadow-[#1f0954]/5 hover:shadow-2xl hover:shadow-[#7458da]/20"
              }`}
            >
              {plan.highlight ? (
                <div className="absolute -top-5 left-8 px-5 py-2 rounded-full bg-[#bca8ff] text-[#1f0954] text-sm font-bold shadow-lg">
                  Recommended
                </div>
              ) : null}

              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold mb-6 ${plan.highlight ? "bg-white/10 text-[#d8cffc]" : "bg-[#ede4ff] text-[#3a1f85]"}`}>
                {plan.badge}
              </div>

              <h2 className="text-3xl font-black mb-3">{plan.name}</h2>
              <p className={`${plan.highlight ? "text-[#d8cffc]" : "text-[#4a2aa3]"} font-medium mb-6`}>
                {plan.audience}
              </p>

              <div className="mb-6">
                <span className="text-4xl lg:text-5xl font-black">{plan.price}</span>
                <p className={`mt-2 ${plan.highlight ? "text-[#d8cffc]" : "text-[#5c3bb8]"}`}>{plan.billing}</p>
              </div>

              <p className={`leading-8 mb-8 ${plan.highlight ? "text-white/80" : "text-[#1f0954]/75"}`}>
                {plan.description}
              </p>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={`${plan.name}-${feature}`} className="flex gap-3 items-start">
                    <span className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${plan.highlight ? "bg-[#bca8ff] text-[#1f0954]" : "bg-[#d8cffc] text-[#1f0954]"}`}>
                      ✓
                    </span>
                    <span className={`${plan.highlight ? "text-white/85" : "text-[#1f0954]/80"}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button type="button" className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${plan.highlight ? "bg-white text-[#1f0954] hover:bg-[#ede4ff]" : "bg-[#1f0954] text-white hover:bg-[#3a1f85]"}`}>
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="institutional-plans" className="bg-[#ede4ff] border-y border-[#d8cffc]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-start">
            <div>
              <p className="text-[#5c3bb8] font-bold uppercase tracking-[0.28em] text-sm mb-5">
                Institutional Pricing
              </p>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
                Built For Organisations That Support Growth At Scale
              </h2>
              <p className="text-[#1f0954]/75 text-lg leading-8">
                VisionTech gives institutions and programme partners a structured way to guide users, monitor growth,
                improve employability outcomes, and evidence impact across different groups.
              </p>
            </div>

            <div className="grid gap-6">
              {institutionalPlans.map((plan) => (
                <div key={plan.name} className="bg-white rounded-[28px] border border-[#d8cffc] p-7 shadow-lg shadow-[#1f0954]/5 hover:shadow-xl hover:shadow-[#7458da]/20 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5">
                    <div>
                      <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                      <p className="text-[#5c3bb8] font-medium">{plan.audience}</p>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-3xl font-black text-[#1f0954]">{plan.price}</p>
                      <p className="text-[#5c3bb8] text-sm mt-1">{plan.billing}</p>
                    </div>
                  </div>

                  <p className="text-[#1f0954]/75 leading-8 mb-6">{plan.description}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    {plan.features.map((feature) => (
                      <div key={`${plan.name}-${feature}`} className="flex items-center gap-3 rounded-2xl bg-[#f7f3ff] border border-[#ede4ff] px-4 py-3">
                        <span className="w-5 h-5 rounded-full bg-[#d8cffc] flex items-center justify-center text-[#1f0954] text-xs">✓</span>
                        <span className="text-sm text-[#1f0954]/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="text-center mb-14">
          <p className="text-[#5c3bb8] font-bold uppercase tracking-[0.28em] text-sm mb-5">
            Plan Comparison
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[#d8cffc] bg-white shadow-xl shadow-[#1f0954]/5">
          <div className="grid grid-cols-5 bg-[#1f0954] text-white font-bold text-sm lg:text-base">
            <div className="p-5 border-r border-white/10">Category</div>
            <div className="p-5 border-r border-white/10">Users</div>
            <div className="p-5 border-r border-white/10">Institutions</div>
            <div className="p-5 border-r border-white/10">Employers</div>
            <div className="p-5">Licensing</div>
          </div>

          {comparisonRows.map((row) => (
            <div key={row[0]} className="grid grid-cols-5 border-t border-[#ede4ff] text-sm lg:text-base">
              {row.map((cell, cellIndex) => (
                <div
                  key={`${row[0]}-${cell}`}
                  className={`p-5 border-r border-[#ede4ff] last:border-r-0 ${cellIndex === 0 ? "font-bold text-[#1f0954] bg-[#f7f3ff]" : "text-[#1f0954]/75"}`}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="relative overflow-hidden rounded-[40px] bg-[#140a3f] text-white p-10 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(188,168,255,0.28),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(116,88,218,0.28),_transparent_35%)]" />

          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
                A Pricing Model Designed For Impact And Sustainability
              </h2>
              <p className="text-[#d8cffc] text-lg leading-8 mb-8">
                VisionTech remains accessible to young users while allowing institutions, employers, government bodies,
                and NGOs to fund wider impact through structured subscriptions, licensing, and talent-matching services.
              </p>

              <div className="flex flex-wrap gap-4">
                <button type="button" className="px-8 py-4 rounded-2xl bg-[#d8cffc] text-[#1f0954] font-bold hover:bg-white transition-all duration-300">
                  Request Partnership Pricing
                </button>
                <button type="button" className="px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition-all duration-300">
                  Speak To VisionTech
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white/10 border border-white/10 p-6 backdrop-blur-sm">
                <p className="text-3xl font-black text-[#d8cffc]">Free</p>
                <p className="text-white/70 mt-2">Core youth access</p>
              </div>
              <div className="rounded-3xl bg-white/10 border border-white/10 p-6 backdrop-blur-sm">
                <p className="text-3xl font-black text-[#d8cffc]">£9.99</p>
                <p className="text-white/70 mt-2">Max premium monthly plan</p>
              </div>
              <div className="rounded-3xl bg-white/10 border border-white/10 p-6 backdrop-blur-sm">
                <p className="text-3xl font-black text-[#d8cffc]">£1.5k</p>
                <p className="text-white/70 mt-2">Enterprise monthly ceiling</p>
              </div>
              <div className="rounded-3xl bg-white/10 border border-white/10 p-6 backdrop-blur-sm">
                <p className="text-3xl font-black text-[#d8cffc]">£20k</p>
                <p className="text-white/70 mt-2">Programme licensing ceiling</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

