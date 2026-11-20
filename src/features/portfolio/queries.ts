import { asc, desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { projects } from "@/db/schema";
import { getFallbackProjects } from "@/features/content/store-fallback";
import type { ProjectDTO } from "./schema";

export async function getProjects(): Promise<{
  items: ProjectDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(projects)
        .orderBy(asc(projects.sortOrder), desc(projects.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          client: r.client,
          industry: r.industry,
          year: r.year,
          category: r.category,
          description: r.description,
          problem: r.problem,
          solution: r.solution,
          result: r.result,
          tech: r.tech ?? [],
          gradient: r.gradient,
          image: r.image,
          timeline: r.timeline ?? [],
          status: r.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          sortOrder: r.sortOrder,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[PortfolioQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackProjects(),
  };
}
