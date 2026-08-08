import type { ReactNode } from "react";
import DashboardTopNav from "./DashboardTopNav";

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      <DashboardTopNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
