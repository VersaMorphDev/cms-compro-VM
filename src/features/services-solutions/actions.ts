"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { approachSteps, services, solutions, whyChooseUs } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  isUniqueConstraintError as isUniqueSlugError,
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import { slugify } from "@/lib/utils";
import {
  deleteFallbackService,
  deleteFallbackSolution,
  upsertFallbackApproachStep,
  upsertFallbackService,
  upsertFallbackSolution,
  upsertFallbackWhyChooseUs,
} from "@/features/content/store-fallback";
import {
  approachStepSchema,
  serviceSchema,
  solutionSchema,
  whyChooseUsSchema,
  type ApproachStepDTO,
  type ServiceDTO,
  type SolutionDTO,
  type WhyChooseUsDTO,
} from "./schema";

export async function saveServiceAction(
  rawInput: unknown
): Promise<ActionResult<ServiceDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan data layanan.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/services",
      payload: rawInput,
    },
    async () => {
      const parsed = serviceSchema.parse(rawInput);
      const resolvedSlug = slugify(parsed.slug || parsed.title);
      if (!resolvedSlug) {
        throw new UserFacingError("Slug layanan tidak valid.");
      }

      let savedItem: ServiceDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        try {
          const res = upsertFallbackService({
            id: parsed.id,
            slug: resolvedSlug,
            title: parsed.title,
            tagline: parsed.tagline,
            description: parsed.description,
            icon: parsed.icon,
            items: parsed.items,
            benefits: parsed.benefits,
            process: parsed.process,
            technologies: parsed.technologies,
            useCases: parsed.useCases,
            gradient: parsed.gradient,
            status: parsed.status,
            sortOrder: parsed.sortOrder,
          });
          savedItem = res.item;
          beforeItem = res.before;
        } catch (fbErr) {
          if (isUniqueSlugError(fbErr)) {
            throw new UserFacingError("Slug layanan sudah digunakan.", {
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
              .from(services)
              .where(eq(services.id, parsed.id))
              .limit(1);

            if (!existing) {
              throw new UserFacingError("Layanan tidak ditemukan.");
            }
            beforeItem = { title: existing.title, status: existing.status };

            const [updated] = await db
              .update(services)
              .set({
                slug: resolvedSlug,
                title: parsed.title,
                tagline: parsed.tagline,
                description: parsed.description,
                icon: parsed.icon,
                items: parsed.items,
                benefits: parsed.benefits,
                process: parsed.process,
                technologies: parsed.technologies,
                useCases: parsed.useCases,
                gradient: parsed.gradient,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(services.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              items: updated.items ?? [],
              benefits: updated.benefits ?? [],
              process: updated.process ?? [],
              technologies: updated.technologies ?? [],
              useCases: updated.useCases ?? [],
              status: updated.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(services)
              .values({
                slug: resolvedSlug,
                title: parsed.title,
                tagline: parsed.tagline,
                description: parsed.description,
                icon: parsed.icon,
                items: parsed.items,
                benefits: parsed.benefits,
                process: parsed.process,
                technologies: parsed.technologies,
                useCases: parsed.useCases,
                gradient: parsed.gradient,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
              })
              .returning();

            savedItem = {
              ...inserted,
              items: inserted.items ?? [],
              benefits: inserted.benefits ?? [],
              process: inserted.process ?? [],
              technologies: inserted.technologies ?? [],
              useCases: inserted.useCases ?? [],
              status: inserted.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: inserted.createdAt.toISOString(),
              updatedAt: inserted.updatedAt.toISOString(),
            };
          }
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          if (isUniqueSlugError(dbErr)) {
            throw new UserFacingError("Slug layanan sudah digunakan.", {
              slug: ["Slug sudah terdaftar"],
            });
          }
          handleFallback();
        }
      } else {
        handleFallback();
      }

      if (!savedItem) throw new Error("Failed saving service");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "SERVICE",
        targetId: savedItem.slug,
        targetTitle: savedItem.title,
        changes: {
          before: beforeItem,
          after: { title: savedItem.title, status: savedItem.status },
        },
      });

      revalidatePath("/content/services");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteServiceAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus layanan.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/services",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Service #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(services)
            .where(eq(services.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Layanan tidak ditemukan.");
          deletedTitle = deleted.title;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackService(parsedId);
          if (!deleted) throw new UserFacingError("Layanan tidak ditemukan.");
          deletedTitle = deleted.title;
        }
      } else {
        const deleted = deleteFallbackService(parsedId);
        if (!deleted) throw new UserFacingError("Layanan tidak ditemukan.");
        deletedTitle = deleted.title;
      }

      await logActivity({
        action: "DELETE",
        module: "SERVICE",
        targetId: String(parsedId),
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, title: deletedTitle } },
      });

      revalidatePath("/content/services");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}

