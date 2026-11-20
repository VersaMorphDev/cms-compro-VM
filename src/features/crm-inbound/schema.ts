import { z } from "zod";

export const LEAD_SOURCES = [
  "contact",
  "service-page",
  "partners-apply",
  "chat",
  "meeting",
  "blog-footer",
] as const;

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
] as const;

export const AFFILIATE_STATUSES = ["ACTIVE", "SUSPENDED"] as const;

export const REFERRAL_STATUSES = [
  "SUBMITTED",
  "IN_REVIEW",
  "PITCHING",
  "WON",
  "REJECTED",
] as const;

export const APPLICANT_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
  "REJECTED",
] as const;

export interface LeadDTO {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  service: string | null;
  source: string;
  partnerType: string | null;
  message: string | null;
  subscribeNewsletter: boolean;
  metadata: Record<string, unknown> | null;
  status: (typeof LEAD_STATUSES)[number];
  salesNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateDTO {
  id: number;
  affiliateCode: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: (typeof AFFILIATE_STATUSES)[number];
  createdAt: string;
}

export interface AffiliateReferralDTO {
  id: number;
  affiliateCode: string;
  affiliateName: string | null;
  clientCompany: string;
  clientPicName: string;
  clientPicTitle: string | null;
  clientEmail: string;
  companyIndustry: string | null;
  companyScale: string | null;
  platforms: string | null;
  budget: string | null;
  timeline: string | null;
  techStack: string | null;
  preferredChannel: string | null;
  bestTime: string | null;
  message: string | null;
  status: (typeof REFERRAL_STATUSES)[number];
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicantDTO {
  id: number;
  position: string;
  name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  portfolioUrl: string | null;
  expectedSalary: string | null;
  startDate: string | null;
  workAuth: string | null;
  resumeFileName: string | null;
  resumeUrl: string | null;
  message: string | null;
  status: (typeof APPLICANT_STATUSES)[number];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid"),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(150).optional().nullable(),
  website: z.string().trim().max(240).optional().nullable(),
  service: z.string().trim().max(150).optional().nullable(),
  source: z.string().trim().min(1).default("contact"),
  partnerType: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  subscribeNewsletter: z.boolean().default(false),
});

export const updateLeadSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(LEAD_STATUSES),
  salesNotes: z.string().trim().max(2000).optional().nullable(),
});

export const createAffiliateSchema = z.object({
  name: z.string().trim().min(2, "Nama partner minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid"),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(150).optional().nullable(),
  affiliateCode: z.string().trim().max(30).optional().default(""),
});

export const updateAffiliateStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(AFFILIATE_STATUSES),
});

export const updateReferralSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(REFERRAL_STATUSES),
  message: z.string().trim().max(2000).optional().nullable(),
});

export const updateApplicantSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(APPLICANT_STATUSES),
  notes: z.string().trim().max(2000).optional().nullable(),
});
