import { z } from "zod";

export interface TeamMemberDTO {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialDTO {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  project: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfileSettings {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  whatsappMessage: string;
  address: string;
  registeredAddress: string;
  url: string;
  dpoEmail: string;
  privacyEmail: string;
  companyNumber: string;
  linkedin: string;
  twitter: string;
  instagram: string;
}

export interface AboutStatItem {
  value: string;
  label: string;
  large: boolean;
}

export interface AboutValueItem {
  icon: string;
  title: string;
  desc: string;
}

export interface LegalTocSection {
  id: string;
  label: string;
}

export interface LegalPageDTO {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  tocSections: LegalTocSection[];
  content: string;
  version: string;
  updatedAt: string;
}

export const teamMemberSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  role: z.string().trim().min(2, "Jabatan wajib diisi").max(120),
  bio: z.string().trim().min(10, "Bio minimal 10 karakter").max(600),
  image: z.string().trim().min(1, "Path foto wajib diisi").max(300),
  linkedinUrl: z.string().trim().max(300).optional().nullable(),
  twitterUrl: z.string().trim().max(300).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const testimonialSchema = z.object({
  id: z.number().int().positive().optional(),
  quote: z.string().trim().min(10, "Kutipan minimal 10 karakter").max(800),
  author: z.string().trim().min(2, "Inisial / nama klien wajib diisi").max(100),
  role: z.string().trim().min(2, "Jabatan klien wajib diisi").max(120),
  company: z.string().trim().min(2, "Perusahaan klien wajib diisi").max(140),
  project: z.string().trim().min(2, "Nama proyek terkait wajib diisi").max(140),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const companyProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(500),
  email: z.string().trim().email("Email tidak valid"),
  phone: z.string().trim().min(4).max(40),
  whatsappPhone: z.string().trim().min(4).max(30),
  whatsappMessage: z.string().trim().min(2).max(300),
  address: z.string().trim().min(2).max(200),
  registeredAddress: z.string().trim().min(5).max(300),
  url: z.string().trim().url("URL website harus valid"),
  dpoEmail: z.string().trim().email("Email DPO tidak valid"),
  privacyEmail: z.string().trim().email("Email Privacy tidak valid"),
  companyNumber: z.string().trim().min(2).max(80),
  linkedin: z.string().trim().max(300),
  twitter: z.string().trim().max(300),
  instagram: z.string().trim().max(300),
});

export const aboutStatsValuesSchema = z.object({
  stats: z
    .array(
      z.object({
        value: z.string().trim().min(1),
        label: z.string().trim().min(2),
        large: z.boolean().default(false),
      })
    )
    .min(1),
  values: z
    .array(
      z.object({
        icon: z.string().trim().min(1),
        title: z.string().trim().min(2),
        desc: z.string().trim().min(5),
      })
    )
    .min(1),
});

export const legalPageSchema = z.object({
  id: z.number().int().positive().optional(),
  slug: z.string().trim().max(160).optional().default(""),
  title: z.string().trim().min(2, "Judul dokumen minimal 2 karakter").max(160),
  subtitle: z.string().trim().max(600).optional().default(""),
  lastUpdated: z.string().trim().max(60).optional().default("June 2026"),
  tocSections: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        label: z.string().trim().min(1),
      })
    )
    .optional()
    .default([]),
  content: z.string().trim().min(10, "Konten dokumen minimal 10 karakter"),
  version: z.string().trim().min(1, "Versi wajib diisi").max(30),
});
