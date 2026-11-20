import { z } from "zod";

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Project Based",
  "Freelance",
] as const;

export const WORK_ECOSYSTEMS = ["On-site", "Hybrid", "Remote"] as const;

export const JOB_CATEGORIES = ["Technology", "Non-IT"] as const;

export const JOB_STATUSES = ["OPEN", "CLOSED", "DRAFT"] as const;

export interface JobOpeningDTO {
  id: number;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: (typeof JOB_TYPES)[number];
  workEcosystem: (typeof WORK_ECOSYSTEMS)[number];
  category: (typeof JOB_CATEGORIES)[number];
  description: string;
  requirements: string[];
  status: (typeof JOB_STATUSES)[number];
  createdAt: string;
  updatedAt: string;
}

export const jobOpeningSchema = z.object({
  id: z.number().int().positive().optional(),
  slug: z.string().trim().max(180).optional().default(""),
  title: z.string().trim().min(3, "Judul posisi minimal 3 karakter").max(160),
  department: z.string().trim().min(2, "Departemen wajib diisi").max(100),
  location: z.string().trim().min(2, "Lokasi wajib diisi").max(150),
  type: z.enum(JOB_TYPES),
  workEcosystem: z.enum(WORK_ECOSYSTEMS),
  category: z.enum(JOB_CATEGORIES),
  description: z.string().trim().min(10, "Deskripsi pekerjaan minimal 10 karakter"),
  requirements: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(JOB_STATUSES).default("OPEN"),
});
