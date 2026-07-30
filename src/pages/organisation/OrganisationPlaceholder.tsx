import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import type { JSX, ReactNode } from "react";
import OrganisationAIPanel from "../../components/organisation/OrganisationAIPanel";
import OrganisationLayout from "../../components/organisation/OrganisationLayout";
import OrganisationMetricCard from "../../components/organisation/OrganisationMetricCard";
import {
  DEFAULT_ORGANISATION_NAVIGATION,
  normaliseNavigation,
  type OrganisationNavigationKey,
} from "../../config/organisationTenant";
import { useAuth } from "../../context/AuthContext";
import { useOrganisation } from "../../context/OrganisationContext";
import { useToast } from "../../context/ToastContext";
import {
  organisationModules,
  type OrganisationModuleAction,
  type OrganisationModuleContent,
  type OrganisationModuleKey,
  type OrganisationModuleItem,
} from "../../data/organisationModules";
import {
  getInstitutionalAIInsight,
  refreshInstitutionalAIInsight,
  updateOrganisationBranding,
  updateOrganisationSettings,
} from "../../services/organisation";
import type {
  ActiveOrganisation,
  InstitutionalAIInsight,
  InstitutionalRecommendedAction,
  OrganisationBranding,
  OrganisationNavigationConfigItem,
  OrganisationSettings,
} from "../../types/organisation";

type OrganisationPlaceholderProps = {
  moduleKey: OrganisationModuleKey;
};

const outlineButton =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-bold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-low)]";
const primaryButton =
  "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:opacity-90";
const requiredNavigationKeys = new Set<OrganisationNavigationKey>(["overview", "settings"]);
const terminologyFields: Array<{ key: string; label: string; placeholder: string }> = [
  { key: "members", label: "Members", placeholder: "Students, Employees, Participants" },
  { key: "cohorts", label: "Cohorts", placeholder: "Programmes, Classes, Teams" },
  { key: "opportunities", label: "Opportunities", placeholder: "Placements, Vacancies, Pathways" },
  { key: "interventions", label: "Interventions", placeholder: "Student Support, Workforce Support" },
];

