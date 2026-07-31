import type { JSX, ReactNode } from "react";
import {
  APPROVED_ORGANISATION_HOMEPAGE_WIDGETS,
  approvedOrganisationHomepageWidgetTypes,
  type OrganisationHomepageWidgetType,
} from "../../config/organisationHomepageWidgets";
import type { OrganisationHomepageSection } from "../../types/organisation";

type OrganisationHomepageWidgetRegistryProps = {
  sections: OrganisationHomepageSection[];
  widgets: Record<OrganisationHomepageWidgetType, ReactNode>;
};

export default function OrganisationHomepageWidgetRegistry({
  sections,
  widgets,
}: OrganisationHomepageWidgetRegistryProps): JSX.Element {
  const resolvedSections = resolveHomepageSections(sections);

  return (
    <div className="space-y-6">
      {resolvedSections.map((section) => (
        <section key={section.id} className="space-y-4">
          {(section.heading || section.description) && (
            <div className="rounded-[var(--organisation-card-radius,1.5rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
              {section.heading ? (
                <h2 className="text-xl font-black tracking-tight text-[var(--color-on-surface)]">{section.heading}</h2>
              ) : null}
              {section.description ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">{section.description}</p>
              ) : null}
            </div>
          )}
          {widgets[section.type]}
        </section>
      ))}
    </div>
  );
}

function resolveHomepageSections(sections: OrganisationHomepageSection[]): Array<{
  id: string;
  type: OrganisationHomepageWidgetType;
  position: number;
  heading?: string | null;
  description?: string | null;
}> {
  const configuredSections = sections.length > 0
    ? sections
    : APPROVED_ORGANISATION_HOMEPAGE_WIDGETS.map((widget) => ({
        id: widget.id,
        type: widget.type,
        enabled: widget.enabled,
        position: widget.position,
        heading: null,
        description: null,
      }));

  return configuredSections
    .filter((section) => section.enabled !== false)
    .filter((section): section is OrganisationHomepageSection & { type: OrganisationHomepageWidgetType } =>
      approvedOrganisationHomepageWidgetTypes.has(section.type as OrganisationHomepageWidgetType),
    )
    .map((section) => ({
      id: section.id,
      type: section.type,
      position: section.position,
      heading: section.heading || null,
      description: section.description || null,
    }))
    .sort((left, right) => left.position - right.position);
}
