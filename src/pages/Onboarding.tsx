import { generateAIInsight } from "../services/aiService";
import type { OnboardingData } from "../types/ai";
import { api } from "../lib/api";
import { useEffect, useMemo, useState, type JSX } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  X,
  UserRound,
  Goal,
  Lightbulb,
  Wrench,
  Briefcase,
  GraduationCap,
  Globe,
  Layers3,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


type OptionGroup = {
  label: string;
  items: string[];
};

type FormState = {
  preferredNickname: string;
  fullName: string;
  fieldOfInterest: string;
  experienceLevel: string;
  preferredWorkStyle: string;
  region: string;
  country: string;
  otherFieldDetail: string;
  otherRegionDetail: string;
  goals: string[];
  interests: string[];
  skills: string[];
};

const FIELD_OPTIONS = [
  "Technology and IT",
  "Business and Entrepreneurship",
  "Creative and Design",
  "Engineering",
  "Healthcare and Life Sciences",
  "Education and Training",
  "Finance and Accounting",
  "Media and Communication",
  "Law and Public Service",
  "Sales and Marketing",
  "Operations and Logistics",
  "Construction and Trades",
  "Energy and Environment",
  "Hospitality and Tourism",
  "Agriculture and Food Systems",
  "Research and Academia",
  "Nonprofit and Social Impact",
  "Other",
];

const EXPERIENCE_LEVELS = [
  "Beginner",
  "Early stage",
  "Intermediate",
  "Advanced",
  "Career switcher",
  "Student",
];

const WORK_STYLE_OPTIONS = [
  "Hands-on practical",
  "Research-based",
  "Creative exploration",
  "Structured learning",
  "Team collaboration",
  "Independent execution",
  "Mentorship-led",
  "Project-based",
];

const REGION_OPTIONS = [
  "Africa",
  "Asia",
  "Europe",
  "Latin America / Caribbean",
  "Oceania",
  "Northern America",
  "Remote / Global",
  "Other",
];

const COUNTRIES_BY_REGION: Record<string, string[]> = {
  Africa: [
    "Algeria",
    "Angola",
    "Benin",
    "Botswana",
    "Burkina Faso",
    "Burundi",
    "Cameroon",
    "Cape Verde",
    "Central African Republic",
    "Chad",
    "Comoros",
    "Congo (Democratic Republic)",
    "Congo (Republic)",
    "Djibouti",
    "Egypt",
    "Equatorial Guinea",
    "Eritrea",
    "Eswatini",
    "Ethiopia",
    "Gabon",
    "Gambia",
    "Ghana",
    "Guinea",
    "Guinea-Bissau",
    "Ivory Coast",
    "Kenya",
    "Lesotho",
    "Liberia",
    "Libya",
    "Madagascar",
    "Malawi",
    "Mali",
    "Mauritania",
    "Mauritius",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Niger",
    "Nigeria",
    "Rwanda",
    "Sao Tome and Principe",
    "Senegal",
    "Seychelles",
    "Sierra Leone",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Sudan",
    "Tanzania",
    "Togo",
    "Tunisia",
    "Uganda",
    "Zambia",
    "Zimbabwe",
  ],
  Asia: [
    "Afghanistan",
    "Armenia",
    "Azerbaijan",
    "Bahrain",
    "Bangladesh",
    "Bhutan",
    "Brunei",
    "Cambodia",
    "China",
    "Cyprus",
    "Georgia",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Israel",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Lebanon",
    "Malaysia",
    "Maldives",
    "Mongolia",
    "Myanmar",
    "Nepal",
    "North Korea",
    "Oman",
    "Pakistan",
    "Philippines",
    "Qatar",
    "Saudi Arabia",
    "Singapore",
    "South Korea",
    "Sri Lanka",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Thailand",
    "Timor-Leste",
    "Turkey",
    "Turkmenistan",
    "United Arab Emirates",
    "Uzbekistan",
    "Vietnam",
    "Yemen",
  ],
  Europe: [
    "Albania",
    "Andorra",
    "Austria",
    "Belarus",
    "Belgium",
    "Bosnia and Herzegovina",
    "Bulgaria",
    "Croatia",
    "Czechia",
    "Denmark",
    "Estonia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",
    "Ireland",
    "Italy",
    "Latvia",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Moldova",
    "Monaco",
    "Montenegro",
    "Netherlands",
    "North Macedonia",
    "Norway",
    "Poland",
    "Portugal",
    "Romania",
    "Serbia",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Switzerland",
    "Ukraine",
    "United Kingdom",
  ],
  "Latin America / Caribbean": [
    "Argentina",
    "Aruba",
    "Bahamas",
    "Barbados",
    "Belize",
    "Bolivia",
    "Brazil",
    "Chile",
    "Colombia",
    "Costa Rica",
    "Cuba",
    "Dominican Republic",
    "Ecuador",
    "El Salvador",
    "Guatemala",
    "Guyana",
    "Haiti",
    "Honduras",
    "Jamaica",
    "Mexico",
    "Nicaragua",
    "Panama",
    "Paraguay",
    "Peru",
    "Puerto Rico",
    "Saint Lucia",
    "Suriname",
    "Trinidad and Tobago",
    "Uruguay",
    "Venezuela",
  ],
  Oceania: [
    "Australia",
    "Fiji",
    "Kiribati",
    "Marshall Islands",
    "Micronesia",
    "Nauru",
    "New Zealand",
    "Palau",
    "Papua New Guinea",
    "Samoa",
    "Solomon Islands",
    "Tonga",
    "Tuvalu",
    "Vanuatu",
  ],
  "Northern America": ["Canada", "United States"],
  "Remote / Global": ["Remote / Global"],
  Other: ["Other"],
};

