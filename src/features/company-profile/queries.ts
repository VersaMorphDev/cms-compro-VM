import { asc, desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import {
  legalPages,
  siteSettings,
  teamMembers,
  testimonials,
} from "@/db/schema";
import {
  getFallbackLegalPages,
  getFallbackSiteSettings,
  getFallbackTeamMembers,
  getFallbackTestimonials,
} from "./store-fallback";
import type {
  AboutStatItem,
  AboutValueItem,
  CompanyProfileSettings,
  LegalPageDTO,
  TeamMemberDTO,
  TestimonialDTO,
} from "./schema";

export async function getTeamAndSettings(): Promise<{
  teamMembers: TeamMemberDTO[];
  companyProfile: CompanyProfileSettings;
  aboutStats: AboutStatItem[];
  aboutValues: AboutValueItem[];
  aboutIndustries: string[];
  trendingTags: string[];
  navLinks: { name: string; href: string }[];
  footerCompanyLinks: { name: string; href: string }[];
  legalLinks: { name: string; href: string }[];
  serviceCategories: { name: string; value: string }[];
  storageMode: "database" | "memory";
}> {
  const defaults = getFallbackSiteSettings();
  const defaultIndustries = [
    "Technology & Software",
    "Financial Services",
    "Healthcare",
    "Manufacturing",
    "Logistics & Supply Chain",
    "Education",
    "Government & Public Sector",
    "Agriculture",
    "Retail & E-Commerce",
    "Professional Services",
    "Telecommunications",
    "Energy & Utilities",
  ];
  const defaultTrendingTags = [
    "AI Integration",
    "Microservices",
    "Edge Computing",
    "IoT",
    "Cybersecurity",
  ];
  const defaultNavLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Solutions", href: "/solutions" },
    { name: "Blog", href: "/blog" },
  ];
  const defaultFooterLinks = [
    { name: "About Us", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Pricing", href: "/pricing" },
    { name: "Project Calculator", href: "/calculator" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Partners", href: "/partners" },
    { name: "Affiliate", href: "/affiliate" },
  ];
  const defaultLegalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-conditions" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "SLA", href: "/sla" },
    { name: "DPA", href: "/dpa" },
  ];
  const defaultServiceCategories = [
    { name: "Digital Transformation", value: "Digital Transformation" },
    { name: "Software Development", value: "Software Development" },
    { name: "Web & Mobile Apps", value: "Web & Mobile Apps" },
    { name: "AI & Cloud Solutions", value: "AI & Cloud Solutions" },
    { name: "UI/UX Design", value: "UI/UX Design" },
    { name: "General Inquiry", value: "General Inquiry" },
  ];

  if (isDatabaseConfigured) {
    try {
      const [memberRows, settingRows] = await Promise.all([
        db
          .select()
          .from(teamMembers)
          .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.id)),
        db.select().from(siteSettings),
      ]);

      const settingsMap = new Map<string, Record<string, unknown>>();
      for (const row of settingRows) {
        settingsMap.set(row.key, row.value);
      }

      const rawProfile = settingsMap.get("company_profile");
      const rawStats = settingsMap.get("about_stats");
      const rawValues = settingsMap.get("about_values");
      const rawIndustries = settingsMap.get("about_industries");
      const rawTags = settingsMap.get("trending_tags");
      const rawNavLinks = settingsMap.get("nav_links");
      const rawFooterLinks = settingsMap.get("footer_company_links");
      const rawLegalLinks = settingsMap.get("legal_links");
      const rawServiceCategories = settingsMap.get("service_categories");

      const companyProfile: CompanyProfileSettings = rawProfile
        ? { ...defaults.companyProfile, ...(rawProfile as Partial<CompanyProfileSettings>) }
        : defaults.companyProfile;

      const aboutStats: AboutStatItem[] = Array.isArray(rawStats?.items)
        ? (rawStats.items as AboutStatItem[])
        : defaults.aboutStats;

      const aboutValues: AboutValueItem[] = Array.isArray(rawValues?.items)
        ? (rawValues.items as AboutValueItem[])
        : defaults.aboutValues;

      const aboutIndustries = Array.isArray(rawIndustries?.items)
        ? (rawIndustries.items as string[])
        : defaultIndustries;

      const trendingTags = Array.isArray(rawTags?.items)
        ? (rawTags.items as string[])
        : defaultTrendingTags;

      const navLinks = Array.isArray(rawNavLinks?.items)
        ? (rawNavLinks.items as { name: string; href: string }[])
        : defaultNavLinks;

      const footerCompanyLinks = Array.isArray(rawFooterLinks?.items)
        ? (rawFooterLinks.items as { name: string; href: string }[])
        : defaultFooterLinks;

      const legalLinks = Array.isArray(rawLegalLinks?.items)
        ? (rawLegalLinks.items as { name: string; href: string }[])
        : defaultLegalLinks;

      const serviceCategories = Array.isArray(rawServiceCategories?.items)
        ? (rawServiceCategories.items as { name: string; value: string }[])
        : defaultServiceCategories;

      return {
        storageMode: "database",
        teamMembers: memberRows.map((r) => ({
          ...r,
          status: r.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
        companyProfile,
        aboutStats,
        aboutValues,
        aboutIndustries,
        trendingTags,
        navLinks,
        footerCompanyLinks,
        legalLinks,
        serviceCategories,
      };
    } catch (err) {
      console.warn(
        "[CompanyQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    teamMembers: getFallbackTeamMembers(),
    companyProfile: defaults.companyProfile,
    aboutStats: defaults.aboutStats,
    aboutValues: defaults.aboutValues,
    aboutIndustries: defaultIndustries,
    trendingTags: defaultTrendingTags,
    navLinks: defaultNavLinks,
    footerCompanyLinks: defaultFooterLinks,
    legalLinks: defaultLegalLinks,
    serviceCategories: defaultServiceCategories,
  };
}

export async function getTestimonials(): Promise<{
  items: TestimonialDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(testimonials)
        .orderBy(asc(testimonials.sortOrder), desc(testimonials.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          ...r,
          status: r.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[TestimonialQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackTestimonials(),
  };
}

export async function getLegalPages(): Promise<{
  items: LegalPageDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(legalPages)
        .orderBy(asc(legalPages.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          ...r,
          subtitle: r.subtitle ?? "",
          lastUpdated: r.lastUpdated ?? "June 2026",
          tocSections: Array.isArray(r.tocSections) ? r.tocSections : [],
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[LegalQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackLegalPages(),
  };
}
