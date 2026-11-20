import { z } from "zod";
import type { ProjectTimelinePhase } from "@/db/schema";

export const PROJECT_CATEGORIES = [
  "AI & ML",
  "IoT & Hardware",
  "Software",
  "Web & Mobile",
  "Cloud & Data",
] as const;

export const PROJECT_GRADIENTS = [
  { label: "Deep Navy", value: "linear-gradient(135deg, #1e3a8a, #0f172a)" },
  { label: "Emerald Slate", value: "linear-gradient(135deg, #065f46, #0f172a)" },
  { label: "Royal Violet", value: "linear-gradient(135deg, #701a75, #0f172a)" },
  { label: "Amber Obsidian", value: "linear-gradient(135deg, #9a3412, #0f172a)" },
  { label: "Cyan Midnight", value: "linear-gradient(135deg, #0e7490, #0f172a)" },
] as const;

export interface ProjectDTO {
  id: number;
  slug: string;
  title: string;
  client: string;
  industry: string;
  year: string;
  category: string;
  description: string;
  problem: string;
  solution: string;
  result: string;
  tech: string[];
  gradient: string;
  image: string | null;
  timeline: ProjectTimelinePhase[];
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const timelinePhaseSchema = z.object({
  phase: z.string().trim().min(1, "Nama phase wajib diisi").max(50),
  title: z.string().trim().min(2, "Judul phase wajib diisi").max(120),
  desc: z.string().trim().min(3, "Deskripsi phase wajib diisi").max(400),
});

export const projectSchema = z.object({
  id: z.number().int().positive().optional(),
  slug: z.string().trim().max(180).optional().default(""),
  title: z.string().trim().min(3, "Judul proyek minimal 3 karakter").max(200),
  client: z.string().trim().min(2, "Nama klien wajib diisi").max(150),
  industry: z.string().trim().min(2, "Industri wajib diisi").max(100),
  year: z.string().trim().min(4, "Tahun proyek wajib diisi").max(10),
  category: z.string().trim().min(1, "Kategori wajib dipilih"),
  description: z.string().trim().min(10, "Deskripsi overview minimal 10 karakter"),
  problem: z.string().trim().min(10, "Deskripsi problem minimal 10 karakter"),
  solution: z.string().trim().min(10, "Deskripsi solution minimal 10 karakter"),
  result: z.string().trim().min(10, "Deskripsi result minimal 10 karakter"),
  tech: z.array(z.string().trim().min(1)).default([]),
  gradient: z
    .string()
    .trim()
    .default("linear-gradient(135deg, #1e3a8a, #0f172a)"),
  image: z.string().trim().max(300).optional().nullable(),
  timeline: z.array(timelinePhaseSchema).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;
