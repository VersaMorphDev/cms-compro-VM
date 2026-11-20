import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { adminUsers } from "@/db/schema";
import {
  ADMIN_ROLES,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  signSessionToken,
  verifySessionToken,
  type AdminRole,
} from "./session-token";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  avatarInitials: string;
  isActive: boolean;
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_EDITOR: "Content Editor",
  HR_RECRUITER: "HR Recruiter",
  SALES_BD: "Sales & BD",
};

export function normalizeRole(role: string): AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole)
    ? (role as AdminRole)
    : "CONTENT_EDITOR";
}

export function deriveInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "VM";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function getCurrentSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const payload = await verifySessionToken(rawToken);
    if (!payload) return null;

    if (!isDatabaseConfigured) {
      return {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        avatarInitials: payload.avatarInitials,
        isActive: true,
      };
    }

    const rows = await db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        role: adminUsers.role,
        avatarInitials: adminUsers.avatarInitials,
        isActive: adminUsers.isActive,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, payload.userId))
      .limit(1);

    const user = rows[0];
    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      avatarInitials: user.avatarInitials || deriveInitials(user.name),
      isActive: user.isActive,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: AuthUser): Promise<void> {
  const token = await signSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarInitials: user.avatarInitials,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 0,
  });
}
