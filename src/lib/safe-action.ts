import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { systemErrorLogs } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import type { AdminRole } from "@/lib/session-token";
import { addFallbackError } from "@/features/monitoring/store-fallback";
import type { ErrorSeverity, ErrorSource } from "@/features/monitoring/types";

const SENSITIVE_KEY_REGEX =
  /password|secret|token|authorization|apikey|api_key|cookie|hash|credit/i;

const MAX_STRING_LEN = 500;
const MAX_DEPTH = 4;

export function isUniqueConstraintError(err: unknown): boolean {
  const check = (e: unknown): boolean => {
    if (!e || typeof e !== "object") return false;
    const code = String((e as { code?: unknown }).code ?? "");
    const msg = String((e as { message?: unknown }).message ?? "");
    return (
      code === "23505" ||
      code.startsWith("SQLITE_CONSTRAINT") ||
      msg.includes("UNIQUE constraint failed") ||
      msg === "DUPLICATE_SLUG" ||
      msg === "DUPLICATE_KEY" ||
      msg === "DUPLICATE_CODE"
    );
  };
  if (check(err)) return true;
  if (err && typeof err === "object" && "cause" in err) {
    return check((err as { cause?: unknown }).cause);
  }
  return false;
}

/**
 * Intentional validation / business-rule error whose message is safe
 * to display directly to the user without recording a technical incident.
 */
export class UserFacingError extends Error {
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "UserFacingError";
    this.fieldErrors = fieldErrors;
  }
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value.length > MAX_STRING_LEN
      ? `${value.slice(0, MAX_STRING_LEN)}...[truncated]`
      : value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (depth >= MAX_DEPTH) {
    return "[Max depth reached]";
  }
  if (Array.isArray(value)) {
    return value.slice(0, 25).map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(k)) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = sanitizeValue(v, depth + 1);
      }
    }
    return out;
  }
  return String(value);
}

/**
 * Recursively redacts sensitive keys and truncates long values so error snapshots
 * never store credentials, tokens, or oversized blobs.
 */
export function sanitizePayload(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") {
    return input === undefined ? {} : { value: sanitizeValue(input, 0) };
  }
  const sanitized = sanitizeValue(input, 0);
  return (typeof sanitized === "object" && sanitized !== null && !Array.isArray(sanitized)
    ? sanitized
    : { data: sanitized }) as Record<string, unknown>;
}

/**
 * Generates a human-shareable incident code, e.g. ERR-2026-A9F2.
 */
