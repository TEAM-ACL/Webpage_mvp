import type { JSX } from "react";
import OrganisationLayout from "../../components/organisation/OrganisationLayout";
import { useAuth } from "../../context/AuthContext";

type OrganisationPlaceholderProps = {
  title: string;
  description: string;
};

export default function OrganisationPlaceholder({
  title,
  description,
}: OrganisationPlaceholderProps): JSX.Element {
  const { profile, user } = useAuth();

  return (
    <OrganisationLayout
      organisationName={profile?.organisationName || "VisionTech Organisation"}
      organisationType="Training Provider"
      administratorRole={profile?.role || user?.role || "Platform Administrator"}
      title={title}
      description={description}
    >
      <section className="rounded-3xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-8">
        <p className="text-sm font-semibold text-[var(--color-primary)]">Module shell ready</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--color-on-surface)]">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
          This section is part of the organisation management structure and will be connected after members management is complete.
        </p>
      </section>
    </OrganisationLayout>
  );
}
