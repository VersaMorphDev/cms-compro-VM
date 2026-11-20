import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
  next: z.string().optional(),
});

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter.")
      .max(128, "Password baru maksimal 128 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password baru tidak cocok.",
  });

export function sanitizeNextPath(raw?: string | null): string {
  if (!raw) return "/";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  if (trimmed === "/login" || trimmed.startsWith("/login?")) return "/";
  return trimmed;
}