export function generateErrorRefCode(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ERR-${year}-${suffix}`;
}

function extractErrorDetails(err: unknown): {
  technicalMessage: string;
  stackTrace: string | null;
} {
  if (err instanceof Error) {
    return {
      technicalMessage: `${err.name}: ${err.message}`,
      stackTrace: err.stack ?? null,
    };
  }
  if (typeof err === "string") {
    return { technicalMessage: err, stackTrace: null };
  }
  try {
    return { technicalMessage: JSON.stringify(err), stackTrace: null };
  } catch {
    return { technicalMessage: "Unknown technical error", stackTrace: null };
  }
}

export interface RecordSystemErrorParams {
  source: ErrorSource;
  severity?: ErrorSeverity;
  friendlyMessage: string;
  error: unknown;
  requestUrl?: string;
  payload?: unknown;
  userAgent?: string;
  actorName?: string;
}

/**
 * Persists technical error details into `system_error_logs` (or memory fallback)
 * and returns a reference code for support correlation.
 */
export async function recordSystemError(
  params: RecordSystemErrorParams
): Promise<string> {
  const referenceCode = generateErrorRefCode();
  const severity: ErrorSeverity = params.severity ?? "ERROR";
  const { technicalMessage, stackTrace } = extractErrorDetails(params.error);
  const payloadSnapshot = sanitizePayload(params.payload);

  if (isDatabaseConfigured) {
    try {
      await db.insert(systemErrorLogs).values({
        referenceCode,
        source: params.source,
        severity,
        friendlyMessage: params.friendlyMessage,
        technicalMessage: technicalMessage.slice(0, 2000),
        stackTrace: stackTrace?.slice(0, 6000) ?? null,
        requestUrl: params.requestUrl?.slice(0, 500) ?? null,
        payloadSnapshot,
        userAgent: params.userAgent?.slice(0, 250) ?? null,
        actorName: params.actorName ?? null,
        isResolved: false,
      });
      return referenceCode;
    } catch (dbErr) {
      console.warn(
        `[SystemErrorLogger:${referenceCode}] DB insert failed, using memory fallback:`,
        dbErr instanceof Error ? dbErr.message : "Unknown DB error"
      );
    }
  }

  addFallbackError({
    referenceCode,
    source: params.source,
    severity,
    friendlyMessage: params.friendlyMessage,
    technicalMessage: technicalMessage.slice(0, 2000),
    stackTrace: stackTrace?.slice(0, 6000) ?? null,
    requestUrl: params.requestUrl?.slice(0, 500) ?? null,
    payloadSnapshot,
    userAgent: params.userAgent?.slice(0, 250) ?? null,
    actorName: params.actorName ?? null,
  });

  return referenceCode;
}

export type ActionResult<T> =
  | { ok: true; data: T; message?: string }
  | {
      ok: false;
      error: {
        message: string;
        referenceCode?: string;
        isValidation?: boolean;
        fieldErrors?: Record<string, string[]>;
      };
    };

export interface SafeActionOptions {
  friendlyMessage?: string;
  source?: ErrorSource;
  severity?: ErrorSeverity;
  actorName?: string;
  requestUrl?: string;
  payload?: unknown;
  successMessage?: string;
  requireAuth?: boolean;
  allowedRoles?: AdminRole[];
}

function normalizeZodFieldErrors(err: ZodError): Record<string, string[]> {
  const flattened = err.flatten().fieldErrors;
  const result: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(flattened)) {
    if (Array.isArray(val) && val.length > 0) {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Wraps Next.js Server Actions with mandatory authentication (by default)
 * so unauthenticated requests are rejected and raw runtime errors are never leaked.
 */
export async function safeAction<T>(
  options: SafeActionOptions,
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  let resolvedActorName = options.actorName;

  try {
    if (options.requireAuth !== false) {
      const session = await getCurrentSession();
      if (!session) {
        throw new UserFacingError(
          "Sesi login Anda telah berakhir atau tidak valid. Silakan login kembali untuk menyimpan perubahan."
        );
      }

      if (
        options.allowedRoles &&
        options.allowedRoles.length > 0 &&
        !options.allowedRoles.includes(session.role)
      ) {
        throw new UserFacingError(
          "Akses ditolak. Anda tidak memiliki hak akses untuk tindakan ini."
        );
      }

      resolvedActorName = resolvedActorName ?? session.name;
    }

    const data = await fn();
    return {
      ok: true,
      data,
      message: options.successMessage,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false,
        error: {
          message: "Mohon periksa kembali data yang Anda masukkan.",
          isValidation: true,
          fieldErrors: normalizeZodFieldErrors(err),
        },
      };
    }

    if (err instanceof UserFacingError) {
      return {
        ok: false,
        error: {
          message: err.message,
          isValidation: true,
          fieldErrors: err.fieldErrors,
        },
      };
    }

    const friendlyMessage =
      options.friendlyMessage ??
      "Terjadi kendala sementara pada sistem. Silakan coba beberapa saat lagi.";

    const referenceCode = await recordSystemError({
      source: options.source ?? "CMS_SERVER_ACTION",
      severity: options.severity ?? "ERROR",
      friendlyMessage,
      error: err,
      requestUrl: options.requestUrl,
      payload: options.payload,
      actorName: resolvedActorName,
    });

    console.error(
      `[${referenceCode}] Server Action failed:`,
      err instanceof Error ? err.message : err
    );

    return {
      ok: false,
      error: {
        message: `${friendlyMessage} (Ref: ${referenceCode})`,
        referenceCode,
        isValidation: false,
      },
    };
  }
}

export interface HandleApiErrorOptions {
  source?: ErrorSource;
  friendlyMessage?: string;
  requestUrl?: string;
  payload?: unknown;
  userAgent?: string;
  actorName?: string;
}

/**
 * Formats safe HTTP error responses for Route Handlers while archiving technical details.
 */
export async function handleApiError(
  err: unknown,
  options: HandleApiErrorOptions = {}
): Promise<NextResponse> {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        message: "Format data yang dikirim tidak valid.",
        fieldErrors: normalizeZodFieldErrors(err),
      },
      { status: 400 }
    );
  }

  if (err instanceof UserFacingError) {
    return NextResponse.json(
      {
        ok: false,
        message: err.message,
        fieldErrors: err.fieldErrors,
      },
      { status: 400 }
    );
  }

  const friendlyMessage =
    options.friendlyMessage ??
    "Layanan mengalami gangguan sementara. Tim teknis telah diberitahu.";

  const referenceCode = await recordSystemError({
    source: options.source ?? "CMS_API",
    severity: "ERROR",
    friendlyMessage,
    error: err,
    requestUrl: options.requestUrl,
    payload: options.payload,
    userAgent: options.userAgent,
    actorName: options.actorName,
  });

  console.error(
    `[${referenceCode}] API Route failed:`,
    err instanceof Error ? err.message : err
  );

  return NextResponse.json(
    {
      ok: false,
      message: `${friendlyMessage} (Ref: ${referenceCode})`,
      referenceCode,
    },
    { status: 500 }
  );
}
