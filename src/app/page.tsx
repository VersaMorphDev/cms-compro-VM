import { databaseUrlLabel } from "@/db";
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
  getAffiliatesBundle,
  getJobApplicants,
  getLeads,
} from "@/features/crm-inbound/queries";
import {
  getActivityLogs,
  getSystemErrorLogs,
} from "@/features/monitoring/queries";
import { getPageSections } from "@/features/page-sections/queries";
import DashboardClient from "@/features/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    blogRes,
    projRes,
    svcBundle,
    faqRes,
    pricingRes,
    calcRes,
    partnerRes,
    sectionsRes,
    leadsRes,
    affRes,
    appRes,
    actRes,
    errRes,
  ] = await Promise.all([
    getBlogPosts(),
    getProjects(),
    getServicesBundle(),
    getFaqItems(),
    getPricingTiers(),
    getCalculatorConfigs(),
    getPartners(),
    getPageSections(),
    getLeads(),
    getAffiliatesBundle(),
    getJobApplicants(),
    getActivityLogs(100),
    getSystemErrorLogs(100),
  ]);

  const blogPublished = blogRes.items.filter((b) => b.status === "PUBLISHED").length;
  const blogDraft = blogRes.items.length - blogPublished;

  const publishedContentCount =
    blogPublished +
    projRes.items.filter((p) => p.status === "PUBLISHED").length +
    svcBundle.services.filter((s) => s.status === "PUBLISHED").length +
    svcBundle.solutions.filter((s) => s.status === "PUBLISHED").length +
    faqRes.items.filter((f) => f.status === "PUBLISHED").length +
    pricingRes.items.filter((t) => t.status === "PUBLISHED").length +
    partnerRes.items.filter((p) => p.status === "PUBLISHED").length;

  return (
    <DashboardClient
      stats={{
        dbLabel: databaseUrlLabel,
        publishedContentCount,
        sectionsCount: sectionsRes.items.length,
        blogCount: blogRes.items.length,
        blogPublished,
        blogDraft,
        projectCount: projRes.items.length,
        serviceCount: svcBundle.services.length,
        solutionCount: svcBundle.solutions.length,
        pricingCount: pricingRes.items.length,
        calcCount: calcRes.items.length,
        leadsCount: leadsRes.items.length,
        newLeadsCount: leadsRes.items.filter((l) => l.status === "NEW").length,
        affiliatesCount: affRes.affiliates.length,
        applicantsCount: appRes.items.length,
        unresolvedErrors: errRes.items.filter((e) => !e.isResolved).length,
        totalActivities: actRes.items.length,
      }}
    />
  );
}
