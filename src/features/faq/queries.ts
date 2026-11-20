import { asc, desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { faqItems } from "@/db/schema";
import { getFallbackFaqItems } from "@/features/content/store-fallback";
import type { FaqItemDTO } from "./schema";

export async function getFaqItems(): Promise<{
  items: FaqItemDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(faqItems)
        .orderBy(asc(faqItems.sortOrder), desc(faqItems.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          id: r.id,
          question: r.question,
          answer: r.answer,
          category: r.category,
          status: r.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          sortOrder: r.sortOrder,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[FaqQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackFaqItems(),
  };
}
