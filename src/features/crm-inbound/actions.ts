"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import {
  affiliateReferrals,
  affiliates,
  jobApplicants,
  leads,
} from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  isUniqueConstraintError as isUniqueViolation,
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import {
  addFallbackLead,
  addFallbackAffiliate,
  deleteFallbackApplicant,
  deleteFallbackLead,
  deleteFallbackReferral,
  toggleFallbackAffiliateStatus,
  updateFallbackApplicant,
  updateFallbackLead,
  updateFallbackReferral,
} from "./store-fallback";
import {
  createAffiliateSchema,
  createLeadSchema,
  updateAffiliateStatusSchema,
  updateApplicantSchema,
  updateLeadSchema,
  updateReferralSchema,
  type AffiliateDTO,
  type AffiliateReferralDTO,
  type JobApplicantDTO,
  type LeadDTO,
} from "./schema";

function generateAffiliateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `VM-AFF-${code}`;
}

export async function createLeadAction(
  rawInput: unknown
): Promise<ActionResult<LeadDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal mencatat lead baru.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/leads",
      payload: rawInput,
    },
    async () => {
      const parsed = createLeadSchema.parse(rawInput);
      let created: LeadDTO;

      if (isDatabaseConfigured) {
        try {
          const [inserted] = await db
            .insert(leads)
            .values({
              name: parsed.name,
              email: parsed.email,
              phone: parsed.phone || null,
              company: parsed.company || null,
              website: parsed.website || null,
              service: parsed.service || null,
              source: parsed.source,
              partnerType: parsed.partnerType || null,
              message: parsed.message || null,
              subscribeNewsletter: parsed.subscribeNewsletter,
              status: "NEW",
              metadata: { createdBy: "CMS Manual Entry" },
            })
            .returning();

          created = {
            ...inserted,
            metadata: (inserted.metadata as Record<string, unknown> | null) ?? {},
            status: inserted.status as LeadDTO["status"],
            createdAt: inserted.createdAt.toISOString(),
            updatedAt: inserted.updatedAt.toISOString(),
          };
        } catch {
          created = addFallbackLead({
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone || null,
            company: parsed.company || null,
            website: parsed.website || null,
            service: parsed.service || null,
            source: parsed.source,
            partnerType: parsed.partnerType || null,
            message: parsed.message || null,
            subscribeNewsletter: parsed.subscribeNewsletter,
            metadata: { createdBy: "CMS Manual Entry" },
            status: "NEW",
            salesNotes: null,
          });
        }
      } else {
        created = addFallbackLead({
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone || null,
          company: parsed.company || null,
          website: parsed.website || null,
          service: parsed.service || null,
          source: parsed.source,
          partnerType: parsed.partnerType || null,
          message: parsed.message || null,
          subscribeNewsletter: parsed.subscribeNewsletter,
          metadata: { createdBy: "CMS Manual Entry" },
          status: "NEW",
          salesNotes: null,
        });
      }

      await logActivity({
        action: "CREATE",
        module: "LEAD",
        targetId: `lead-${created.id}`,
        targetTitle: `${created.name}${created.company ? ` (${created.company})` : ""}`,
        changes: { after: { source: created.source, status: created.status } },
      });

      revalidatePath("/crm/leads");
      revalidatePath("/monitoring");

      return created;
    }
  );
}

