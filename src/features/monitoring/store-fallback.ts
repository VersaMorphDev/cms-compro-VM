import type { ActivityLogDTO, SystemErrorLogDTO } from "./types";

interface MonitoringFallbackStore {
  activities: ActivityLogDTO[];
  errors: SystemErrorLogDTO[];
  nextActivityId: number;
  nextErrorId: number;
}

const globalForMonitoring = globalThis as unknown as {
  __vmMonitoringStore?: MonitoringFallbackStore;
};

function createInitialStore(): MonitoringFallbackStore {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

  return {
    nextActivityId: 6,
    nextErrorId: 4,
    activities: [
      {
        id: 5,
        actorId: "1",
        actorName: "Sahri Ramadan",
        actorRole: "SUPER_ADMIN",
        action: "PUBLISH",
        module: "BLOG",
        targetId: "securing-web-apps-2026",
        targetTitle: "Securing Web Applications: Best Practices for 2026",
        changes: {
          before: { status: "DRAFT" },
          after: { status: "PUBLISHED", publishedDate: "Jul 10, 2026" },
        },
        ipAddress: "103.145.22.10",
        createdAt: hoursAgo(1.5),
      },
      {
        id: 4,
        actorId: "2",
        actorName: "Andika Noor",
        actorRole: "SUPER_ADMIN",
        action: "UPDATE",
        module: "PRICING",
        targetId: "tier-growth",
        targetTitle: "Growth Tier Package",
        changes: {
          before: { price: "IDR 4.5M", highlighted: false },
          after: { price: "IDR 5M", highlighted: true },
        },
        ipAddress: "103.145.22.14",
        createdAt: hoursAgo(4),
      },
      {
        id: 3,
        actorId: "3",
        actorName: "Nadia Putri",
        actorRole: "SALES_BD",
        action: "STATUS_CHANGE",
        module: "LEAD",
        targetId: "lead-402",
        targetTitle: "PT Nusantara Logistics - Supply Chain RFP",
        changes: {
          before: { status: "NEW" },
          after: { status: "QUALIFIED", salesNotes: "Discovery call scheduled" },
        },
        ipAddress: "182.253.88.4",
        createdAt: hoursAgo(8),
      },
      {
        id: 2,
        actorId: "1",
        actorName: "Sahri Ramadan",
        actorRole: "SUPER_ADMIN",
        action: "REVALIDATE",
        module: "SYSTEM",
        targetId: "compro-isr",
        targetTitle: "Vercel On-Demand ISR Sync (/portfolio)",
        changes: {
          before: { cacheTag: "projects" },
          after: { revalidated: true, latencyMs: 118 },
        },
        ipAddress: "103.145.22.10",
        createdAt: hoursAgo(14),
      },
      {
        id: 1,
        actorId: null,
        actorName: "System Seeder",
        actorRole: "SYSTEM",
        action: "CREATE",
        module: "SYSTEM",
        targetId: "seed-v1",
        targetTitle: "Initial Compro Data Seed",
        changes: {
          after: { tablesSeeded: 15, status: "ok" },
        },
        ipAddress: "127.0.0.1",
        createdAt: hoursAgo(28),
      },
    ],
    errors: [
      {
        id: 3,
        referenceCode: "ERR-2026-9F2A",
        source: "COMPRO_FRONTEND",
        severity: "ERROR",
        friendlyMessage:
          "Permintaan tidak dapat diproses saat ini. Silakan coba beberapa saat lagi.",
        technicalMessage:
          "TypeError: Cannot read properties of undefined (reading 'slug') at ProjectCalculator.handleSubmit",
        stackTrace:
          "TypeError: Cannot read properties of undefined (reading 'slug')\n    at handleSubmit (src/components/ProjectCalculator.tsx:214:32)\n    at onClick (src/components/ProjectCalculator.tsx:480:14)",
        requestUrl: "https://versamorph.id/calculator",
        payloadSnapshot: {
          selectedService: "custom-software",
          calcMode: "complex",
          apiKey: "[REDACTED]",
        },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
        actorName: "Public Visitor",
        isResolved: false,
        resolvedBy: null,
        resolvedAt: null,
        createdAt: hoursAgo(2),
      },
      {
        id: 2,
        referenceCode: "ERR-2026-4C81",
        source: "CMS_API",
        severity: "FATAL",
        friendlyMessage:
          "Gagal menyinkronkan konten ke website utama. Tim teknis telah diberitahu.",
        technicalMessage:
          "FetchError: request to https://versamorph.id/api/revalidate failed, reason: connect ETIMEDOUT 76.76.21.21:443",
        stackTrace:
          "FetchError: connect ETIMEDOUT 76.76.21.21:443\n    at triggerRevalidate (src/lib/revalidate-compro.ts:24:11)\n    at POST (src/app/api/v1/content/route.ts:52:5)",
        requestUrl: "/api/v1/content",
        payloadSnapshot: {
          tag: "blog",
          revalidateSecret: "[REDACTED]",
        },
        userAgent: "Next.js Server",
        actorName: "Sahri Ramadan",
        isResolved: false,
        resolvedBy: null,
        resolvedAt: null,
        createdAt: hoursAgo(6),
      },
      {
        id: 1,
        referenceCode: "ERR-2026-1D09",
        source: "CMS_SERVER_ACTION",
        severity: "WARN",
        friendlyMessage:
          "Gagal memproses lampiran berkas. Pastikan format dan ukuran file sesuai.",
        technicalMessage:
          "PayloadTooLargeError: Multipart upload exceeded 10MB limit on career resume upload",
        stackTrace:
          "PayloadTooLargeError: exceeded 10485760 bytes\n    at parseUpload (src/app/api/v1/inbound/route.ts:88:9)",
        requestUrl: "/careers",
        payloadSnapshot: {
          position: "Senior Full-Stack Engineer",
          fileSizeBytes: 14281920,
        },
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)",
        actorName: "Public Applicant",
        isResolved: true,
        resolvedBy: "Sahri Ramadan",
        resolvedAt: hoursAgo(12),
        createdAt: hoursAgo(16),
      },
    ],
  };
}

