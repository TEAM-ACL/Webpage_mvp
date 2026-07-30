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
        <div key={section.id}>
          {widgets[section.type]}
        </div>
      ))}
    </div>
  );
}

function resolveHomepageSections(sections: OrganisationHomepageSection[]): Array<{
  id: string;
  type: OrganisationHomepageWidgetType;
  position: number;
}> {
  const configuredSections = sections.length > 0
    ? sections
    : APPROVED_ORGANISATION_HOMEPAGE_WIDGETS.map((widget) => ({
        id: widget.id,
        type: widget.type,
        enabled: widget.enabled,
        position: widget.position,
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
    }))
    .sort((left, right) => left.position - right.position);
}
