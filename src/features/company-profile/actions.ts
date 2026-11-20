"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import {
  legalPages,
  siteSettings,
  teamMembers,
  testimonials,
} from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  isUniqueConstraintError as isUniqueSlugError,
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import { slugify } from "@/lib/utils";
import {
  deleteFallbackLegalPage,
  deleteFallbackTeamMember,
  deleteFallbackTestimonial,
  saveFallbackAboutStatsValues,
  saveFallbackCompanyProfile,
  upsertFallbackLegalPage,
  upsertFallbackTeamMember,
  upsertFallbackTestimonial,
} from "./store-fallback";
import {
  aboutStatsValuesSchema,
  companyProfileSchema,
  legalPageSchema,
  teamMemberSchema,
  testimonialSchema,
  type AboutStatItem,
  type AboutValueItem,
  type CompanyProfileSettings,
  type LegalPageDTO,
  type TeamMemberDTO,
  type TestimonialDTO,
} from "./schema";

export async function saveTeamMemberAction(
  rawInput: unknown
): Promise<ActionResult<TeamMemberDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan data anggota tim.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/team",
      payload: rawInput,
    },
    async () => {
      const parsed = teamMemberSchema.parse(rawInput);
      const linkedinVal = parsed.linkedinUrl?.trim() || null;
      const twitterVal = parsed.twitterUrl?.trim() || null;

      let savedItem: TeamMemberDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        const res = upsertFallbackTeamMember({
          ...parsed,
          linkedinUrl: linkedinVal,
          twitterUrl: twitterVal,
        });
        savedItem = res.item;
        beforeItem = res.before;
      };

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(teamMembers)
              .where(eq(teamMembers.id, parsed.id))
              .limit(1);
            if (!existing) throw new UserFacingError("Anggota tim tidak ditemukan.");
            beforeItem = { name: existing.name, role: existing.role };

            const [updated] = await db
              .update(teamMembers)
              .set({
                name: parsed.name,
                role: parsed.role,
                bio: parsed.bio,
                image: parsed.image,
                linkedinUrl: linkedinVal,
                twitterUrl: twitterVal,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(teamMembers.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              status: updated.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(teamMembers)
              .values({
                name: parsed.name,
                role: parsed.role,
                bio: parsed.bio,
                image: parsed.image,
                linkedinUrl: linkedinVal,
                twitterUrl: twitterVal,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
              })
              .returning();

            savedItem = {
              ...inserted,
              status: inserted.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: inserted.createdAt.toISOString(),
              updatedAt: inserted.updatedAt.toISOString(),
            };
          }
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          handleFallback();
        }
      } else {
        handleFallback();
      }

      if (!savedItem) throw new Error("Failed saving team member");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "TEAM",
        targetId: `team-${savedItem.id}`,
        targetTitle: `${savedItem.name} (${savedItem.role})`,
        changes: {
          before: beforeItem,
          after: { name: savedItem.name, role: savedItem.role, status: savedItem.status },
        },
      });

      revalidatePath("/company/team");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteTeamMemberAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus anggota tim.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/team",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Member #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(teamMembers)
            .where(eq(teamMembers.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Anggota tim tidak ditemukan.");
          deletedTitle = deleted.name;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackTeamMember(parsedId);
          if (!deleted) throw new UserFacingError("Anggota tim tidak ditemukan.");
          deletedTitle = deleted.name;
        }
      } else {
        const deleted = deleteFallbackTeamMember(parsedId);
        if (!deleted) throw new UserFacingError("Anggota tim tidak ditemukan.");
        deletedTitle = deleted.name;
      }

      await logActivity({
        action: "DELETE",
        module: "TEAM",
        targetId: `team-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, name: deletedTitle } },
      });

      revalidatePath("/company/team");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}

export async function saveCompanyProfileAction(
  rawInput: unknown
): Promise<ActionResult<CompanyProfileSettings>> {
  return safeAction(
    {
      friendlyMessage: "Gagal memperbarui profil perusahaan.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/team",
      payload: rawInput,
    },
    async () => {
      const parsed = companyProfileSchema.parse(rawInput);

      if (isDatabaseConfigured) {
        try {
          await db
            .insert(siteSettings)
            .values({
              key: "company_profile",
              value: parsed as unknown as Record<string, unknown>,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: siteSettings.key,
              set: {
                value: parsed as unknown as Record<string, unknown>,
                updatedAt: new Date(),
              },
            });
        } catch {
          saveFallbackCompanyProfile(parsed);
        }
      } else {
        saveFallbackCompanyProfile(parsed);
      }

      await logActivity({
        action: "UPDATE",
        module: "SETTINGS",
        targetId: "company_profile",
        targetTitle: "Global Company Profile & Contact",
        changes: { after: { email: parsed.email, whatsappPhone: parsed.whatsappPhone } },
      });

      revalidatePath("/company/team");
      revalidatePath("/monitoring");

      return parsed;
    }
  );
}

export async function saveAboutStatsValuesAction(
  rawInput: unknown
): Promise<ActionResult<{ stats: AboutStatItem[]; values: AboutValueItem[] }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal memperbarui statistik & nilai perusahaan.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/team",
      payload: rawInput,
    },
    async () => {
      const parsed = aboutStatsValuesSchema.parse(rawInput);

      if (isDatabaseConfigured) {
        try {
          await Promise.all([
            db
              .insert(siteSettings)
              .values({
                key: "about_stats",
                value: { items: parsed.stats },
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: siteSettings.key,
                set: { value: { items: parsed.stats }, updatedAt: new Date() },
              }),
            db
              .insert(siteSettings)
              .values({
                key: "about_values",
                value: { items: parsed.values },
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: siteSettings.key,
                set: { value: { items: parsed.values }, updatedAt: new Date() },
              }),
          ]);
        } catch {
          saveFallbackAboutStatsValues(parsed);
        }
      } else {
        saveFallbackAboutStatsValues(parsed);
      }

      await logActivity({
        action: "UPDATE",
        module: "SETTINGS",
        targetId: "about_stats_values",
        targetTitle: "About Us Stats & Core Values",
        changes: {
          after: {
            statsCount: parsed.stats.length,
            valuesCount: parsed.values.length,
          },
        },
      });

      revalidatePath("/company/team");
      revalidatePath("/monitoring");

      return parsed;
    }
  );
}

export async function saveTestimonialAction(
  rawInput: unknown
): Promise<ActionResult<TestimonialDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan testimoni klien.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/testimonials",
      payload: rawInput,
    },
    async () => {
      const parsed = testimonialSchema.parse(rawInput);
      let savedItem: TestimonialDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        const res = upsertFallbackTestimonial(parsed);
        savedItem = res.item;
        beforeItem = res.before;
      };

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(testimonials)
              .where(eq(testimonials.id, parsed.id))
              .limit(1);
            if (!existing) throw new UserFacingError("Testimoni tidak ditemukan.");
            beforeItem = { author: existing.author, company: existing.company };

            const [updated] = await db
              .update(testimonials)
              .set({
                quote: parsed.quote,
                author: parsed.author,
                role: parsed.role,
                company: parsed.company,
                project: parsed.project,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(testimonials.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              status: updated.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(testimonials)
              .values({
                quote: parsed.quote,
                author: parsed.author,
                role: parsed.role,
                company: parsed.company,
                project: parsed.project,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
              })
              .returning();

            savedItem = {
              ...inserted,
              status: inserted.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: inserted.createdAt.toISOString(),
              updatedAt: inserted.updatedAt.toISOString(),
            };
          }
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          handleFallback();
        }
      } else {
        handleFallback();
      }

      if (!savedItem) throw new Error("Failed saving testimonial");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "TEAM",
        targetId: `testi-${savedItem.id}`,
        targetTitle: `${savedItem.author} · ${savedItem.company}`,
        changes: {
          before: beforeItem,
          after: { project: savedItem.project, status: savedItem.status },
        },
      });

      revalidatePath("/company/testimonials");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteTestimonialAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus testimoni.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/testimonials",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Testimonial #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(testimonials)
            .where(eq(testimonials.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Testimoni tidak ditemukan.");
          deletedTitle = `${deleted.author} (${deleted.company})`;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackTestimonial(parsedId);
          if (!deleted) throw new UserFacingError("Testimoni tidak ditemukan.");
          deletedTitle = `${deleted.author} (${deleted.company})`;
        }
      } else {
        const deleted = deleteFallbackTestimonial(parsedId);
        if (!deleted) throw new UserFacingError("Testimoni tidak ditemukan.");
        deletedTitle = `${deleted.author} (${deleted.company})`;
      }

      await logActivity({
        action: "DELETE",
        module: "TEAM",
        targetId: `testi-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId } },
      });

      revalidatePath("/company/testimonials");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}

