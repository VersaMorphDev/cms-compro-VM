"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import { useToast } from "@/components/ui/ToastProvider";
import type { ActivityLogDTO, MonitoringSummary } from "../types";

interface ActivityMonitorClientProps {
  initialLogs: ActivityLogDTO[];
  summary: MonitoringSummary;
}

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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "VM";
}

function formatUtcTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d)} UTC`;
}

export default function ActivityMonitorClient({
  initialLogs,
  summary,
}: ActivityMonitorClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number>(initialLogs[0]?.id ?? 0);
  const [activeMiniCard, setActiveMiniCard] = useState("audit");

  const availableModules = useMemo(() => {
    return Array.from(new Set(initialLogs.map((l) => l.module))).sort();
  }, [initialLogs]);

  const availableActions = useMemo(() => {
    return Array.from(new Set(initialLogs.map((l) => l.action))).sort();
  }, [initialLogs]);

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((item) => {
      if (activeTab === "content" && !CONTENT_MODULES.has(item.module)) {
        return false;
      }
      if (activeTab === "system" && CONTENT_MODULES.has(item.module)) {
        return false;
      }
      if (moduleFilter !== "all" && item.module !== moduleFilter) return false;
      if (actionFilter !== "all" && item.action !== actionFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.actorName.toLowerCase().includes(q) ||
          item.module.toLowerCase().includes(q) ||
          item.action.toLowerCase().includes(q) ||
          (item.targetTitle ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [initialLogs, activeTab, moduleFilter, actionFilter, searchQuery]);

  const selectedLog =
    filteredLogs.find((item) => item.id === selectedId) ??
    filteredLogs[0] ??
    null;

  const activeFiltersCount =
    (moduleFilter !== "all" ? 1 : 0) +
    (actionFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const totalOps = Math.max(1, summary.totalActivities);
  const contentPct = Math.round((summary.contentOpsCount / totalOps) * 100);
  const crmPct = Math.round((summary.crmOpsCount / totalOps) * 100);
  const systemPct = Math.round((summary.systemOpsCount / totalOps) * 100);

  const contentCount = initialLogs.filter((l) =>
    CONTENT_MODULES.has(l.module)
  ).length;
  const systemCrmCount = initialLogs.length - contentCount;

  const handleRefresh = () => {
    router.refresh();
    toast({
      type: "info",
      title: "Feed aktivitas diperbarui",
      description: "Data audit terbaru telah dimuat dari server.",
    });
  };

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Activity Logs"
        backHref="/"
        primaryActionLabel="View Error Logs"
        primaryActionHref="/monitoring/errors"
      />

      <BentoKpiSection
        leftStats={[
          {
            label: "Total Activities",
            value: String(summary.totalActivities),
            unit: "events",
          },
          {
            label: "Last 24 Hours",
            value: String(summary.activitiesLast24h),
            unit: "actions",
          },
          {
            label: "Active Modules",
            value: String(summary.activeModulesCount),
            unit: "modules",
          },
        ]}
        timelineSegments={[
          {
            label: "Content Ops",
            endLabel: `${summary.contentOpsCount} events`,
            progressPercent: contentPct || 10,
            avatars: ["SR", "AN"],
          },
          {
            label: "CRM & Leads",
            endLabel: `${summary.crmOpsCount} events`,
            progressPercent: crmPct || 10,
            avatars: ["NP", "BD"],
          },
          {
            label: "System & Sync",
            endLabel: `${summary.systemOpsCount} events`,
            progressPercent: systemPct || 10,
            avatars: ["SYS"],
          },
        ]}
        rightTitle="Monitoring Engine"
        rightValue={
          summary.storageMode === "database" ? "PostgreSQL" : "Memory Mode"
        }
        rightBadge={`${summary.unresolvedErrors} Open Errors`}
        rightActionLabel="Error Logs"
        onRightAction={() => router.push("/monitoring/errors")}
        miniCards={[
          {
            id: "audit",
            code: "Audit Trail",
            title: "Activity Feed",
            subtitle: `${summary.totalActivities} recorded`,
            highlighted: activeMiniCard === "audit",
          },
          {
            id: "errors",
            code: "Error Guard",
            title: "Error Shield",
            subtitle: `${summary.unresolvedErrors} unresolved`,
            highlighted: activeMiniCard === "errors",
          },
          {
            id: "compro",
            code: "Telemetry",
            title: "Compro API",
            subtitle: `${summary.comproErrors} client logs`,
            highlighted: activeMiniCard === "compro",
          },
        ]}
        onMiniCardClick={(id) => {
          setActiveMiniCard(id);
          if (id === "errors" || id === "compro") {
            router.push("/monitoring/errors");
          }
        }}
      />

      <FilterPillBar
        activeCount={activeFiltersCount}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search actor, module, target..."
        selects={[
          {
            id: "module",
            value: moduleFilter,
            onChange: setModuleFilter,
            options: [
              { label: "All modules", value: "all" },
              ...availableModules.map((m) => ({ label: m, value: m })),
            ],
          },
          {
            id: "action",
            value: actionFilter,
            onChange: setActionFilter,
            options: [
              { label: "All actions", value: "all" },
              ...availableActions.map((a) => ({ label: a, value: a })),
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Activity", count: initialLogs.length },
          { id: "content", label: "Content Ops", count: contentCount },
          { id: "system", label: "CRM & System", count: systemCrmCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Recent Activity Stream"
        leftContent={
          filteredLogs.length > 0 ? (
            filteredLogs.map((item) => (
              <MasterListItem
                key={item.id}
                selected={selectedLog?.id === item.id}
                onClick={() => setSelectedId(item.id)}
                avatarText={getInitials(item.actorName)}
                title={`${item.action} · ${item.targetTitle ?? item.module}`}
                subtitle={`${item.actorName} · ${formatUtcTimestamp(item.createdAt)}`}
                statusLabel={item.module}
                rightMetric={`#${item.id}`}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada aktivitas yang sesuai filter.
            </div>
          )
        }
        rightContent={
          selectedLog ? (
            <div className="flex flex-col justify-between h-full gap-6">
              {/* Top 3-Column Metadata Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Activity details
                  </p>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-display font-semibold text-xl tracking-tight text-white">
                      ACT-{String(selectedLog.id).padStart(4, "0")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full border border-[#86FF00]/35 bg-[#86FF00]/15 text-[11px] font-semibold text-[#86FF00]">
                      {selectedLog.action}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Module & Target
                  </p>
                  <p className="font-display font-semibold text-sm text-white truncate">
                    {selectedLog.module}
                    {selectedLog.targetId ? ` · ${selectedLog.targetId}` : ""}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Executed By
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#242936] border border-white/10 text-xs font-bold text-[#86FF00] flex items-center justify-center shrink-0 uppercase">
                      {getInitials(selectedLog.actorName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {selectedLog.actorName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {selectedLog.actorRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Summary Sub-Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Target Item
                  </p>
                  <p className="text-xs font-semibold text-white leading-snug">
                    {selectedLog.targetTitle ?? "-"}
                  </p>
                </div>
                <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Timestamp
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {formatUtcTimestamp(selectedLog.createdAt)}
                  </p>
                </div>
                <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Source IP Address
                  </p>
                  <p className="text-xs font-mono font-semibold text-slate-200">
                    {selectedLog.ipAddress ?? "Internal Server"}
                  </p>
                </div>
              </div>

              {/* Before / After Diff Viewer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#0B0D12] border border-white/8 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Before Snapshot
                  </p>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
                    {selectedLog.changes?.before
                      ? JSON.stringify(selectedLog.changes.before, null, 2)
                      : "// No prior snapshot"}
                  </pre>
                </div>
                <div className="bg-[#0B0D12] border border-[#86FF00]/20 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86FF00]">
                    After Snapshot
                  </p>
                  <pre className="text-[11px] font-mono text-slate-200 overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
                    {selectedLog.changes?.after
                      ? JSON.stringify(selectedLog.changes.after, null, 2)
                      : "// No post-change snapshot"}
                  </pre>
                </div>
              </div>

              {/* Bottom Footer Action Bar */}
              <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Audit Status
                    </p>
                    <p className="font-display font-semibold text-sm text-white">
                      Verified
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Storage
                    </p>
                    <p className="font-display font-semibold text-sm text-white capitalize">
                      {summary.storageMode}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Log ID
                    </p>
                    <p className="font-display font-semibold text-sm text-white">
                      #{selectedLog.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-[0_4px_18px_rgba(134,255,0,0.25)]"
                >
                  Refresh Feed
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-slate-400">
              Pilih item aktivitas di sebelah kiri untuk melihat detail audit.
            </div>
          )
        }
      />
    </div>
  );
}
