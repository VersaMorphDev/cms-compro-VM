import { z } from "zod";
import type { ServiceProcessStep, ServiceUseCase } from "@/db/schema";

export const SERVICE_ICONS = [
  "code",
  "globe",
  "mobile",
  "design",
  "ai",
  "cloud",
  "transform",
  "iot",
  "automation",
  "security",
  "analytics",
] as const;

export interface ServiceDTO {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  items: string[];
  benefits: string[];
  process: ServiceProcessStep[];
  technologies: string[];
  useCases: ServiceUseCase[];
  gradient: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionDTO {
  id: number;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  items: string[];
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApproachStepDTO {
  id: number;
  num: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface WhyChooseUsDTO {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
}

export const serviceSchema = z.object({
  id: z.number().int().positive().optional(),
  slug: z.string().trim().max(180).optional().default(""),
  title: z.string().trim().min(3, "Judul layanan minimal 3 karakter").max(160),
  tagline: z.string().trim().min(5, "Tagline minimal 5 karakter").max(260),
  description: z.string().trim().min(10, "Deskripsi minimal 10 karakter"),
  icon: z.string().trim().min(1).default("code"),
  items: z.array(z.string().trim().min(1)).default([]),
  benefits: z.array(z.string().trim().min(1)).default([]),
  process: z
    .array(
      z.object({
        step: z.string().trim().min(2),
        desc: z.string().trim().min(2),
      })
    )
    .default([]),
  technologies: z.array(z.string().trim().min(1)).default([]),
  useCases: z
    .array(
      z.object({
        title: z.string().trim().min(2),
        desc: z.string().trim().min(2),
      })
    )
    .default([]),
  gradient: z
    .string()
    .trim()
    .default("from-[rgba(59,130,246,0.15)] to-transparent"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const solutionSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(3, "Judul solusi minimal 3 karakter").max(160),
  description: z.string().trim().min(10, "Deskripsi solusi minimal 10 karakter"),
  icon: z.string().trim().min(1).default("transform"),
  gradient: z
    .string()
    .trim()
    .default("from-[rgba(59,130,246,0.15)] to-transparent"),
  items: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const approachStepSchema = z.object({
  id: z.number().int().positive().optional(),
  num: z.string().trim().min(1).max(10),
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(400),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const whyChooseUsSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(400),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
