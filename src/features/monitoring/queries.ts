import { desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { activityLogs, systemErrorLogs } from "@/db/schema";
import {
  getFallbackActivities,
  getFallbackErrors,
} from "./store-fallback";
import type {
  ActivityLogDTO,
  MonitoringSummary,
  SystemErrorLogDTO,
} from "./types";

const CONTENT_MODULES = new Set([
  "BLOG",
  "PROJECT",
  "SERVICE",
  "PRICING",
  "PARTNER",
  "CAREER",
  "TEAM",
  "FAQ",
  "SETTINGS",
]);

const CRM_MODULES = new Set(["LEAD", "AFFILIATE", "APPLICANT"]);

export async function getActivityLogs(limit = 50): Promise<{
  items: ActivityLogDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(activityLogs)
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          id: r.id,
          actorId: r.actorId,
          actorName: r.actorName,
          actorRole: r.actorRole,
          action: r.action,
          module: r.module,
          targetId: r.targetId,
          targetTitle: r.targetTitle,
          changes: (r.changes as { before?: unknown; after?: unknown } | null) ?? {},
          ipAddress: r.ipAddress,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[MonitoringQueries] Failed querying activity_logs, using fallback:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackActivities(limit),
  };
}

export async function getSystemErrorLogs(limit = 50): Promise<{
  items: SystemErrorLogDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(systemErrorLogs)
        .orderBy(desc(systemErrorLogs.createdAt))
        .limit(limit);

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          id: r.id,
          referenceCode: r.referenceCode,
          source: r.source,
          severity: r.severity,
          friendlyMessage: r.friendlyMessage,
          technicalMessage: r.technicalMessage,
          stackTrace: r.stackTrace,
          requestUrl: r.requestUrl,
          payloadSnapshot:
            (r.payloadSnapshot as Record<string, unknown> | null) ?? {},
          userAgent: r.userAgent,
          actorName: r.actorName,
          isResolved: r.isResolved,
          resolvedBy: r.resolvedBy,
          resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[MonitoringQueries] Failed querying system_error_logs, using fallback:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackErrors(limit),
  };
}

export function getMonitoringSummary(
  activities: ActivityLogDTO[],
  errors: SystemErrorLogDTO[],
  storageMode: "database" | "memory"
): MonitoringSummary {
  const cutoff24h = Date.now() - 24 * 3600_000;
  const activeModules = new Set(activities.map((a) => a.module));

  let activitiesLast24h = 0;
  let contentOpsCount = 0;
  let crmOpsCount = 0;
  let systemOpsCount = 0;

  for (const act of activities) {
    if (new Date(act.createdAt).getTime() >= cutoff24h) {
      activitiesLast24h++;
    }
    if (CONTENT_MODULES.has(act.module)) {
      contentOpsCount++;
    } else if (CRM_MODULES.has(act.module)) {
      crmOpsCount++;
    } else {
      systemOpsCount++;
    }
  }

  let unresolvedErrors = 0;
  let fatalErrors = 0;
  let resolvedErrors = 0;
  let cmsActionErrors = 0;
  let cmsApiErrors = 0;
  let comproErrors = 0;

  for (const err of errors) {
    if (err.isResolved) {
      resolvedErrors++;
    } else {
      unresolvedErrors++;
    }
    if (err.severity === "FATAL") {
      fatalErrors++;
    }
    if (err.source === "CMS_SERVER_ACTION") {
      cmsActionErrors++;
    } else if (err.source === "CMS_API") {
      cmsApiErrors++;
    } else {
      comproErrors++;
    }
  }

  return {
    totalActivities: activities.length,
    activitiesLast24h,
    activeModulesCount: activeModules.size,
    contentOpsCount,
    crmOpsCount,
    systemOpsCount,
    totalErrors: errors.length,
    unresolvedErrors,
    fatalErrors,
    resolvedErrors,
    cmsActionErrors,
    cmsApiErrors,
    comproErrors,
    storageMode,
  };
}
