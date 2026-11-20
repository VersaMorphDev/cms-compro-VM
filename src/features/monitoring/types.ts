export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "STATUS_CHANGE"
  | "LOGIN"
  | "LOGOUT"
  | "REVALIDATE"
  | "RESOLVE_ERROR";

export type ActivityModule =
  | "BLOG"
  | "PROJECT"
  | "SERVICE"
  | "PRICING"
  | "PARTNER"
  | "CAREER"
  | "TEAM"
  | "FAQ"
  | "LEAD"
  | "AFFILIATE"
  | "APPLICANT"
  | "SETTINGS"
  | "AUTH"
  | "USER"
  | "SYSTEM";

export type ErrorSource =
  | "CMS_SERVER_ACTION"
  | "CMS_API"
  | "COMPRO_FRONTEND"
  | "COMPRO_API";

export type ErrorSeverity = "WARN" | "ERROR" | "FATAL";

export interface ActivityLogDTO {
  id: number;
  actorId: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  module: string;
  targetId: string | null;
  targetTitle: string | null;
  changes: { before?: unknown; after?: unknown } | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface SystemErrorLogDTO {
  id: number;
  referenceCode: string;
  source: string;
  severity: string;
  friendlyMessage: string;
  technicalMessage: string;
  stackTrace: string | null;
  requestUrl: string | null;
  payloadSnapshot: Record<string, unknown> | null;
  userAgent: string | null;
  actorName: string | null;
  isResolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface MonitoringSummary {
  totalActivities: number;
  activitiesLast24h: number;
  activeModulesCount: number;
  contentOpsCount: number;
  crmOpsCount: number;
  systemOpsCount: number;
  totalErrors: number;
  unresolvedErrors: number;
  fatalErrors: number;
  resolvedErrors: number;
  cmsActionErrors: number;
  cmsApiErrors: number;
  comproErrors: number;
  storageMode: "database" | "memory";
}
