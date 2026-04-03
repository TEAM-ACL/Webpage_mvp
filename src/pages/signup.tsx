import type { JSX } from "react";
import { Mail, Lock, ArrowRight, User, AtSign } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function SignUp(): JSX.Element {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full">
      {/* Left Side */}
      <section className="relative hidden md:flex flex-col justify-between p-16 overflow-hidden bg-[#1f0954] text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
              <Zap className="text-white h-5 w-5 fill-current" />
            </div>
            <span className="font-headline font-bold text-2xl tracking-tighter text-white">VisionTech</span>
          </div>
          <div className="max-w-md">
            <h1 className="font-headline text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Join the next paradigm shift
            </h1>
            <p className="text-white/80 font-sans text-lg leading-relaxed">
              Where artificial intelligence meets curated human intuition. Step into the future of endless possibilities.
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="p-8 rounded-xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10">
            <span className="text-white/70 text-4xl mb-4 block font-serif">"</span>
            <blockquote className="text-white font-sans italic text-xl leading-snug mb-4">
              Innovation is not just about moving fast; it's about seeing what others miss through the noise of the now.
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white text-[#1f0954] flex items-center justify-center font-headline font-bold">ET</div>
              <div>
                <cite className="not-italic block font-headline font-bold text-white">Elias Thorne</cite>
                <span className="text-sm font-label text-white/70">Director of Predictive Dynamics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side */}
      <section className="flex flex-col justify-center items-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="flex md:hidden items-center gap-2 mb-12">
            <span className="font-headline font-bold text-3xl tracking-tighter text-primary">VisionTech</span>
          </div>
          <div className="mb-10">
            <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-2">Begin your evolution</h2>
            <p className="text-on-surface-variant font-sans opacity-70">
              Create your workstation and start curating with AI precision.
            </p>
          </div>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Full Name</label>
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                  placeholder="Alex Sterling"
                  type="text"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Work Email</label>
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                  placeholder="alex@company.ai"
                  type="email"
                />
                <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label text-sm font-semibold text-on-surface-variant ml-1">Password</label>
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface placeholder:text-on-surface-variant/40 transition-all"
                  placeholder="••••••••••••"
                  type="password"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 h-5 w-5" />
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <input
                className="mt-1 rounded border-surface-container-high text-primary focus:ring-primary h-4 w-4"
                id="terms"
                type="checkbox"
              />
              <label className="text-sm text-on-surface-variant leading-tight" htmlFor="terms">
                I agree to the{" "}
                <Link className="text-primary font-semibold hover:underline" to="#">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="text-primary font-semibold hover:underline" to="#">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            <button className="w-full py-4 px-6 bg-[#1f0954] hover:bg-black text-white font-headline font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
              Create Account
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          <div className="mt-12 text-center">
            <p className="text-on-surface-variant font-sans">
              Already have an account?
              <Link className="text-secondary font-bold hover:text-primary transition-colors ml-1" to="/login">
                Sign in
              </Link>
            </p>
          </div>
          <div className="mt-16 pt-8 border-t border-surface-container-high flex justify-between items-center text-[10px] font-label uppercase tracking-widest text-on-surface-variant/40">
            <span>© 2026 VISIONTECH AI</span>
            <div className="flex gap-4">
              <Link className="hover:text-primary" to="#">
                Status
              </Link>
              <Link className="hover:text-primary" to="#">
                Security
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
