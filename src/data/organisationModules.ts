import {
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  LifeBuoy,
  Megaphone,
  Palette,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type OrganisationModuleKey =
  | "cohorts"
  | "interventions"
  | "opportunities"
  | "reports"
  | "settings";

export type OrganisationModuleMetric = {
  label: string;
  value: string;
  note: string;
  tone: "indigo" | "emerald" | "amber" | "rose" | "sky" | "slate";
};

export type OrganisationModuleAction = {
  label: string;
  href: string;
  primary?: boolean;
};

export type OrganisationModuleItem = {
  title: string;
  subtitle: string;
  status: string;
  meta: string;
  progress?: number;
  tags: string[];
  action: OrganisationModuleAction;
};

export type OrganisationWorkflowStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type OrganisationModuleContent = {
  key: OrganisationModuleKey;
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: OrganisationModuleAction;
  secondaryAction?: OrganisationModuleAction;
  metrics: OrganisationModuleMetric[];
  focusTitle: string;
  focusDescription: string;
  focusAction: OrganisationModuleAction;
  itemsTitle: string;
  itemsDescription: string;
  items: OrganisationModuleItem[];
  workflowTitle: string;
  workflow: OrganisationWorkflowStep[];
};

export const organisationModules: Record<OrganisationModuleKey, OrganisationModuleContent> = {
  cohorts: {
    key: "cohorts",
    eyebrow: "Programmes & Delivery",
    title: "Cohorts",
    description: "Create cohorts, assign members, track programme progress, and identify where delivery support is needed.",
    primaryAction: { label: "Create Cohort", href: "/organisation/cohorts?create=true", primary: true },
    secondaryAction: { label: "Assign Members", href: "/organisation/members?action=assign-cohort" },
    metrics: [
      { label: "Active Cohorts", value: "4", note: "Currently being delivered", tone: "indigo" },
      { label: "Assigned Members", value: "52", note: "People in cohort pathways", tone: "sky" },
      { label: "Avg Progress", value: "61%", note: "Pathway completion across cohorts", tone: "emerald" },
      { label: "Need Support", value: "11", note: "Members flagged inside cohorts", tone: "amber" },
    ],
    focusTitle: "Create a four-week practical project cohort",
    focusDescription: "AI signals show project evidence is weaker than engagement. A focused cohort helps members produce portfolio-ready proof.",
    focusAction: { label: "Start Cohort Setup", href: "/organisation/cohorts?create=true", primary: true },
    itemsTitle: "Cohort Performance",
    itemsDescription: "Track the highest-priority cohorts and open the full workflow when deeper management is needed.",
    items: [
      {
        title: "Cloud Career Transition",
        subtitle: "24 members • Cloud Support / IT pathway",
        status: "Active",
        meta: "5 need support",
        progress: 54,
        tags: ["Readiness 68%", "Project evidence gap", "Mentor review due"],
        action: { label: "Open Cohort", href: "/organisation/cohorts?cohort=cloud-career-transition" },
      },
      {
        title: "Data Employability Sprint",
        subtitle: "16 members • Data analyst readiness",
        status: "Active",
        meta: "2 need support",
        progress: 62,
        tags: ["Readiness 74%", "Strong engagement", "Opportunity matching"],
        action: { label: "Open Cohort", href: "/organisation/cohorts?cohort=data-employability-sprint" },
      },
      {
        title: "Digital Skills Foundation",
        subtitle: "12 members • Foundation digital confidence",
        status: "Planning",
        meta: "Launch checklist",
        progress: 38,
        tags: ["Invite pending", "Baseline assessment", "Resource pack"],
        action: { label: "Continue Setup", href: "/organisation/cohorts?cohort=digital-skills-foundation" },
      },
    ],
    workflowTitle: "Cohort Workflow",
    workflow: [
      { icon: Building2, title: "Create cohort", description: "Define programme goal, duration, and target outcomes." },
      { icon: Users, title: "Assign members", description: "Add people manually or from filtered support/readiness lists." },
      { icon: BarChart3, title: "Track progress", description: "Monitor readiness, activity, pathway completion, and evidence." },
    ],
  },
  interventions: {
    key: "interventions",
    eyebrow: "Support Operations",
    title: "Interventions",
    description: "Coordinate support actions for inactive members, low readiness, overdue work, and incomplete pathways.",
    primaryAction: { label: "Create Intervention", href: "/organisation/interventions?create=true", primary: true },
    secondaryAction: { label: "Review Support Cases", href: "/organisation/members?filter=needs-support" },
    metrics: [
      { label: "Open Cases", value: "9", note: "Currently active support actions", tone: "amber" },
      { label: "High Risk", value: "3", note: "Urgent cases needing admin review", tone: "rose" },
      { label: "Resolved", value: "14", note: "Support actions closed this month", tone: "emerald" },
      { label: "Avg Response", value: "1.8d", note: "Time to first administrator action", tone: "sky" },
    ],
    focusTitle: "Review inactive members first",
    focusDescription: "Inactivity is the strongest risk signal. Start with members who have not engaged for more than 14 days.",
    focusAction: { label: "Review Inactive Members", href: "/organisation/members?filter=needs-support", primary: true },
    itemsTitle: "Active Support Alerts",
    itemsDescription: "Each case pairs a risk signal with a recommended response so action stays practical.",
    items: [
      {
        title: "Sarah James",
        subtitle: "Cloud Support Engineer",
        status: "Medium Risk",
        meta: "No activity for 16 days",
        tags: ["Inactive", "Cloud cohort", "Mentor check-in"],
        action: { label: "Create Intervention", href: "/organisation/interventions?member=sarah-james&create=true" },
      },
      {
        title: "Jayden Smith",
        subtitle: "Junior Data Analyst",
        status: "Medium Risk",
        meta: "Low project evidence",
        tags: ["Readiness 48%", "2 overdue tasks", "Portfolio sprint"],
        action: { label: "Assign Action", href: "/organisation/interventions?member=jayden-smith&create=true" },
      },
      {
        title: "Lewis Carter",
        subtitle: "Software Project Portfolio",
        status: "High Risk",
        meta: "Incomplete onboarding",
        tags: ["Invited", "Goal missing", "Needs onboarding support"],
        action: { label: "Review Member", href: "/organisation/members?member=lewis-carter" },
      },
    ],
    workflowTitle: "Intervention Workflow",
    workflow: [
      { icon: BellRing, title: "Detect risk", description: "Use inactivity, readiness, tasks, and onboarding signals." },
      { icon: LifeBuoy, title: "Assign support", description: "Create an action with owner, reason, and next response." },
      { icon: CheckCircle2, title: "Resolve", description: "Close the case when the member has re-engaged or progressed." },
    ],
  },
  opportunities: {
    key: "opportunities",
    eyebrow: "Opportunity Pipeline",
    title: "Opportunities",
    description: "Publish opportunities, match members, assign cohorts, and track expressions of interest.",
    primaryAction: { label: "Add Opportunity", href: "/organisation/opportunities?create=true", primary: true },
    secondaryAction: { label: "Review Matches", href: "/organisation/opportunities?view=matches" },
    metrics: [
      { label: "Active Opportunities", value: "6", note: "Currently published", tone: "indigo" },
      { label: "Closing Soon", value: "3", note: "Need review this week", tone: "amber" },
      { label: "Strong Matches", value: "31", note: "Members ready to apply", tone: "emerald" },
      { label: "Interest", value: "18", note: "Expressions submitted", tone: "sky" },
    ],
    focusTitle: "Review opportunities closing this week",
    focusDescription: "Three opportunities are close to expiry. Confirm matched members have enough evidence before applications are encouraged.",
    focusAction: { label: "Review Closing Soon", href: "/organisation/opportunities?filter=closing-soon", primary: true },
    itemsTitle: "Opportunity Activity",
    itemsDescription: "Focus on live opportunities with readiness-linked matching signals.",
    items: [
      {
        title: "Junior Cloud Internship",
        subtitle: "Cloud support • External employer",
        status: "Closing in 4 days",
        meta: "12 strong matches",
        tags: ["7 interested", "Cloud cohort", "Evidence required"],
        action: { label: "View Opportunity", href: "/organisation/opportunities?opportunity=junior-cloud-internship" },
      },
      {
        title: "Data Portfolio Challenge",
        subtitle: "Data analysis • Project opportunity",
        status: "Closing in 9 days",
        meta: "18 strong matches",
        tags: ["11 interested", "Portfolio evidence", "Remote"],
        action: { label: "View Opportunity", href: "/organisation/opportunities?opportunity=data-portfolio-challenge" },
      },
      {
        title: "Mentor Feedback Circle",
        subtitle: "Peer and mentor support • Internal opportunity",
        status: "Open",
        meta: "8 suggested members",
        tags: ["Feedback", "Interview prep", "Low confidence support"],
        action: { label: "Assign Members", href: "/organisation/opportunities?action=assign-members" },
      },
    ],
    workflowTitle: "Opportunity Workflow",
    workflow: [
      { icon: BriefcaseBusiness, title: "Publish", description: "Create opportunity details, requirements, and deadline." },
      { icon: Users, title: "Match members", description: "Use readiness, skill gaps, and project evidence to identify fit." },
      { icon: Megaphone, title: "Track interest", description: "Monitor applications, expressions of interest, and follow-up." },
    ],
  },
  reports: {
    key: "reports",
    eyebrow: "Institutional Reporting",
    title: "Reports",
    description: "Generate progress, readiness, engagement, intervention, and opportunity impact reports.",
    primaryAction: { label: "Generate Report", href: "/organisation/reports?create=true", primary: true },
    secondaryAction: { label: "Export CSV", href: "/organisation/reports?export=csv" },
    metrics: [
      { label: "Templates", value: "5", note: "Available report types", tone: "indigo" },
      { label: "Generated", value: "12", note: "Reports this month", tone: "emerald" },
      { label: "Data Coverage", value: "86%", note: "Members with enough activity", tone: "sky" },
      { label: "AI Summaries", value: "Ready", note: "Executive summaries available", tone: "amber" },
    ],
    focusTitle: "Generate a monthly institutional progress report",
    focusDescription: "Combine member progress, cohort delivery, support cases, and opportunity readiness into one executive view.",
    focusAction: { label: "Build Monthly Report", href: "/organisation/reports?template=monthly-progress", primary: true },
    itemsTitle: "Report Templates",
    itemsDescription: "Use templates to keep leadership reporting consistent and outcome-focused.",
    items: [
      {
        title: "Monthly Progress Report",
        subtitle: "Members, cohorts, readiness, and activity",
        status: "Recommended",
        meta: "Best for leadership review",
        tags: ["CSV export", "AI summary", "Date filters"],
        action: { label: "Preview", href: "/organisation/reports?template=monthly-progress" },
      },
      {
        title: "Support & Intervention Report",
        subtitle: "Risk signals, open cases, and resolution trends",
        status: "Available",
        meta: "9 open cases",
        tags: ["Risk", "Resolution", "Member support"],
        action: { label: "Preview", href: "/organisation/reports?template=support" },
      },
      {
        title: "Opportunity Readiness Report",
        subtitle: "Matches, interests, and evidence strength",
        status: "Available",
        meta: "31 strong matches",
        tags: ["Readiness", "Matching", "Evidence"],
        action: { label: "Preview", href: "/organisation/reports?template=opportunities" },
      },
    ],
    workflowTitle: "Reporting Workflow",
    workflow: [
      { icon: FileText, title: "Choose template", description: "Select the institutional outcome you want to report." },
      { icon: BarChart3, title: "Filter data", description: "Pick period, cohort, readiness band, or support status." },
      { icon: CheckCircle2, title: "Export", description: "Generate CSV, preview, and AI executive summary." },
    ],
  },
  settings: {
    key: "settings",
    eyebrow: "Administration",
    title: "Organisation Settings",
    description: "Manage organisation profile, administrators, branding, notifications, security, and data privacy controls.",
    primaryAction: { label: "Save Settings", href: "/organisation/settings?save=true", primary: true },
    secondaryAction: { label: "Invite Admin", href: "/organisation/settings?invite-admin=true" },
    metrics: [
      { label: "Profile", value: "80%", note: "Organisation profile completion", tone: "emerald" },
      { label: "Admins", value: "2", note: "People with administrator access", tone: "indigo" },
      { label: "Security", value: "Good", note: "Access controls configured", tone: "sky" },
      { label: "Branding", value: "Draft", note: "Logo and theme not final", tone: "amber" },
    ],
    focusTitle: "Complete organisation profile and admin access",
    focusDescription: "A complete profile makes reporting, invitations, and opportunity publishing more trustworthy.",
    focusAction: { label: "Review Profile", href: "/organisation/settings?section=profile", primary: true },
    itemsTitle: "Settings Areas",
    itemsDescription: "Keep institutional administration clean, secure, and ready for scale.",
    items: [
      {
        title: "Organisation Profile",
        subtitle: "Name, type, description, website, and status",
        status: "In progress",
        meta: "80% complete",
        progress: 80,
        tags: ["Profile", "Public details", "Institution data"],
        action: { label: "Edit Profile", href: "/organisation/settings?section=profile" },
      },
      {
        title: "Administrators",
        subtitle: "Manage roles and platform access",
        status: "Configured",
        meta: "2 admins",
        tags: ["platform_admin", "organisation_admin", "Access"],
        action: { label: "Manage Admins", href: "/organisation/settings?section=admins" },
      },
      {
        title: "Branding & Notifications",
        subtitle: "Logo, accent colour, invitation messages, and alerts",
        status: "Draft",
        meta: "Needs review",
        tags: ["Branding", "Notifications", "Templates"],
        action: { label: "Configure", href: "/organisation/settings?section=branding" },
      },
    ],
    workflowTitle: "Settings Workflow",
    workflow: [
      { icon: Palette, title: "Profile & branding", description: "Configure organisation identity and public details." },
      { icon: ShieldCheck, title: "Access control", description: "Assign admin roles and review permissions." },
      { icon: BellRing, title: "Notifications", description: "Set invitation, support, report, and opportunity alerts." },
    ],
  },
};
