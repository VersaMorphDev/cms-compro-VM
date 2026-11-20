"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import {
  clearSessionCookie,
  deriveInitials,
  getCurrentSession,
  normalizeRole,
  setSessionCookie,
  type AuthUser,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { safeAction, UserFacingError, type ActionResult } from "@/lib/safe-action";
import { logActivity } from "@/lib/activity-logger";
import {
  changeOwnPasswordSchema,
  loginSchema,
  sanitizeNextPath,
} from "./schema";

export interface LoginActionResult {
  redirectTo: string;
  user: Omit<AuthUser, "isActive">;
}

export async function loginAction(rawInput: {
  email: string;
  password: string;
  next?: string;
}): Promise<ActionResult<LoginActionResult>> {
  return safeAction(
    {
      requireAuth: false,
      friendlyMessage: "Gagal memproses login. Silakan coba beberapa saat lagi.",
      payload: { email: rawInput.email },
      successMessage: "Login berhasil. Mengalihkan ke CMS Studio...",
    },
    async () => {
      const parsed = loginSchema.parse(rawInput);
      const normalizedEmail = parsed.email.toLowerCase();

      const rows = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, normalizedEmail))
        .limit(1);

      const user = rows[0];
      if (!user || !verifyPassword(parsed.password, user.passwordHash)) {
        throw new UserFacingError("Email atau password yang Anda masukkan salah.");
      }

      if (!user.isActive) {
        throw new UserFacingError(
          "Akun Anda sedang dinonaktifkan. Hubungi Super Admin untuk mengaktifkan kembali."
        );
      }

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        avatarInitials: user.avatarInitials || deriveInitials(user.name),
        isActive: user.isActive,
      };

      await setSessionCookie(authUser);

      await logActivity({
        actorId: String(authUser.id),
        actorName: authUser.name,
        actorRole: authUser.role,
        action: "LOGIN",
        module: "AUTH",
        targetId: String(authUser.id),
        targetTitle: authUser.email,
      });

      return {
        redirectTo: sanitizeNextPath(parsed.next),
        user: {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role,
          avatarInitials: authUser.avatarInitials,
        },
      };
    }
  );
}

export async function logoutAction(): Promise<ActionResult<{ redirectTo: string }>> {
  return safeAction(
    {
      requireAuth: false,
      friendlyMessage: "Gagal memproses logout.",
      successMessage: "Berhasil keluar dari CMS Studio.",
    },
    async () => {
      const session = await getCurrentSession();
      await clearSessionCookie();

      if (session) {
        await logActivity({
          actorId: String(session.id),
          actorName: session.name,
          actorRole: session.role,
          action: "LOGOUT",
          module: "AUTH",
          targetId: String(session.id),
          targetTitle: session.email,
        });
      }

      return { redirectTo: "/login?reason=logout" };
    }
  );
}

export async function changeOwnPasswordAction(rawInput: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult<{ updatedAt: string }>> {
  return safeAction(
    {
      requireAuth: true,
      friendlyMessage: "Gagal memperbarui password akun Anda.",
      successMessage: "Password akun Anda berhasil diperbarui.",
    },
    async () => {
      const session = await getCurrentSession();
      if (!session) {
        throw new UserFacingError(
          "Sesi login Anda tidak ditemukan. Silakan login kembali."
        );
      }

      const parsed = changeOwnPasswordSchema.parse(rawInput);

      const rows = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, session.id))
        .limit(1);

      const dbUser = rows[0];
      if (!dbUser) {
        throw new UserFacingError("Akun tidak ditemukan.");
      }

      if (!verifyPassword(parsed.currentPassword, dbUser.passwordHash)) {
        throw new UserFacingError("Password saat ini tidak sesuai.", {
          currentPassword: ["Password saat ini salah."],
        });
      }

      if (parsed.currentPassword === parsed.newPassword) {
        throw new UserFacingError(
          "Password baru harus berbeda dari password saat ini.",
          {
            newPassword: ["Gunakan kombinasi password yang baru."],
          }
        );
      }

      const now = new Date();
      await db
        .update(adminUsers)
        .set({
          passwordHash: hashPassword(parsed.newPassword),
          updatedAt: now,
        })
        .where(eq(adminUsers.id, session.id));

      await logActivity({
        actorId: String(session.id),
        actorName: session.name,
        actorRole: session.role,
        action: "UPDATE",
        module: "AUTH",
        targetId: String(session.id),
        targetTitle: `${session.email} (password changed)`,
      });

      return { updatedAt: now.toISOString() };
    }
  );
}
