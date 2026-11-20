"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { partners } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import {
  deleteFallbackPartner,
  upsertFallbackPartner,
} from "@/features/commercial/store-fallback";
import { partnerSchema, type PartnerDTO } from "./schema";

export async function savePartnerAction(
  rawInput: unknown
): Promise<ActionResult<PartnerDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan data mitra teknologi.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/commercial/partners",
      payload: rawInput,
    },
    async () => {
      const parsed = partnerSchema.parse(rawInput);
      const urlVal = parsed.url?.trim() || null;

      let savedItem: PartnerDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        const res = upsertFallbackPartner({
          ...parsed,
          url: urlVal,
        });
        savedItem = res.item;
        beforeItem = res.before;
      };

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(partners)
              .where(eq(partners.id, parsed.id))
              .limit(1);
            if (!existing) throw new UserFacingError("Mitra tidak ditemukan.");
            beforeItem = {
              name: existing.name,
              category: existing.category,
              status: existing.status,
            };

            const [updated] = await db
              .update(partners)
              .set({
                name: parsed.name,
                description: parsed.description,
                details: parsed.details,
                category: parsed.category,
                url: urlVal,
                logo: parsed.logo,
                color: parsed.color,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(partners.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              status: updated.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(partners)
              .values({
                name: parsed.name,
                description: parsed.description,
                details: parsed.details,
                category: parsed.category,
                url: urlVal,
                logo: parsed.logo,
                color: parsed.color,
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

      if (!savedItem) throw new Error("Failed saving partner");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "PARTNER",
        targetId: `partner-${savedItem.id}`,
        targetTitle: savedItem.name,
        changes: {
          before: beforeItem,
          after: {
            name: savedItem.name,
            category: savedItem.category,
            status: savedItem.status,
          },
        },
      });

      revalidatePath("/commercial/partners");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deletePartnerAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus mitra teknologi.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/commercial/partners",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Partner #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(partners)
            .where(eq(partners.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Mitra tidak ditemukan.");
          deletedTitle = deleted.name;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackPartner(parsedId);
          if (!deleted) throw new UserFacingError("Mitra tidak ditemukan.");
          deletedTitle = deleted.name;
        }
      } else {
        const deleted = deleteFallbackPartner(parsedId);
        if (!deleted) throw new UserFacingError("Mitra tidak ditemukan.");
        deletedTitle = deleted.name;
      }

      await logActivity({
        action: "DELETE",
        module: "PARTNER",
        targetId: `partner-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, name: deletedTitle } },
      });

      revalidatePath("/commercial/partners");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}
