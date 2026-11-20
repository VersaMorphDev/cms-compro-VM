import { databaseUrlLabel } from "@/db";
import { getBlogPosts } from "@/features/blog/queries";
import { getProjects } from "@/features/portfolio/queries";
import { getServicesBundle } from "@/features/services-solutions/queries";
import { getFaqItems } from "@/features/faq/queries";
import { getPricingTiers } from "@/features/pricing-calculator/queries";
import { getPartners } from "@/features/partners/queries";
import {
  getAffiliatesBundle,
  getJobApplicants,
  getLeads,
} from "@/features/crm-inbound/queries";
import { getSystemErrorLogs } from "@/features/monitoring/queries";
import SyncManagerClient from "@/features/dashboard/SyncManagerClient";

export const dynamic = "force-dynamic";

export default async function SyncPage() {
  const [
    blogRes,
    projRes,
    svcBundle,
    faqRes,
    pricingRes,
    partnerRes,
    leadsRes,
    affRes,
    appRes,
    errRes,
  ] = await Promise.all([
    getBlogPosts(),
    getProjects(),
    getServicesBundle(),
    getFaqItems(),
    getPricingTiers(),
    getPartners(),
    getLeads(),
    getAffiliatesBundle(),
    getJobApplicants(),
    getSystemErrorLogs(),
  ]);

  const publishedContentCount =
    blogRes.items.filter((b) => b.status === "PUBLISHED").length +
    projRes.items.filter((p) => p.status === "PUBLISHED").length +
    svcBundle.services.filter((s) => s.status === "PUBLISHED").length +
    svcBundle.solutions.filter((s) => s.status === "PUBLISHED").length +
    faqRes.items.filter((f) => f.status === "PUBLISHED").length +
    pricingRes.items.filter((t) => t.status === "PUBLISHED").length +
    partnerRes.items.filter((p) => p.status === "PUBLISHED").length;

  const crmRecordsCount =
    leadsRes.items.length +
    affRes.affiliates.length +
    affRes.referrals.length +
    appRes.items.length;

  const unresolvedErrors = errRes.items.filter((e) => !e.isResolved).length;

  return (
    <SyncManagerClient
      stats={{
        dbLabel: databaseUrlLabel,
        publishedContentCount,
        crmRecordsCount,
        unresolvedErrors,
        endpoints: [
          {
            id: "content",
            method: "GET",
            path: "/api/v1/content?section=all",
            purpose: "Menyuplai Blog, Portfolio, Services, Pricing, Calculator, Partners, Team & Legal ke Compro.",
            targetCompro: "src/lib/cms-client.ts",
            status: "Live",
          },
          {
            id: "inbound",
            method: "POST",
            path: "/api/v1/inbound",
            purpose: "Menerima Leads, Pendaftaran Affiliate, Referral Proyek, dan Lamaran Kerja dari Compro.",
            targetCompro: "/api/leads",
            status: "Live",
          },
          {
            id: "telemetry",
            method: "POST",
            path: "/api/v1/telemetry/error",
            purpose: "Menampung error frontend Compro ke tabel terpisah system_error_logs.",
            targetCompro: "/api/log-error",
            status: "Live",
          },
          {
            id: "revalidate",
            method: "POST",
            path: "${COMPRO_URL}/api/revalidate",
            purpose: "Membersihkan cache ISR Next.js di website Compro saat konten dipublish.",
            targetCompro: "/api/revalidate",
            status: "Webhook",
          },
        ],
      }}
    />
  );
}
