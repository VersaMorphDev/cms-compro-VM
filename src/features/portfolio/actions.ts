"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { projects } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  isUniqueConstraintError as isUniqueSlugError,
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import { slugify } from "@/lib/utils";
import {
  deleteFallbackProject,
  upsertFallbackProject,
} from "@/features/content/store-fallback";
import { projectSchema, type ProjectDTO } from "./schema";

export async function saveProjectAction(
  rawInput: unknown
): Promise<ActionResult<ProjectDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan data studi kasus proyek.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/portfolio",
      payload: rawInput,
    },
    async () => {
      const parsed = projectSchema.parse(rawInput);
      const resolvedSlug = slugify(parsed.slug || parsed.title);
      if (!resolvedSlug) {
        throw new UserFacingError("Slug proyek tidak valid.");
      }

      const imageVal = parsed.image?.trim() || null;
      let savedItem: ProjectDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        try {
          const res = upsertFallbackProject({
            id: parsed.id,
            slug: resolvedSlug,
            title: parsed.title,
            client: parsed.client,
            industry: parsed.industry,
            year: parsed.year,
            category: parsed.category,
            description: parsed.description,
            problem: parsed.problem,
            solution: parsed.solution,
            result: parsed.result,
            tech: parsed.tech,
            gradient: parsed.gradient,
            image: imageVal,
            timeline: parsed.timeline,
            status: parsed.status,
            sortOrder: parsed.sortOrder,
          });
          savedItem = res.item;
          beforeItem = res.before;
        } catch (fbErr) {
          if (isUniqueSlugError(fbErr)) {
            throw new UserFacingError(
              "Slug proyek sudah digunakan. Gunakan slug lain.",
              { slug: ["Slug sudah terdaftar"] }
            );
          }
          throw fbErr;
        }
      };

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(projects)
              .where(eq(projects.id, parsed.id))
              .limit(1);

            if (!existing) {
              throw new UserFacingError("Proyek portofolio tidak ditemukan.");
            }
            beforeItem = {
              title: existing.title,
              slug: existing.slug,
              status: existing.status,
            };

            const [updated] = await db
              .update(projects)
              .set({
                slug: resolvedSlug,
                title: parsed.title,
                client: parsed.client,
                industry: parsed.industry,
                year: parsed.year,
                category: parsed.category,
                description: parsed.description,
                problem: parsed.problem,
                solution: parsed.solution,
                result: parsed.result,
                tech: parsed.tech,
                gradient: parsed.gradient,
                image: imageVal,
                timeline: parsed.timeline,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(projects.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              tech: updated.tech ?? [],
              timeline: updated.timeline ?? [],
              status: updated.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(projects)
              .values({
                slug: resolvedSlug,
                title: parsed.title,
                client: parsed.client,
                industry: parsed.industry,
                year: parsed.year,
                category: parsed.category,
                description: parsed.description,
                problem: parsed.problem,
                solution: parsed.solution,
                result: parsed.result,
                tech: parsed.tech,
                gradient: parsed.gradient,
                image: imageVal,
                timeline: parsed.timeline,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
              })
              .returning();

            savedItem = {
              ...inserted,
              tech: inserted.tech ?? [],
              timeline: inserted.timeline ?? [],
              status: inserted.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: inserted.createdAt.toISOString(),
              updatedAt: inserted.updatedAt.toISOString(),
            };
          }
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          if (isUniqueSlugError(dbErr)) {
            throw new UserFacingError(
              "Slug proyek sudah digunakan. Gunakan slug lain.",
              { slug: ["Slug sudah terdaftar"] }
            );
          }
          handleFallback();
        }
      } else {
        handleFallback();
      }

      if (!savedItem) {
        throw new Error("Project could not be saved");
      }

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "PROJECT",
        targetId: savedItem.slug,
        targetTitle: savedItem.title,
        changes: {
          before: beforeItem,
          after: {
            slug: savedItem.slug,
            client: savedItem.client,
            status: savedItem.status,
          },
        },
      });

      revalidatePath("/content/portfolio");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteProjectAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus proyek portofolio.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/portfolio",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Project #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(projects)
            .where(eq(projects.id, parsedId))
            .returning();
          if (!deleted) {
            throw new UserFacingError("Proyek portofolio tidak ditemukan.");
          }
          deletedTitle = deleted.title;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackProject(parsedId);
          if (!deleted) {
            throw new UserFacingError("Proyek portofolio tidak ditemukan.");
          }
          deletedTitle = deleted.title;
        }
      } else {
        const deleted = deleteFallbackProject(parsedId);
        if (!deleted) {
          throw new UserFacingError("Proyek portofolio tidak ditemukan.");
        }
        deletedTitle = deleted.title;
      }

      await logActivity({
        action: "DELETE",
        module: "PROJECT",
        targetId: String(parsedId),
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, title: deletedTitle } },
      });

      revalidatePath("/content/portfolio");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}