function getStore(): MonitoringFallbackStore {
  if (!globalForMonitoring.__vmMonitoringStore) {
    globalForMonitoring.__vmMonitoringStore = createInitialStore();
  }
  return globalForMonitoring.__vmMonitoringStore;
}

export function getFallbackActivities(limit = 50): ActivityLogDTO[] {
  return [...getStore().activities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function addFallbackActivity(
  entry: Omit<ActivityLogDTO, "id" | "createdAt">
): ActivityLogDTO {
  const store = getStore();
  const created: ActivityLogDTO = {
    ...entry,
    id: store.nextActivityId++,
    createdAt: new Date().toISOString(),
  };
  store.activities.unshift(created);
  if (store.activities.length > 200) {
    store.activities.length = 200;
  }
  return created;
}

export function getFallbackErrors(limit = 50): SystemErrorLogDTO[] {
  return [...getStore().errors]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function addFallbackError(
  entry: Omit<SystemErrorLogDTO, "id" | "createdAt" | "isResolved" | "resolvedBy" | "resolvedAt">
): SystemErrorLogDTO {
  const store = getStore();
  const created: SystemErrorLogDTO = {
    ...entry,
    id: store.nextErrorId++,
    isResolved: false,
    resolvedBy: null,
    resolvedAt: null,
    createdAt: new Date().toISOString(),
  };
  store.errors.unshift(created);
  if (store.errors.length > 200) {
    store.errors.length = 200;
  }
  return created;
}

export function toggleFallbackErrorResolved(
  id: number,
  resolved: boolean,
  resolvedBy: string
): SystemErrorLogDTO | null {
  const store = getStore();
  const item = store.errors.find((e) => e.id === id);
  if (!item) return null;
  item.isResolved = resolved;
  item.resolvedBy = resolved ? resolvedBy : null;
  item.resolvedAt = resolved ? new Date().toISOString() : null;
  return { ...item };
}
