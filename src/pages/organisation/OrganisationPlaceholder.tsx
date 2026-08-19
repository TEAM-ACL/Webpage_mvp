import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Info, LockKeyhole } from "lucide-react";
import type { JSX, ReactNode } from "react";
import OrganisationAIPanel from "../../components/organisation/OrganisationAIPanel";
import OrganisationLayout from "../../components/organisation/OrganisationLayout";
import OrganisationMetricCard from "../../components/organisation/OrganisationMetricCard";
import {
  DEFAULT_ORGANISATION_NAVIGATION,
  normaliseNavigation,
  type OrganisationNavigationKey,
} from "../../config/organisationTenant";
import { APPROVED_ORGANISATION_HOMEPAGE_WIDGETS } from "../../config/organisationHomepageWidgets";
import { useAuth } from "../../context/AuthContext";
import { useOrganisation } from "../../context/OrganisationContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import {
  organisationModules,
  type OrganisationModuleAction,
  type OrganisationModuleContent,
  type OrganisationModuleKey,
  type OrganisationModuleItem,
} from "../../data/organisationModules";
import {
  createOrganisationCohort,
  getInstitutionalAIInsight,
  getOrganisationCohorts,
  getOrganisationMemberInterventions,
  getOrganisationOpportunityRecommendations,
  getOrganisationReportSummary,
  publishOrganisationConfiguration,
  refreshInstitutionalAIInsight,
  restorePublishedOrganisationConfiguration,
  saveOrganisationConfiguration,
} from "../../services/organisation";
import {
  editableConfigurationFingerprint,
  normaliseOrganisationBrandingForSave,
  normaliseOrganisationSettingsForSave,
  validateOrganisationConfiguration,
} from "../../lib/organisationConfiguration";
import { isOrganisationAdminRole, isPlatformAdminRole } from "../../lib/auth";
import { buildOrganisationPortalThemeVariables } from "../../lib/organisationTheme";
import type {
  ActiveOrganisation,
  InstitutionalAIInsight,
  InstitutionalRecommendedAction,
  OrganisationBranding,
  OrganisationConfiguration,
  OrganisationCohortOverview,
  OrganisationHomepageSection,
  OrganisationMemberInterventionRecord,
  OrganisationMemberOpportunityRecommendationRecord,
  OrganisationNavigationConfigItem,
  OrganisationReportResponse,
  OrganisationSettings,
} from "../../types/organisation";

type OrganisationPlaceholderProps = {
  moduleKey: OrganisationModuleKey;
};

const outlineButton =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-bold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";
const primaryButton =
  "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--organisation-action)] px-4 text-sm font-bold text-[var(--organisation-on-action)] shadow-lg transition hover:opacity-90";
const requiredNavigationKeys = new Set<OrganisationNavigationKey>(["overview", "settings"]);
const terminologyFields: Array<{ key: string; label: string; placeholder: string }> = [
  { key: "members", label: "Members", placeholder: "Students, Employees, Participants" },
  { key: "cohorts", label: "Cohorts", placeholder: "Programmes, Classes, Teams" },
  { key: "opportunities", label: "Opportunities", placeholder: "Placements, Vacancies, Pathways" },
  { key: "interventions", label: "Interventions", placeholder: "Student Support, Workforce Support" },
];
const colourFieldHints = {
  primary:
    "Primary colour drives main organisation actions and strongest brand moments: save/publish buttons, key links, sidebar logo background, progress bars, active highlights, and panel gradients.",
  secondary:
    "Secondary colour drives supporting action chips and navigation pills, including the module labels shown in organisation previews.",
  accent:
    "Accent colour drives branded emphasis such as preview borders, accent labels, and the secondary blend in organisation header panels.",
  text:
    "Text colour controls readable foreground text in tenant-facing organisation previews. VisionTech automatically adjusts it if contrast is too low.",
  background:
    "Background colour controls tenant-facing organisation page surfaces, the preview canvas, and the derived low/high card surfaces.",
};

