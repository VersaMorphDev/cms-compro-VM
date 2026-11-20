import { z } from "zod";

export interface PricingTierDTO {
  id: number;
  name: string;
  description: string;
  price: string;
  priceLabel: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  ctaHref: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type CalculatorConfigType =
  | "SERVICE"
  | "SCALE"
  | "ADDON"
  | "PLATFORM"
  | "COMPLEX_FEATURE"
  | "INFRA_TIER"
  | "UX_MULTIPLIER"
  | "SCOPE_RATE";

export const CALCULATOR_CONFIG_TYPES = [
  "SERVICE",
  "SCALE",
  "ADDON",
  "PLATFORM",
  "COMPLEX_FEATURE",
  "INFRA_TIER",
  "UX_MULTIPLIER",
  "SCOPE_RATE",
] as const;

export function isMultiplierConfigType(type: CalculatorConfigType): boolean {
  return type === "SCALE" || type === "UX_MULTIPLIER";
}

export const SERVICE_INTEREST_OPTIONS = [
  "Digital Transformation",
  "Software Development",
  "Web & Mobile Apps",
  "AI & Cloud Solutions",
  "UI/UX Design",
  "General Inquiry",
] as const;

export interface CalculatorConfigDTO {
  id: number;
  configType: CalculatorConfigType;
  key: string;
  name: string;
  description: string | null;
  cost: number | null;
  weeks: number | null;
  multiplier: string | null;
  interestValue: string | null;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export const pricingTierSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Nama paket minimal 2 karakter").max(100),
  description: z.string().trim().min(5, "Deskripsi paket minimal 5 karakter").max(400),
  price: z.string().trim().min(1, "Harga wajib diisi").max(60),
  priceLabel: z.string().trim().min(1, "Label harga wajib diisi").max(60),
  features: z.array(z.string().trim().min(1)).default([]),
  highlighted: z.boolean().default(false),
  cta: z.string().trim().min(1, "Teks CTA wajib diisi").max(60),
  ctaHref: z.string().trim().min(1).max(200).default("/contact"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const calculatorConfigSchema = z
  .object({
    id: z.number().int().positive().optional(),
    configType: z.enum(CALCULATOR_CONFIG_TYPES),
    key: z.string().trim().max(120).optional().default(""),
    name: z.string().trim().min(2, "Nama konfigurasi minimal 2 karakter").max(120),
    description: z.string().trim().max(300).optional().nullable(),
    cost: z
      .union([z.coerce.number().int().min(0), z.literal(""), z.null(), z.undefined()])
      .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v))),
    weeks: z
      .union([z.coerce.number().int().min(0), z.literal(""), z.null(), z.undefined()])
      .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v))),
    multiplier: z.string().trim().max(20).optional().nullable(),
    interestValue: z.string().trim().max(100).optional().nullable(),
    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((val, ctx) => {
    if (isMultiplierConfigType(val.configType)) {
      const num = Number(val.multiplier);
      if (!val.multiplier || Number.isNaN(num) || num <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiplier harus berupa angka positif (misal: 1.35).",
          path: ["multiplier"],
        });
      }
    } else {
      if (val.cost === null || val.cost < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Biaya dasar (IDR) wajib diisi dan tidak boleh negatif.",
          path: ["cost"],
        });
      }
      if (val.configType === "SERVICE" || val.configType === "ADDON") {
        if (val.weeks === null || val.weeks < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Estimasi minggu wajib diisi.",
            path: ["weeks"],
          });
        }
      }
    }
  });
