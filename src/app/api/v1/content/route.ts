import { NextResponse } from "next/server";
import { getBlogPosts } from "@/features/blog/queries";
import { getProjects } from "@/features/portfolio/queries";
import { getServicesBundle } from "@/features/services-solutions/queries";
import { getFaqItems } from "@/features/faq/queries";
import {
  getCalculatorConfigs,
  getPricingTiers,
} from "@/features/pricing-calculator/queries";
import { getPartners } from "@/features/partners/queries";
import {
  getLegalPages,
  getTeamAndSettings,
  getTestimonials,
} from "@/features/company-profile/queries";
import { getJobOpenings } from "@/features/careers/queries";
import { getPageSections } from "@/features/page-sections/queries";
import { handleApiError } from "@/lib/safe-action";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const configuredKey = process.env.CMS_API_KEY?.trim();
  if (!configuredKey) return true;
  return req.headers.get("x-cms-api-key") === configuredKey;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized CMS API key." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const section = url.searchParams.get("section")?.toLowerCase() || "all";
    const pageFilter = url.searchParams.get("page")?.toLowerCase() || undefined;

    const data: Record<string, unknown> = {};

    if (section === "all" || section === "sections") {
      const res = await getPageSections(pageFilter);
      data.sections = res.items;
      const byPage: Record<string, Record<string, unknown>> = {};
      for (const item of res.items) {
        if (!byPage[item.pageSlug]) byPage[item.pageSlug] = {};
        byPage[item.pageSlug][item.sectionKey] = item;
      }
      data.sectionsByPage = byPage;
    }

    if (section === "all" || section === "blog") {
      const res = await getBlogPosts();
      data.blog = res.items.filter((p) => p.status === "PUBLISHED");
    }

    if (section === "all" || section === "projects" || section === "portfolio") {
      const res = await getProjects();
      data.projects = res.items.filter((p) => p.status === "PUBLISHED");
    }

    if (section === "all" || section === "services") {
      const bundle = await getServicesBundle();
      data.services = bundle.services.filter((s) => s.status === "PUBLISHED");
      data.solutions = bundle.solutions.filter((s) => s.status === "PUBLISHED");
      data.approachSteps = bundle.approachSteps;
      data.whyChooseUs = bundle.whyChooseUs;
    }

    if (section === "all" || section === "faq") {
      const res = await getFaqItems();
      data.faq = res.items.filter((f) => f.status === "PUBLISHED");
    }

    if (section === "all" || section === "pricing") {
      const res = await getPricingTiers();
      data.pricing = res.items.filter((t) => t.status === "PUBLISHED");
    }

    if (section === "all" || section === "calculator") {
      const res = await getCalculatorConfigs();
      const active = res.items.filter((c) => c.isActive);
      data.calculator = {
        services: active.filter((c) => c.configType === "SERVICE"),
        scales: active.filter((c) => c.configType === "SCALE"),
        addons: active.filter((c) => c.configType === "ADDON"),
        platforms: active.filter((c) => c.configType === "PLATFORM"),
        complexFeatures: active.filter((c) => c.configType === "COMPLEX_FEATURE"),
        infraTiers: active.filter((c) => c.configType === "INFRA_TIER"),
        uxMultipliers: active.filter((c) => c.configType === "UX_MULTIPLIER"),
        scopeRates: active.filter((c) => c.configType === "SCOPE_RATE"),
      };
    }

    if (section === "all" || section === "partners") {
      const res = await getPartners();
      data.partners = res.items.filter((p) => p.status === "PUBLISHED");
    }

    if (section === "all" || section === "company" || section === "team" || section === "settings") {
      const res = await getTeamAndSettings();
      data.team = res.teamMembers.filter((m) => m.status === "PUBLISHED");
      data.companyProfile = res.companyProfile;
      data.aboutStats = res.aboutStats;
      data.aboutValues = res.aboutValues;
      data.aboutIndustries = res.aboutIndustries;
      data.trendingTags = res.trendingTags;
      data.navLinks = res.navLinks;
      data.footerCompanyLinks = res.footerCompanyLinks;
      data.legalLinks = res.legalLinks;
      data.serviceCategories = res.serviceCategories;
    }

    if (section === "all" || section === "testimonials") {
      const res = await getTestimonials();
      data.testimonials = res.items.filter((t) => t.status === "PUBLISHED");
    }

    if (section === "all" || section === "careers") {
      const res = await getJobOpenings();
      data.careers = res.items.filter((j) => j.status === "OPEN");
    }

    if (section === "all" || section === "legal") {
      const res = await getLegalPages();
      data.legal = res.items;
    }

    return NextResponse.json(
      {
        ok: true,
        section,
        generatedAt: new Date().toISOString(),
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    return handleApiError(err, {
      source: "CMS_API",
      friendlyMessage: "Gagal mengambil konten dari CMS.",
      requestUrl: req.url,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
  }
}
