import { desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import {
  affiliateReferrals,
  affiliates,
  jobApplicants,
  leads,
} from "@/db/schema";
import {
  getFallbackAffiliatesBundle,
  getFallbackJobApplicants,
  getFallbackLeads,
} from "./store-fallback";
import type {
  AffiliateDTO,
  AffiliateReferralDTO,
  JobApplicantDTO,
  LeadDTO,
} from "./schema";

export async function getLeads(): Promise<{
  items: LeadDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(leads)
        .orderBy(desc(leads.createdAt), desc(leads.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          ...r,
          metadata: (r.metadata as Record<string, unknown> | null) ?? {},
          status: r.status as LeadDTO["status"],
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[CrmQueries] Falling back to memory store for leads:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackLeads(),
  };
}

export async function getAffiliatesBundle(): Promise<{
  affiliates: AffiliateDTO[];
  referrals: AffiliateReferralDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const [affRows, refRows] = await Promise.all([
        db.select().from(affiliates).orderBy(desc(affiliates.id)),
        db
          .select()
          .from(affiliateReferrals)
          .orderBy(desc(affiliateReferrals.createdAt), desc(affiliateReferrals.id)),
      ]);

      return {
        storageMode: "database",
        affiliates: affRows.map((a) => ({
          ...a,
          status: a.status as AffiliateDTO["status"],
          createdAt: a.createdAt.toISOString(),
        })),
        referrals: refRows.map((r) => ({
          ...r,
          status: r.status as AffiliateReferralDTO["status"],
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[CrmQueries] Falling back to memory store for affiliates:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  const fb = getFallbackAffiliatesBundle();
  return {
    storageMode: "memory",
    ...fb,
  };
}

export async function getJobApplicants(): Promise<{
  items: JobApplicantDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(jobApplicants)
        .orderBy(desc(jobApplicants.createdAt), desc(jobApplicants.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          ...r,
          status: r.status as JobApplicantDTO["status"],
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[CrmQueries] Falling back to memory store for applicants:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackJobApplicants(),
  };
}
