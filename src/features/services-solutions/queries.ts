import { asc, desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { approachSteps, services, solutions, whyChooseUs } from "@/db/schema";
import { getFallbackServicesBundle } from "@/features/content/store-fallback";
import type {
  ApproachStepDTO,
  ServiceDTO,
  SolutionDTO,
  WhyChooseUsDTO,
} from "./schema";

export async function getServicesBundle(): Promise<{
  services: ServiceDTO[];
  solutions: SolutionDTO[];
  approachSteps: ApproachStepDTO[];
  whyChooseUs: WhyChooseUsDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const [svcRows, solRows, appRows, whyRows] = await Promise.all([
        db
          .select()
          .from(services)
          .orderBy(asc(services.sortOrder), desc(services.id)),
        db
          .select()
          .from(solutions)
          .orderBy(asc(solutions.sortOrder), desc(solutions.id)),
        db
          .select()
          .from(approachSteps)
          .orderBy(asc(approachSteps.sortOrder), asc(approachSteps.id)),
        db
          .select()
          .from(whyChooseUs)
          .orderBy(asc(whyChooseUs.sortOrder), asc(whyChooseUs.id)),
      ]);

      return {
        storageMode: "database",
        services: svcRows.map((r) => ({
          ...r,
          items: r.items ?? [],
          benefits: r.benefits ?? [],
          process: r.process ?? [],
          technologies: r.technologies ?? [],
          useCases: r.useCases ?? [],
          status: r.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
        solutions: solRows.map((r) => ({
          ...r,
          items: r.items ?? [],
          status: r.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
        approachSteps: appRows,
        whyChooseUs: whyRows,
      };
    } catch (err) {
      console.warn(
        "[ServicesQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  const fb = getFallbackServicesBundle();
  return {
    storageMode: "memory",
    ...fb,
  };
}