export async function saveLegalPageAction(
  rawInput: unknown
): Promise<ActionResult<LegalPageDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan dokumen legal.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/legal",
      payload: rawInput,
    },
    async () => {
      const parsed = legalPageSchema.parse(rawInput);
      const resolvedSlug = slugify(parsed.slug || parsed.title);
      if (!resolvedSlug) {
        throw new UserFacingError("Slug dokumen legal tidak valid.");
      }

      let savedItem: LegalPageDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        try {
          const res = upsertFallbackLegalPage({
            id: parsed.id,
            slug: resolvedSlug,
            title: parsed.title,
            subtitle: parsed.subtitle,
            lastUpdated: parsed.lastUpdated,
            tocSections: parsed.tocSections,
            content: parsed.content,
            version: parsed.version,
          });
          savedItem = res.item;
          beforeItem = res.before;
        } catch (fbErr) {
          if (isUniqueSlugError(fbErr)) {
            throw new UserFacingError("Slug dokumen legal sudah digunakan.", {
              slug: ["Slug sudah terdaftar"],
            });
          }
          throw fbErr;
        }
      };

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(legalPages)
              .where(eq(legalPages.id, parsed.id))
              .limit(1);
            if (!existing) throw new UserFacingError("Dokumen legal tidak ditemukan.");
            beforeItem = { title: existing.title, version: existing.version };

            const [updated] = await db
              .update(legalPages)
              .set({
                slug: resolvedSlug,
                title: parsed.title,
                subtitle: parsed.subtitle,
                lastUpdated: parsed.lastUpdated,
                tocSections: parsed.tocSections,
                content: parsed.content,
                version: parsed.version,
                updatedAt: new Date(),
              })
              .where(eq(legalPages.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              subtitle: updated.subtitle ?? "",
              lastUpdated: updated.lastUpdated ?? "June 2026",
              tocSections: Array.isArray(updated.tocSections)
                ? updated.tocSections
                : [],
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(legalPages)
              .values({
                slug: resolvedSlug,
                title: parsed.title,
                subtitle: parsed.subtitle,
                lastUpdated: parsed.lastUpdated,
                tocSections: parsed.tocSections,
                content: parsed.content,
                version: parsed.version,
              })
              .returning();

            savedItem = {
              ...inserted,
              subtitle: inserted.subtitle ?? "",
              lastUpdated: inserted.lastUpdated ?? "June 2026",
              tocSections: Array.isArray(inserted.tocSections)
                ? inserted.tocSections
                : [],
              updatedAt: inserted.updatedAt.toISOString(),
            };
          }
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          if (isUniqueSlugError(dbErr)) {
            throw new UserFacingError("Slug dokumen legal sudah digunakan.", {
              slug: ["Slug sudah terdaftar"],
            });
          }
          handleFallback();
        }
      } else {
        handleFallback();
      }

      if (!savedItem) throw new Error("Failed saving legal page");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "SETTINGS",
        targetId: savedItem.slug,
        targetTitle: `${savedItem.title} (v${savedItem.version})`,
        changes: {
          before: beforeItem,
          after: { slug: savedItem.slug, version: savedItem.version },
        },
      });

      revalidatePath("/company/legal");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteLegalPageAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus dokumen legal.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/legal",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Legal #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(legalPages)
            .where(eq(legalPages.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Dokumen legal tidak ditemukan.");
          deletedTitle = deleted.title;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackLegalPage(parsedId);
          if (!deleted) throw new UserFacingError("Dokumen legal tidak ditemukan.");
          deletedTitle = deleted.title;
        }
      } else {
        const deleted = deleteFallbackLegalPage(parsedId);
        if (!deleted) throw new UserFacingError("Dokumen legal tidak ditemukan.");
        deletedTitle = deleted.title;
      }

      await logActivity({
        action: "DELETE",
        module: "SETTINGS",
        targetId: `legal-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, title: deletedTitle } },
      });

      revalidatePath("/company/legal");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}
