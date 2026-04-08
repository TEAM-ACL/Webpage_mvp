import type { ReactNode, CSSProperties } from "react";
import DashboardTopNav from "./DashboardTopNav";

const primaryOverride: CSSProperties = { "--color-primary": "#1f0954" } as CSSProperties;

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]" style={primaryOverride}>
      <DashboardTopNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
