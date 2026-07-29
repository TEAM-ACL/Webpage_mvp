import type { CSSProperties, JSX, ReactNode } from "react";
import { Menu } from "lucide-react";

type OrganisationHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  organisationName: string;
  organisationType: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  brandColour?: string;
  accentColour?: string;
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
  brandColour = "#1f0954",
  accentColour = "#7c3aed",
  welcomeHeading,
  welcomeMessage,
  onMenuClick,
}: OrganisationHeaderProps): JSX.Element {
  const initials = organisationName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const mastheadStyle = {
    backgroundColor: brandColour,
    backgroundImage: bannerUrl
      ? `linear-gradient(135deg, ${brandColour}f2, ${accentColour}dd), url("${bannerUrl}")`
      : `linear-gradient(135deg, ${brandColour}, ${accentColour})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  } as CSSProperties;

  return (
    <div className="mb-6 space-y-4">
      <section className="overflow-hidden rounded-3xl border border-white/20 p-6 text-white shadow-xl shadow-slate-200/60" style={mastheadStyle}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white/15 text-base font-black text-white shadow-sm backdrop-blur">
              {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : initials || "VT"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/75">{organisationType}</p>
              <h2 className="mt-1 truncate text-2xl font-black">{welcomeHeading || organisationName}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/82">
                {welcomeMessage || "Your branded organisation workspace for guidance, readiness, cohorts, support, and opportunities."}
              </p>
            </div>
          </div>
          {actions && <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div>}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <button
            type="button"
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--color-on-surface)]">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
              {description}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
