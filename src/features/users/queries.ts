import { asc } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { normalizeRole } from "@/lib/auth";
import type { AdminUserDTO } from "./schema";

export async function getAdminUsers(): Promise<AdminUserDTO[]> {
  const rows = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      avatarInitials: adminUsers.avatarInitials,
      isActive: adminUsers.isActive,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.id));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: normalizeRole(row.role),
    avatarInitials: row.avatarInitials,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}