export default function OrganisationPlaceholder({ moduleKey }: OrganisationPlaceholderProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const {
    organisation,
    error: organisationError,
    getOrganisationPath,
    isLoading: isOrganisationLoading,
    isModuleEnabled,
    applyOrganisationConfiguration,
    refreshOrganisation,
  } = useOrganisation();
  const organisationId = organisation?.id;
  const { showError, showSuccess } = useToast();
  const content = organisationModules[moduleKey];
  const [insight, setInsight] = useState<InstitutionalAIInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [isAiRefreshing, setIsAiRefreshing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [interventions, setInterventions] = useState<OrganisationMemberInterventionRecord[]>([]);
  const [opportunityRecommendations, setOpportunityRecommendations] = useState<OrganisationMemberOpportunityRecommendationRecord[]>([]);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [areRecordsLoading, setAreRecordsLoading] = useState(false);
  const [cohorts, setCohorts] = useState<OrganisationCohortOverview[]>([]);
  const [report, setReport] = useState<OrganisationReportResponse | null>(null);
  const queryAction = buildModuleQueryAction(moduleKey, location.search);

  const loadInsight = useCallback(async () => {
    if (!organisationId) {
      setInsight(null);
      setAiError(null);
      setIsAiLoading(false);
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await getInstitutionalAIInsight(organisationId);
      setInsight(response.insight);
    } catch (error) {
      setAiError(readError(error, "Unable to load institutional AI insight."));
    } finally {
      setIsAiLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    setSelectedPrompt(null);
    void loadInsight();
  }, [loadInsight, moduleKey]);

  useEffect(() => {
    let isMounted = true;

    async function loadModuleRecords(): Promise<void> {
      if (!organisationId || !["cohorts", "interventions", "opportunities", "reports"].includes(moduleKey)) {
        setCohorts([]);
        setInterventions([]);
        setOpportunityRecommendations([]);
        setReport(null);
        setRecordsError(null);
        setAreRecordsLoading(false);
        return;
      }

      setAreRecordsLoading(true);
      setRecordsError(null);
      try {
        if (moduleKey === "cohorts") {
          const records = await getOrganisationCohorts(organisationId);
          if (isMounted) {
            setCohorts(records);
            setInterventions([]);
            setOpportunityRecommendations([]);
            setReport(null);
          }
          return;
        }

        if (moduleKey === "interventions") {
          const records = await getOrganisationMemberInterventions(organisationId);
          if (isMounted) {
            setCohorts([]);
            setInterventions(records);
            setOpportunityRecommendations([]);
            setReport(null);
          }
          return;
        }

        if (moduleKey === "reports") {
          const reportSummary = await getOrganisationReportSummary(organisationId);
          if (isMounted) {
            setReport(reportSummary);
            setCohorts([]);
            setInterventions([]);
            setOpportunityRecommendations([]);
          }
          return;
        }

        const records = await getOrganisationOpportunityRecommendations(organisationId);
        if (isMounted) {
          setOpportunityRecommendations(records);
          setCohorts([]);
          setInterventions([]);
          setReport(null);
        }
      } catch (error) {
        if (isMounted) {
          setRecordsError(readError(error, "Unable to load organisation records."));
        }
      } finally {
        if (isMounted) {
          setAreRecordsLoading(false);
        }
      }
    }

    void loadModuleRecords();

    return () => {
      isMounted = false;
    };
  }, [moduleKey, organisationId]);

  async function handleAction(action: OrganisationModuleAction): Promise<void> {
    if (moduleKey === "cohorts" && action.href.includes("create=true") && organisationId) {
      const cohortName = window.prompt("Create cohort", "Digital Skills Cohort");
      if (!cohortName) return;
      try {
        const cohort = await createOrganisationCohort(organisationId, {
          name: cohortName,
          description: "Created from the cohorts module.",
          status: "active",
        });
        setCohorts((currentCohorts) =>
          currentCohorts.some((currentCohort) => currentCohort.cohort_id === cohort.cohort_id)
            ? currentCohorts
            : [cohort, ...currentCohorts],
        );
        showSuccess(`${cohort.name} cohort created.`);
      } catch (error) {
        showError(readError(error, "Unable to create organisation cohort."));
      }
      return;
    }
    navigate(toTenantPath(action.href, getOrganisationPath));
  }

  async function handleRefreshInsight(): Promise<void> {
    setIsAiRefreshing(true);
    setAiError(null);
    try {
      const response = await refreshInstitutionalAIInsight(organisationId);
      setInsight(response.insight);
    } catch (error) {
      setAiError(readError(error, "Unable to refresh institutional AI insight."));
    } finally {
      setIsAiRefreshing(false);
      setIsAiLoading(false);
    }
  }

  function handleInsightAction(action: InstitutionalRecommendedAction): void {
    const destinations: Record<InstitutionalRecommendedAction["actionType"], string> = {
      create_cohort: getOrganisationPath("cohorts?create=true"),
      create_intervention: getOrganisationPath("interventions?create=true"),
      assign_project: getOrganisationPath("cohorts?action=assign-project"),
      share_resource: getOrganisationPath("members?action=share-resource"),
      share_opportunity: getOrganisationPath("opportunities?create=true"),
      review_members: getOrganisationPath("members?filter=needs-support"),
    };
    navigate(destinations[action.actionType]);
  }

  const promptResponse = selectedPrompt ? buildPromptResponse(content, selectedPrompt, insight) : null;

  return (
    <OrganisationLayout
      organisationName={organisation?.name || profile?.organisationName || "VisionTech Organisation"}
      organisationType={organisation?.organisationType || "Training Provider"}
      administratorRole={formatRole(organisation?.role || profile?.role || user?.role || "Platform Administrator")}
      title={content.title}
      description={content.description}
      actions={
        organisation ? (
          <>
            {content.secondaryAction && (
              <button type="button" className={outlineButton} onClick={() => void handleAction(content.secondaryAction!)}>
                {content.secondaryAction.label}
              </button>
            )}
            <button type="button" className={primaryButton} onClick={() => void handleAction(content.primaryAction)}>
              {content.primaryAction.label}
            </button>
          </>
        ) : undefined
      }
    >
      {organisationError && organisation ? (
        <section className="mb-5 rounded-3xl border border-[var(--color-warning)] bg-[var(--color-warning-container)] p-4 text-sm font-semibold text-[var(--color-warning)] shadow-sm">
          Showing the last verified organisation details because the live configuration reload failed: {organisationError}
        </section>
      ) : null}
      {!organisation ? (
        <section className="rounded-3xl border border-[var(--color-warning)] bg-[var(--color-warning-container)] p-6 text-[var(--color-warning)] shadow-sm">
          <h2 className="text-lg font-black">
            {isOrganisationLoading ? "Loading organisation..." : "Organisation unavailable"}
          </h2>
          <p className="mt-2 text-sm leading-6">
            {organisationError || "This organisation could not be resolved for your account."}
          </p>
          {!isOrganisationLoading ? (
            <button
              type="button"
              onClick={() => void refreshOrganisation()}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-warning)] px-4 text-sm font-black text-[var(--color-warning-container)] transition hover:opacity-90"
            >
              Retry organisation loading
            </button>
          ) : null}
        </section>
      ) : !isModuleEnabled(moduleKey) ? (
        <DisabledModuleState moduleName={content.title} onOpenSettings={() => navigate(getOrganisationPath("settings"))} />
      ) : moduleKey === "settings" && organisation ? (
        <>
          {queryAction ? <ModuleQueryActionBanner action={queryAction} /> : null}
          <OrganisationPersonalisationSettings
            organisation={organisation}
            onApplyConfiguration={applyOrganisationConfiguration}
            onRefresh={refreshOrganisation}
            onError={showError}
            onSuccess={showSuccess}
          />
        </>
      ) : (
        <>
          {queryAction ? <ModuleQueryActionBanner action={queryAction} /> : null}
          <OrganisationModuleView
            content={content}
            onAction={handleAction}
            liveRecords={
              moduleKey === "cohorts" ? (
                <CohortRecordsPanel
                  records={cohorts}
                  isLoading={areRecordsLoading}
                  error={recordsError}
                  onCreate={() => void handleAction(content.primaryAction)}
                />
              ) : moduleKey === "interventions" ? (
                <InterventionRecordsPanel
                  records={interventions}
                  isLoading={areRecordsLoading}
                  error={recordsError}
                />
              ) : moduleKey === "opportunities" ? (
                <OpportunityRecommendationRecordsPanel
                  records={opportunityRecommendations}
                  isLoading={areRecordsLoading}
                  error={recordsError}
                />
              ) : moduleKey === "reports" ? (
                <ReportSummaryPanel
                  report={report}
                  isLoading={areRecordsLoading}
                  error={recordsError}
                />
              ) : null
            }
          />
        </>
      )}
      {organisation ? <div className="mt-6">
        <OrganisationAIPanel
          contextLabel={`${content.title} Intelligence`}
          insight={insight}
          isLoading={isAiLoading}
          isRefreshing={isAiRefreshing}
          error={aiError}
          prompts={content.aiPrompts}
          selectedPrompt={selectedPrompt}
          response={promptResponse}
          onPromptSelect={setSelectedPrompt}
          onRefresh={() => void handleRefreshInsight()}
          onActionSelect={handleInsightAction}
        />
      </div> : null}
    </OrganisationLayout>
  );
}

type ModuleQueryAction = {
  eyebrow: string;
  title: string;
  description: string;
};

