import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: text("actor_id"),
  actorName: text("actor_name").notNull().default("System"),
  actorRole: text("actor_role").notNull().default("SUPER_ADMIN"),
  action: text("action").notNull(), // CREATE | UPDATE | DELETE | PUBLISH | STATUS_CHANGE | LOGIN | REVALIDATE | RESOLVE_ERROR
  module: text("module").notNull(), // BLOG | PROJECT | SERVICE | PRICING | PARTNER | CAREER | TEAM | FAQ | LEAD | AFFILIATE | APPLICANT | SETTINGS | SYSTEM
  targetId: text("target_id"),
  targetTitle: text("target_title"),
  changes: text("changes", { mode: "json" })
    .$type<{ before?: unknown; after?: unknown }>()
    .default({}),
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const systemErrorLogs = sqliteTable("system_error_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referenceCode: text("reference_code").notNull().unique(), // e.g. ERR-2026-A1B2
  source: text("source").notNull(), // CMS_SERVER_ACTION | CMS_API | COMPRO_FRONTEND | COMPRO_API
  severity: text("severity").notNull().default("ERROR"), // WARN | ERROR | FATAL
  friendlyMessage: text("friendly_message").notNull(),
  technicalMessage: text("technical_message").notNull(),
  stackTrace: text("stack_trace"),
  requestUrl: text("request_url"),
  payloadSnapshot: text("payload_snapshot", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({}),
  userAgent: text("user_agent"),
  actorName: text("actor_name"),
  isResolved: integer("is_resolved", { mode: "boolean" })
    .notNull()
    .default(false),
  resolvedBy: text("resolved_by"),
  resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
