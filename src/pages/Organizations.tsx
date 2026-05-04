import { useEffect, useState, type JSX } from "react";
import DashboardShell from "../components/dashboard/DashboardShell";
import PageHeader from "../components/dashboard/PageHeader";
import {
  createOrganization,
  getOrganizationAnalytics,
  getOrganizationMembers,
  getOrganizations,
  joinOrganization,
} from "../services/organizations";
import {
  createOpportunity,
  getOpportunities,
  getRecommendedOpportunities,
} from "../services/opportunities";
import type {
  Organization,
  OrganizationAnalytics,
  OrganizationType,
} from "../types/organizations";
import type { Opportunity, OpportunityStatus, OpportunityType } from "../types/opportunities";

const orgTypes: OrganizationType[] = [
  "university",
  "bootcamp",
  "company",
  "community",
  "innovation_hub",
  "training_center",
];

const oppTypes: OpportunityType[] = [
  "internship",
  "project",
  "hackathon",
  "training",
  "collaboration",
  "job",
];

export default function Organizations(): JSX.Element {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<OrganizationType>("innovation_hub");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");

  const [oppTitle, setOppTitle] = useState("");
  const [oppDescription, setOppDescription] = useState("");
  const [oppSkills, setOppSkills] = useState("");
  const [oppType, setOppType] = useState<OpportunityType>("project");
  const [oppStatus, setOppStatus] = useState<OpportunityStatus>("open");

  const loadBaseData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, opps, recs] = await Promise.all([
        getOrganizations(),
        getOpportunities(),
        getRecommendedOpportunities(),
      ]);
      setOrganizations(orgs);
      setOpportunities(opps);
      setRecommendedOpportunities(recs);
      if (orgs.length > 0 && !selectedOrgId) {
        setSelectedOrgId(orgs[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load organization data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadOrgData = async (): Promise<void> => {
      if (!selectedOrgId) {
        setAnalytics(null);
        setMemberCount(0);
        return;
      }
      try {
        const [a, members] = await Promise.all([
          getOrganizationAnalytics(selectedOrgId),
          getOrganizationMembers(selectedOrgId),
        ]);
        setAnalytics(a);
        setMemberCount(members.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load organization analytics.");
      }
    };
    void loadOrgData();
  }, [selectedOrgId]);

  const handleCreateOrganization = async (): Promise<void> => {
    setError(null);
    if (!orgName.trim() || !orgDescription.trim()) {
      setError("Organization name and description are required.");
      return;
    }
    try {
      const created = await createOrganization({
        name: orgName.trim(),
        type: orgType,
        description: orgDescription.trim(),
        website: orgWebsite.trim() || undefined,
      });
      setOrganizations((current) => [created, ...current]);
      setSelectedOrgId(created.id);
      setOrgName("");
      setOrgDescription("");
      setOrgWebsite("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create organization.");
    }
  };

  const handleJoinOrganization = async (id: string): Promise<void> => {
    setError(null);
    try {
      await joinOrganization(id);
      if (selectedOrgId === id) {
        const members = await getOrganizationMembers(id);
        setMemberCount(members.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join organization.");
    }
  };

  const handleCreateOpportunity = async (): Promise<void> => {
    setError(null);
    if (!oppTitle.trim() || !oppDescription.trim()) {
      setError("Opportunity title and description are required.");
      return;
    }
    try {
      const created = await createOpportunity({
        organization_id: selectedOrgId || undefined,
        title: oppTitle.trim(),
        description: oppDescription.trim(),
        required_skills: oppSkills.split(",").map((s) => s.trim()).filter(Boolean),
        opportunity_type: oppType,
        status: oppStatus,
      });
      setOpportunities((current) => [created, ...current]);
      setOppTitle("");
      setOppDescription("");
      setOppSkills("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create opportunity.");
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="VisionTech Organizations"
        title="Institution & Organization Layer"
        description="Create organizations, manage participation, post opportunities, and monitor institution intelligence."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading organization workspace...
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Create Organization</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Organization name" />
              <select value={orgType} onChange={(e) => setOrgType(e.target.value as OrganizationType)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                {orgTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <input value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Website (optional)" />
              <textarea value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} className="min-h-[90px] rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Description" />
            </div>
            <button type="button" onClick={() => void handleCreateOrganization()} className="mt-4 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white">
              Create Organization
            </button>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Organizations</h2>
              <div className="mt-3 space-y-3">
                {organizations.map((org) => (
                  <div key={org.id} className="rounded-xl border border-slate-200 p-3">
                    <button
                      type="button"
                      onClick={() => setSelectedOrgId(org.id)}
                      className="w-full text-left"
                    >
                      <p className="text-sm font-semibold text-slate-900">{org.name}</p>
                      <p className="mt-1 text-xs text-slate-600">{org.type}</p>
                    </button>
                    <button type="button" onClick={() => void handleJoinOrganization(org.id)} className="mt-2 rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-700">
                      Join
                    </button>
                  </div>
                ))}
                {organizations.length === 0 ? <p className="text-sm text-slate-600">No organizations yet.</p> : null}
              </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Institution Dashboard</h2>
                {analytics ? (
                  <>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <Metric title="Members" value={memberCount} />
                      <Metric title="Projects" value={analytics.projects} />
                      <Metric title="Completed Projects" value={analytics.completed_projects} />
                      <Metric title="Learning Items" value={analytics.learning_items} />
                      <Metric title="Learning Completions" value={analytics.completed_learning_items} />
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Top Skills</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analytics.top_skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-700 border border-slate-200">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">Select an organization to view analytics.</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Post Opportunity</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input value={oppTitle} onChange={(e) => setOppTitle(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Opportunity title" />
                  <select value={oppType} onChange={(e) => setOppType(e.target.value as OpportunityType)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                    {oppTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <select value={oppStatus} onChange={(e) => setOppStatus(e.target.value as OpportunityStatus)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                    <option value="paused">paused</option>
                  </select>
                  <textarea value={oppDescription} onChange={(e) => setOppDescription(e.target.value)} className="min-h-[90px] rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Description" />
                  <input value={oppSkills} onChange={(e) => setOppSkills(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Required skills (comma separated)" />
                </div>
                <button type="button" onClick={() => void handleCreateOpportunity()} className="mt-4 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white">
                  Create Opportunity
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-cyan-900">Recommended Opportunities</h2>
              <div className="mt-3 space-y-3">
                {recommendedOpportunities.map((item) => (
                  <div key={item.id} className="rounded-xl border border-cyan-200 bg-white p-3">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {item.opportunity_type} - {item.status}
                      {typeof item.match_score === "number" ? ` - ${item.match_score}% Match` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.required_skills.map((skill) => (
                        <span key={`${item.id}-${skill}`} className="rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] text-cyan-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {recommendedOpportunities.length === 0 ? <p className="text-sm text-slate-600">No recommended opportunities yet.</p> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">All Open Opportunities</h2>
              <div className="mt-3 space-y-3">
                {opportunities.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{item.opportunity_type} - {item.status}</p>
                  </div>
                ))}
                {opportunities.length === 0 ? <p className="text-sm text-slate-600">No opportunities posted yet.</p> : null}
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}

function Metric({ title, value }: { title: string; value: number }): JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
