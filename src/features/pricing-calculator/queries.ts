import { asc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { calculatorConfigs, pricingTiers } from "@/db/schema";
import {
  getFallbackCalculatorConfigs,
  getFallbackPricingTiers,
} from "@/features/commercial/store-fallback";
import {
  CALCULATOR_CONFIG_TYPES,
  type CalculatorConfigDTO,
  type CalculatorConfigType,
  type PricingTierDTO,
} from "./schema";

export async function getPricingTiers(): Promise<{
  items: PricingTierDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(pricingTiers)
        .orderBy(asc(pricingTiers.sortOrder), asc(pricingTiers.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          ...r,
          features: r.features ?? [],
          status: r.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[PricingQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackPricingTiers(),
  };
}

export async function getCalculatorConfigs(): Promise<{
  items: CalculatorConfigDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(calculatorConfigs)
        .orderBy(asc(calculatorConfigs.sortOrder), asc(calculatorConfigs.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          id: r.id,
          configType: (CALCULATOR_CONFIG_TYPES.includes(
            r.configType as CalculatorConfigType
          )
            ? r.configType
            : "SERVICE") as CalculatorConfigType,
          key: r.key,
          name: r.name,
          description: r.description,
          cost: r.cost,
          weeks: r.weeks,
          multiplier: r.multiplier,
          interestValue: r.interestValue,
          isActive: r.isActive,
          sortOrder: r.sortOrder,
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[CalculatorQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackCalculatorConfigs(),
  };
}