export default function OrganisationPlaceholder({ moduleKey }: OrganisationPlaceholderProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const { organisation, getOrganisationPath, isModuleEnabled, refreshOrganisation } = useOrganisation();
  const organisationId = organisation?.id;
  const { showError, showSuccess } = useToast();
  const content = organisationModules[moduleKey];
  const [insight, setInsight] = useState<InstitutionalAIInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [isAiRefreshing, setIsAiRefreshing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const queryAction = buildModuleQueryAction(moduleKey, location.search);

  const loadInsight = useCallback(async () => {
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

  function handleAction(action: OrganisationModuleAction): void {
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
        <>
          {content.secondaryAction && (
            <button type="button" className={outlineButton} onClick={() => handleAction(content.secondaryAction!)}>
              {content.secondaryAction.label}
            </button>
          )}
          <button type="button" className={primaryButton} onClick={() => handleAction(content.primaryAction)}>
            {content.primaryAction.label}
          </button>
        </>
      }
    >
      {!isModuleEnabled(moduleKey) ? (
        <DisabledModuleState moduleName={content.title} onOpenSettings={() => navigate(getOrganisationPath("settings"))} />
      ) : moduleKey === "settings" && organisation ? (
        <>
          {queryAction ? <ModuleQueryActionBanner action={queryAction} /> : null}
          <OrganisationPersonalisationSettings
            organisation={organisation}
            onRefresh={refreshOrganisation}
            onError={showError}
            onSuccess={showSuccess}
          />
        </>
      ) : (
        <>
          {queryAction ? <ModuleQueryActionBanner action={queryAction} /> : null}
          <OrganisationModuleView content={content} onAction={handleAction} />
        </>
      )}
      <div className="mt-6">
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
      </div>
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
    <section className="mb-6 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm shadow-slate-200/50">
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
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm shadow-slate-200/50">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <LockKeyhole className="h-6 w-6" />
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-slate-500">Module Hidden</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{moduleName} is disabled for this organisation</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        This module has been turned off in organisation feature visibility. Administrators can re-enable it from settings when it is needed.
      </p>
      <button
        type="button"
        onClick={onOpenSettings}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-black text-white transition hover:opacity-90"
      >
        Open Settings
      </button>
    </section>
  );
}

function OrganisationPersonalisationSettings({
  organisation,
  onRefresh,
  onError,
  onSuccess,
}: {
  organisation: ActiveOrganisation;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}): JSX.Element {
  const [branding, setBranding] = useState<OrganisationBranding>(organisation.branding);
  const [settings, setSettings] = useState<OrganisationSettings>(organisation.settings);
  const [isSaving, setIsSaving] = useState(false);
  const canManageSettings = ["owner", "organisation_admin", "admin"].includes(organisation.role);

  useEffect(() => {
    setBranding(organisation.branding);
    setSettings(organisation.settings);
  }, [organisation.branding, organisation.settings]);

  async function handleSave(): Promise<void> {
    if (!canManageSettings) {
      onError("Organisation administrator access is required.");
      return;
    }

    setIsSaving(true);
    try {
      await updateOrganisationBranding(organisation.id, branding);
      await updateOrganisationSettings(organisation.id, settings);
      await onRefresh();
      onSuccess("Organisation personalisation saved.");
    } catch (error) {
      onError(readError(error, "Unable to save organisation personalisation."));
    } finally {
      setIsSaving(false);
    }
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
      const existingItem = current.navigationConfig.find((item) => item.key === key);
      const nextItem: OrganisationNavigationConfigItem = {
        key,
        label: defaultItem.label,
        path: defaultItem.path,
        enabled: defaultItem.enabled,
        order: defaultItem.order,
        ...existingItem,
        ...updates,
      };
      const nextConfig = [
        ...current.navigationConfig.filter((item) => item.key !== key),
        nextItem,
      ].sort((left, right) => left.order - right.order);

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

  const navigationPreview = normaliseNavigation(settings.navigationConfig, settings.featureFlags);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[var(--organisation-card-radius,1.5rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Personalisation</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--color-on-surface)]">Organisation identity</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
              Configure the visual identity and welcome experience members see inside this organisation workspace.
            </p>
          </div>
          <button
            type="button"
            disabled={isSaving || !canManageSettings}
            onClick={() => void handleSave()}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-black text-[var(--organisation-on-primary)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {!canManageSettings && (
          <div className="mt-5 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            You can view these settings, but only organisation administrators can update them.
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextInput
            label="Logo URL"
            value={branding.logoUrl || ""}
            placeholder="https://example.com/logo.png"
            onChange={(value) => setBranding((current) => ({ ...current, logoUrl: value || null }))}
          />
          <TextInput
            label="Dashboard Banner URL"
            value={branding.dashboardBannerUrl || ""}
            placeholder="https://example.com/banner.png"
            onChange={(value) => setBranding((current) => ({ ...current, dashboardBannerUrl: value || null }))}
          />
          <ColourInput
            label="Primary Colour"
            value={branding.primaryColour}
            onChange={(value) => setBranding((current) => ({ ...current, primaryColour: value }))}
          />
          <ColourInput
            label="Secondary Colour"
            value={branding.secondaryColour}
            onChange={(value) => setBranding((current) => ({ ...current, secondaryColour: value }))}
          />
          <ColourInput
            label="Accent Colour"
            value={branding.accentColour}
            onChange={(value) => setBranding((current) => ({ ...current, accentColour: value }))}
          />
          <ColourInput
            label="Text Colour"
            value={branding.textColour}
            onChange={(value) => setBranding((current) => ({ ...current, textColour: value }))}
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

        <div className="mt-8 rounded-[var(--organisation-card-radius,1.5rem)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Navigation & Terminology</p>
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
                onChange={(value) => updateTerminology(field.key, value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <TextInput
            label="Welcome Heading"
            value={settings.welcomeHeading || ""}
            placeholder={`Welcome to ${organisation.name}`}
            onChange={(value) => setSettings((current) => ({ ...current, welcomeHeading: value || null }))}
          />
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">Welcome Message</span>
            <textarea
              value={settings.welcomeMessage || ""}
              onChange={(event) => setSettings((current) => ({ ...current, welcomeMessage: event.target.value || null }))}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              placeholder="Add a short message that explains the purpose of this organisation workspace."
            />
          </label>
        </div>
      </section>

      <section className="space-y-6">
        <div
          className="rounded-3xl border p-6 shadow-xl"
          style={{
            background: branding.backgroundColour,
            borderColor: branding.accentColour,
            color: branding.textColour,
            borderRadius: branding.borderRadius === "rounded" ? "2rem" : undefined,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white"
              style={{ background: branding.primaryColour }}
            >
              {organisation.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: branding.accentColour }}>
                Live Preview
              </p>
              <h3 className="text-xl font-black">{settings.welcomeHeading || organisation.name}</h3>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 opacity-80">
            {settings.welcomeMessage || "Your organisation workspace can carry your identity while staying inside the VisionTech experience."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {navigationPreview.slice(0, 5).map((item) => (
              <span key={item.key} className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: branding.secondaryColour }}>
                {item.label}
              </span>
            ))}
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
                  checked={settings.featureFlags[feature] ?? true}
                  onChange={(event) => updateFeatureFlag(feature, event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-300"
                />
              </label>
            ))}
          </div>
        </div>
      </section>
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
        className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
    </label>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
    </label>
  );
}

function ColourInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">{label}</span>
      <div className="mt-2 flex rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-1 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
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
    </label>
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
        className="mt-2 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm font-bold text-[var(--color-on-surface)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
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
}: {
  content: OrganisationModuleContent;
  onAction: (action: OrganisationModuleAction) => void;
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

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl shadow-slate-200/60">
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
              onClick={() => onAction(content.focusAction)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-indigo-50"
            >
              {content.focusAction.label}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{content.title}</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">{content.itemsTitle}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{content.itemsDescription}</p>
            </div>
            <button
              type="button"
              onClick={() => onAction(content.primaryAction)}
              className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
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

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{content.workflowTitle}</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">How this tab works</h2>
          <div className="mt-6 space-y-5">
            {content.workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Step {index + 1}</p>
                    <h3 className="mt-1 font-bold text-slate-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{step.description}</p>
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

function ModuleItemCard({
  item,
  onAction,
}: {
  item: OrganisationModuleItem;
  onAction: (action: OrganisationModuleAction) => void;
}): JSX.Element {
  return (
    <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black tracking-tight text-slate-950">{item.title}</h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
          <p className="mt-2 text-sm font-semibold text-indigo-700">{item.meta}</p>
        </div>
        <button
          type="button"
          onClick={() => onAction(item.action)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          {item.action.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {typeof item.progress === "number" && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
            <span>Progress</span>
            <span>{item.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => renderTag(tag))}</div>
    </article>
  );
}

function renderTag(tag: string): ReactNode {
  return (
    <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
      {tag}
    </span>
  );
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
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
