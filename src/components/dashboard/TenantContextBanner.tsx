import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { buildOrganisationThemeVariables } from "../../lib/organisationTheme";
import { getPublicOrganisationProfile } from "../../services/organisation";
import type { PublicOrganisationProfile } from "../../types/organisation";

type TenantContextBannerProps = {
  className?: string;
};

export default function TenantContextBanner({ className = "mb-6" }: TenantContextBannerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [tenantProfile, setTenantProfile] = useState<PublicOrganisationProfile | null>(null);
  const [tenantProfileError, setTenantProfileError] = useState<string | null>(null);
  const tenantOrganisationSlug = useMemo(
    () => new URLSearchParams(location.search).get("organisationSlug"),
    [location.search],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadTenantProfile(): Promise<void> {
      if (!tenantOrganisationSlug) {
        setTenantProfile(null);
        setTenantProfileError(null);
        return;
      }

      setTenantProfileError(null);
      try {
        const result = await getPublicOrganisationProfile(tenantOrganisationSlug);
        if (isMounted) {
          setTenantProfile(result);
        }
      } catch (error) {
        if (isMounted) {
          setTenantProfile(null);
          setTenantProfileError(error instanceof Error ? error.message : "Unable to load organisation context.");
        }
      }
    }

    void loadTenantProfile();

    return () => {
      isMounted = false;
    };
  }, [tenantOrganisationSlug]);

  if (!tenantOrganisationSlug) {
    return null;
  }

  const bannerStyle = buildOrganisationThemeVariables(tenantProfile?.branding, {
    prefix: "tenant",
    mode: isDark ? "dark" : "light",
  });

  return (
    <section className={`${className} rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm`} style={bannerStyle}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--tenant-action)] text-sm font-black text-[var(--tenant-on-action)]">
            {tenantProfile?.logoUrl || tenantProfile?.branding.logoUrl ? (
              <img src={tenantProfile.logoUrl || tenantProfile.branding.logoUrl || ""} alt="" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--tenant-action)]">
              Organisation Context
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--color-on-surface)]">
              {tenantProfile?.name || "Organisation pathway"}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
              {tenantProfile?.settings.welcomeMessage ||
                tenantProfile?.description ||
                "You entered VisionTech through an organisation pathway. Your personal intelligence remains private while your journey stays connected to this context."}
            </p>
            {tenantProfileError ? (
              <p className="mt-2 text-xs font-semibold text-[var(--color-warning)]">{tenantProfileError}</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/org/${tenantOrganisationSlug}`)}
          className="inline-flex h-11 w-fit items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-bold text-[var(--color-on-surface)] transition hover:border-[var(--tenant-action)] hover:bg-[var(--color-surface-container-low)]"
        >
          View organisation page
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
