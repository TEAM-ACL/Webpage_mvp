import type { CSSProperties, JSX, ReactNode } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

type OrganisationHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  organisationName: string;
  organisationType: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  welcomeHeading?: string | null;
  welcomeMessage?: string | null;
  onMenuClick: () => void;
};

export default function OrganisationHeader({
  eyebrow = "Institutional Command Centre",
  title,
  description,
  actions,
  organisationName,
  organisationType,
  logoUrl,
  bannerUrl,
  welcomeHeading,
  welcomeMessage,
  onMenuClick,
}: OrganisationHeaderProps): JSX.Element {
  const { isDark, toggleMode } = useTheme();
  const initials = organisationName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const mastheadStyle = {
    backgroundColor: "var(--organisation-panel-start)",
    backgroundImage: bannerUrl
      ? `linear-gradient(135deg, color-mix(in srgb, var(--organisation-panel-start) 96%, transparent), color-mix(in srgb, var(--organisation-panel-end) 96%, transparent)), url("${bannerUrl}")`
      : "linear-gradient(135deg, var(--organisation-panel-start), var(--organisation-panel-end))",
    backgroundPosition: "center",
    backgroundSize: "cover",
  } as CSSProperties;

  return (
    <div className="mb-6 space-y-4">
      <section className="overflow-hidden rounded-3xl border border-current/20 p-6 text-[var(--organisation-on-panel)] shadow-xl shadow-black/10 dark:shadow-black/30" style={mastheadStyle}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-current/30 bg-current/10 text-base font-black shadow-sm backdrop-blur">
              {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : initials || "VT"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] opacity-75">{organisationType}</p>
              <h2 className="mt-1 truncate text-2xl font-black">{welcomeHeading || organisationName}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 opacity-85">
                {welcomeMessage || "Your branded organisation workspace for guidance, readiness, cohorts, support, and opportunities."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <button
            type="button"
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--organisation-action)]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--color-on-surface)]">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
              {description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {actions}
          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)]"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </section>
    </div>
  );
}
