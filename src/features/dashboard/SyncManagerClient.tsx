"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconRefresh } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import { COMPRO_REVALIDATE_TAGS } from "@/lib/revalidate-tags";
import { triggerManualSyncAction } from "./actions";

interface SyncStats {
  dbLabel: string;
  publishedContentCount: number;
  crmRecordsCount: number;
  unresolvedErrors: number;
  endpoints: {
    id: string;
    method: string;
    path: string;
    purpose: string;
    targetCompro: string;
    status: string;
  }[];
}

export default function SyncManagerClient({ stats }: { stats: SyncStats }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState("endpoints");
  const [selectedId, setSelectedId] = useState(stats.endpoints[0]?.id ?? "content");
  const [selectedTags, setSelectedTags] = useState<string[]>(["cms-all"]);
  const [lastSyncInfo, setLastSyncInfo] = useState<string>("Ready to sync");

  const selectedEndpoint =
    stats.endpoints.find((e) => e.id === selectedId) ?? stats.endpoints[0];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (tag === "cms-all") return ["cms-all"];
      const withoutAll = prev.filter((t) => t !== "cms-all");
      if (withoutAll.includes(tag)) {
        const next = withoutAll.filter((t) => t !== tag);
        return next.length > 0 ? next : ["cms-all"];
      }
      return [...withoutAll, tag];
    });
  };

  const handleTriggerSync = () => {
    startTransition(async () => {
      const res = await triggerManualSyncAction(selectedTags);
      if (res.ok) {
        setLastSyncInfo(
          res.data.ok
            ? `Synced (${res.data.latencyMs}ms)`
            : `HTTP ${res.data.status || "Offline"}`
        );
        toast({
          type: res.data.ok ? "success" : "info",
          title: res.data.ok
            ? "Cache Compro Disinkronkan"
            : "Webhook Sync Terkirim",
          description: res.data.message,
        });
        router.refresh();
      } else {
        toast({
          type: "error",
          title: "Gagal Sinkronisasi",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Quick Sync & API Bridge"
        backHref="/"
        primaryActionLabel={isPending ? "Syncing..." : "Sync Compro Now"}
        onPrimaryAction={handleTriggerSync}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Database Engine", value: "SQLite", unit: "file DB" },
          { label: "Published Content", value: String(stats.publishedContentCount), unit: "items" },
          { label: "CRM Records", value: String(stats.crmRecordsCount), unit: "inbound" },
        ]}
        timelineSegments={[
          {
            label: "Public Content API",
            endLabel: "/api/v1/content",
            progressPercent: 100,
            avatars: ["GET"],
          },
          {
            label: "Inbound CRM API",
            endLabel: "/api/v1/inbound",
            progressPercent: 100,
            avatars: ["POST"],
          },
          {
            label: "Error Telemetry",
            endLabel: "/api/v1/telemetry/error",
            progressPercent: 100,
            avatars: ["ERR"],
          },
        ]}
        rightTitle="Storage & Sync Bridge"
        rightValue={stats.dbLabel}
        rightBadge={lastSyncInfo}
        rightActionLabel="Trigger Sync"
        onRightAction={handleTriggerSync}
        miniCards={[
          {
            id: "db",
            code: "SQLite File",
            title: "data/cms.db",
            subtitle: "Persistent Local",
            highlighted: true,
          },
          {
            id: "isr",
            code: "Webhook",
            title: "On-Demand ISR",
            subtitle: "Compro Revalidate",
          },
          {
            id: "errors",
            code: "Error Shield",
            title: `${stats.unresolvedErrors} Open`,
            subtitle: "Telemetry Active",
          },
        ]}
        onMiniCardClick={(id) => {
          if (id === "errors") router.push("/monitoring/errors");
        }}
      />

      <SplitWorkspace
        tabs={[
          { id: "endpoints", label: "API Endpoints", count: stats.endpoints.length },
          { id: "tags", label: "Revalidate Tags", count: COMPRO_REVALIDATE_TAGS.length },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Integration Endpoints"
        leftContent={
          stats.endpoints.map((ep) => (
            <MasterListItem
              key={ep.id}
              selected={selectedEndpoint?.id === ep.id}
              onClick={() => setSelectedId(ep.id)}
              avatarText={ep.method}
              title={ep.path}
              subtitle={ep.purpose}
              statusLabel={ep.status}
              rightMetric={ep.targetCompro}
            />
          ))
        }
        rightContent={
          <div className="flex flex-col justify-between h-full gap-5">
            <div className="border-b border-white/8 pb-4 space-y-1">
              <p className="text-[11px] font-medium text-slate-400">
                Selected Bridge Endpoint
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#86FF00] text-[#090A0F] font-mono text-xs font-bold">
                  {selectedEndpoint.method}
                </span>
                <h3 className="font-mono font-bold text-base text-white">
                  {selectedEndpoint.path}
                </h3>
              </div>
              <p className="text-xs text-slate-300 pt-1">
                {selectedEndpoint.purpose} ↔ Compro:{" "}
                <code className="text-[#86FF00]">
                  {selectedEndpoint.targetCompro}
                </code>
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Select Cache Tags to Revalidate on Compro
              </p>
              <div className="flex flex-wrap gap-2">
                {COMPRO_REVALIDATE_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                        active
                          ? "bg-[#86FF00] text-[#090A0F] border-[#86FF00]"
                          : "bg-[#1C2029] text-slate-300 border-white/10 hover:border-white/30"
                      )}
                    >
                      {active && <IconCheck size={13} stroke={2.5} />}
                      <span>#{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0B0D12] border border-white/10 rounded-2xl p-4 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Database Note (SQLite → Turso Ready)
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Database saat ini disimpan secara lokal ke file{" "}
                <code className="text-[#86FF00]">data/cms.db</code> via
                Drizzle ORM &amp; libSQL. Saat deploy ke Vercel Serverless, Anda
                cukup mengganti <code className="text-white">DATABASE_URL</code>{" "}
                ke Turso (<code className="text-white">libsql://...</code>) tanpa
                mengubah kode aplikasi.
              </p>
            </div>

            <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
              <div className="text-xs">
                <span className="block text-[10px] text-slate-400">
                  Selected Tags
                </span>
                <span className="font-mono text-white">
                  {selectedTags.join(", ")}
                </span>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={handleTriggerSync}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
              >
                <IconRefresh size={15} className={isPending ? "animate-spin" : ""} />
                <span>{isPending ? "Syncing..." : "Trigger Compro Sync"}</span>
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}
