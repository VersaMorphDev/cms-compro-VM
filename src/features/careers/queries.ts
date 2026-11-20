import { desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { jobOpenings } from "@/db/schema";
import { getFallbackJobOpenings } from "@/features/company-profile/store-fallback";
import type { JobOpeningDTO } from "./schema";

export async function getJobOpenings(): Promise<{
  items: JobOpeningDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(jobOpenings)
        .orderBy(desc(jobOpenings.createdAt), desc(jobOpenings.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          department: r.department,
          location: r.location,
          type: r.type as JobOpeningDTO["type"],
          workEcosystem: r.workEcosystem as JobOpeningDTO["workEcosystem"],
          category: r.category as JobOpeningDTO["category"],
          description: r.description,
          requirements: r.requirements ?? [],
          status: r.status as JobOpeningDTO["status"],
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[CareersQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackJobOpenings(),
  };
}
