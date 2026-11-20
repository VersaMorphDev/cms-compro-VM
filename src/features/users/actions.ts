"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { deriveInitials, getCurrentSession, normalizeRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import {
  isUniqueConstraintError,
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import { logActivity } from "@/lib/activity-logger";
import {
  saveAdminUserSchema,
  type AdminUserDTO,
  type SaveAdminUserInput,
} from "./schema";

async function countActiveSuperAdmins(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(adminUsers)
    .where(
      and(
        eq(adminUsers.role, "SUPER_ADMIN"),
        eq(adminUsers.isActive, true)
      )
    );
  return Number(rows[0]?.count ?? 0);
}

function toDto(row: {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminUserDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: normalizeRole(row.role),
    avatarInitials: row.avatarInitials,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function saveAdminUserAction(
  rawInput: SaveAdminUserInput
): Promise<ActionResult<AdminUserDTO>> {
  return safeAction(
    {
      requireAuth: true,
      allowedRoles: ["SUPER_ADMIN"],
      friendlyMessage: "Gagal menyimpan akun admin.",
      payload: {
        id: rawInput.id,
        name: rawInput.name,
        email: rawInput.email,
        role: rawInput.role,
        isActive: rawInput.isActive,
      },
      successMessage: rawInput.id
        ? "Data akun admin berhasil diperbarui."
        : "Akun admin baru berhasil dibuat.",
    },
    async () => {
      const session = await getCurrentSession();
      if (!session) {
        throw new UserFacingError("Sesi Anda telah berakhir. Silakan login kembali.");
      }

      const parsed = saveAdminUserSchema.parse(rawInput);
      const normalizedEmail = parsed.email.toLowerCase();
      const initials = (
        parsed.avatarInitials?.trim() || deriveInitials(parsed.name)
      )
        .slice(0, 4)
        .toUpperCase();
      const now = new Date();

      try {
        if (parsed.id) {
          const existingRows = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.id, parsed.id))
            .limit(1);
          const existing = existingRows[0];
          if (!existing) {
            throw new UserFacingError("Akun admin tidak ditemukan.");
          }

          if (parsed.id === session.id && !parsed.isActive) {
            throw new UserFacingError(
              "Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang login."
            );
          }

          if (parsed.id === session.id && parsed.role !== "SUPER_ADMIN") {
            throw new UserFacingError(
              "Anda tidak dapat menurunkan role SUPER_ADMIN dari akun Anda sendiri."
            );
          }

          const wasActiveSuper =
            existing.role === "SUPER_ADMIN" && existing.isActive;
          const willBeActiveSuper =
            parsed.role === "SUPER_ADMIN" && parsed.isActive;
          if (wasActiveSuper && !willBeActiveSuper) {
            const activeSupers = await countActiveSuperAdmins();
            if (activeSupers <= 1) {
              throw new UserFacingError(
                "Sistem harus memiliki minimal satu Super Admin yang aktif."
              );
            }
          }

          const dup = await db
            .select({ id: adminUsers.id })
            .from(adminUsers)
            .where(
              and(
                eq(adminUsers.email, normalizedEmail),
                ne(adminUsers.id, parsed.id)
              )
            )
            .limit(1);
          if (dup[0]) {
            throw new UserFacingError("Email sudah digunakan oleh akun admin lain.", {
              email: ["Email sudah terdaftar."],
            });
          }

          const trimmedPwd = parsed.password?.trim();
          const updateData: {
            name: string;
            email: string;
            role: string;
            avatarInitials: string;
            isActive: boolean;
            updatedAt: Date;
            passwordHash?: string;
          } = {
            name: parsed.name,
            email: normalizedEmail,
            role: parsed.role,
            avatarInitials: initials,
            isActive: parsed.isActive,
            updatedAt: now,
          };

          if (trimmedPwd) {
            updateData.passwordHash = hashPassword(trimmedPwd);
          }

          const [updated] = await db
            .update(adminUsers)
            .set(updateData)
            .where(eq(adminUsers.id, parsed.id))
            .returning({
              id: adminUsers.id,
              name: adminUsers.name,
              email: adminUsers.email,
              role: adminUsers.role,
              avatarInitials: adminUsers.avatarInitials,
              isActive: adminUsers.isActive,
              createdAt: adminUsers.createdAt,
              updatedAt: adminUsers.updatedAt,
            });

          await logActivity({
            action: "UPDATE",
            module: "USER",
            targetId: String(updated.id),
            targetTitle: updated.email,
            changes: {
              before: {
                name: existing.name,
                email: existing.email,
                role: existing.role,
                isActive: existing.isActive,
              },
              after: {
                name: updated.name,
                email: updated.email,
                role: updated.role,
                isActive: updated.isActive,
                passwordReset: Boolean(trimmedPwd),
              },
            },
          });

          revalidatePath("/company/users");
          revalidatePath("/");
          return toDto(updated);
        }

        // Create new admin user
        const existingEmail = await db
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .where(eq(adminUsers.email, normalizedEmail))
          .limit(1);
        if (existingEmail[0]) {
          throw new UserFacingError("Email sudah digunakan oleh akun admin lain.", {
            email: ["Email sudah terdaftar."],
          });
        }

        const [created] = await db
          .insert(adminUsers)
          .values({
            name: parsed.name,
            email: normalizedEmail,
            passwordHash: hashPassword(parsed.password!.trim()),
            role: parsed.role,
            avatarInitials: initials,
            isActive: parsed.isActive,
            createdAt: now,
            updatedAt: now,
          })
          .returning({
            id: adminUsers.id,
            name: adminUsers.name,
            email: adminUsers.email,
            role: adminUsers.role,
            avatarInitials: adminUsers.avatarInitials,
            isActive: adminUsers.isActive,
            createdAt: adminUsers.createdAt,
            updatedAt: adminUsers.updatedAt,
          });

        await logActivity({
          action: "CREATE",
          module: "USER",
          targetId: String(created.id),
          targetTitle: created.email,
          changes: {
            after: {
              name: created.name,
              email: created.email,
              role: created.role,
              isActive: created.isActive,
            },
          },
        });

        revalidatePath("/company/users");
        revalidatePath("/");
        return toDto(created);
      } catch (err) {
        if (isUniqueConstraintError(err)) {
          throw new UserFacingError("Email sudah digunakan oleh akun admin lain.", {
            email: ["Email sudah terdaftar."],
          });
        }
        throw err;
      }
    }
  );
}

