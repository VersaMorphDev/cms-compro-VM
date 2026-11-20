export type NavGroupId =
  | "overview"
  | "content"
  | "commercial"
  | "company"
  | "crm"
  | "monitoring";

export type NavSubIconName =
  | "dashboard"
  | "refresh"
  | "layout-sections"
  | "briefcase"
  | "stack"
  | "article"
  | "help"
  | "tag"
  | "calculator"
  | "handshake"
  | "users"
  | "quote"
  | "user-plus"
  | "scale"
  | "shield-lock"
  | "mail"
  | "affiliate"
  | "file-cv"
  | "history"
  | "shield-alert";

export interface NavSubItem {
  label: string;
  href: string;
  description: string;
  iconName: NavSubIconName;
  comproRoute?: string;
  badge?: number;
}

export interface NavGroup {
  id: NavGroupId;
  label: string;
  shortLabel: string;
  description: string;
  accentBadge: string;
  quickActionLabel: string;
  quickActionHref: string;
  iconName:
    | "layout-dashboard"
    | "file-text"
    | "currency-dollar"
    | "building"
    | "inbox"
    | "activity";
  defaultHref: string;
  items: NavSubItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "Overview & Operations",
    shortLabel: "Overview",
    description:
      "Monitor live CMS statistics, inspect active SQLite collections, and push instant cache updates to the public Compro site.",
    accentBadge: "Control Center",
    quickActionLabel: "Trigger Compro Sync",
    quickActionHref: "/sync",
    iconName: "layout-dashboard",
    defaultHref: "/",
    items: [
      {
        label: "Dashboard",
        href: "/",
        description: "Module KPIs, database metrics, and quick navigation hub.",
        iconName: "dashboard",
      },
      {
        label: "Quick Sync",
        href: "/sync",
        description: "Trigger on-demand ISR cache revalidation & check API bridge.",
        iconName: "refresh",
        comproRoute: "/api/revalidate",
      },
    ],
  },
  {
    id: "content",
    label: "Content & Pages",
    shortLabel: "Content",
    description:
      "Manage per-section landing copy, service offerings, enterprise case studies, insights articles, and customer FAQs.",
    accentBadge: "Editorial Studio",
    quickActionLabel: "Edit Page Sections",
    quickActionHref: "/content/sections",
    iconName: "file-text",
    defaultHref: "/content/sections",
    items: [
      {
        label: "Page Sections",
        href: "/content/sections",
        description: "Edit hero text, story, vision & CTA banners across all 15 routes.",
        iconName: "layout-sections",
        comproRoute: "15 Routes",
      },
      {
        label: "Services & Solutions",
        href: "/content/services",
        description: "Services, industry solutions, DSDDO steps & differentiators.",
        iconName: "briefcase",
        comproRoute: "/services",
      },
      {
        label: "Portfolio",
        href: "/content/portfolio",
        description: "Case studies with problem, solution, tech stack & timeline.",
        iconName: "stack",
        comproRoute: "/portfolio",
      },
      {
        label: "Blog",
        href: "/content/blog",
        description: "Publish engineering articles with rich HTML editor & metadata.",
        iconName: "article",
        comproRoute: "/blog",
      },
      {
        label: "FAQ",
        href: "/content/faq",
        description: "34+ categorized Q&As across General, Services & Support.",
        iconName: "help",
        comproRoute: "/faq",
      },
    ],
  },
  {
    id: "commercial",
    label: "Commercial & Pricing",
    shortLabel: "Commercial",
    description:
      "Configure service packages, tune Simple & Advanced project calculator rates in IDR, and curate partner alliances.",
    accentBadge: "Revenue Engine",
    quickActionLabel: "Open Cost Calculator",
    quickActionHref: "/commercial/calculator",
    iconName: "currency-dollar",
    defaultHref: "/commercial/pricing",
    items: [
      {
        label: "Pricing Tiers",
        href: "/commercial/pricing",
        description: "Discovery, Growth & Enterprise plans with feature checklists.",
        iconName: "tag",
        comproRoute: "/pricing",
      },
      {
        label: "Project Calculator",
        href: "/commercial/calculator",
        description: "Simple & Advanced estimator rates, multipliers & infra tiers.",
        iconName: "calculator",
        comproRoute: "/calculator",
      },
      {
        label: "Partners",
        href: "/commercial/partners",
        description: "23 technology partners across cloud, DevOps, AI & security.",
        iconName: "handshake",
        comproRoute: "/partners",
      },
    ],
  },
  {
    id: "company",
    label: "Company & HR",
    shortLabel: "Company",
    description:
      "Update leadership bios, global company contacts, client testimonials, open positions, and compliance legal pages.",
    accentBadge: "Organization",
    quickActionLabel: "Manage Legal Docs",
    quickActionHref: "/company/legal",
    iconName: "building",
    defaultHref: "/company/team",
    items: [
      {
        label: "About & Team",
        href: "/company/team",
        description: "Founders, global contact/WhatsApp info & company core values.",
        iconName: "users",
        comproRoute: "/about · /team",
      },
      {
        label: "Testimonials",
        href: "/company/testimonials",
        description: "Verified client quotes, project tags & executive reviews.",
        iconName: "quote",
        comproRoute: "/ · /services",
      },
      {
        label: "Careers",
        href: "/company/careers",
        description: "Open positions with work ecosystem & hiring requirements.",
        iconName: "user-plus",
        comproRoute: "/careers",
      },
      {
        label: "Legal Pages",
        href: "/company/legal",
        description: "Privacy, Terms, SLA, DPA, NDA & Newsletter compliance docs.",
        iconName: "scale",
        comproRoute: "10 Legal Pages",
      },
      {
        label: "Admin Users",
        href: "/company/users",
        description: "Manage studio accounts, RBAC roles, active status & password resets.",
        iconName: "shield-lock",
        comproRoute: "RBAC · Auth",
      },
    ],
  },
  {
    id: "crm",
    label: "Inbound & CRM",
    shortLabel: "CRM",
    description:
      "Review inbound contact sales inquiries, manage affiliate codes (VM-AFF) & referrals, and screen job candidates.",
    accentBadge: "Pipeline Inbox",
    quickActionLabel: "Open Leads Inbox",
    quickActionHref: "/crm/leads",
    iconName: "inbox",
    defaultHref: "/crm/leads",
    items: [
      {
        label: "Leads Inbox",
        href: "/crm/leads",
        description: "Contact forms, AI chat captures, partner leads & statuses.",
        iconName: "mail",
        comproRoute: "/contact",
      },
      {
        label: "Affiliates",
        href: "/crm/affiliates",
        description: "Registered growth partners (VM-AFF) and client project referrals.",
        iconName: "affiliate",
        comproRoute: "/affiliate",
      },
      {
        label: "Job Applicants",
        href: "/crm/applicants",
        description: "Candidate CVs, salary expectations, and interview pipeline.",
        iconName: "file-cv",
        comproRoute: "/careers/apply",
      },
    ],
  },
  {
    id: "monitoring",
    label: "System Monitor",
    shortLabel: "Monitor",
    description:
      "Track immutable admin audit logs with before/after diffs and inspect friendly-guarded error telemetry from CMS & Compro.",
    accentBadge: "Observability",
    quickActionLabel: "Inspect Error Guard",
    quickActionHref: "/monitoring/errors",
    iconName: "activity",
    defaultHref: "/monitoring",
    items: [
      {
        label: "Activity Logs",
        href: "/monitoring",
        description: "Audit trail of CMS edits, creates, syncs & system events.",
        iconName: "history",
      },
      {
        label: "Error Logs",
        href: "/monitoring/errors",
        description: "Technical error telemetry (ERR-2026) & resolution status.",
        iconName: "shield-alert",
        comproRoute: "/api/log-error",
      },
    ],
  },
];

export function getActiveNavGroup(pathname: string): NavGroup {
  if (pathname === "/" || pathname.startsWith("/sync")) {
    return NAV_GROUPS[0];
  }
  if (pathname.startsWith("/content")) return NAV_GROUPS[1];
  if (pathname.startsWith("/commercial")) return NAV_GROUPS[2];
  if (pathname.startsWith("/company")) return NAV_GROUPS[3];
  if (pathname.startsWith("/crm")) return NAV_GROUPS[4];
  if (pathname.startsWith("/monitoring")) return NAV_GROUPS[5];
  return NAV_GROUPS[0];
}
