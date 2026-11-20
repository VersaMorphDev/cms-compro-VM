import { asc, eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { pageSections } from "@/db/schema";
import {
  buildDefaultSnapshot,
  DEFAULT_PAGE_SECTIONS,
} from "@/db/seed-data/page-sections-default";
import type { PageSectionDTO } from "./schema";

function getFallbackPageSections(pageSlug?: string): PageSectionDTO[] {
  const now = new Date().toISOString();
  return DEFAULT_PAGE_SECTIONS.filter((s) => !pageSlug || s.pageSlug === pageSlug).map(
    (s, idx) => ({
      id: idx + 1,
      pageSlug: s.pageSlug,
      sectionKey: s.sectionKey,
      sectionLabel: s.sectionLabel,
      badge: s.badge ?? null,
      badgeSubtext: s.badgeSubtext ?? null,
      headline: s.headline ?? null,
      highlight: s.highlight ?? null,
      subtitle: s.subtitle ?? null,
      body: s.body ?? null,
      ctaPrimaryLabel: s.ctaPrimaryLabel ?? null,
      ctaPrimaryHref: s.ctaPrimaryHref ?? null,
      ctaSecondaryLabel: s.ctaSecondaryLabel ?? null,
      ctaSecondaryHref: s.ctaSecondaryHref ?? null,
      extraData: s.extraData ?? {},
      defaultSnapshot: buildDefaultSnapshot(s),
      isVisible: s.isVisible ?? true,
      sortOrder: s.sortOrder,
      updatedAt: now,
    })
  );
}

export async function getPageSections(pageSlug?: string): Promise<{
  items: PageSectionDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const baseQuery = db.select().from(pageSections);
      const rows = pageSlug
        ? await baseQuery
            .where(eq(pageSections.pageSlug, pageSlug))
            .orderBy(asc(pageSections.sortOrder), asc(pageSections.id))
        : await baseQuery.orderBy(
            asc(pageSections.pageSlug),
            asc(pageSections.sortOrder),
            asc(pageSections.id)
          );

      return {
        storageMode: "database",
        items: rows.map((r) => ({
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
        })),
      };
    } catch (err) {
      console.warn(
        "[PageSectionsQueries] Falling back to static defaults:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackPageSections(pageSlug),
  };
}