export async function saveSolutionAction(
  rawInput: unknown
): Promise<ActionResult<SolutionDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan data solusi.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/services",
      payload: rawInput,
    },
    async () => {
      const parsed = solutionSchema.parse(rawInput);
      let savedItem: SolutionDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        const res = upsertFallbackSolution({
          id: parsed.id,
          title: parsed.title,
          description: parsed.description,
          icon: parsed.icon,
          gradient: parsed.gradient,
          items: parsed.items,
          status: parsed.status,
          sortOrder: parsed.sortOrder,
        });
        savedItem = res.item;
        beforeItem = res.before;
      };

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(solutions)
              .where(eq(solutions.id, parsed.id))
              .limit(1);
            if (!existing) throw new UserFacingError("Solusi tidak ditemukan.");
            beforeItem = { title: existing.title, status: existing.status };

            const [updated] = await db
              .update(solutions)
              .set({
                title: parsed.title,
                description: parsed.description,
                icon: parsed.icon,
                gradient: parsed.gradient,
                items: parsed.items,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(solutions.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              items: updated.items ?? [],
              status: updated.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(solutions)
              .values({
                title: parsed.title,
                description: parsed.description,
                icon: parsed.icon,
                gradient: parsed.gradient,
                items: parsed.items,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
              })
              .returning();

            savedItem = {
              ...inserted,
              items: inserted.items ?? [],
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

      if (!savedItem) throw new Error("Failed saving solution");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "SERVICE",
        targetId: `sol-${savedItem.id}`,
        targetTitle: savedItem.title,
        changes: {
          before: beforeItem,
          after: { title: savedItem.title, status: savedItem.status },
        },
      });

      revalidatePath("/content/services");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteSolutionAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus solusi.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/services",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Solution #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(solutions)
            .where(eq(solutions.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Solusi tidak ditemukan.");
          deletedTitle = deleted.title;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackSolution(parsedId);
          if (!deleted) throw new UserFacingError("Solusi tidak ditemukan.");
          deletedTitle = deleted.title;
        }
      } else {
        const deleted = deleteFallbackSolution(parsedId);
        if (!deleted) throw new UserFacingError("Solusi tidak ditemukan.");
        deletedTitle = deleted.title;
      }

      await logActivity({
        action: "DELETE",
        module: "SERVICE",
        targetId: `sol-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, title: deletedTitle } },
      });

      revalidatePath("/content/services");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}

export async function saveApproachStepAction(
  rawInput: unknown
): Promise<ActionResult<ApproachStepDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal memperbarui langkah metodologi DSDDO.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/services",
      payload: rawInput,
    },
    async () => {
      const parsed = approachStepSchema.parse(rawInput);
      let savedItem: ApproachStepDTO | null = null;
      let beforeItem: unknown = undefined;

      if (isDatabaseConfigured && parsed.id) {
        try {
          const [existing] = await db
            .select()
            .from(approachSteps)
            .where(eq(approachSteps.id, parsed.id))
            .limit(1);
          if (!existing) throw new UserFacingError("Langkah DSDDO tidak ditemukan.");
          beforeItem = existing;
          const [updated] = await db
            .update(approachSteps)
            .set({
              num: parsed.num,
              title: parsed.title,
              description: parsed.description,
              sortOrder: parsed.sortOrder,
            })
            .where(eq(approachSteps.id, parsed.id))
            .returning();
          savedItem = updated;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const res = upsertFallbackApproachStep(parsed);
          savedItem = res.item;
          beforeItem = res.before;
        }
      } else {
        const res = upsertFallbackApproachStep(parsed);
        savedItem = res.item;
        beforeItem = res.before;
      }

      if (!savedItem) throw new Error("Failed saving approach step");

      await logActivity({
        action: parsed.id ? "UPDATE" : "CREATE",
        module: "SERVICE",
        targetId: `step-${savedItem.id}`,
        targetTitle: `DSDDO ${savedItem.num}: ${savedItem.title}`,
        changes: { before: beforeItem, after: savedItem },
      });

      revalidatePath("/content/services");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function saveWhyChooseUsAction(
  rawInput: unknown
): Promise<ActionResult<WhyChooseUsDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal memperbarui poin Why Choose Us.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/services",
      payload: rawInput,
    },
    async () => {
      const parsed = whyChooseUsSchema.parse(rawInput);
      let savedItem: WhyChooseUsDTO | null = null;
      let beforeItem: unknown = undefined;

      if (isDatabaseConfigured && parsed.id) {
        try {
          const [existing] = await db
            .select()
            .from(whyChooseUs)
            .where(eq(whyChooseUs.id, parsed.id))
            .limit(1);
          if (!existing) throw new UserFacingError("Item Why Choose Us tidak ditemukan.");
          beforeItem = existing;
          const [updated] = await db
            .update(whyChooseUs)
            .set({
              title: parsed.title,
              description: parsed.description,
              sortOrder: parsed.sortOrder,
            })
            .where(eq(whyChooseUs.id, parsed.id))
            .returning();
          savedItem = updated;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const res = upsertFallbackWhyChooseUs(parsed);
          savedItem = res.item;
          beforeItem = res.before;
        }
      } else {
        const res = upsertFallbackWhyChooseUs(parsed);
        savedItem = res.item;
        beforeItem = res.before;
      }

      if (!savedItem) throw new Error("Failed saving Why Choose Us item");

      await logActivity({
        action: parsed.id ? "UPDATE" : "CREATE",
        module: "SERVICE",
        targetId: `why-${savedItem.id}`,
        targetTitle: savedItem.title,
        changes: { before: beforeItem, after: savedItem },
      });

      revalidatePath("/content/services");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}