export async function toggleAdminUserActiveAction(
  id: number
): Promise<ActionResult<AdminUserDTO>> {
  return safeAction(
    {
      requireAuth: true,
      allowedRoles: ["SUPER_ADMIN"],
      friendlyMessage: "Gagal mengubah status aktif akun admin.",
      payload: { id },
      successMessage: "Status akun admin berhasil diperbarui.",
    },
    async () => {
      const session = await getCurrentSession();
      if (!session) {
        throw new UserFacingError("Sesi Anda telah berakhir. Silakan login kembali.");
      }

      const rows = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, id))
        .limit(1);
      const existing = rows[0];
      if (!existing) {
        throw new UserFacingError("Akun admin tidak ditemukan.");
      }

      if (id === session.id && existing.isActive) {
        throw new UserFacingError(
          "Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang login."
        );
      }

      const nextActive = !existing.isActive;
      if (existing.role === "SUPER_ADMIN" && existing.isActive && !nextActive) {
        const activeSupers = await countActiveSuperAdmins();
        if (activeSupers <= 1) {
          throw new UserFacingError(
            "Sistem harus memiliki minimal satu Super Admin yang aktif."
          );
        }
      }

      const [updated] = await db
        .update(adminUsers)
        .set({ isActive: nextActive, updatedAt: new Date() })
        .where(eq(adminUsers.id, id))
        .returning({
          id: adminUsers.id,
          name: adminUsers.name,
          email: adminUsers.email,
          role: adminUsers.role,
          avatarInitials: adminUsers.avatarInitials,
          isActive: adminUsers.isActive,
          createdAt: adminUsers.createdAt,
          updatedAt: adminUsers.updatedAt,
        });

      await logActivity({
        action: "STATUS_CHANGE",
        module: "USER",
        targetId: String(updated.id),
        targetTitle: updated.email,
        changes: {
          before: { isActive: existing.isActive },
          after: { isActive: updated.isActive },
        },
      });

      revalidatePath("/company/users");
      return toDto(updated);
    }
  );
}

export async function deleteAdminUserAction(
  id: number
): Promise<ActionResult<{ deletedId: number }>> {
  return safeAction(
    {
      requireAuth: true,
      allowedRoles: ["SUPER_ADMIN"],
      friendlyMessage: "Gagal menghapus akun admin.",
      payload: { id },
      successMessage: "Akun admin berhasil dihapus.",
    },
    async () => {
      const session = await getCurrentSession();
      if (!session) {
        throw new UserFacingError("Sesi Anda telah berakhir. Silakan login kembali.");
      }

      if (id === session.id) {
        throw new UserFacingError(
          "Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan."
        );
      }

      const rows = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, id))
        .limit(1);
      const existing = rows[0];
      if (!existing) {
        throw new UserFacingError("Akun admin tidak ditemukan.");
      }

      if (existing.role === "SUPER_ADMIN" && existing.isActive) {
        const activeSupers = await countActiveSuperAdmins();
        if (activeSupers <= 1) {
          throw new UserFacingError(
            "Tidak dapat menghapus Super Admin aktif terakhir."
          );
        }
      }

      await db.delete(adminUsers).where(eq(adminUsers.id, id));

      await logActivity({
        action: "DELETE",
        module: "USER",
        targetId: String(existing.id),
        targetTitle: existing.email,
        changes: {
          before: {
            name: existing.name,
            email: existing.email,
            role: existing.role,
            isActive: existing.isActive,
          },
        },
      });

      revalidatePath("/company/users");
      revalidatePath("/");
      return { deletedId: id };
    }
  );
}