const GOAL_GROUPS: OptionGroup[] = [
  {
    label: "Career Growth",
    items: [
      "Get career direction",
      "Build job readiness",
      "Prepare for role transition",
      "Develop a promotion pathway",
      "Strengthen professional confidence",
      "Improve employability",
    ],
  },
  {
    label: "Learning and Skills",
    items: [
      "Learn a new skill",
      "Build practical experience",
      "Close skill gaps",
      "Create a structured growth pathway",
      "Find the best learning resources",
      "Gain confidence in a field",
    ],
  },
  {
    label: "Projects and Innovation",
    items: [
      "Build a project",
      "Turn an idea into execution",
      "Find project collaborators",
      "Validate a solution idea",
      "Join innovation challenges",
      "Create proof of work",
    ],
  },
  {
    label: "Network and Opportunity",
    items: [
      "Find mentors",
      "Meet like-minded people",
      "Expand professional network",
      "Discover opportunities",
      "Find collaborators",
      "Access industry guidance",
    ],
  },
];

const INTEREST_GROUPS: OptionGroup[] = [
  {
    label: "Technology and Digital",
    items: [
      "Cloud computing",
      "Cybersecurity",
      "Software development",
      "Data analysis",
      "Artificial intelligence",
      "UI/UX design",
      "Web development",
      "Networking",
      "Automation",
      "Product management",
    ],
  },
  {
    label: "Business and Growth",
    items: [
      "Entrepreneurship",
      "Business operations",
      "Project management",
      "Marketing",
      "Sales",
      "Customer success",
      "Strategy",
      "Innovation management",
    ],
  },
  {
    label: "Creative and Media",
    items: [
      "Graphic design",
      "Content creation",
      "Writing",
      "Video production",
      "Branding",
      "Photography",
      "Public speaking",
      "Social media",
    ],
  },
  {
    label: "People and Impact",
    items: [
      "Teaching",
      "Coaching",
      "Community development",
      "Healthcare support",
      "Leadership",
      "Public service",
      "Youth development",
      "Social impact",
    ],
  },
  {
    label: "Technical and Industry",
    items: [
      "Engineering systems",
      "Manufacturing",
      "Logistics",
      "Renewable energy",
      "Construction",
      "Food systems",
      "Agriculture",
      "Research",
    ],
  },
];