export async function updateLeadAction(
  rawInput: unknown
): Promise<ActionResult<LeadDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal memperbarui status lead.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/leads",
      payload: rawInput,
    },
    async () => {
      const parsed = updateLeadSchema.parse(rawInput);
      const notesVal = parsed.salesNotes?.trim() || null;

      let updatedItem: LeadDTO | null = null;
      let beforeItem: unknown = undefined;

      if (isDatabaseConfigured) {
        try {
          const [existing] = await db
            .select()
            .from(leads)
            .where(eq(leads.id, parsed.id))
            .limit(1);
          if (!existing) throw new UserFacingError("Lead tidak ditemukan.");
          beforeItem = { status: existing.status, salesNotes: existing.salesNotes };

          const [updated] = await db
            .update(leads)
            .set({
              status: parsed.status,
              salesNotes: notesVal,
              updatedAt: new Date(),
            })
            .where(eq(leads.id, parsed.id))
            .returning();

          updatedItem = {
            ...updated,
            metadata: (updated.metadata as Record<string, unknown> | null) ?? {},
            status: updated.status as LeadDTO["status"],
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          };
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const res = updateFallbackLead(parsed.id, parsed.status, notesVal);
          if (!res) throw new UserFacingError("Lead tidak ditemukan.");
          updatedItem = res.item;
          beforeItem = { status: res.before.status, salesNotes: res.before.salesNotes };
        }
      } else {
        const res = updateFallbackLead(parsed.id, parsed.status, notesVal);
        if (!res) throw new UserFacingError("Lead tidak ditemukan.");
        updatedItem = res.item;
        beforeItem = { status: res.before.status, salesNotes: res.before.salesNotes };
      }

      await logActivity({
        action: "STATUS_CHANGE",
        module: "LEAD",
        targetId: `lead-${updatedItem.id}`,
        targetTitle: `${updatedItem.name} (${updatedItem.company || updatedItem.email})`,
        changes: {
          before: beforeItem,
          after: { status: updatedItem.status, salesNotes: updatedItem.salesNotes },
        },
      });

      revalidatePath("/crm/leads");
      revalidatePath("/monitoring");

      return updatedItem;
    }
  );
}

