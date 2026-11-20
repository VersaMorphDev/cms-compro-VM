import { logActivity } from "./activity-logger";
import { COMPRO_REVALIDATE_TAGS } from "./revalidate-tags";

export { COMPRO_REVALIDATE_TAGS };

export interface RevalidationResult {
  ok: boolean;
  status: number;
  latencyMs: number;
  message: string;
  targetUrl: string;
  tags: string[];
}

export async function triggerComproRevalidation(
  tags: string[] = ["cms-all"],
  paths: string[] = []
): Promise<RevalidationResult> {
  const comproUrl = (process.env.COMPRO_URL?.trim() || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const secret = process.env.COMPRO_REVALIDATE_SECRET?.trim() || "";
  const targetUrl = `${comproUrl}/api/revalidate`;
  const startedAt = Date.now();

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-revalidate-secret": secret } : {}),
      },
      body: JSON.stringify({ tags, paths }),
      signal: AbortSignal.timeout(5000),
    });

    const latencyMs = Date.now() - startedAt;
    const ok = res.ok;

    await logActivity({
      action: "REVALIDATE",
      module: "SYSTEM",
      targetId: tags.join(","),
      targetTitle: `Compro ISR Sync (${tags.join(", ")})`,
      changes: { after: { ok, status: res.status, latencyMs, targetUrl } },
    });

    return {
      ok,
      status: res.status,
      latencyMs,
      targetUrl,
      tags,
      message: ok
        ? `Cache Compro berhasil disinkronkan (${latencyMs}ms).`
        : `Endpoint Compro merespons HTTP ${res.status}. Pastikan COMPRO_URL dan COMPRO_REVALIDATE_SECRET sesuai.`,
    };
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const reason = err instanceof Error ? err.message : "Network unreachable";

    await logActivity({
      action: "REVALIDATE",
      module: "SYSTEM",
      targetId: tags.join(","),
      targetTitle: `Compro ISR Sync Pending (${comproUrl})`,
      changes: { after: { ok: false, reason, latencyMs } },
    });

    return {
      ok: false,
      status: 0,
      latencyMs,
      targetUrl,
      tags,
      message: `Compro frontend (${comproUrl}) belum aktif atau tidak terjangkau saat ini.`,
    };
  }
}