const SKILL_GROUPS: OptionGroup[] = [
  {
    label: "Transferable Skills",
    items: [
      "Communication",
      "Problem solving",
      "Critical thinking",
      "Teamwork",
      "Leadership",
      "Time management",
      "Adaptability",
      "Organisation",
      "Documentation",
      "Attention to detail",
    ],
  },
  {
    label: "Digital Skills",
    items: [
      "Microsoft Office",
      "Google Workspace",
      "Data entry",
      "Presentation design",
      "Spreadsheet analysis",
      "Digital research",
      "Basic coding",
      "Technical troubleshooting",
    ],
  },
  {
    label: "Business and Delivery",
    items: [
      "Project coordination",
      "Process improvement",
      "Stakeholder communication",
      "Customer support",
      "Reporting",
      "Planning",
      "Task management",
      "Operations support",
    ],
  },
  {
    label: "Creative Skills",
    items: [
      "Writing",
      "Graphic design",
      "Content planning",
      "Video editing",
      "Brand communication",
      "Storytelling",
    ],
  },
  {
    label: "Specialist Skills",
    items: [
      "Cloud fundamentals",
      "Networking",
      "Cybersecurity basics",
      "Teaching support",
      "Research methods",
      "Sales communication",
      "Machine operation",
      "Health and safety awareness",
    ],
  },
];

const FIELD_AUTOFILL: Record<string, { goals: string[]; interests: string[]; skills: string[] }> = {
  "Technology and IT": {
    goals: ["Learn a new skill", "Build practical experience", "Build job readiness"],
    interests: ["Cloud computing", "Cybersecurity", "Software development"],
    skills: ["Problem solving", "Technical troubleshooting", "Documentation"],
  },
  "Business and Entrepreneurship": {
    goals: ["Get career direction", "Turn an idea into execution", "Discover opportunities"],
    interests: ["Entrepreneurship", "Strategy", "Project management"],
    skills: ["Communication", "Leadership", "Planning"],
  },
  "Creative and Design": {
    goals: ["Build a project", "Create proof of work", "Expand professional network"],
    interests: ["Graphic design", "Content creation", "Branding"],
    skills: ["Writing", "Storytelling", "Communication"],
  },
  Engineering: {
    goals: ["Build practical experience", "Create a structured growth pathway", "Improve employability"],
    interests: ["Engineering systems", "Manufacturing", "Research"],
    skills: ["Problem solving", "Attention to detail", "Organisation"],
  },
  "Healthcare and Life Sciences": {
    goals: ["Get career direction", "Strengthen professional confidence", "Access industry guidance"],
    interests: ["Healthcare support", "Research", "Community development"],
    skills: ["Communication", "Attention to detail", "Teamwork"],
  },
  "Education and Training": {
    goals: ["Develop a promotion pathway", "Find mentors", "Close skill gaps"],
    interests: ["Teaching", "Coaching", "Leadership"],
    skills: ["Communication", "Organisation", "Leadership"],
  },
  "Finance and Accounting": {
    goals: ["Improve employability", "Build job readiness", "Gain confidence in a field"],
    interests: ["Strategy", "Business operations", "Data analysis"],
    skills: ["Attention to detail", "Reporting", "Critical thinking"],
  },
  "Media and Communication": {
    goals: ["Build a project", "Expand professional network", "Find collaborators"],
    interests: ["Writing", "Public speaking", "Social media"],
    skills: ["Communication", "Storytelling", "Presentation design"],
  },
  "Law and Public Service": {
    goals: ["Get career direction", "Strengthen professional confidence", "Access industry guidance"],
    interests: ["Public service", "Leadership", "Community development"],
    skills: ["Critical thinking", "Communication", "Documentation"],
  },
  "Sales and Marketing": {
    goals: ["Discover opportunities", "Build job readiness", "Develop a promotion pathway"],
    interests: ["Marketing", "Sales", "Branding"],
    skills: ["Communication", "Customer support", "Planning"],
  },
  "Operations and Logistics": {
    goals: ["Improve employability", "Build practical experience", "Close skill gaps"],
    interests: ["Logistics", "Business operations", "Process improvement"],
    skills: ["Organisation", "Time management", "Operations support"],
  },
  "Construction and Trades": {
    goals: ["Build practical experience", "Improve employability", "Create proof of work"],
    interests: ["Construction", "Engineering systems", "Health and safety"],
    skills: ["Attention to detail", "Problem solving", "Adaptability"],
  },
  "Energy and Environment": {
    goals: ["Get career direction", "Build a project", "Join innovation challenges"],
    interests: ["Renewable energy", "Research", "Social impact"],
    skills: ["Problem solving", "Documentation", "Critical thinking"],
  },
  "Hospitality and Tourism": {
    goals: ["Improve employability", "Develop a promotion pathway", "Expand professional network"],
    interests: ["Customer experience", "Leadership", "Operations"],
    skills: ["Communication", "Teamwork", "Adaptability"],
  },
  "Agriculture and Food Systems": {
    goals: ["Build practical experience", "Create proof of work", "Find collaborators"],
    interests: ["Agriculture", "Food systems", "Research"],
    skills: ["Organisation", "Problem solving", "Attention to detail"],
  },
  "Research and Academia": {
    goals: ["Gain confidence in a field", "Find the best learning resources", "Access industry guidance"],
    interests: ["Research", "Teaching", "Data analysis"],
    skills: ["Critical thinking", "Documentation", "Writing"],
  },
  "Nonprofit and Social Impact": {
    goals: ["Find collaborators", "Discover opportunities", "Turn an idea into execution"],
    interests: ["Social impact", "Community development", "Leadership"],
    skills: ["Communication", "Leadership", "Project coordination"],
  },
};

