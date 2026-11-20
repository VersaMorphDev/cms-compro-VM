import { asc, desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { partners } from "@/db/schema";
import { getFallbackPartners } from "@/features/commercial/store-fallback";
import type { PartnerDTO } from "./schema";

export async function getPartners(): Promise<{
  items: PartnerDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(partners)
        .orderBy(asc(partners.sortOrder), desc(partners.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          ...r,
          status: r.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[PartnerQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackPartners(),
  };
}
