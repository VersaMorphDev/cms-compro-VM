"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { calculatorConfigs, pricingTiers } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  isUniqueConstraintError as isUniqueKeyError,
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import { slugify } from "@/lib/utils";
import {
  deleteFallbackCalculatorConfig,
  deleteFallbackPricingTier,
  upsertFallbackCalculatorConfig,
  upsertFallbackPricingTier,
} from "@/features/commercial/store-fallback";
import {
  calculatorConfigSchema,
  pricingTierSchema,
  type CalculatorConfigDTO,
  type CalculatorConfigType,
  type PricingTierDTO,
} from "./schema";

export async function savePricingTierAction(
  rawInput: unknown
): Promise<ActionResult<PricingTierDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan paket harga.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/commercial/pricing",
      payload: rawInput,
    },
    async () => {
      const parsed = pricingTierSchema.parse(rawInput);
      let savedItem: PricingTierDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        const res = upsertFallbackPricingTier(parsed);
        savedItem = res.item;
        beforeItem = res.before;
      };

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(pricingTiers)
              .where(eq(pricingTiers.id, parsed.id))
              .limit(1);
            if (!existing) throw new UserFacingError("Paket harga tidak ditemukan.");
            beforeItem = {
              name: existing.name,
              price: existing.price,
              highlighted: existing.highlighted,
            };

            const [updated] = await db
              .update(pricingTiers)
              .set({
                name: parsed.name,
                description: parsed.description,
                price: parsed.price,
                priceLabel: parsed.priceLabel,
                features: parsed.features,
                highlighted: parsed.highlighted,
                cta: parsed.cta,
                ctaHref: parsed.ctaHref,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(pricingTiers.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              features: updated.features ?? [],
              status: updated.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(pricingTiers)
              .values({
                name: parsed.name,
                description: parsed.description,
                price: parsed.price,
                priceLabel: parsed.priceLabel,
                features: parsed.features,
                highlighted: parsed.highlighted,
                cta: parsed.cta,
                ctaHref: parsed.ctaHref,
                status: parsed.status,
                sortOrder: parsed.sortOrder,
              })
              .returning();

            savedItem = {
              ...inserted,
              features: inserted.features ?? [],
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

      if (!savedItem) throw new Error("Failed saving pricing tier");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "PRICING",
        targetId: `tier-${savedItem.id}`,
        targetTitle: `${savedItem.name} (${savedItem.price})`,
        changes: {
          before: beforeItem,
          after: {
            name: savedItem.name,
            price: savedItem.price,
            highlighted: savedItem.highlighted,
          },
        },
      });

      revalidatePath("/commercial/pricing");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deletePricingTierAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus paket harga.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/commercial/pricing",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Tier #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(pricingTiers)
            .where(eq(pricingTiers.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Paket harga tidak ditemukan.");
          deletedTitle = deleted.name;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackPricingTier(parsedId);
          if (!deleted) throw new UserFacingError("Paket harga tidak ditemukan.");
          deletedTitle = deleted.name;
        }
      } else {
        const deleted = deleteFallbackPricingTier(parsedId);
        if (!deleted) throw new UserFacingError("Paket harga tidak ditemukan.");
        deletedTitle = deleted.name;
      }

      await logActivity({
        action: "DELETE",
        module: "PRICING",
        targetId: `tier-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, name: deletedTitle } },
      });

      revalidatePath("/commercial/pricing");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}

export async function saveCalculatorConfigAction(
  rawInput: unknown
): Promise<ActionResult<CalculatorConfigDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan konfigurasi kalkulator proyek.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/commercial/calculator",
      payload: rawInput,
    },
    async () => {
      const parsed = calculatorConfigSchema.parse(rawInput);
      const resolvedKey = slugify(parsed.key || parsed.name);
      if (!resolvedKey) {
        throw new UserFacingError("Key konfigurasi tidak valid.");
      }

      let savedItem: CalculatorConfigDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      const handleFallback = () => {
        try {
          const res = upsertFallbackCalculatorConfig({
            id: parsed.id,
            configType: parsed.configType,
            key: resolvedKey,
            name: parsed.name,
            description: parsed.description ?? null,
            cost: parsed.cost,
            weeks: parsed.weeks,
            multiplier: parsed.multiplier ?? null,
            interestValue: parsed.interestValue ?? null,
            isActive: parsed.isActive,
            sortOrder: parsed.sortOrder,
          });
          savedItem = res.item;
          beforeItem = res.before;
        } catch (fbErr) {
          if (isUniqueKeyError(fbErr)) {
            throw new UserFacingError(
              "Key konfigurasi sudah digunakan. Gunakan key berbeda.",
              { key: ["Key sudah terdaftar"] }
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
              .from(calculatorConfigs)
              .where(eq(calculatorConfigs.id, parsed.id))
              .limit(1);
            if (!existing) {
              throw new UserFacingError("Konfigurasi kalkulator tidak ditemukan.");
            }
            beforeItem = {
              name: existing.name,
              cost: existing.cost,
              multiplier: existing.multiplier,
              isActive: existing.isActive,
            };

            const [updated] = await db
              .update(calculatorConfigs)
              .set({
                configType: parsed.configType,
                key: resolvedKey,
                name: parsed.name,
                description: parsed.description ?? null,
                cost: parsed.cost,
                weeks: parsed.weeks,
                multiplier: parsed.multiplier ?? null,
                interestValue: parsed.interestValue ?? null,
                isActive: parsed.isActive,
                sortOrder: parsed.sortOrder,
                updatedAt: new Date(),
              })
              .where(eq(calculatorConfigs.id, parsed.id))
              .returning();

            savedItem = {
              ...updated,
              configType: updated.configType as CalculatorConfigType,
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(calculatorConfigs)
              .values({
                configType: parsed.configType,
                key: resolvedKey,
                name: parsed.name,
                description: parsed.description ?? null,
                cost: parsed.cost,
                weeks: parsed.weeks,
                multiplier: parsed.multiplier ?? null,
                interestValue: parsed.interestValue ?? null,
                isActive: parsed.isActive,
                sortOrder: parsed.sortOrder,
              })
              .returning();

            savedItem = {
              ...inserted,
              configType: inserted.configType as CalculatorConfigType,
              updatedAt: inserted.updatedAt.toISOString(),
            };
          }
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          if (isUniqueKeyError(dbErr)) {
            throw new UserFacingError(
              "Key konfigurasi sudah digunakan. Gunakan key berbeda.",
              { key: ["Key sudah terdaftar"] }
            );
          }
          handleFallback();
        }
      } else {
        handleFallback();
      }

      if (!savedItem) throw new Error("Failed saving calculator config");

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "PRICING",
        targetId: savedItem.key,
        targetTitle: `Calculator [${savedItem.configType}]: ${savedItem.name}`,
        changes: {
          before: beforeItem,
          after: {
            cost: savedItem.cost,
            weeks: savedItem.weeks,
            multiplier: savedItem.multiplier,
            isActive: savedItem.isActive,
          },
        },
      });

      revalidatePath("/commercial/calculator");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function deleteCalculatorConfigAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus item kalkulator.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/commercial/calculator",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Config #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(calculatorConfigs)
            .where(eq(calculatorConfigs.id, parsedId))
            .returning();
          if (!deleted) {
            throw new UserFacingError("Konfigurasi kalkulator tidak ditemukan.");
          }
          deletedTitle = deleted.name;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackCalculatorConfig(parsedId);
          if (!deleted) {
            throw new UserFacingError("Konfigurasi kalkulator tidak ditemukan.");
          }
          deletedTitle = deleted.name;
        }
      } else {
        const deleted = deleteFallbackCalculatorConfig(parsedId);
        if (!deleted) {
          throw new UserFacingError("Konfigurasi kalkulator tidak ditemukan.");
        }
        deletedTitle = deleted.name;
      }

      await logActivity({
        action: "DELETE",
        module: "PRICING",
        targetId: `calc-${parsedId}`,
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, name: deletedTitle } },
      });

      revalidatePath("/commercial/calculator");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}
