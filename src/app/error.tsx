"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconRefresh, IconHome } from "@tabler/icons-react";

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;

    fetch("/api/v1/telemetry/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Unhandled CMS client/server boundary error",
        stack: error.stack,
        digest: error.digest,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        source: "CMS_SERVER_ACTION",
        severity: "FATAL",
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.referenceCode) {
          setReferenceCode(data.referenceCode);
        }
      })
      .catch(() => {
        // silent fallback
      });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-[#14171E] border border-white/10 rounded-[28px] p-8 text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <IconAlertTriangle size={26} />
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-bold text-2xl text-white">
            Halaman Sedang Mengalami Kendala
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Terjadi kendala sementara saat memuat halaman ini. Tim teknis kami
            telah menerima laporan otomatis dan sedang menanganinya.
          </p>
        </div>

        {referenceCode && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C2029] border border-white/10 text-xs font-mono text-slate-200">
            <span className="text-slate-400">Kode Referensi:</span>
            <span className="text-[#86FF00] font-semibold">{referenceCode}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer"
          >
            <IconRefresh size={16} />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C2029] border border-white/15 hover:border-white/30 text-white text-xs font-semibold transition-colors"
          >
            <IconHome size={16} />
            <span>Kembali ke Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
