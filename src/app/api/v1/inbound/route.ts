import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import {
  affiliateReferrals,
  affiliates,
  jobApplicants,
  leads,
} from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import { handleApiError } from "@/lib/safe-action";

const inboundSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email(),
  phone: z.string().trim().max(60).optional().nullable(),
  company: z.string().trim().max(180).optional().nullable(),
  website: z.string().trim().max(300).optional().nullable(),
  service: z.string().trim().max(150).optional().nullable(),
  source: z.string().trim().max(80).default("contact"),
  partnerType: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().max(4000).optional().nullable(),
  subscribeNewsletter: z.boolean().optional().default(false),
  // Affiliate registration & referral
  generatedAffId: z.string().trim().max(40).optional().nullable(),
  affiliateId: z.string().trim().max(40).optional().nullable(),
  affiliateName: z.string().trim().max(160).optional().nullable(),
  clientPicTitle: z.string().trim().max(120).optional().nullable(),
  companyIndustry: z.string().trim().max(120).optional().nullable(),
  companyScale: z.string().trim().max(120).optional().nullable(),
  platforms: z.string().trim().max(200).optional().nullable(),
  budget: z.string().trim().max(120).optional().nullable(),
  timeline: z.string().trim().max(120).optional().nullable(),
  techStack: z.string().trim().max(300).optional().nullable(),
  preferredChannel: z.string().trim().max(120).optional().nullable(),
  bestTime: z.string().trim().max(120).optional().nullable(),
  // Career application
  position: z.string().trim().max(160).optional().nullable(),
  linkedin: z.string().trim().max(300).optional().nullable(),
  portfolioUrl: z.string().trim().max(300).optional().nullable(),
  expectedSalary: z.string().trim().max(100).optional().nullable(),
  startDate: z.string().trim().max(100).optional().nullable(),
  workAuth: z.string().trim().max(100).optional().nullable(),
  resumeFileName: z.string().trim().max(260).optional().nullable(),
  resumeUrl: z.string().trim().max(400).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

function isAuthorized(req: Request): boolean {
  const configuredKey = process.env.CMS_API_KEY?.trim();
  if (!configuredKey) return true;
  return req.headers.get("x-cms-api-key") === configuredKey;
}

function generateAffCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return `VM-AFF-${out}`;
}

export async function POST(req: Request) {
  let rawBody: unknown;
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized CMS API key." },
        { status: 401 }
      );
    }

    rawBody = await req.json();
    const parsed = inboundSchema.parse(rawBody);
    const source = parsed.source || "contact";

    if (source === "affiliate-apply") {
      const code = parsed.generatedAffId?.trim() || generateAffCode();
      const [inserted] = await db
        .insert(affiliates)
        .values({
          affiliateCode: code,
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone ?? null,
          company: parsed.company ?? null,
          status: "ACTIVE",
        })
        .onConflictDoNothing({ target: affiliates.affiliateCode })
        .returning();

      await logActivity({
        actorName: "Compro Website",
        actorRole: "SYSTEM",
        action: "CREATE",
        module: "AFFILIATE",
        targetId: code,
        targetTitle: `${parsed.name} (${code})`,
        changes: { after: { email: parsed.email, source } },
      });

      return NextResponse.json(
        { ok: true, kind: "affiliate", id: inserted?.id ?? null, affiliateCode: code },
        { status: 201 }
      );
    }

    if (source === "affiliate-project-submit") {
      const [inserted] = await db
        .insert(affiliateReferrals)
        .values({
          affiliateCode: parsed.affiliateId?.trim() || "UNASSIGNED",
          affiliateName: parsed.affiliateName ?? null,
          clientCompany: parsed.company?.trim() || parsed.name,
          clientPicName: parsed.name,
          clientPicTitle: parsed.clientPicTitle ?? null,
          clientEmail: parsed.email,
          companyIndustry: parsed.companyIndustry ?? null,
          companyScale: parsed.companyScale ?? null,
          platforms: parsed.platforms ?? null,
          budget: parsed.budget ?? null,
          timeline: parsed.timeline ?? null,
          techStack: parsed.techStack ?? null,
          preferredChannel: parsed.preferredChannel ?? null,
          bestTime: parsed.bestTime ?? null,
          message: parsed.message ?? null,
          status: "SUBMITTED",
        })
        .returning();

      await logActivity({
        actorName: "Compro Website",
        actorRole: "SYSTEM",
        action: "CREATE",
        module: "AFFILIATE",
        targetId: `ref-${inserted.id}`,
        targetTitle: `${inserted.clientCompany} (via ${inserted.affiliateCode})`,
        changes: { after: { budget: inserted.budget, source } },
      });

      return NextResponse.json(
        { ok: true, kind: "referral", id: inserted.id },
        { status: 201 }
      );
    }

    if (
      ["careers-apply", "careers-open-application", "open-apply", "job-apply"].includes(
        source
      )
    ) {
      const [inserted] = await db
        .insert(jobApplicants)
        .values({
          position: parsed.position?.trim() || "General Application",
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone ?? null,
          linkedin: parsed.linkedin ?? null,
          portfolioUrl: parsed.portfolioUrl ?? null,
          expectedSalary: parsed.expectedSalary ?? null,
          startDate: parsed.startDate ?? null,
          workAuth: parsed.workAuth ?? null,
          resumeFileName: parsed.resumeFileName ?? null,
          resumeUrl: parsed.resumeUrl ?? null,
          message: parsed.message ?? null,
          status: "APPLIED",
        })
        .returning();

      await logActivity({
        actorName: "Compro Website",
        actorRole: "SYSTEM",
        action: "CREATE",
        module: "APPLICANT",
        targetId: `app-${inserted.id}`,
        targetTitle: `${inserted.name} · ${inserted.position}`,
        changes: { after: { email: inserted.email, source } },
      });

      return NextResponse.json(
        { ok: true, kind: "applicant", id: inserted.id },
        { status: 201 }
      );
    }

    const [inserted] = await db
      .insert(leads)
      .values({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone ?? null,
        company: parsed.company ?? null,
        website: parsed.website ?? null,
        service: parsed.service ?? null,
        source,
        partnerType: parsed.partnerType ?? null,
        message: parsed.message ?? null,
        subscribeNewsletter: parsed.subscribeNewsletter,
        metadata: parsed.metadata ?? {},
        status: "NEW",
      })
      .returning();

    await logActivity({
      actorName: "Compro Website",
      actorRole: "SYSTEM",
      action: "CREATE",
      module: "LEAD",
      targetId: `lead-${inserted.id}`,
      targetTitle: `${inserted.name}${inserted.company ? ` (${inserted.company})` : ""}`,
      changes: { after: { source, service: inserted.service } },
    });

    return NextResponse.json(
      { ok: true, kind: "lead", id: inserted.id },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, {
      source: "CMS_API",
      friendlyMessage: "Gagal menyimpan data inbound dari website.",
      requestUrl: req.url,
      payload: rawBody,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
  }
}