function flattenGroups(groups: OptionGroup[]): string[] {
  return groups.flatMap((group) => group.items);
}

function uniquePush(list: string[], value: string) {
  const v = value.trim();
  if (!v) return list;
  if (list.includes(v)) return list;
  return [...list, v];
}

function SelectionBlock({
  title,
  subtitle,
  groups,
  selectedItems,
  onAdd,
  onRemove,
  customValue,
  onCustomChange,
  onAddCustom,
  minHint = "Select at least 3",
  limitMessage,
}: {
  title: string;
  subtitle: string;
  groups: OptionGroup[];
  selectedItems: string[];
  onAdd: (value: string, groupLabel: string) => void;
  onRemove: (value: string) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  onAddCustom: () => void;
  minHint?: string;
  limitMessage?: string;
}): JSX.Element {
  const [selectedDropdownValue, setSelectedDropdownValue] = useState("");

  return (
    <motion.section
      layout
      className="rounded-3xl border border-[var(--color-outline-variant)]/60 bg-white p-6 shadow-sm"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-5 flex flex-col gap-2">
        <h3 className="text-xl font-bold text-[var(--color-on-surface)]">{title}</h3>
        <p className="text-sm text-[var(--color-on-surface-variant)]">{subtitle}</p>
        <p className="text-xs font-medium text-[var(--color-on-surface-variant)]/80">{minHint}</p>
        {limitMessage && <p className="text-xs font-semibold text-red-600">{limitMessage}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">
                {group.label}
              </label>

              <div className="flex gap-2">
                <select
                  value={selectedDropdownValue}
                  onChange={(e) => setSelectedDropdownValue(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
                >
                  <option value="">Choose an option</option>
                  {group.items.map((item) => (
                    <option key={`${group.label}-${item}`} value={item} disabled={selectedItems.includes(item)}>
                      {item}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedDropdownValue) return;
                    onAdd(selectedDropdownValue, group.label);
                    setSelectedDropdownValue("");
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:bg-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
          <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Add custom field</label>

          <div className="flex gap-2">
            <input
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder={`Custom ${title.toLowerCase().slice(0, -1)}`}
              className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
            />

            <button
              type="button"
              onClick={onAddCustom}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm font-medium text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container-low)]"
            >
              Add
            </button>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-[var(--color-on-surface)]/80">Selected</p>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedItems.map((item) => (
                  <motion.div
                    key={item}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-white"
                  >
                    <span>{item}</span>
                    <button type="button" onClick={() => onRemove(item)}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function OnboardingPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  const reminder = (location.state as { reminder?: string } | null)?.reminder;
  const [form, setForm] = useState<FormState>({
    preferredNickname: "",
    fullName: "",
    fieldOfInterest: "",
    experienceLevel: "",
    preferredWorkStyle: "",
    region: "",
    country: "",
    otherFieldDetail: "",
    otherRegionDetail: "",
    goals: [],
    interests: [],
    skills: [],
  });

  const [customGoal, setCustomGoal] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [goalLimitMessage, setGoalLimitMessage] = useState("");
  const [interestLimitMessage, setInterestLimitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalRequiredChecks = [
    form.preferredNickname,
    form.fieldOfInterest,
    form.experienceLevel,
    form.preferredWorkStyle,
    form.region,
    form.country,
    form.goals.length >= 3 ? "ok" : "",
    form.interests.length >= 3 ? "ok" : "",
    form.skills.length >= 3 ? "ok" : "",
  ];

  const completion = Math.round((totalRequiredChecks.filter(Boolean).length / totalRequiredChecks.length) * 100);

  useEffect(() => {
    if (!user) return;

    const inferredFullName = (user.display_name || `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()).trim();
    const inferredNickname = user.first_name || "";

    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || inferredFullName,
      preferredNickname: prev.preferredNickname || inferredNickname,
    }));
  }, [user]);

  useEffect(() => {
    setGoalLimitMessage("");
  }, [form.goals]);

  useEffect(() => {
    setInterestLimitMessage("");
  }, [form.interests]);

  const availableCountries = useMemo(() => {
    if (!form.region) return [];
    const list = COUNTRIES_BY_REGION[form.region] || [];
    return [...list].sort((a, b) => a.localeCompare(b));
  }, [form.region]);

  const recommendedPack = useMemo(() => {
    if (!form.fieldOfInterest || !FIELD_AUTOFILL[form.fieldOfInterest]) {
      return null;
    }
    return FIELD_AUTOFILL[form.fieldOfInterest];
  }, [form.fieldOfInterest]);

  const suggestedInterestSkills = useMemo(() => {
    const allSkills = flattenGroups(SKILL_GROUPS);
    const allGoals = flattenGroups(GOAL_GROUPS);

    const smartSkills = form.interests
      .flatMap((interest) => {
        const map: Record<string, string[]> = {
          "Cloud computing": ["Cloud fundamentals", "Technical troubleshooting"],
          Cybersecurity: ["Cybersecurity basics", "Documentation"],
          "Software development": ["Basic coding", "Problem solving"],
          "Data analysis": ["Spreadsheet analysis", "Critical thinking"],
          Entrepreneurship: ["Leadership", "Planning"],
          Marketing: ["Communication", "Presentation design"],
          Teaching: ["Communication", "Leadership"],
          Research: ["Research methods", "Writing"],
          "Graphic design": ["Graphic design", "Storytelling"],
          Logistics: ["Organisation", "Operations support"],
          Manufacturing: ["Attention to detail", "Time management"],
          "Community development": ["Leadership", "Project coordination"],
        };
        return map[interest] || [];
      })
      .filter((item) => allSkills.includes(item));

    const smartGoals = form.interests
      .flatMap((interest) => {
        const map: Record<string, string[]> = {
          "Cloud computing": ["Build practical experience"],
          Cybersecurity: ["Close skill gaps"],
          Entrepreneurship: ["Turn an idea into execution"],
          Research: ["Find the best learning resources"],
          Teaching: ["Find mentors"],
          Marketing: ["Improve employability"],
          "Graphic design": ["Create proof of work"],
          Logistics: ["Develop a promotion pathway"],
          "Community development": ["Find collaborators"],
        };
        return map[interest] || [];
      })
      .filter((item) => allGoals.includes(item));

    return {
      skills: [...new Set(smartSkills)].slice(0, 4),
      goals: [...new Set(smartGoals)].slice(0, 3),
    };
  }, [form.interests]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addToList(key: "goals" | "interests" | "skills", value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: uniquePush(prev[key], value),
    }));
  }

  function applyGroupLimitedAdditions(current: string[], additions: string[], groups: OptionGroup[]): string[] {
    let next = [...current];

    additions.forEach((item) => {
      const group = groups.find((g) => g.items.includes(item));
      const groupCount = group ? next.filter((val) => group.items.includes(val)).length : 0;
      if (group && groupCount >= 2) return;
      next = uniquePush(next, item);
    });

    return next;
  }

  function addGoal(value: string, groupLabel: string) {
    const targetGroup = GOAL_GROUPS.find((g) => g.label === groupLabel);
    const currentCount = targetGroup ? form.goals.filter((item) => targetGroup.items.includes(item)).length : 0;
    if (targetGroup && currentCount >= 2 && !form.goals.includes(value)) {
      setGoalLimitMessage(`Max 2 selections in ${groupLabel}. Remove one to add another.`);
      return;
    }
    setGoalLimitMessage("");
    addToList("goals", value);
  }

  function addInterest(value: string, groupLabel: string) {
    const targetGroup = INTEREST_GROUPS.find((g) => g.label === groupLabel);
    const currentCount = targetGroup ? form.interests.filter((item) => targetGroup.items.includes(item)).length : 0;
    if (targetGroup && currentCount >= 2 && !form.interests.includes(value)) {
      setInterestLimitMessage(`Max 2 selections in ${groupLabel}. Remove one to add another.`);
      return;
    }
    setInterestLimitMessage("");
    addToList("interests", value);
  }

  function handleFieldChange(value: string) {
    setForm((prev) => ({
      ...prev,
      fieldOfInterest: value,
      otherFieldDetail: value === "Other" ? prev.otherFieldDetail : "",
    }));
  }

  function handleRegionChange(value: string) {
    setForm((prev) => ({
      ...prev,
      region: value,
      country: "",
      otherRegionDetail: value === "Other" ? prev.otherRegionDetail : "",
    }));
  }

  function removeFromList(key: "goals" | "interests" | "skills", value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item !== value),
    }));
  }

  function applyAutofillPack() {
    if (!recommendedPack) return;

    setForm((prev) => ({
      ...prev,
      goals: applyGroupLimitedAdditions(prev.goals, recommendedPack.goals, GOAL_GROUPS).slice(0, 6),
      interests: applyGroupLimitedAdditions(prev.interests, recommendedPack.interests, INTEREST_GROUPS).slice(0, 8),
      skills: [...new Set([...prev.skills, ...recommendedPack.skills])].slice(0, 8),
    }));
  }

  function applyInterestSuggestions() {
    setForm((prev) => ({
      ...prev,
      goals: applyGroupLimitedAdditions(prev.goals, suggestedInterestSkills.goals, GOAL_GROUPS),
      skills: [...new Set([...prev.skills, ...suggestedInterestSkills.skills])],
    }));
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const aiPayload: OnboardingData = {
        nickname: form.preferredNickname || form.fullName || "User",
        skills: form.skills,
        interests: form.interests,
        goals: form.goals,
        level: form.experienceLevel || "Unspecified",
      };

      // Persist onboarding to backend (source of truth)
      await api.saveOnboardingProfile(form);

      // Optionally generate AI insight (non-blocking for persistence)
      try {
        const aiInsight = await generateAIInsight(aiPayload);
        console.log("VisionTech AI insight", aiInsight);
      } catch (aiErr) {
        console.warn("AI insight generation failed (non-blocking):", aiErr);
      }

      // Refresh backend-backed profile state
      await refreshProfile();

      navigate("/intelligence");
    } catch (error) {
      console.error("Failed to complete onboarding", error);
      setSubmitError((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-surface)] via-white to-[var(--color-surface-container-low)] text-[var(--color-on-surface)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-outline-variant)]/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">VisionTech</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">Personalise your intelligent journey</p>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full bg-[var(--color-surface-container-low)] px-4 py-2 text-sm font-medium text-[var(--color-on-surface-variant)]">
              Setup progress: {completion}%
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {reminder && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
            <strong className="font-semibold">Heads up:</strong> {reminder} 👋
          </div>
        )}

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            className="rounded-3xl border border-[var(--color-outline-variant)] bg-white p-7 shadow-sm"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="inline-flex items-center rounded-full bg-[var(--color-surface-container-low)] px-3 py-1 text-xs font-semibold text-[var(--color-on-surface-variant)]">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Foundational onboarding
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Let VisionTech understand you properly</h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-on-surface-variant)]">
              The information you provide here helps VisionTech shape your pathways, skill guidance, network matches,
              workspace suggestions, and relevant opportunities.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                <p className="text-sm font-semibold text-[var(--color-on-surface)]">Direction</p>
                <p className="mt-1 text-xs leading-6 text-[var(--color-on-surface-variant)]">Understand your goals and field focus.</p>
              </div>

              <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                <p className="text-sm font-semibold text-[var(--color-on-surface)]">Capability</p>
                <p className="mt-1 text-xs leading-6 text-[var(--color-on-surface-variant)]">Capture current skills and experience.</p>
              </div>

              <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                <p className="text-sm font-semibold text-[var(--color-on-surface)]">Fit</p>
                <p className="mt-1 text-xs leading-6 text-[var(--color-on-surface-variant)]">Improve matching, guidance, and recommendations.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-3xl bg-[var(--color-primary)] p-7 text-white shadow-sm"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <p className="text-sm font-semibold text-white/80">Interactive profile signal</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-white/10 p-4">
                  <UserRound className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">Identity</p>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-white/10 p-4">
                  <Goal className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">Goals</p>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-white/10 p-4">
                  <Wrench className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">Skills</p>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-white/10 p-4">
                  <Lightbulb className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">Interests</p>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-white/10 p-4">
                  <Briefcase className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">Pathway fit</p>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-white/10 p-4">
                  <Layers3 className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">AI context</p>
                </motion.div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/80">Completion</span>
                  <span className="font-semibold">{completion}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-white/20">
                  <motion.div className="h-2 rounded-full bg-white" animate={{ width: `${completion}%` }} transition={{ duration: 0.35 }} />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="mb-8 rounded-3xl border border-[var(--color-outline-variant)] bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Basic profile context</h2>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              Start with the most important details VisionTech needs to identify and introduce you to the system.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Preferred nickname</label>
              <input
                value={form.preferredNickname}
                onChange={(e) => updateField("preferredNickname", e.target.value)}
                placeholder="What should VisionTech call you?"
                className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Full name</label>
              <input
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Your full name"
                className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Primary field / career direction</label>
              <select
                value={form.fieldOfInterest}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
              >
                <option value="">Select primary field</option>
                {FIELD_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {form.fieldOfInterest === "Other" && (
              <div className="md:col-span-2 xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Describe your field / career direction</label>
                <input
                  value={form.otherFieldDetail}
                  onChange={(e) => updateField("otherFieldDetail", e.target.value)}
                  placeholder="Tell us more about your field"
                  className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Current level</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => updateField("experienceLevel", e.target.value)}
                className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
              >
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Preferred learning / work style</label>
              <select
                value={form.preferredWorkStyle}
                onChange={(e) => updateField("preferredWorkStyle", e.target.value)}
                className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
              >
                <option value="">Select work style</option>
                {WORK_STYLE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Region</label>
              <select
                value={form.region}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
              >
                <option value="">Select region</option>
                {REGION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Country</label>
              <select
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70 disabled:text-[var(--color-on-surface-variant)]/60"
                disabled={!availableCountries.length}
              >
                <option value="">{form.region ? "Select country" : "Select a region first"}</option>
                {availableCountries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {form.region === "Other" && (
              <div className="md:col-span-2 xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-[var(--color-on-surface)]/80">Describe your region</label>
                <input
                  value={form.otherRegionDetail}
                  onChange={(e) => updateField("otherRegionDetail", e.target.value)}
                  placeholder="Tell us about your region or location"
                  className="h-11 w-full rounded-2xl border border-[var(--color-outline-variant)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)]/70"
                />
              </div>
            )}
          </div>

          {recommendedPack && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl bg-[var(--color-surface-container-low)] p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-on-surface)]">Smart starter pack available</p>
                  <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                    Based on your selected field, VisionTech can autofill a strong starting set of goals, interests, and skills to reduce repeated input.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={applyAutofillPack}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:bg-black"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Use suggested starter set
                </button>
              </div>
            </motion.div>
          )}
        </motion.section>

        <SelectionBlock
          title="Goals"
          subtitle="Choose the main outcomes you want VisionTech to help you achieve. Select at least 3."
          groups={GOAL_GROUPS}
          selectedItems={form.goals}
          onAdd={(value, groupLabel) => addGoal(value, groupLabel)}
          onRemove={(value) => removeFromList("goals", value)}
          customValue={customGoal}
          onCustomChange={setCustomGoal}
          onAddCustom={() => {
            addToList("goals", customGoal);
            setCustomGoal("");
          }}
          limitMessage={goalLimitMessage}
          minHint="Select at least 3 (max 2 per category)"
        />

        <div className="my-8" />

        <SelectionBlock
          title="Interests"
          subtitle="Choose the major areas you are curious about, already exploring, or want to grow into. Select at least 3."
          groups={INTEREST_GROUPS}
          selectedItems={form.interests}
          onAdd={(value, groupLabel) => addInterest(value, groupLabel)}
          onRemove={(value) => removeFromList("interests", value)}
          customValue={customInterest}
          onCustomChange={setCustomInterest}
          onAddCustom={() => {
            addToList("interests", customInterest);
            setCustomInterest("");
          }}
          limitMessage={interestLimitMessage}
          minHint="Select at least 3 (max 2 per category)"
        />

        <div className="my-8" />

        <SelectionBlock
          title="Skills"
          subtitle="Choose your current strengths or skills you already have. This helps VisionTech avoid asking for the same things repeatedly and improve pathway accuracy. Select at least 3."
          groups={SKILL_GROUPS}
          selectedItems={form.skills}
          onAdd={(value, _groupLabel) => addToList("skills", value)}
          onRemove={(value) => removeFromList("skills", value)}
          customValue={customSkill}
          onCustomChange={setCustomSkill}
          onAddCustom={() => {
            addToList("skills", customSkill);
            setCustomSkill("");
          }}
        />

        {(suggestedInterestSkills.skills.length > 0 || suggestedInterestSkills.goals.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-3xl border border-[var(--color-outline-variant)] bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--color-on-surface)]">VisionTech smart suggestions</h3>
                <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                  Based on the interests you selected, these are useful related goals and skills you may want to add.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                    <p className="text-sm font-semibold text-[var(--color-on-surface)]">Suggested goals</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestedInterestSkills.goals.map((item) => (
                        <span key={item} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[var(--color-on-surface-variant)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                    <p className="text-sm font-semibold text-[var(--color-on-surface)]">Suggested skills</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestedInterestSkills.skills.map((item) => (
                        <span key={item} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[var(--color-on-surface-variant)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={applyInterestSuggestions}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:bg-black"
              >
                <Check className="mr-2 h-4 w-4" />
                Apply suggestions
              </button>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 rounded-3xl border border-[var(--color-outline-variant)] bg-white p-6 shadow-sm"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Review your onboarding profile</h3>
              <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                This is the foundation VisionTech uses to personalise your system experience from day one.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">Nickname</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                    {form.preferredNickname || "Not set yet"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">Field</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                    {form.fieldOfInterest || "Not set yet"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">Level</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                    {form.experienceLevel || "Not set yet"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">Work style</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                    {form.preferredWorkStyle || "Not set yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--color-primary)] p-6 text-white">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <p className="text-sm font-semibold text-white/80">Ready to continue</p>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/80">
                After this step, the next page takes you into Intelligence, where VisionTech begins generating tailored guidance, pathway logic, and recommendation signals.
              </p>

              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/80">Completion</span>
                  <span className="font-semibold">{completion}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/20">
                  <motion.div className="h-2 rounded-full bg-white" animate={{ width: `${completion}%` }} transition={{ duration: 0.35 }} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {submitError && (
                  <p className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {submitError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-container-low)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Complete onboarding"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>

                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/30 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Save and continue later
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
