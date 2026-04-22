import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type WalkthroughSlide = {
  id: number;
  stage: string;
  title: string;
  action: string;
  expectation: string;
  image: string;
};

const slides: WalkthroughSlide[] = [
  {
    id: 1,
    stage: "Access",
    title: "Sign in securely",
    action: "A new user begins on the login page and authenticates with their account.",
    expectation: "VisionTech establishes a secure session and routes the user into the guided experience.",
    image: "/demo/01-login-page.png",
  },
  {
    id: 2,
    stage: "Activation",
    title: "Complete account setup",
    action: "After registration, the user confirms successful account creation.",
    expectation: "The account is active and ready for profile-driven onboarding.",
    image: "/demo/02-successful-signup.png",
  },
  {
    id: 3,
    stage: "Onboarding",
    title: "Capture goals and skills",
    action: "The user completes onboarding inputs including interests, goals, and capability baseline.",
    expectation: "Backend profile data becomes the source for recommendations and matching.",
    image: "/demo/03-onboarding.png",
  },
  {
    id: 4,
    stage: "Guidance",
    title: "Review personal dashboard",
    action: "The user enters their dashboard to see progress, priorities, and suggested direction.",
    expectation: "The experience shifts from setup to action with personalized signals.",
    image: "/demo/04-user-dashboard.png",
  },
  {
    id: 5,
    stage: "Profile",
    title: "Refine profile data",
    action: "Users can view and edit profile details to keep recommendations relevant.",
    expectation: "Profile changes improve recommendation quality and matching precision over time.",
    image: "/demo/05-view-edit-profile.png",
  },
  {
    id: 6,
    stage: "Matching",
    title: "Explore smart matches",
    action: "The user opens matching views to discover collaborators and opportunity-aligned connections.",
    expectation: "VisionTech surfaces high-fit matches with transparent relevance context.",
    image: "/demo/06-explore-matching.png",
  },
  {
    id: 7,
    stage: "Execution",
    title: "Work in collaboration space",
    action: "Users move into workspace/collaboration surfaces to execute projects and tasks.",
    expectation: "Guidance turns into measurable progress through practical, team-ready workflow.",
    image: "/demo/07-collab-workspace.png",
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function OnboardingWalkthroughSlideshow(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const imageScrollRef = useRef<HTMLDivElement | null>(null);

  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [autoplay]);

  useEffect(() => {
    if (!imageScrollRef.current) return;
    imageScrollRef.current.scrollTop = 0;
  }, [activeIndex]);

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-[#ece2ff] px-6 py-20 md:px-12 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(31,9,84,0.3),transparent_40%),radial-gradient(circle_at_88%_22%,rgba(31,9,84,0.24),transparent_38%),linear-gradient(180deg,rgba(31,9,84,0.12)_0%,rgba(31,9,84,0.06)_100%)]" />
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3 text-center">
          <p className="font-label text-[11px] font-bold uppercase tracking-[0.3em] text-[#1f0954]">
            Demo Story
          </p>
          <h2 className="font-headline text-3xl font-bold text-slate-900 md:text-4xl">
            How a new user experiences VisionTech
          </h2>
          <p className="mx-auto max-w-3xl leading-relaxed text-slate-700">
            A professional end-to-end walkthrough from sign-in through matching and collaboration.
          </p>
        </div>

        <div className="rounded-3xl border border-[#bda7f4] bg-white/100 via-[#e9ddff] to-[#f2eaff] p-4 shadow-sm md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <div className="rounded-2xl border border-[#e6defc] bg-white">
              <div
                ref={imageScrollRef}
                className="h-[560px] overflow-y-auto overflow-x-hidden rounded-2xl"
              >
                <img
                  src={activeSlide.image}
                  alt={`${activeSlide.title} screen`}
                  className="block h-auto w-full"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-[#e6defc] bg-white p-5 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1f0954]">
                {activeSlide.stage} - Step {activeSlide.id} of {slides.length}
              </p>
              <h3 className="mt-3 font-headline text-2xl font-bold text-slate-900">{activeSlide.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">What to do: </span>
                {activeSlide.action}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">What to expect: </span>
                {activeSlide.expectation}
              </p>

              <div className="mt-6 flex items-center gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Go to step ${slide.id}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeIndex ? "w-8 bg-[#1f0954]" : "w-2 bg-[#c9bdf8]"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition hover:border-[#1f0954]"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#1f0954] px-4 text-sm font-medium text-white transition hover:bg-black"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAutoplay((prev) => !prev)}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#1f0954] px-4 text-sm font-medium text-white transition hover:bg-black"
                >
                  {autoplay ? (
                    <>
                      <Pause className="mr-1 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-4 w-4" />
                      Play
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