function ModuleQueryActionBanner({ action }: { action: ModuleQueryAction }): JSX.Element {
  return (
    <section className="mb-6 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">{action.eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">{action.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">{action.description}</p>
    </section>
  );
}

function buildModuleQueryAction(moduleKey: OrganisationModuleKey, search: string): ModuleQueryAction | null {
  const queryParams = new URLSearchParams(search);
  const isCreate = queryParams.get("create") === "true";
  const action = queryParams.get("action");
  const filter = queryParams.get("filter");
  const template = queryParams.get("template");
  const section = queryParams.get("section");
  const exportType = queryParams.get("export");

  if (moduleKey === "cohorts") {
    if (isCreate) {
      return {
        eyebrow: "Cohort Setup",
        title: "Start a new tenant cohort",
        description: "Define the programme goal, assign members, and use cohort readiness signals to track progress in this organisation.",
      };
    }
    if (action === "assign-project") {
      return {
        eyebrow: "Project Assignment",
        title: "Prepare a cohort project sprint",
        description: "Use this area to group members into a practical project sprint before assigning evidence tasks.",
      };
    }
  }

  if (moduleKey === "interventions" && isCreate) {
    return {
      eyebrow: "Support Intervention",
      title: "Create a targeted support action",
      description: "Capture the risk signal, recommended action, owner, and follow-up expectation for members needing support.",
    };
  }

  if (moduleKey === "opportunities") {
    if (isCreate) {
      return {
        eyebrow: "Opportunity Publishing",
        title: "Add an organisation opportunity",
        description: "Create the opportunity details, requirements, deadline, and matching criteria for members in this tenant.",
      };
    }
    if (filter === "closing-soon") {
      return {
        eyebrow: "Opportunity Review",
        title: "Review opportunities closing soon",
        description: "Prioritise opportunities with near deadlines and confirm matched members have enough evidence to act.",
      };
    }
    if (action === "assign-members") {
      return {
        eyebrow: "Opportunity Matching",
        title: "Assign matched members",
        description: "Use readiness, skills, and project evidence to identify members who should receive this opportunity.",
      };
    }
  }

  if (moduleKey === "reports") {
    if (isCreate || template) {
      return {
        eyebrow: "Report Builder",
        title: template ? "Preview the selected report template" : "Generate a tenant report",
        description: "Build an organisation-level report using member progress, cohort activity, support cases, and opportunity readiness.",
      };
    }
    if (exportType === "csv") {
      return {
        eyebrow: "Report Export",
        title: "Prepare CSV export",
        description: "Export tenant reporting data for offline review, leadership packs, or institutional monitoring workflows.",
      };
    }
  }

  if (moduleKey === "settings") {
    if (section) {
      return {
        eyebrow: "Settings Section",
        title: `Review ${formatRole(section)} settings`,
        description: "Update the relevant organisation profile, access, branding, or notification controls for this tenant.",
      };
    }
    if (queryParams.get("invite-admin") === "true") {
      return {
        eyebrow: "Admin Access",
        title: "Invite or review organisation administrators",
        description: "Use this settings area to plan administrator access. Role-specific admin invitations can be connected in a later backend slice.",
      };
    }
  }

  return null;
}

function DisabledModuleState({
  moduleName,
  onOpenSettings,
}: {
  moduleName: string;
  onOpenSettings: () => void;
}): JSX.Element {
  return (
    <section className="rounded-3xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <LockKeyhole className="h-6 w-6" />
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-on-surface-variant)]">Module Hidden</p>
      <h2 className="mt-2 text-2xl font-black text-[var(--color-on-surface)]">{moduleName} is disabled for this organisation</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
        This module has been turned off in organisation feature visibility. Administrators can re-enable it from settings when it is needed.
      </p>
      <button
        type="button"
        onClick={onOpenSettings}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--organisation-action)] px-5 py-3 text-sm font-black text-[var(--organisation-on-action)] transition hover:opacity-90"
      >
        Open Settings
      </button>
    </section>
  );
}

