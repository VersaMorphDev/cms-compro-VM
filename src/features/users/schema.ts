import { z } from "zod";
import { ADMIN_ROLES, type AdminRole } from "@/lib/session-token";

export interface RoleMetadata {
  label: string;
  badge: string;
  description: string;
}

export const ROLE_META: Record<AdminRole, RoleMetadata> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    badge: "Full Access",
    description:
      "Akses penuh ke seluruh modul konten, komersial, CRM, error monitor, dan manajemen akun admin.",
  },
  CONTENT_EDITOR: {
    label: "Content Editor",
    badge: "Editorial",
    description:
      "Mengelola Page Sections, Services, Portfolio, Blog, FAQ, serta sinkronisasi cache Compro.",
  },
  HR_RECRUITER: {
    label: "HR Recruiter",
    badge: "People & Hiring",
    description:
      "Mengelola lowongan karier, profil tim & nilai perusahaan, serta pipeline pelamar kerja.",
  },
  SALES_BD: {
    label: "Sales & BD",
    badge: "Revenue & CRM",
    description:
      "Mengelola Leads Inbox, Affiliate & referral partners, pricing tiers, dan kalkulator proyek.",
  },
};

export interface AdminUserDTO {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  avatarInitials: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const saveAdminUserSchema = z
  .object({
    id: z.number().int().positive().optional(),
    name: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter.")
      .max(100, "Nama lengkap maksimal 100 karakter."),
    email: z
      .string()
      .trim()
      .email("Format email tidak valid.")
      .max(150, "Email maksimal 150 karakter."),
    role: z.enum(ADMIN_ROLES),
    avatarInitials: z
      .string()
      .trim()
      .max(4, "Inisial maksimal 4 karakter.")
      .optional(),
    isActive: z.boolean().default(true),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const trimmedPwd = data.password?.trim() ?? "";
    if (!data.id && trimmedPwd.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password awal minimal 8 karakter untuk akun baru.",
      });
    }
    if (data.id && trimmedPwd.length > 0 && trimmedPwd.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password baru minimal 8 karakter jika ingin di-reset.",
      });
    }
    if (trimmedPwd.length > 128) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password maksimal 128 karakter.",
      });
    }
  });

export type SaveAdminUserInput = z.infer<typeof saveAdminUserSchema>;
