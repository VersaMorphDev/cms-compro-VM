"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { jobOpenings } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  isUniqueConstraintError as isUniqueSlugError,
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import { slugify } from "@/lib/utils";
import {
  deleteFallbackJobOpening,
  upsertFallbackJobOpening,
} from "@/features/company-profile/store-fallback";
import { jobOpeningSchema, type JobOpeningDTO } from "./schema";

export async function saveJobOpeningAction(
  rawInput: unknown
): Promise<ActionResult<JobOpeningDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan data lowongan kerja.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/careers",
      payload: rawInput,
    },
    async () => {
      const parsed = jobOpeningSchema.parse(rawInput);
      const resolvedSlug = slugify(parsed.slug || parsed.title);
      if (!resolvedSlug) {
        throw new UserFacingError("Slug lowongan tidak valid.");
      }

      let savedItem: JobOpeningDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        try {
          const res = upsertFallbackJobOpening({
            ...parsed,
            slug: resolvedSlug,
          });
          savedItem = res.item;
          beforeItem = res.before;
        } catch (fbErr) {
          if (isUniqueSlugError(fbErr)) {
            throw new UserFacingError("Slug lowongan sudah digunakan.", {
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
              .from(jobOpenings)
              .where(eq(jobOpenings.id, parsed.id))
              .limit(1);
            if (!existing) throw new UserFacingError("Lowongan tidak ditemukan.");
            beforeItem = { title: existing.title, status: existing.status };

            const [updated] = await db
              .update(jobOpenings)
              .set({
                slug: resolvedSlug,
                title: parsed.title,
                department: parsed.department,
                location: parsed.location,
                type: parsed.type,
                workEcosystem: parsed.workEcosystem,
                category: parsed.category,
                description: parsed.description,
                requirements: parsed.requirements,
                status: parsed.status,
                updatedAt: new Date(),
              })
              .where(eq(jobOpenings.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              type: updated.type as JobOpeningDTO["type"],
              workEcosystem: updated.workEcosystem as JobOpeningDTO["workEcosystem"],
              category: updated.category as JobOpeningDTO["category"],
              requirements: updated.requirements ?? [],
              status: updated.status as JobOpeningDTO["status"],
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(jobOpenings)
              .values({
                slug: resolvedSlug,
                title: parsed.title,
                department: parsed.department,
                location: parsed.location,
                type: parsed.type,
                workEcosystem: parsed.workEcosystem,
                category: parsed.category,
                description: parsed.description,
                requirements: parsed.requirements,
                status: parsed.status,
              })
              .returning();

            savedItem = {
              ...inserted,
              type: inserted.type as JobOpeningDTO["type"],
              workEcosystem: inserted.workEcosystem as JobOpeningDTO["workEcosystem"],
              category: inserted.category as JobOpeningDTO["category"],
              requirements: inserted.requirements ?? [],
              status: inserted.status as JobOpeningDTO["status"],
              createdAt: inserted.createdAt.toISOString(),
              updatedAt: inserted.updatedAt.toISOString(),
            };
          }
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          if (isUniqueSlugError(dbErr)) {
            throw new UserFacingError("Slug lowongan sudah digunakan.", {
              slug: ["Slug sudah terdaftar"],
            });
          }
          handleFallback();
        }
      } else {
        handleFallback();
      }

      if (!savedItem) throw new Error("Failed saving job opening");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "CAREER",
        targetId: savedItem.slug,
        targetTitle: `${savedItem.title} (${savedItem.status})`,
        changes: {
          before: beforeItem,
          after: {
            department: savedItem.department,
            workEcosystem: savedItem.workEcosystem,
            status: savedItem.status,
          },
        },
      });

      revalidatePath("/company/careers");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteJobOpeningAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus lowongan kerja.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/company/careers",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Job #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(jobOpenings)
            .where(eq(jobOpenings.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Lowongan tidak ditemukan.");
          deletedTitle = deleted.title;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackJobOpening(parsedId);
          if (!deleted) throw new UserFacingError("Lowongan tidak ditemukan.");
          deletedTitle = deleted.title;
        }
      } else {
        const deleted = deleteFallbackJobOpening(parsedId);
        if (!deleted) throw new UserFacingError("Lowongan tidak ditemukan.");
        deletedTitle = deleted.title;
      }

      await logActivity({
        action: "DELETE",
        module: "CAREER",
        targetId: `job-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, title: deletedTitle } },
      });

      revalidatePath("/company/careers");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}