export async function deleteLeadAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus data lead.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/leads",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Lead #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(leads)
            .where(eq(leads.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Lead tidak ditemukan.");
          deletedTitle = deleted.name;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackLead(parsedId);
          if (!deleted) throw new UserFacingError("Lead tidak ditemukan.");
          deletedTitle = deleted.name;
        }
      } else {
        const deleted = deleteFallbackLead(parsedId);
        if (!deleted) throw new UserFacingError("Lead tidak ditemukan.");
        deletedTitle = deleted.name;
      }

      await logActivity({
        action: "DELETE",
        module: "LEAD",
        targetId: `lead-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId } },
      });

      revalidatePath("/crm/leads");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}

export async function createAffiliateAction(
  rawInput: unknown
): Promise<ActionResult<AffiliateDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal mendaftarkan partner affiliate.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/affiliates",
      payload: rawInput,
    },
    async () => {
      const parsed = createAffiliateSchema.parse(rawInput);
      const code = parsed.affiliateCode.trim()
        ? parsed.affiliateCode.trim().toUpperCase()
        : generateAffiliateCode();

      let created: AffiliateDTO;

      const handleFallback = () => {
        try {
          return addFallbackAffiliate({
            affiliateCode: code,
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone || null,
            company: parsed.company || null,
            status: "ACTIVE",
          });
        } catch (fbErr) {
          if (isUniqueViolation(fbErr)) {
            throw new UserFacingError("Kode Affiliate sudah terdaftar.", {
              affiliateCode: ["Kode sudah digunakan"],
            });
          }
          throw fbErr;
        }
      };

      if (isDatabaseConfigured) {
        try {
          const [inserted] = await db
            .insert(affiliates)
            .values({
              affiliateCode: code,
              name: parsed.name,
              email: parsed.email,
              phone: parsed.phone || null,
              company: parsed.company || null,
              status: "ACTIVE",
            })
            .returning();

          created = {
            ...inserted,
            status: inserted.status as AffiliateDTO["status"],
            createdAt: inserted.createdAt.toISOString(),
          };
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          if (isUniqueViolation(dbErr)) {
            throw new UserFacingError("Kode Affiliate sudah terdaftar.", {
              affiliateCode: ["Kode sudah digunakan"],
            });
          }
          created = handleFallback();
        }
      } else {
        created = handleFallback();
      }

      await logActivity({
        action: "CREATE",
        module: "AFFILIATE",
        targetId: created.affiliateCode,
        targetTitle: `${created.name} (${created.affiliateCode})`,
        changes: { after: { email: created.email, status: created.status } },
      });

      revalidatePath("/crm/affiliates");
      revalidatePath("/monitoring");

      return created;
    }
  );
}

export async function toggleAffiliateStatusAction(
  rawInput: unknown
): Promise<ActionResult<AffiliateDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal mengubah status partner affiliate.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/affiliates",
      payload: rawInput,
    },
    async () => {
      const parsed = updateAffiliateStatusSchema.parse(rawInput);
      let updatedItem: AffiliateDTO | null = null;
      let beforeStatus = "ACTIVE";

      if (isDatabaseConfigured) {
        try {
          const [existing] = await db
            .select()
            .from(affiliates)
            .where(eq(affiliates.id, parsed.id))
            .limit(1);
          if (!existing) throw new UserFacingError("Affiliate tidak ditemukan.");
          beforeStatus = existing.status;

          const [updated] = await db
            .update(affiliates)
            .set({ status: parsed.status })
            .where(eq(affiliates.id, parsed.id))
            .returning();

          updatedItem = {
            ...updated,
            status: updated.status as AffiliateDTO["status"],
            createdAt: updated.createdAt.toISOString(),
          };
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const res = toggleFallbackAffiliateStatus(parsed.id, parsed.status);
          if (!res) throw new UserFacingError("Affiliate tidak ditemukan.");
          updatedItem = res.item;
          beforeStatus = res.before.status;
        }
      } else {
        const res = toggleFallbackAffiliateStatus(parsed.id, parsed.status);
        if (!res) throw new UserFacingError("Affiliate tidak ditemukan.");
        updatedItem = res.item;
        beforeStatus = res.before.status;
      }

      await logActivity({
        action: "STATUS_CHANGE",
        module: "AFFILIATE",
        targetId: updatedItem.affiliateCode,
        targetTitle: updatedItem.name,
        changes: {
          before: { status: beforeStatus },
          after: { status: updatedItem.status },
        },
      });

      revalidatePath("/crm/affiliates");
      revalidatePath("/monitoring");

      return updatedItem;
    }
  );
}

export async function updateReferralAction(
  rawInput: unknown
): Promise<ActionResult<AffiliateReferralDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal memperbarui status proyek referral.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/affiliates",
      payload: rawInput,
    },
    async () => {
      const parsed = updateReferralSchema.parse(rawInput);
      let updatedItem: AffiliateReferralDTO | null = null;
      let beforeStatus = "SUBMITTED";

      if (isDatabaseConfigured) {
        try {
          const [existing] = await db
            .select()
            .from(affiliateReferrals)
            .where(eq(affiliateReferrals.id, parsed.id))
            .limit(1);
          if (!existing) throw new UserFacingError("Proyek referral tidak ditemukan.");
          beforeStatus = existing.status;

          const [updated] = await db
            .update(affiliateReferrals)
            .set({
              status: parsed.status,
              ...(parsed.message !== undefined ? { message: parsed.message } : {}),
              updatedAt: new Date(),
            })
            .where(eq(affiliateReferrals.id, parsed.id))
            .returning();

          updatedItem = {
            ...updated,
            status: updated.status as AffiliateReferralDTO["status"],
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          };
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const res = updateFallbackReferral(
            parsed.id,
            parsed.status,
            parsed.message
          );
          if (!res) throw new UserFacingError("Proyek referral tidak ditemukan.");
          updatedItem = res.item;
          beforeStatus = res.before.status;
        }
      } else {
        const res = updateFallbackReferral(
          parsed.id,
          parsed.status,
          parsed.message
        );
        if (!res) throw new UserFacingError("Proyek referral tidak ditemukan.");
        updatedItem = res.item;
        beforeStatus = res.before.status;
      }

      await logActivity({
        action: "STATUS_CHANGE",
        module: "AFFILIATE",
        targetId: updatedItem.affiliateCode,
        targetTitle: `${updatedItem.clientCompany} (${updatedItem.affiliateCode})`,
        changes: {
          before: { status: beforeStatus },
          after: { status: updatedItem.status },
        },
      });

      revalidatePath("/crm/affiliates");
      revalidatePath("/monitoring");

      return updatedItem;
    }
  );
}

export async function deleteReferralAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus proyek referral.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/affiliates",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Referral #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(affiliateReferrals)
            .where(eq(affiliateReferrals.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Referral tidak ditemukan.");
          deletedTitle = deleted.clientCompany;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackReferral(parsedId);
          if (!deleted) throw new UserFacingError("Referral tidak ditemukan.");
          deletedTitle = deleted.clientCompany;
        }
      } else {
        const deleted = deleteFallbackReferral(parsedId);
        if (!deleted) throw new UserFacingError("Referral tidak ditemukan.");
        deletedTitle = deleted.clientCompany;
      }

      await logActivity({
        action: "DELETE",
        module: "AFFILIATE",
        targetId: `ref-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId } },
      });

      revalidatePath("/crm/affiliates");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}

