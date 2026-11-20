import { db, isDatabaseConfigured } from "@/db";
import { activityLogs } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { addFallbackActivity } from "@/features/monitoring/store-fallback";
import type { ActivityAction, ActivityModule } from "@/features/monitoring/types";

export interface LogActivityInput {
  actorId?: string | null;
  actorName?: string;
  actorRole?: string;
  action: ActivityAction | string;
  module: ActivityModule | string;
  targetId?: string | null;
  targetTitle?: string | null;
  changes?: { before?: unknown; after?: unknown };
  ipAddress?: string | null;
}

/**
 * Records an admin or system activity entry to `activity_logs` (with safe in-memory fallback).
 * Automatically resolves the active logged-in session actor when actor fields are omitted.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  const needsSessionLookup =
    !input.actorName?.trim() || !input.actorRole?.trim() || input.actorId === undefined;
  const session = needsSessionLookup
    ? await getCurrentSession().catch(() => null)
    : null;

  const actorId = input.actorId ?? (session ? String(session.id) : null);
  const actorName = input.actorName?.trim() || session?.name || "System";
  const actorRole = input.actorRole?.trim() || session?.role || "SYSTEM";
  const changes = input.changes ?? {};

  if (isDatabaseConfigured) {
    try {
      await db.insert(activityLogs).values({
        actorId,
        actorName,
        actorRole,
        action: input.action,
        module: input.module,
        targetId: input.targetId ?? null,
        targetTitle: input.targetTitle ?? null,
        changes,
        ipAddress: input.ipAddress ?? null,
      });
      return;
    } catch (err) {
      console.warn(
        "[ActivityLogger] Falling back to memory store:",
        err instanceof Error ? err.message : "Unknown DB error"
      );
    }
  }

  addFallbackActivity({
    actorId,
    actorName,
    actorRole,
    action: input.action,
    module: input.module,
    targetId: input.targetId ?? null,
    targetTitle: input.targetTitle ?? null,
    changes,
    ipAddress: input.ipAddress ?? null,
  });
}