function OrganisationPersonalisationSettings({
  organisation,
  onApplyConfiguration,
  onRefresh,
  onError,
  onSuccess,
}: {
  organisation: ActiveOrganisation;
  onApplyConfiguration: (configuration: OrganisationConfiguration) => void;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}): JSX.Element {
  const { systemMode } = useTheme();
  const [branding, setBranding] = useState<OrganisationBranding>(organisation.branding);
  const [settings, setSettings] = useState<OrganisationSettings>(organisation.settings);
  const [savedConfiguration, setSavedConfiguration] = useState<OrganisationConfiguration>({
    branding: organisation.branding,
    settings: organisation.settings,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [publishPreviewConfiguration, setPublishPreviewConfiguration] = useState<OrganisationConfiguration | null>(null);
  const canManageSettings =
    organisation.role === "owner" ||
    isOrganisationAdminRole(organisation.role) ||
    isPlatformAdminRole(organisation.role);
  const currentConfiguration = useMemo(
    () => ({ branding, settings }),
    [branding, settings],
  );
  const isDirty = useMemo(
    () => editableConfigurationFingerprint(currentConfiguration)
      !== editableConfigurationFingerprint(savedConfiguration),
    [currentConfiguration, savedConfiguration],
  );
  const isWorking = isSaving || isPublishing || isRestoring;
  const previewThemeVariables = useMemo(
    () => buildOrganisationPortalThemeVariables(branding, { prefix: "preview", systemMode }),
    [branding, systemMode],
  );
  const publishPreviewThemeVariables = useMemo(
    () => publishPreviewConfiguration
      ? buildOrganisationPortalThemeVariables(publishPreviewConfiguration.branding, { prefix: "publish-preview", systemMode })
      : null,
    [publishPreviewConfiguration, systemMode],
  );

  useEffect(() => {
    if (savedConfiguration.settings.draftVersion > organisation.settings.draftVersion) {
      return;
    }
    setBranding(organisation.branding);
    setSettings(organisation.settings);
    setSavedConfiguration({
      branding: organisation.branding,
      settings: organisation.settings,
    });
  }, [organisation.branding, organisation.settings, savedConfiguration.settings.draftVersion]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent): void {
      if (!isDirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  function configurationForSave(): OrganisationConfiguration | null {
    const configuration = {
      branding: normaliseOrganisationBrandingForSave(branding),
      settings: normaliseOrganisationSettingsForSave(settings),
    };
    const validationError = validateOrganisationConfiguration(configuration);
    if (validationError) {
      onError(validationError);
      return null;
    }
    return configuration;
  }

  function applySavedConfiguration(configuration: OrganisationConfiguration): void {
    setBranding(configuration.branding);
    setSettings(configuration.settings);
    setSavedConfiguration(configuration);
    onApplyConfiguration(configuration);
  }

  async function handleSave(): Promise<void> {
    if (!canManageSettings) {
      onError("Organisation administrator access is required.");
      return;
    }

    const configuration = configurationForSave();
    if (!configuration) return;

    setIsSaving(true);
    try {
      const saved = await saveOrganisationConfiguration(organisation.id, configuration);
      applySavedConfiguration(saved);
      onSuccess("Organisation personalisation saved as a draft.");
    } catch (error) {
      onError(readError(error, "Unable to save organisation personalisation."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish(): Promise<void> {
    if (!canManageSettings) {
      onError("Organisation administrator access is required.");
      return;
    }

    const configuration = configurationForSave();
    if (!configuration) return;
    setPublishPreviewConfiguration(configuration);
  }

  async function handleConfirmPublish(): Promise<void> {
    if (!canManageSettings) {
      onError("Organisation administrator access is required.");
      return;
    }

    const configuration = publishPreviewConfiguration ?? configurationForSave();
    if (!configuration) return;

    setIsPublishing(true);
    try {
      const published = await publishOrganisationConfiguration(organisation.id, configuration);
      applySavedConfiguration(published);
      setPublishPreviewConfiguration(null);
      await onRefresh();
      onSuccess("Organisation personalisation published successfully.");
    } catch (error) {
      onError(readError(error, "Unable to publish organisation personalisation."));
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleRestorePublished(): Promise<void> {
    if (!canManageSettings) {
      onError("Organisation administrator access is required.");
      return;
    }
    const confirmed = window.confirm(
      "Restore the last published configuration into the editor? Current unpublished edits will be replaced.",
    );
    if (!confirmed) return;

    setIsRestoring(true);
    try {
      const restored = await restorePublishedOrganisationConfiguration(
        organisation.id,
        settings.draftVersion,
      );
      applySavedConfiguration(restored);
      await onRefresh();
      onSuccess("Last published configuration restored as a draft.");
    } catch (error) {
      onError(readError(error, "Unable to restore the published configuration."));
    } finally {
      setIsRestoring(false);
    }
  }

  function handleDiscardLocalEdits(): void {
    setBranding(savedConfiguration.branding);
    setSettings(savedConfiguration.settings);
  }

  function updateFeatureFlag(key: string, enabled: boolean): void {
    setSettings((current) => ({
      ...current,
      featureFlags: {
        ...current.featureFlags,
        [key]: enabled,
      },
    }));
  }

  function updateNavigationItem(
    key: OrganisationNavigationKey,
    updates: Partial<OrganisationNavigationConfigItem>,
  ): void {
    const defaultItem = DEFAULT_ORGANISATION_NAVIGATION.find((item) => item.key === key);
    if (!defaultItem) {
      return;
    }

    setSettings((current) => {
      const nextConfig = DEFAULT_ORGANISATION_NAVIGATION.map((item) => ({
        key: item.key,
        label: item.label,
        path: item.path,
        enabled: item.enabled,
        order: item.order,
        ...current.navigationConfig.find((configured) => configured.key === item.key),
        ...(item.key === key ? updates : {}),
      }));
      if (typeof updates.order === "number") {
        const target = nextConfig.find((item) => item.key === key)!;
        const reordered = nextConfig
          .filter((item) => item.key !== key)
          .sort((left, right) => left.order - right.order);
        reordered.splice(Math.max(0, Math.min(updates.order - 1, reordered.length)), 0, target);
        nextConfig.splice(0, nextConfig.length, ...reordered);
      } else {
        nextConfig.sort((left, right) => left.order - right.order);
      }
      nextConfig.forEach((item, index) => {
        item.order = index + 1;
      });

      return {
        ...current,
        navigationConfig: nextConfig,
        featureFlags: typeof updates.enabled === "boolean" && !requiredNavigationKeys.has(key)
          ? { ...current.featureFlags, [key]: updates.enabled }
          : current.featureFlags,
      };
    });
  }

  function updateTerminology(key: string, value: string): void {
    setSettings((current) => {
      const nextTerminology = { ...current.terminologyConfig };
      if (value.trim()) {
        nextTerminology[key] = value.trim();
      } else {
        delete nextTerminology[key];
      }

      return {
        ...current,
        terminologyConfig: nextTerminology,
      };
    });
  }

  function resetNavigationDefaults(): void {
    setSettings((current) => ({
      ...current,
      navigationConfig: [],
      terminologyConfig: {},
      featureFlags: {
        ...current.featureFlags,
        members: true,
        cohorts: true,
        interventions: true,
        opportunities: true,
        reports: true,
      },
    }));
  }

  function updateHomepageWidget(
    id: string,
    updates: Partial<OrganisationHomepageSection>,
  ): void {
    const defaultWidget = APPROVED_ORGANISATION_HOMEPAGE_WIDGETS.find((widget) => widget.id === id);
    if (!defaultWidget) {
      return;
    }

    setSettings((current) => {
      const nextConfig = APPROVED_ORGANISATION_HOMEPAGE_WIDGETS.map((widget) => ({
        id: widget.id,
        type: widget.type,
        enabled: widget.enabled,
        position: widget.position,
        config: {},
        ...current.homepageConfig.find((configured) => configured.id === widget.id),
        ...(widget.id === id ? updates : {}),
      } satisfies OrganisationHomepageSection));
      if (typeof updates.position === "number") {
        const target = nextConfig.find((section) => section.id === id)!;
        const reordered = nextConfig
          .filter((section) => section.id !== id)
          .sort((left, right) => left.position - right.position);
        reordered.splice(Math.max(0, Math.min(updates.position - 1, reordered.length)), 0, target);
        nextConfig.splice(0, nextConfig.length, ...reordered);
      } else {
        nextConfig.sort((left, right) => left.position - right.position);
      }
      nextConfig.forEach((section, index) => {
        section.position = index + 1;
      });

      return {
        ...current,
        homepageConfig: nextConfig,
      };
    });
  }

  function resetHomepageDefaults(): void {
    setSettings((current) => ({
      ...current,
      homepageConfig: [],
    }));
  }

  const navigationPreview = normaliseNavigation(settings.navigationConfig, settings.featureFlags);
  const publishNavigationPreview = publishPreviewConfiguration
    ? normaliseNavigation(
      publishPreviewConfiguration.settings.navigationConfig,
      publishPreviewConfiguration.settings.featureFlags,
    )
    : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[var(--organisation-card-radius,1.5rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--organisation-action)]">Personalisation</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--color-on-surface)]">Organisation identity</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
              Configure the visual identity and welcome experience members see inside this organisation workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isWorking || !isDirty || !canManageSettings}
              onClick={handleDiscardLocalEdits}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-black text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard Edits
            </button>
            <button
              type="button"
              disabled={isWorking || !isDirty || !canManageSettings}
              onClick={() => void handleSave()}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--organisation-action)] px-5 text-sm font-black text-[var(--organisation-on-action)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        </div>

        {!canManageSettings && (
          <div className="mt-5 rounded-2xl border border-[var(--color-warning)] bg-[var(--color-warning-container)] p-4 text-sm font-semibold text-[var(--color-warning)]">
            You can view these settings, but only organisation administrators can update them.
          </div>
        )}

        <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--organisation-action)]">Publishing Status</p>
            <h3 className="mt-1 text-lg font-black text-[var(--color-on-surface)]">
              {isDirty
                ? "Unsaved edits in this browser"
                : settings.configurationStatus === "draft"
                  ? "Draft changes need publishing"
                  : "Published personalisation"}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              {settings.publishedAt
                ? `Version ${settings.publishedVersion ?? "-"} published ${formatDateTime(settings.publishedAt)}. Draft revision ${settings.draftVersion}.`
                : `Not published yet. Draft revision ${settings.draftVersion}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <button
              type="button"
              disabled={isWorking || !settings.publishedVersion || !canManageSettings}
              onClick={() => void handleRestorePublished()}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-black text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRestoring ? "Restoring..." : "Restore Published"}
            </button>
            <button
              type="button"
              disabled={isWorking || (!isDirty && settings.configurationStatus !== "draft") || !canManageSettings}
              onClick={() => void handlePublish()}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--organisation-action)] bg-[var(--color-surface-container-lowest)] px-5 text-sm font-black text-[var(--organisation-action)] transition hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPublishing ? "Publishing..." : "Review & Publish"}
            </button>
          </div>
        </div>

        <fieldset disabled={!canManageSettings}>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextInput
            label="Logo URL"
            value={branding.logoUrl || ""}
            placeholder="https://example.com/logo.png"
            type="url"
            maxLength={2000}
            onChange={(value) => setBranding((current) => ({ ...current, logoUrl: value || null }))}
          />
          <TextInput
            label="Dashboard Banner URL"
            value={branding.dashboardBannerUrl || ""}
            placeholder="https://example.com/banner.png"
            type="url"
            maxLength={2000}
            onChange={(value) => setBranding((current) => ({ ...current, dashboardBannerUrl: value || null }))}
          />
          <ColourInput
            label="Primary Colour"
            value={branding.primaryColour}
            description={colourFieldHints.primary}
            onChange={(value) => setBranding((current) => ({ ...current, primaryColour: value }))}
          />
          <ColourInput
            label="Secondary Colour"
            value={branding.secondaryColour}
            description={colourFieldHints.secondary}
            onChange={(value) => setBranding((current) => ({ ...current, secondaryColour: value }))}
          />
          <ColourInput
            label="Accent Colour"
            value={branding.accentColour}
            description={colourFieldHints.accent}
            onChange={(value) => setBranding((current) => ({ ...current, accentColour: value }))}
          />
          <ColourInput
            label="Text Colour"
            value={branding.textColour}
            description={colourFieldHints.text}
            onChange={(value) => setBranding((current) => ({ ...current, textColour: value }))}
          />
          <ColourInput
            label="Background Colour"
            value={branding.backgroundColour}
            description={colourFieldHints.background}
            onChange={(value) => setBranding((current) => ({ ...current, backgroundColour: value }))}
          />
          <SelectInput
            label="Theme Mode"
            value={branding.themeMode}
            options={["light", "dark", "system"]}
            onChange={(value) => setBranding((current) => ({ ...current, themeMode: value as OrganisationBranding["themeMode"] }))}
          />
          <SelectInput
            label="Border Radius"
            value={branding.borderRadius}
            options={["small", "medium", "large", "rounded"]}
            onChange={(value) => setBranding((current) => ({ ...current, borderRadius: value as OrganisationBranding["borderRadius"] }))}
          />
        </div>
        <div className="mt-4 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm leading-6 text-[var(--color-on-surface-variant)]">
          <p className="font-black text-[var(--color-on-surface)]">Palette coverage</p>
          <p className="mt-1">
            These colours theme tenant-facing organisation areas, previews, headers, actions, navigation chips, and module highlights. Core VisionTech dashboard chrome keeps neutral system colours so readability and platform consistency stay intact.
          </p>
        </div>

        <div className="mt-8 rounded-[var(--organisation-card-radius,1.5rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--organisation-action)]">Navigation & Terminology</p>
              <h3 className="mt-2 text-xl font-black text-[var(--color-on-surface)]">Adapt approved platform language</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
                Rename approved sections, adjust order, and hide optional modules without changing protected routes.
              </p>
            </div>
            <button
              type="button"
              onClick={resetNavigationDefaults}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-xs font-black text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)]"
            >
              Restore Defaults
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {DEFAULT_ORGANISATION_NAVIGATION.map((defaultItem) => {
              const configuredItem = settings.navigationConfig.find((item) => item.key === defaultItem.key);
              const isRequired = requiredNavigationKeys.has(defaultItem.key);
              const label = configuredItem?.label ?? defaultItem.label;
              const order = configuredItem?.order ?? defaultItem.order;
              const enabled = isRequired || (settings.featureFlags[defaultItem.key] ?? configuredItem?.enabled ?? defaultItem.enabled);

              return (
                <div key={defaultItem.key} className="grid gap-3 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4 md:grid-cols-[1.5fr_0.6fr_0.7fr] md:items-end">
                  <TextInput
                    label={`${defaultItem.label} label`}
                    value={label}
                    placeholder={defaultItem.label}
                    maxLength={80}
                    onChange={(value) => updateNavigationItem(defaultItem.key, { label: value || defaultItem.label })}
                  />
                  <NumberInput
                    label="Order"
                    value={order}
                    min={1}
                    max={DEFAULT_ORGANISATION_NAVIGATION.length}
                    onChange={(value) => updateNavigationItem(defaultItem.key, { order: value })}
                  />
                  <label className="flex h-12 items-center justify-between rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 text-sm font-bold text-[var(--color-on-surface)]">
                    <span>{isRequired ? "Required" : "Visible"}</span>
                    <input
                      type="checkbox"
                      disabled={isRequired}
                      checked={enabled}
                      onChange={(event) => updateNavigationItem(defaultItem.key, { enabled: event.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-300 disabled:opacity-50"
                    />
                  </label>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {terminologyFields.map((field) => (
              <TextInput
                key={field.key}
                label={field.label}
                value={settings.terminologyConfig[field.key] || ""}
                placeholder={field.placeholder}
                maxLength={60}
                onChange={(value) => updateTerminology(field.key, value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[var(--organisation-card-radius,1.5rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--organisation-action)]">Homepage Widgets</p>
              <h3 className="mt-2 text-xl font-black text-[var(--color-on-surface)]">Configure approved homepage sections</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
                Show, hide, and reorder controlled VisionTech widgets. Unknown widget types are ignored safely.
              </p>
            </div>
            <button
              type="button"
              onClick={resetHomepageDefaults}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-xs font-black text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)]"
            >
              Restore Widgets
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {APPROVED_ORGANISATION_HOMEPAGE_WIDGETS.map((widget) => {
              const configuredSection = settings.homepageConfig.find((section) => section.id === widget.id);
              const enabled = configuredSection?.enabled ?? widget.enabled;
              const position = configuredSection?.position ?? widget.position;

              return (
                <div key={widget.id} className="grid gap-3 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4">
                  <div className="grid gap-3 md:grid-cols-[1.4fr_0.5fr_0.6fr] md:items-end">
                    <div>
                      <p className="text-sm font-black text-[var(--color-on-surface)]">{widget.label}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--color-on-surface-variant)]">{widget.description}</p>
                    </div>
                    <NumberInput
                      label="Position"
                      value={position}
                      min={1}
                      max={APPROVED_ORGANISATION_HOMEPAGE_WIDGETS.length}
                      onChange={(value) => updateHomepageWidget(widget.id, { position: value })}
                    />
                    <label className="flex h-12 items-center justify-between rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 text-sm font-bold text-[var(--color-on-surface)]">
                      <span>Visible</span>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(event) => updateHomepageWidget(widget.id, { enabled: event.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-300"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextInput
                      label="Custom Heading"
                      value={configuredSection?.heading || ""}
                      placeholder={widget.label}
                      maxLength={100}
                      onChange={(value) => updateHomepageWidget(widget.id, { heading: value || null })}
                    />
                    <TextInput
                      label="Custom Description"
                      value={configuredSection?.description || ""}
                      placeholder={widget.description}
                      maxLength={240}
                      onChange={(value) => updateHomepageWidget(widget.id, { description: value || null })}
                    />
                  </div>
                  <div className="rounded-2xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--organisation-action)]">Preview Label</p>
                    <p className="text-sm font-black text-[var(--color-on-surface)]">{widget.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                      {configuredSection?.heading || configuredSection?.description
                        ? `${configuredSection?.heading || widget.label} — ${configuredSection?.description || widget.description}`
                        : "Default widget title only. Add a heading or description to display a custom section intro."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <TextInput
            label="Welcome Heading"
            value={settings.welcomeHeading || ""}
            placeholder={`Welcome to ${organisation.name}`}
            maxLength={255}
            onChange={(value) => setSettings((current) => ({ ...current, welcomeHeading: value || null }))}
          />
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">Welcome Message</span>
            <textarea
              value={settings.welcomeMessage || ""}
              onChange={(event) => setSettings((current) => ({ ...current, welcomeMessage: event.target.value || null }))}
              rows={4}
              maxLength={1000}
              className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface)] outline-none transition focus:border-[var(--organisation-action)] focus:ring-2 focus:ring-[var(--organisation-action)]"
              placeholder="Add a short message that explains the purpose of this organisation workspace."
            />
          </label>
        </div>
        </fieldset>
      </section>

      <section className="space-y-6">
        <div
          className="rounded-3xl border border-[var(--preview-accent-foreground)] bg-[var(--preview-background)] p-6 text-[var(--preview-text)] shadow-xl"
          style={{
            ...previewThemeVariables,
            borderRadius: branding.borderRadius === "rounded" ? "2rem" : undefined,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--preview-action)] text-sm font-black text-[var(--preview-on-action)]"
            >
              {organisation.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--preview-accent-foreground)]">
                Draft Preview
              </p>
              <h3 className="text-xl font-black">{settings.welcomeHeading || organisation.name}</h3>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-[var(--preview-outline-variant)] bg-[var(--preview-surface-container-low)] p-4">
            <p className="text-sm leading-6 text-[var(--preview-on-surface-variant)]">
              {settings.welcomeMessage || "Your organisation workspace can carry your identity while staying inside the VisionTech experience."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {navigationPreview.slice(0, 5).map((item) => (
                <span key={item.key} className="rounded-full bg-[var(--preview-secondary-action)] px-3 py-1 text-xs font-bold text-[var(--preview-on-secondary-action)]">
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[var(--organisation-card-radius,1.5rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Feature Visibility</p>
          <h3 className="mt-2 text-xl font-black text-[var(--color-on-surface)]">Workspace modules</h3>
          <div className="mt-5 space-y-3">
            {["members", "cohorts", "interventions", "opportunities", "reports"].map((feature) => (
              <label key={feature} className="flex items-center justify-between rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm font-bold text-[var(--color-on-surface)]">
                <span className="capitalize">{feature}</span>
                <input
                  type="checkbox"
                  disabled={!canManageSettings}
                  checked={settings.featureFlags[feature] ?? true}
                  onChange={(event) => updateFeatureFlag(feature, event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-300"
                />
              </label>
            ))}
          </div>
        </div>
      </section>
      {publishPreviewConfiguration && publishPreviewThemeVariables ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-2xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--organisation-action)]">Review Before Publishing</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-[var(--color-on-surface)]">Preview organisation changes</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
                  This is the configuration members and public organisation pages will use after publishing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPublishPreviewConfiguration(null)}
                disabled={isPublishing}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 text-sm font-black text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <div
              className="mt-5 rounded-3xl border border-[var(--publish-preview-accent-foreground)] bg-[var(--publish-preview-background)] p-6 text-[var(--publish-preview-text)] shadow-xl"
              style={{
                ...publishPreviewThemeVariables,
                borderRadius: publishPreviewConfiguration.branding.borderRadius === "rounded" ? "2rem" : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[var(--publish-preview-action)] text-sm font-black text-[var(--publish-preview-on-action)]">
                  {publishPreviewConfiguration.branding.logoUrl ? (
                    <img src={publishPreviewConfiguration.branding.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    organisation.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--publish-preview-accent-foreground)]">
                    Publish Preview
                  </p>
                  <h4 className="text-xl font-black">{publishPreviewConfiguration.settings.welcomeHeading || organisation.name}</h4>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-[var(--publish-preview-outline-variant)] bg-[var(--publish-preview-surface-container-low)] p-4">
                <p className="text-sm leading-6 text-[var(--publish-preview-on-surface-variant)]">
                  {publishPreviewConfiguration.settings.welcomeMessage || "Your organisation workspace can carry your identity while staying inside the VisionTech experience."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {publishNavigationPreview.slice(0, 5).map((item) => (
                    <span key={item.key} className="rounded-full bg-[var(--publish-preview-secondary-action)] px-3 py-1 text-xs font-bold text-[var(--publish-preview-on-secondary-action)]">
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm text-[var(--color-on-surface-variant)] sm:grid-cols-2">
              <div>
                <p className="font-black text-[var(--color-on-surface)]">Theme</p>
                <p className="mt-1">Mode: {publishPreviewConfiguration.branding.themeMode}</p>
                <p>Radius: {publishPreviewConfiguration.branding.borderRadius}</p>
              </div>
              <div>
                <p className="font-black text-[var(--color-on-surface)]">Visible modules</p>
                <p className="mt-1">
                  {publishNavigationPreview.map((item) => item.label).join(", ") || "No optional modules enabled"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPublishPreviewConfiguration(null)}
                disabled={isPublishing}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 text-sm font-black text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmPublish()}
                disabled={isPublishing}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--organisation-action)] px-5 text-sm font-black text-[var(--organisation-on-action)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPublishing ? "Publishing..." : "Confirm Publish"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}): JSX.Element {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value) || min)}
        className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] outline-none transition focus:border-[var(--organisation-action)] focus:ring-2 focus:ring-[var(--organisation-action)]"
      />
    </label>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  type = "text",
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "url";
  maxLength?: number;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface)] outline-none transition focus:border-[var(--organisation-action)] focus:ring-2 focus:ring-[var(--organisation-action)]"
      />
    </label>
  );
}

function ColourInput({
  label,
  value,
  description,
  onChange,
}: {
  label: string;
  value: string;
  description: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <div className="block">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">{label}</span>
        <span className="group relative inline-flex">
          <span
            tabIndex={0}
            aria-label={`${label} details: ${description}`}
            className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] outline-none transition hover:text-[var(--organisation-action)] focus:text-[var(--organisation-action)]"
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-72 -translate-x-1/2 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-3 text-xs font-medium normal-case leading-5 tracking-normal text-[var(--color-on-surface)] shadow-xl group-hover:block group-focus-within:block">
            {description}
          </span>
        </span>
      </div>
      <div className="mt-2 flex rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-1 focus-within:border-[var(--organisation-action)] focus-within:ring-2 focus-within:ring-[var(--organisation-action)]">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border-0 bg-transparent"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-[var(--color-on-surface)] outline-none"
        />
      </div>
    </div>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] outline-none transition focus:border-[var(--organisation-action)] focus:ring-2 focus:ring-[var(--organisation-action)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatRole(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function toTenantPath(
  href: string,
  getOrganisationPath: (path?: string) => string,
): string {
  if (!href.startsWith("/organisation")) {
    return href;
  }

  const path = href.replace(/^\/organisation\/?/, "");
  return getOrganisationPath(path);
}

function OrganisationModuleView({
  content,
  onAction,
  liveRecords,
}: {
  content: OrganisationModuleContent;
  onAction: (action: OrganisationModuleAction) => void | Promise<void>;
  liveRecords?: ReactNode;
}): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {content.metrics.map((metric) => (
          <OrganisationMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            note={metric.note}
            tone={metric.tone}
          />
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[var(--color-outline-variant)] bg-slate-950 shadow-xl shadow-black/20">
        <div className="grid gap-6 p-6 text-white lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">{content.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">{content.focusTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{content.focusDescription}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Recommended Admin Action</p>
            <button
              type="button"
              onClick={() => void onAction(content.focusAction)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-fixed-light-surface)] px-4 py-3 text-sm font-black text-[var(--color-on-fixed-light-surface)] transition hover:opacity-90"
            >
              {content.focusAction.label}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {liveRecords}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--organisation-action)]">{content.title}</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">{content.itemsTitle}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">{content.itemsDescription}</p>
            </div>
            <button
              type="button"
              onClick={() => void onAction(content.primaryAction)}
              className="rounded-2xl bg-[var(--color-info-container)] px-4 py-2 text-sm font-black text-[var(--color-info)] transition hover:opacity-85"
            >
              {content.primaryAction.label}
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {content.items.map((item) => (
              <ModuleItemCard key={item.title} item={item} onAction={onAction} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">{content.workflowTitle}</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">How this tab works</h2>
          <div className="mt-6 space-y-5">
            {content.workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-info-container)] text-[var(--color-info)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] opacity-75">Step {index + 1}</p>
                    <h3 className="mt-1 font-bold text-[var(--color-on-surface)]">{step.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-[var(--color-on-surface-variant)]">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function CohortRecordsPanel({
  records,
  isLoading,
  error,
  onCreate,
}: {
  records: OrganisationCohortOverview[];
  isLoading: boolean;
  error: string | null;
  onCreate: () => void;
}): JSX.Element {
  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--organisation-action)]">Live Cohorts</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">Tenant cohort records</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
            Cohorts created for this organisation appear here with assignment and delivery status.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--organisation-action)] px-4 text-sm font-black text-[var(--organisation-on-action)] transition hover:opacity-90"
        >
          Create Cohort
        </button>
      </div>

      {isLoading ? (
        <p className="mt-5 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm font-semibold text-[var(--color-on-surface-variant)]">
          Loading cohorts...
        </p>
      ) : error ? (
        <p className="mt-5 rounded-2xl border border-[var(--color-warning)] bg-[var(--color-warning-container)] px-4 py-3 text-sm font-semibold text-[var(--color-warning)]">
          {error}
        </p>
      ) : records.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((cohort) => (
            <article key={cohort.cohort_id} className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-black text-[var(--color-on-surface)]">{cohort.name}</h3>
                <span className="rounded-full bg-[var(--color-info-container)] px-3 py-1 text-xs font-bold text-[var(--color-info)]">
                  {formatRecordLabel(cohort.status)}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <MetricMini label="Members" value={String(cohort.member_count)} />
                <MetricMini label="Readiness" value={`${cohort.average_readiness}%`} />
                <MetricMini label="Progress" value={`${cohort.average_completion}%`} />
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--color-on-surface-variant)]">
                {cohort.start_date ? `Starts ${cohort.start_date}` : "No start date set"}
                {cohort.end_date ? ` - ends ${cohort.end_date}` : ""}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
          <h3 className="font-black text-[var(--color-on-surface)]">No cohorts created yet</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">
            Create a cohort to organise members into programmes, project sprints, or support groups.
          </p>
        </div>
      )}
    </section>
  );
}

function MetricMini({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-xl bg-[var(--color-surface-container-lowest)] p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">{label}</p>
      <p className="mt-1 font-black text-[var(--color-on-surface)]">{value}</p>
    </div>
  );
}

function InterventionRecordsPanel({
  records,
  isLoading,
  error,
}: {
  records: OrganisationMemberInterventionRecord[];
  isLoading: boolean;
  error: string | null;
}): JSX.Element {
  return (
    <LiveRecordsPanel
      eyebrow="Live Support Records"
      title="Created interventions"
      description="Interventions created from member actions are stored here for tenant-level follow-up."
      isLoading={isLoading}
      error={error}
      emptyTitle="No interventions created yet"
      emptyDescription="Create an intervention from a member profile or support alert to start tracking live cases."
    >
      {records.map((record) => (
        <article key={record.id} className="grid gap-3 border-t border-[var(--color-outline-variant)] py-4 first:border-t-0 md:grid-cols-[1fr_0.7fr_0.5fr] md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-[var(--color-on-surface)]">{formatRecordLabel(record.type)}</h3>
              <span className="rounded-full bg-[var(--color-warning-container)] px-3 py-1 text-xs font-bold text-[var(--color-warning)]">{record.risk_level}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">{record.reason}</p>
            <p className="mt-2 text-sm font-semibold text-[var(--organisation-action)]">{record.recommended_action}</p>
          </div>
          <div className="text-sm text-[var(--color-on-surface-variant)]">
            <p className="font-bold text-[var(--color-on-surface)]">Member</p>
            <p className="mt-1 break-all">{record.user_id}</p>
          </div>
          <RecordStatus status={record.status} createdAt={record.created_at} />
        </article>
      ))}
    </LiveRecordsPanel>
  );
}

function OpportunityRecommendationRecordsPanel({
  records,
  isLoading,
  error,
}: {
  records: OrganisationMemberOpportunityRecommendationRecord[];
  isLoading: boolean;
  error: string | null;
}): JSX.Element {
  return (
    <LiveRecordsPanel
      eyebrow="Live Opportunity Records"
      title="Member recommendations"
      description="Opportunity recommendations shared from member actions are listed here for matching review."
      isLoading={isLoading}
      error={error}
      emptyTitle="No opportunity recommendations yet"
      emptyDescription="Recommend an opportunity from a member drawer to create a live matching record."
    >
      {records.map((record) => (
        <article key={record.id} className="grid gap-3 border-t border-[var(--color-outline-variant)] py-4 first:border-t-0 md:grid-cols-[1fr_0.7fr_0.5fr] md:items-start">
          <div>
            <h3 className="font-black text-[var(--color-on-surface)]">{record.title}</h3>
            {record.note ? (
              <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">{record.note}</p>
            ) : null}
          </div>
          <div className="text-sm text-[var(--color-on-surface-variant)]">
            <p className="font-bold text-[var(--color-on-surface)]">Member</p>
            <p className="mt-1 break-all">{record.user_id}</p>
          </div>
          <RecordStatus status={record.status} createdAt={record.created_at} />
        </article>
      ))}
    </LiveRecordsPanel>
  );
}

function ReportSummaryPanel({
  report,
  isLoading,
  error,
}: {
  report: OrganisationReportResponse | null;
  isLoading: boolean;
  error: string | null;
}): JSX.Element {
  function handleExportCsv(): void {
    if (!report) return;
    const rows = [
      ["Section", "Label", "Value", "Note"],
      ...report.csv_rows.map((row) => [
        row.section,
        row.label,
        row.value,
        row.note || "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.organisation_name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "organisation"}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--organisation-action)]">Live Report</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">Tenant progress summary</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
            Generate a current snapshot from members, cohorts, interventions, and opportunity recommendations.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!report || isLoading}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--organisation-action)] px-4 text-sm font-black text-[var(--organisation-on-action)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <p className="mt-5 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm font-semibold text-[var(--color-on-surface-variant)]">
          Loading report summary...
        </p>
      ) : error ? (
        <p className="mt-5 rounded-2xl border border-[var(--color-warning)] bg-[var(--color-warning-container)] px-4 py-3 text-sm font-semibold text-[var(--color-warning)]">
          {error}
        </p>
      ) : report ? (
        <div className="mt-5 space-y-5">
          <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">
              Generated {formatDateTime(report.generated_at)}
            </p>
            <h3 className="mt-2 text-lg font-black text-[var(--color-on-surface)]">{report.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">{report.summary}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {report.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-on-surface-variant)]">{metric.label}</p>
                <p className="mt-2 text-2xl font-black text-[var(--color-on-surface)]">{metric.value}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-on-surface-variant)]">{metric.note}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
            <h3 className="font-black text-[var(--color-on-surface)]">Highlights</h3>
            <div className="mt-3 space-y-2">
              {report.highlights.map((highlight) => (
                <p key={highlight} className="text-sm leading-6 text-[var(--color-on-surface-variant)]">
                  {highlight}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
          <h3 className="font-black text-[var(--color-on-surface)]">No report available yet</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">
            Report data will appear once the tenant summary endpoint returns a snapshot.
          </p>
        </div>
      )}
    </section>
  );
}

function LiveRecordsPanel({
  eyebrow,
  title,
  description,
  isLoading,
  error,
  emptyTitle,
  emptyDescription,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  emptyTitle: string;
  emptyDescription: string;
  children: ReactNode;
}): JSX.Element {
  const hasRecords = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--organisation-action)]">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-on-surface-variant)]">{description}</p>
      {isLoading ? (
        <p className="mt-5 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm font-semibold text-[var(--color-on-surface-variant)]">
          Loading live records...
        </p>
      ) : error ? (
        <p className="mt-5 rounded-2xl border border-[var(--color-warning)] bg-[var(--color-warning-container)] px-4 py-3 text-sm font-semibold text-[var(--color-warning)]">
          {error}
        </p>
      ) : hasRecords ? (
        <div className="mt-5">{children}</div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
          <h3 className="font-black text-[var(--color-on-surface)]">{emptyTitle}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">{emptyDescription}</p>
        </div>
      )}
    </section>
  );
}

function RecordStatus({ status, createdAt }: { status: string; createdAt: string | null }): JSX.Element {
  return (
    <div className="text-sm text-[var(--color-on-surface-variant)] md:text-right">
      <span className="inline-flex rounded-full bg-[var(--color-info-container)] px-3 py-1 text-xs font-bold text-[var(--color-info)]">
        {formatRecordLabel(status)}
      </span>
      {createdAt ? <p className="mt-2">{formatDateTime(createdAt)}</p> : null}
    </div>
  );
}

function ModuleItemCard({
  item,
  onAction,
}: {
  item: OrganisationModuleItem;
  onAction: (action: OrganisationModuleAction) => void | Promise<void>;
}): JSX.Element {
  return (
    <article className="rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5 transition hover:border-[var(--organisation-action)] hover:bg-[var(--color-surface-container-high)] hover:shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black tracking-tight text-[var(--color-on-surface)]">{item.title}</h3>
            <span className="rounded-full bg-[var(--color-surface-container-lowest)] px-3 py-1 text-xs font-bold text-[var(--color-on-surface)] ring-1 ring-[var(--color-outline-variant)]">
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{item.subtitle}</p>
          <p className="mt-2 text-sm font-semibold text-[var(--organisation-action)]">{item.meta}</p>
        </div>
        <button
          type="button"
          onClick={() => void onAction(item.action)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          {item.action.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {typeof item.progress === "number" && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs font-bold text-[var(--color-on-surface-variant)]">
            <span>Progress</span>
            <span>{item.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-container-lowest)]">
            <div className="h-full rounded-full bg-[var(--organisation-action)]" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => renderTag(tag))}</div>
    </article>
  );
}

function renderTag(tag: string): ReactNode {
  return (
    <span key={tag} className="rounded-full bg-[var(--color-surface-container-lowest)] px-3 py-1 text-xs font-semibold text-[var(--color-on-surface-variant)] ring-1 ring-[var(--color-outline-variant)]">
      {tag}
    </span>
  );
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatRecordLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildPromptResponse(
  content: OrganisationModuleContent,
  prompt: string,
  insight: InstitutionalAIInsight | null,
): string {
  const baseResponse = content.aiResponses[prompt] || "Use the latest institutional insight to prioritise practical administrator action.";
  if (!insight?.mainConcern) {
    return baseResponse;
  }
  return `${baseResponse} Current AI concern: ${insight.mainConcern}`;
}

function readError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
