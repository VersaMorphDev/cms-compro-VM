import { z } from "zod";

export const PARTNER_CATEGORIES = [
  "Cloud Infrastructure",
  "DevOps & Automation",
  "Monitoring & Observability",
  "Security & Identity",
  "Database & Storage",
  "AI & Machine Learning",
] as const;

export interface PartnerDTO {
  id: number;
  name: string;
  description: string;
  details: string;
  category: string;
  url: string | null;
  logo: string;
  color: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const partnerSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Nama partner minimal 2 karakter").max(120),
  description: z.string().trim().min(5, "Deskripsi singkat minimal 5 karakter").max(300),
  details: z.string().trim().min(10, "Detail kapabilitas minimal 10 karakter"),
  category: z.enum(PARTNER_CATEGORIES),
  url: z.string().trim().max(300).optional().nullable(),
  logo: z.string().trim().min(1, "Slug ikon logo wajib diisi").max(120),
  color: z
    .string()
    .trim()
    .transform((v) => v.replace(/^#/, "").toUpperCase())
    .refine((v) => /^[0-9A-F]{6}$/.test(v), {
      message: "Warna hex harus 6 karakter valid (misal: FF9900).",
    }),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
