import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, recordSystemError } from "@/lib/safe-action";
import type { ErrorSeverity, ErrorSource } from "@/features/monitoring/types";

const telemetrySchema = z.object({
  message: z.string().min(1, "Error message is required").max(2000),
  level: z.string().optional(),
  severity: z.enum(["WARN", "ERROR", "FATAL"]).optional(),
  source: z
    .enum(["CMS_SERVER_ACTION", "CMS_API", "COMPRO_FRONTEND", "COMPRO_API"])
    .optional(),
  friendlyMessage: z.string().max(500).optional(),
  url: z.string().max(500).optional(),
  userAgent: z.string().max(500).optional(),
  stack: z.string().max(8000).optional(),
  digest: z.string().max(200).optional(),
  context: z.record(z.unknown()).optional(),
  actorName: z.string().max(120).optional(),
});

function mapSeverity(level?: string, explicit?: ErrorSeverity): ErrorSeverity {
  if (explicit) return explicit;
  const norm = level?.toUpperCase();
  if (norm === "FATAL") return "FATAL";
  if (norm === "WARN" || norm === "INFO" || norm === "DEBUG") return "WARN";
  return "ERROR";
}

export async function POST(req: Request) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
    const parsed = telemetrySchema.parse(rawBody);

    const source: ErrorSource = parsed.source ?? "COMPRO_FRONTEND";
    const severity = mapSeverity(parsed.level, parsed.severity);
    const headerUserAgent = req.headers.get("user-agent") ?? undefined;

    const syntheticError = new Error(parsed.message);
    if (parsed.stack) {
      syntheticError.stack = parsed.stack;
    }

    const referenceCode = await recordSystemError({
      source,
      severity,
      friendlyMessage:
        parsed.friendlyMessage ??
        "Terjadi kendala sementara pada aplikasi. Tim teknis kami telah menerima laporan.",
      error: syntheticError,
      requestUrl: parsed.url,
      payload: {
        ...(parsed.context ?? {}),
        ...(parsed.digest ? { digest: parsed.digest } : {}),
      },
      userAgent: parsed.userAgent ?? headerUserAgent,
      actorName: parsed.actorName ?? (source.startsWith("COMPRO") ? "Public Visitor" : "Admin"),
    });

    return NextResponse.json(
      {
        ok: true,
        referenceCode,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, {
      source: "CMS_API",
      friendlyMessage: "Gagal mencatat laporan telemetry error.",
      requestUrl: req.url,
      payload: rawBody,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
  }
}
