import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

type ProfileForm = {
  preferredNickname: string;
  fullName: string;
  fieldOfInterest: string;
  experienceLevel: string;
  preferredWorkStyle: string;
  region: string;
  goals: string;
  interests: string;
  skills: string;
};

export default function Profile(): JSX.Element {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>({
    preferredNickname: "",
    fullName: "",
    fieldOfInterest: "",
    experienceLevel: "",
    preferredWorkStyle: "",
    region: "",
    goals: "",
    interests: "",
    skills: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      preferredNickname: profile.preferredNickname || "",
      fullName: profile.fullName || "",
      fieldOfInterest: profile.fieldOfInterest || "",
      experienceLevel: profile.experienceLevel || "",
      preferredWorkStyle: profile.preferredWorkStyle || "",
      region: profile.region || "",
      goals: Array.isArray(profile.goals) ? profile.goals.join(", ") : "",
      interests: Array.isArray(profile.interests) ? profile.interests.join(", ") : "",
      skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
    });
  }, [profile]);

  const handleChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        preferred_nickname: form.preferredNickname,
        full_name: form.fullName,
        field_of_interest: form.fieldOfInterest,
        experience_level: form.experienceLevel,
        preferred_work_style: form.preferredWorkStyle,
        region: form.region,
        goals: splitCsv(form.goals),
        interests: splitCsv(form.interests),
        skills: splitCsv(form.skills),
      };
      await api.saveOnboardingProfile(payload);
      await refreshProfile();
      alert("Profile saved");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-outline-variant)] bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-on-surface-variant)]">Profile</p>
            <h1 className="text-3xl font-headline font-bold text-[var(--color-on-surface)]">Your account & identity</h1>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Review and update your core details and onboarding signals.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-5 rounded-2xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {profileLoading && <p className="text-sm text-[var(--color-on-surface-variant)]">Loading profile...</p>}
        <section className="rounded-3xl bg-white border border-[var(--color-outline-variant)] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-4">Account</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email (from sign up)" value={user?.email || "—"} readOnly />
            <Field
              label="Preferred nickname"
              value={form.preferredNickname}
              onChange={(v) => handleChange("preferredNickname", v)}
              placeholder="What should we call you?"
            />
            <Field
              label="Full name"
              value={form.fullName}
              onChange={(v) => handleChange("fullName", v)}
              placeholder="Your full name"
            />
            <Field
              label="Region"
              value={form.region}
              onChange={(v) => handleChange("region", v)}
              placeholder="e.g. United Kingdom"
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-[var(--color-outline-variant)] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-4">Professional focus</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Primary field"
              value={form.fieldOfInterest}
              onChange={(v) => handleChange("fieldOfInterest", v)}
              placeholder="Cloud security, design, data..."
            />
            <Field
              label="Experience level"
              value={form.experienceLevel}
              onChange={(v) => handleChange("experienceLevel", v)}
              placeholder="Beginner, Intermediate, Advanced..."
            />
            <Field
              label="Preferred work/learning style"
              value={form.preferredWorkStyle}
              onChange={(v) => handleChange("preferredWorkStyle", v)}
              placeholder="Hands-on, research, collaboration..."
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-[var(--color-outline-variant)] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-4">Onboarding signals</h2>
          <div className="grid gap-4 md:grid-cols-1">
            <TextArea
              label="Goals (comma separated)"
              value={form.goals}
              onChange={(v) => handleChange("goals", v)}
              placeholder="e.g. Get career direction, Build job readiness"
            />
            <TextArea
              label="Interests (comma separated)"
              value={form.interests}
              onChange={(v) => handleChange("interests", v)}
              placeholder="e.g. Cloud computing, UI/UX, Marketing"
            />
            <TextArea
              label="Skills (comma separated)"
              value={form.skills}
              onChange={(v) => handleChange("skills", v)}
              placeholder="e.g. Problem solving, Basic coding, Presentation design"
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-on-surface-variant)]">
            These feed your Intelligence dashboard, matching, and pathway recommendations.
          </p>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--color-on-surface)]">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">{label}</span>
      <input
        className="h-11 rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--color-on-surface)]">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">{label}</span>
      <textarea
        className="min-h-[90px] rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function splitCsv(input: string): string[] {
  return input
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
