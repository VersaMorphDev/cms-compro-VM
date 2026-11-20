"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { faqItems } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import {
  deleteFallbackFaqItem,
  upsertFallbackFaqItem,
} from "@/features/content/store-fallback";
import { faqSchema, type FaqItemDTO } from "./schema";

export async function saveFaqAction(
  rawInput: unknown
): Promise<ActionResult<FaqItemDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan item FAQ.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/faq",
      payload: rawInput,
    },
    async () => {
      const parsed = faqSchema.parse(rawInput);
      let savedItem: FaqItemDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        const res = upsertFallbackFaqItem(parsed);
        savedItem = res.item;
        beforeItem = res.before;
      };

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(faqItems)
              .where(eq(faqItems.id, parsed.id))
              .limit(1);
            if (!existing) throw new UserFacingError("Item FAQ tidak ditemukan.");
            beforeItem = {
              question: existing.question,
              category: existing.category,
              status: existing.status,
            };

            const [updated] = await db
              .update(faqItems)
              .set({
                question: parsed.question,
                answer: parsed.answer,
                category: parsed.category,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(faqItems.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              status: updated.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(faqItems)
              .values({
                question: parsed.question,
                answer: parsed.answer,
                category: parsed.category,
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

      if (!savedItem) throw new Error("Failed saving FAQ item");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "FAQ",
        targetId: `faq-${savedItem.id}`,
        targetTitle: savedItem.question,
        changes: {
          before: beforeItem,
          after: {
            category: savedItem.category,
            status: savedItem.status,
          },
        },
      });

      revalidatePath("/content/faq");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteFaqAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus item FAQ.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/faq",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `FAQ #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(faqItems)
            .where(eq(faqItems.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Item FAQ tidak ditemukan.");
          deletedTitle = deleted.question;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackFaqItem(parsedId);
          if (!deleted) throw new UserFacingError("Item FAQ tidak ditemukan.");
          deletedTitle = deleted.question;
        }
      } else {
        const deleted = deleteFallbackFaqItem(parsedId);
        if (!deleted) throw new UserFacingError("Item FAQ tidak ditemukan.");
        deletedTitle = deleted.question;
      }

      await logActivity({
        action: "DELETE",
        module: "FAQ",
        targetId: `faq-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, question: deletedTitle } },
      });

      revalidatePath("/content/faq");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}