export async function updateApplicantAction(
  rawInput: unknown
): Promise<ActionResult<JobApplicantDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal memperbarui status kandidat.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/applicants",
      payload: rawInput,
    },
    async () => {
      const parsed = updateApplicantSchema.parse(rawInput);
      const notesVal = parsed.notes?.trim() || null;

      let updatedItem: JobApplicantDTO | null = null;
      let beforeStatus = "APPLIED";

      if (isDatabaseConfigured) {
        try {
          const [existing] = await db
            .select()
            .from(jobApplicants)
            .where(eq(jobApplicants.id, parsed.id))
            .limit(1);
          if (!existing) throw new UserFacingError("Data kandidat tidak ditemukan.");
          beforeStatus = existing.status;

          const [updated] = await db
            .update(jobApplicants)
            .set({
              status: parsed.status,
              notes: notesVal,
              updatedAt: new Date(),
            })
            .where(eq(jobApplicants.id, parsed.id))
            .returning();

          updatedItem = {
            ...updated,
            status: updated.status as JobApplicantDTO["status"],
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          };
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const res = updateFallbackApplicant(parsed.id, parsed.status, notesVal);
          if (!res) throw new UserFacingError("Data kandidat tidak ditemukan.");
          updatedItem = res.item;
          beforeStatus = res.before.status;
        }
      } else {
        const res = updateFallbackApplicant(parsed.id, parsed.status, notesVal);
        if (!res) throw new UserFacingError("Data kandidat tidak ditemukan.");
        updatedItem = res.item;
        beforeStatus = res.before.status;
      }

      await logActivity({
        action: "STATUS_CHANGE",
        module: "APPLICANT",
        targetId: `app-${updatedItem.id}`,
        targetTitle: `${updatedItem.name} (${updatedItem.position})`,
        changes: {
          before: { status: beforeStatus },
          after: { status: updatedItem.status, notes: updatedItem.notes },
        },
      });

      revalidatePath("/crm/applicants");
      revalidatePath("/monitoring");

      return updatedItem;
    }
  );
}

export async function deleteApplicantAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus data pelamar.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/crm/applicants",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Applicant #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(jobApplicants)
            .where(eq(jobApplicants.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Data kandidat tidak ditemukan.");
          deletedTitle = deleted.name;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackApplicant(parsedId);
          if (!deleted) throw new UserFacingError("Data kandidat tidak ditemukan.");
          deletedTitle = deleted.name;
        }
      } else {
        const deleted = deleteFallbackApplicant(parsedId);
        if (!deleted) throw new UserFacingError("Data kandidat tidak ditemukan.");
        deletedTitle = deleted.name;
      }

      await logActivity({
        action: "DELETE",
        module: "APPLICANT",
        targetId: `app-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId } },
      });

      revalidatePath("/crm/applicants");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}
