import type { JSX } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";

export default function OrganizationAuth(): JSX.Element {
  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      <header className="fixed top-0 w-full z-50 glass-panel flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">VisionTech</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 px-6">
        <div className="w-full max-w-xl rounded-3xl border border-[var(--color-outline-variant)] bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-700">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-on-surface)]">Organization Access</h1>
            <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
              Sign in or create an organization account to manage opportunities and institutional workflows.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/organization-login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Organization Login
            </Link>
            <Link
              to="/organization-signup"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-semibold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]"
            >
              Organization Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
