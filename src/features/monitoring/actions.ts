"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { systemErrorLogs } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import { toggleFallbackErrorResolved } from "./store-fallback";
import type { SystemErrorLogDTO } from "./types";

const resolveSchema = z.object({
  id: z.number().int().positive(),
  resolved: z.boolean(),
});

export async function resolveErrorLogAction(
  id: number,
  resolved: boolean
): Promise<ActionResult<{ id: number; isResolved: boolean; referenceCode: string }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal memperbarui status laporan error.",
      source: "CMS_SERVER_ACTION",
      actorName: "Sahri Ramadan",
      requestUrl: "/monitoring/errors",
      payload: { id, resolved },
      successMessage: resolved
        ? "Laporan error berhasil ditandai selesai."
        : "Laporan error berhasil dibuka kembali.",
    },
    async () => {
      const parsed = resolveSchema.parse({ id, resolved });
      const actorName = "Sahri Ramadan";
      let updatedRefCode = `ERR-${parsed.id}`;

      if (isDatabaseConfigured) {
        try {
          const [updated] = await db
            .update(systemErrorLogs)
            .set({
              isResolved: parsed.resolved,
              resolvedBy: parsed.resolved ? actorName : null,
              resolvedAt: parsed.resolved ? new Date() : null,
            })
            .where(eq(systemErrorLogs.id, parsed.id))
            .returning({
              id: systemErrorLogs.id,
              referenceCode: systemErrorLogs.referenceCode,
            });

          if (!updated) {
            throw new UserFacingError("Laporan error tidak ditemukan.");
          }
          updatedRefCode = updated.referenceCode;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const fallbackUpdated: SystemErrorLogDTO | null =
            toggleFallbackErrorResolved(parsed.id, parsed.resolved, actorName);
          if (!fallbackUpdated) {
            throw new UserFacingError("Laporan error tidak ditemukan.");
          }
          updatedRefCode = fallbackUpdated.referenceCode;
        }
      } else {
        const fallbackUpdated = toggleFallbackErrorResolved(
          parsed.id,
          parsed.resolved,
          actorName
        );
        if (!fallbackUpdated) {
          throw new UserFacingError("Laporan error tidak ditemukan.");
        }
        updatedRefCode = fallbackUpdated.referenceCode;
      }

      await logActivity({
        actorName,
        actorRole: "SUPER_ADMIN",
        action: "RESOLVE_ERROR",
        module: "SYSTEM",
        targetId: String(parsed.id),
        targetTitle: parsed.resolved
          ? `Resolved ${updatedRefCode}`
          : `Reopened ${updatedRefCode}`,
        changes: {
          before: { isResolved: !parsed.resolved },
          after: { isResolved: parsed.resolved },
        },
      });

      revalidatePath("/monitoring");
      revalidatePath("/monitoring/errors");

      return {
        id: parsed.id,
        isResolved: parsed.resolved,
        referenceCode: updatedRefCode,
      };
    }
  );
}

export async function simulateTestErrorAction(): Promise<ActionResult<never>> {
  const result = await safeAction<never>(
    {
      friendlyMessage:
        "Terjadi gangguan sementara saat memproses simulasi. Silakan coba beberapa saat lagi.",
      source: "CMS_SERVER_ACTION",
      severity: "ERROR",
      actorName: "Sahri Ramadan",
      requestUrl: "/monitoring/errors",
      payload: {
        testMode: true,
        module: "ERROR_GUARD_SIMULATION",
        secretToken: "vm-live-secret-token-should-be-redacted",
      },
    },
    async () => {
      throw new Error(
        "Simulated PostgreSQL connection timeout (ECONNREFUSED 127.0.0.1:5432)"
      );
    }
  );

  revalidatePath("/monitoring/errors");
  return result;
}
