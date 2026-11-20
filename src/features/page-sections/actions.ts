"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { pageSections } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import { safeAction, UserFacingError, type ActionResult } from "@/lib/safe-action";
import { pageSectionSchema, type PageSectionDTO } from "./schema";

function normalizeOptText(val: string | null | undefined): string | null {
  if (val === undefined || val === null) return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function rowToDto(r: typeof pageSections.$inferSelect): PageSectionDTO {
  return {
    id: r.id,
    pageSlug: r.pageSlug,
    sectionKey: r.sectionKey,
    sectionLabel: r.sectionLabel,
    badge: r.badge ?? null,
    badgeSubtext: r.badgeSubtext ?? null,
    headline: r.headline ?? null,
    highlight: r.highlight ?? null,
    subtitle: r.subtitle ?? null,
    body: r.body ?? null,
    ctaPrimaryLabel: r.ctaPrimaryLabel ?? null,
    ctaPrimaryHref: r.ctaPrimaryHref ?? null,
    ctaSecondaryLabel: r.ctaSecondaryLabel ?? null,
    ctaSecondaryHref: r.ctaSecondaryHref ?? null,
    extraData:
      r.extraData && typeof r.extraData === "object" ? r.extraData : {},
    defaultSnapshot:
      r.defaultSnapshot && typeof r.defaultSnapshot === "object"
        ? r.defaultSnapshot
        : {},
    isVisible: r.isVisible,
    sortOrder: r.sortOrder,
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function savePageSectionAction(
  rawInput: unknown
): Promise<ActionResult<PageSectionDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan perubahan section halaman.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/sections",
      payload: rawInput,
    },
    async () => {
      const parsed = pageSectionSchema.parse(rawInput);

      if (!isDatabaseConfigured) {
        throw new UserFacingError("Database belum terhubung.");
      }

      const [existing] = await db
        .select()
        .from(pageSections)
        .where(eq(pageSections.id, parsed.id))
        .limit(1);

      if (!existing) {
        throw new UserFacingError("Section halaman tidak ditemukan.");
      }

      const [updated] = await db
        .update(pageSections)
        .set({
          sectionLabel: parsed.sectionLabel,
          badge: normalizeOptText(parsed.badge),
          badgeSubtext: normalizeOptText(parsed.badgeSubtext),
          headline: normalizeOptText(parsed.headline),
          highlight: normalizeOptText(parsed.highlight),
          subtitle: normalizeOptText(parsed.subtitle),
          body: normalizeOptText(parsed.body),
          ctaPrimaryLabel: normalizeOptText(parsed.ctaPrimaryLabel),
          ctaPrimaryHref: normalizeOptText(parsed.ctaPrimaryHref),
          ctaSecondaryLabel: normalizeOptText(parsed.ctaSecondaryLabel),
          ctaSecondaryHref: normalizeOptText(parsed.ctaSecondaryHref),
          extraData: parsed.extraData,
          isVisible: parsed.isVisible,
          sortOrder: parsed.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(pageSections.id, parsed.id))
        .returning();

      const dto = rowToDto(updated);

      await logActivity({
        action: "UPDATE",
        module: "SETTINGS",
        targetId: `${dto.pageSlug}/${dto.sectionKey}`,
        targetTitle: `Section: ${dto.sectionLabel}`,
        changes: {
          before: {
            headline: existing.headline,
            highlight: existing.highlight,
            isVisible: existing.isVisible,
          },
          after: {
            headline: dto.headline,
            highlight: dto.highlight,
            isVisible: dto.isVisible,
          },
        },
      });

      revalidatePath("/content/sections");
      revalidatePath("/");
      revalidatePath("/monitoring");

      return dto;
    }
  );
}

export async function resetPageSectionToDefaultAction(
  id: number
): Promise<ActionResult<PageSectionDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal mereset section ke default Compro.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/sections",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      if (!isDatabaseConfigured) {
        throw new UserFacingError("Database belum terhubung.");
      }

      const [existing] = await db
        .select()
        .from(pageSections)
        .where(eq(pageSections.id, parsedId))
        .limit(1);

      if (!existing) {
        throw new UserFacingError("Section halaman tidak ditemukan.");
      }

      const snap = (existing.defaultSnapshot ?? {}) as Record<string, unknown>;
      if (Object.keys(snap).length === 0) {
        throw new UserFacingError(
          "Snapshot default untuk section ini belum tersedia."
        );
      }

      const [updated] = await db
        .update(pageSections)
        .set({
          badge: (snap.badge as string | null) ?? null,
          badgeSubtext: (snap.badgeSubtext as string | null) ?? null,
          headline: (snap.headline as string | null) ?? null,
          highlight: (snap.highlight as string | null) ?? null,
          subtitle: (snap.subtitle as string | null) ?? null,
          body: (snap.body as string | null) ?? null,
          ctaPrimaryLabel: (snap.ctaPrimaryLabel as string | null) ?? null,
          ctaPrimaryHref: (snap.ctaPrimaryHref as string | null) ?? null,
          ctaSecondaryLabel: (snap.ctaSecondaryLabel as string | null) ?? null,
          ctaSecondaryHref: (snap.ctaSecondaryHref as string | null) ?? null,
          extraData:
            snap.extraData && typeof snap.extraData === "object"
              ? (snap.extraData as Record<string, unknown>)
              : {},
          isVisible:
            typeof snap.isVisible === "boolean" ? snap.isVisible : true,
          updatedAt: new Date(),
        })
        .where(eq(pageSections.id, parsedId))
        .returning();

      const dto = rowToDto(updated);

      await logActivity({
        action: "UPDATE",
        module: "SETTINGS",
        targetId: `${dto.pageSlug}/${dto.sectionKey}`,
        targetTitle: `Reset to Default: ${dto.sectionLabel}`,
        changes: {
          before: { headline: existing.headline, highlight: existing.highlight },
          after: { headline: dto.headline, highlight: dto.highlight, reset: true },
        },
      });

      revalidatePath("/content/sections");
      revalidatePath("/");
      revalidatePath("/monitoring");

      return dto;
    }
  );
}
