import { z } from "zod";

export const PAGE_SLUG_OPTIONS = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About Us" },
  { slug: "services", label: "Services" },
  { slug: "solutions", label: "Solutions" },
  { slug: "portfolio", label: "Portfolio" },
  { slug: "pricing", label: "Pricing" },
  { slug: "calculator", label: "Calculator" },
  { slug: "blog", label: "Blog" },
  { slug: "careers", label: "Careers" },
  { slug: "partners", label: "Partners" },
  { slug: "affiliate", label: "Affiliate" },
  { slug: "contact", label: "Contact" },
  { slug: "team", label: "Team" },
  { slug: "faq", label: "FAQ" },
  { slug: "global", label: "Global / Footer" },
] as const;

export interface PageSectionDTO {
  id: number;
  pageSlug: string;
  sectionKey: string;
  sectionLabel: string;
  badge: string | null;
  badgeSubtext: string | null;
  headline: string | null;
  highlight: string | null;
  subtitle: string | null;
  body: string | null;
  ctaPrimaryLabel: string | null;
  ctaPrimaryHref: string | null;
  ctaSecondaryLabel: string | null;
  ctaSecondaryHref: string | null;
  extraData: Record<string, unknown>;
  defaultSnapshot: Record<string, unknown>;
  isVisible: boolean;
  sortOrder: number;
  updatedAt: string;
}

export const pageSectionSchema = z.object({
  id: z.number().int().positive(),
  sectionLabel: z.string().trim().min(2, "Label section wajib diisi").max(160),
  badge: z.string().trim().max(120).optional().nullable(),
  badgeSubtext: z.string().trim().max(160).optional().nullable(),
  headline: z.string().trim().max(300).optional().nullable(),
  highlight: z.string().trim().max(200).optional().nullable(),
  subtitle: z.string().trim().max(1000).optional().nullable(),
  body: z.string().trim().max(4000).optional().nullable(),
  ctaPrimaryLabel: z.string().trim().max(120).optional().nullable(),
  ctaPrimaryHref: z.string().trim().max(300).optional().nullable(),
  ctaSecondaryLabel: z.string().trim().max(120).optional().nullable(),
  ctaSecondaryHref: z.string().trim().max(300).optional().nullable(),
  extraData: z.record(z.unknown()).default({}),
  isVisible: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
