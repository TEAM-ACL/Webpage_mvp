import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, type Account } from "../lib/api";
import { toUserMessage } from "../lib/userErrors";

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

type AccountForm = {
  displayName: string;
  firstName: string;
  lastName: string;
};

export default function Profile(): JSX.Element {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [account, setAccount] = useState<Account | null>(null);
  const [accountForm, setAccountForm] = useState<AccountForm>({
    displayName: "",
    firstName: "",
    lastName: "",
  });
  const [profileForm, setProfileForm] = useState<ProfileForm>({
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
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

  useEffect(() => {
    const loadAccount = async () => {
      setAccountLoading(true);
      try {
        const data = await api.getMyAccount();
        setAccount(data);
        setAccountForm({
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (err) {
        const message = toUserMessage(err, "Unable to load account details.");
        setError(message);
        showError(message);
      } finally {
        setAccountLoading(false);
      }
    };
    if (user) void loadAccount();
  }, [user, showError]);

  const accountDirty = useMemo(() => {
    if (!account) return false;
    return (
      accountForm.displayName.trim() !== account.displayName
      || accountForm.firstName.trim() !== account.firstName
      || accountForm.lastName.trim() !== account.lastName
    );
  }, [account, accountForm]);

  const profileDirty = useMemo(() => {
    if (!profile) return false;
    return (
      profileForm.preferredNickname !== (profile.preferredNickname || "")
      || profileForm.fullName !== (profile.fullName || "")
      || profileForm.fieldOfInterest !== (profile.fieldOfInterest || "")
      || profileForm.experienceLevel !== (profile.experienceLevel || "")
      || profileForm.preferredWorkStyle !== (profile.preferredWorkStyle || "")
      || profileForm.region !== (profile.region || "")
      || profileForm.goals !== (Array.isArray(profile.goals) ? profile.goals.join(", ") : "")
      || profileForm.interests !== (Array.isArray(profile.interests) ? profile.interests.join(", ") : "")
      || profileForm.skills !== (Array.isArray(profile.skills) ? profile.skills.join(", ") : "")
    );
  }, [profile, profileForm]);

  const handleAccountSave = async () => {
    setError(null);
    if (!accountDirty) {
      showSuccess("No account changes to save.");
      return;
    }

    const payload: { display_name?: string; first_name?: string; last_name?: string } = {};
    if (accountForm.displayName.trim()) payload.display_name = accountForm.displayName.trim();
    if (accountForm.firstName.trim()) payload.first_name = accountForm.firstName.trim();
    if (accountForm.lastName.trim()) payload.last_name = accountForm.lastName.trim();
    if (Object.keys(payload).length === 0) {
      const message = "Please provide at least one account field before saving.";
      setError(message);
      showError(message);
      return;
    }

    setAccountSaving(true);
    try {
      const updated = await api.updateMyAccount(payload);
      setAccount(updated);
      setAccountForm({
        displayName: updated.displayName,
        firstName: updated.firstName,
        lastName: updated.lastName,
      });
      showSuccess("Account settings saved.");
    } catch (err) {
      const message = toUserMessage(err, "We couldn't save account settings right now.");
      setError(message);
      showError(message);
    } finally {
      setAccountSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setError(null);
    if (!profileDirty) {
      showSuccess("No profile changes to save.");
      return;
    }

    const payload = {
      preferred_nickname: profileForm.preferredNickname.trim(),
      full_name: profileForm.fullName.trim(),
      field_of_interest: profileForm.fieldOfInterest.trim(),
      experience_level: profileForm.experienceLevel.trim(),
      preferred_work_style: profileForm.preferredWorkStyle.trim(),
      region: profileForm.region.trim(),
      goals: splitCsv(profileForm.goals),
      interests: splitCsv(profileForm.interests),
      skills: splitCsv(profileForm.skills),
    };

    setProfileSaving(true);
    try {
      await api.updateMyProfile(payload);
      await refreshProfile();
      showSuccess("Profile details saved.");
    } catch (err) {
      const message = toUserMessage(err, "We couldn't save your profile right now.");
      setError(message);
      showError(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setError(null);
    const current = currentPassword.trim();
    const next = newPassword.trim();
    if (!current || !next) {
      const message = "Current password and new password are required.";
      setError(message);
      showError(message);
      return;
    }
    if (current === next) {
      const message = "New password must be different from current password.";
      setError(message);
      showError(message);
      return;
    }

    setPasswordSaving(true);
    try {
      await api.changeMyPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      showSuccess("Password changed successfully.");
    } catch (err) {
      const fallback = "Unable to change password right now.";
      const message = toUserMessage(err, fallback);
      const lower = message.toLowerCase();
      if (lower.includes("same") && lower.includes("password")) {
        setError("New password must be different from current password.");
      } else if (lower.includes("weak") || lower.includes("invalid password")) {
        setError("Your new password does not meet security requirements.");
      } else if (lower.includes("unauth") || lower.includes("not authenticated")) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(message);
      }
      showError(error || message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-outline-variant)] bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-on-surface-variant)]">Settings</p>
          <h1 className="text-3xl font-headline font-bold text-[var(--color-on-surface)]">Account & Profile</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Manage account identity, profile details, and password securely.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <section className="rounded-3xl bg-white border border-[var(--color-outline-variant)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Account</h2>
            <button
              onClick={handleAccountSave}
              disabled={accountSaving || accountLoading}
              className="h-10 px-4 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold disabled:opacity-60"
            >
              {accountSaving ? "Saving..." : "Save account"}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email (read-only)" value={account?.email || user?.email || "—"} readOnly />
            <Field
              label="Display name"
              value={accountForm.displayName}
              onChange={(v) => setAccountForm((prev) => ({ ...prev, displayName: v }))}
              placeholder="Display name"
            />
            <Field
              label="First name"
              value={accountForm.firstName}
              onChange={(v) => setAccountForm((prev) => ({ ...prev, firstName: v }))}
              placeholder="First name"
            />
            <Field
              label="Last name"
              value={accountForm.lastName}
              onChange={(v) => setAccountForm((prev) => ({ ...prev, lastName: v }))}
              placeholder="Last name"
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-[var(--color-outline-variant)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Profile</h2>
            <button
              onClick={handleProfileSave}
              disabled={profileSaving || profileLoading}
              className="h-10 px-4 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save profile"}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Preferred nickname" value={profileForm.preferredNickname} onChange={(v) => setProfileForm((p) => ({ ...p, preferredNickname: v }))} />
            <Field label="Full name" value={profileForm.fullName} onChange={(v) => setProfileForm((p) => ({ ...p, fullName: v }))} />
            <Field label="Primary field" value={profileForm.fieldOfInterest} onChange={(v) => setProfileForm((p) => ({ ...p, fieldOfInterest: v }))} />
            <Field label="Experience level" value={profileForm.experienceLevel} onChange={(v) => setProfileForm((p) => ({ ...p, experienceLevel: v }))} />
            <Field label="Preferred work/learning style" value={profileForm.preferredWorkStyle} onChange={(v) => setProfileForm((p) => ({ ...p, preferredWorkStyle: v }))} />
            <Field label="Region" value={profileForm.region} onChange={(v) => setProfileForm((p) => ({ ...p, region: v }))} />
          </div>
          <div className="mt-4 grid gap-4">
            <TextArea label="Goals (comma separated)" value={profileForm.goals} onChange={(v) => setProfileForm((p) => ({ ...p, goals: v }))} />
            <TextArea label="Interests (comma separated)" value={profileForm.interests} onChange={(v) => setProfileForm((p) => ({ ...p, interests: v }))} />
            <TextArea label="Skills (comma separated)" value={profileForm.skills} onChange={(v) => setProfileForm((p) => ({ ...p, skills: v }))} />
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-[var(--color-outline-variant)] p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Password</h2>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Use your current password to set a new one.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Current password"
              type="password"
            />
            <Field
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="New password"
              type="password"
            />
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={passwordSaving}
            className="mt-4 h-10 px-4 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold disabled:opacity-60"
          >
            {passwordSaving ? "Updating..." : "Change password"}
          </button>
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: "text" | "password";
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--color-on-surface)]">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">{label}</span>
      <input
        type={type}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--color-on-surface)]">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">{label}</span>
      <textarea
        className="min-h-[90px] rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
        value={value}
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
