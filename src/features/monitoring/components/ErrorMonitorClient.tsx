"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconRotateClockwise, IconShieldCheck } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import {
  resolveErrorLogAction,
  simulateTestErrorAction,
} from "../actions";
import type { MonitoringSummary, SystemErrorLogDTO } from "../types";

interface ErrorMonitorClientProps {
  initialErrors: SystemErrorLogDTO[];
  summary: MonitoringSummary;
}

function getSeverityPrefix(severity: string): string {
  if (severity === "FATAL") return "FT";
  if (severity === "WARN") return "WN";
  return "ER";
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

export default function ErrorMonitorClient({
  initialErrors,
  summary,
}: ErrorMonitorClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState("unresolved");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number>(
    initialErrors.find((e) => !e.isResolved)?.id ?? initialErrors[0]?.id ?? 0
  );
  const [activeMiniCard, setActiveMiniCard] = useState<string>("all");

  const filteredErrors = useMemo(() => {
    return initialErrors.filter((item) => {
      if (activeTab === "unresolved" && item.isResolved) return false;
      if (activeTab === "resolved" && !item.isResolved) return false;
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
      if (severityFilter !== "all" && item.severity !== severityFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.referenceCode.toLowerCase().includes(q) ||
          item.friendlyMessage.toLowerCase().includes(q) ||
          item.technicalMessage.toLowerCase().includes(q) ||
          (item.requestUrl ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [initialErrors, activeTab, sourceFilter, severityFilter, searchQuery]);

  const selectedError =
    filteredErrors.find((item) => item.id === selectedId) ??
    filteredErrors[0] ??
    null;

  const activeFiltersCount =
    (sourceFilter !== "all" ? 1 : 0) +
    (severityFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const totalErr = Math.max(1, summary.totalErrors);
  const actionPct = Math.round((summary.cmsActionErrors / totalErr) * 100);
  const apiPct = Math.round((summary.cmsApiErrors / totalErr) * 100);
  const comproPct = Math.round((summary.comproErrors / totalErr) * 100);

  const handleToggleResolve = (item: SystemErrorLogDTO) => {
    startTransition(async () => {
      const nextResolved = !item.isResolved;
      const result = await resolveErrorLogAction(item.id, nextResolved);
      if (result.ok) {
        toast({
          type: "success",
          title: nextResolved
            ? "Insiden ditandai selesai"
            : "Insiden dibuka kembali",
          description: result.message,
          referenceCode: result.data.referenceCode,
        });
        router.refresh();
      } else {
        toast({
          type: "error",
          title: "Gagal memperbarui status",
          description: result.error.message,
          referenceCode: result.error.referenceCode,
        });
      }
    });
  };

  const handleSimulateError = () => {
    startTransition(async () => {
      const result = await simulateTestErrorAction();
      if (!result.ok) {
        // Notice: UI receives only the polite message & ref code, never the DB stack trace!
        toast({
          type: "error",
          title: "Error Guard Menangkap Kegagalan",
          description: result.error.message,
          referenceCode: result.error.referenceCode,
        });
        setActiveTab("unresolved");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="System Error Logs"
        backHref="/monitoring"
        primaryActionLabel={isPending ? "Testing Guard..." : "Test Error Guard"}
        onPrimaryAction={handleSimulateError}
      />

      <BentoKpiSection
        leftStats={[
          {
            label: "Unresolved Incidents",
            value: String(summary.unresolvedErrors),
            unit: "open",
          },
          {
            label: "Fatal / Critical",
            value: String(summary.fatalErrors),
            unit: "alerts",
          },
          {
            label: "Resolved Total",
            value: String(summary.resolvedErrors),
            unit: "closed",
          },
        ]}
        timelineSegments={[
          {
            label: "CMS Actions",
            endLabel: `${summary.cmsActionErrors} logs`,
            progressPercent: actionPct || 8,
            avatars: ["ACT"],
          },
          {
            label: "CMS API",
            endLabel: `${summary.cmsApiErrors} logs`,
            progressPercent: apiPct || 8,
            avatars: ["API"],
          },
          {
            label: "Compro Frontend",
            endLabel: `${summary.comproErrors} logs`,
            progressPercent: comproPct || 8,
            avatars: ["WEB"],
          },
        ]}
        rightTitle="Error Shield Status"
        rightValue={`${summary.unresolvedErrors} Open`}
        rightBadge="Friendly UI Active"
        rightActionLabel="Test Guard"
        onRightAction={handleSimulateError}
        miniCards={[
          {
            id: "CMS_SERVER_ACTION",
            code: "CMS Action",
            title: `${summary.cmsActionErrors} Logs`,
            subtitle: "safeAction()",
            highlighted: activeMiniCard === "CMS_SERVER_ACTION",
          },
          {
            id: "CMS_API",
            code: "CMS API",
            title: `${summary.cmsApiErrors} Logs`,
            subtitle: "handleApiError()",
            highlighted: activeMiniCard === "CMS_API",
          },
          {
            id: "COMPRO_FRONTEND",
            code: "Compro Web",
            title: `${summary.comproErrors} Logs`,
            subtitle: "Telemetry API",
            highlighted: activeMiniCard === "COMPRO_FRONTEND",
          },
        ]}
        onMiniCardClick={(id) => {
          if (activeMiniCard === id) {
            setActiveMiniCard("all");
            setSourceFilter("all");
          } else {
            setActiveMiniCard(id);
            setSourceFilter(id);
          }
        }}
      />

      <FilterPillBar
        activeCount={activeFiltersCount}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search ERR code, message, URL..."
        selects={[
          {
            id: "source",
            value: sourceFilter,
            onChange: (val) => {
              setSourceFilter(val);
              setActiveMiniCard(val);
            },
            options: [
              { label: "All sources", value: "all" },
              { label: "CMS_SERVER_ACTION", value: "CMS_SERVER_ACTION" },
              { label: "CMS_API", value: "CMS_API" },
              { label: "COMPRO_FRONTEND", value: "COMPRO_FRONTEND" },
              { label: "COMPRO_API", value: "COMPRO_API" },
            ],
          },
          {
            id: "severity",
            value: severityFilter,
            onChange: setSeverityFilter,
            options: [
              { label: "All severities", value: "all" },
              { label: "FATAL", value: "FATAL" },
              { label: "ERROR", value: "ERROR" },
              { label: "WARN", value: "WARN" },
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Errors", count: initialErrors.length },
          {
            id: "unresolved",
            label: "Unresolved",
            count: initialErrors.filter((e) => !e.isResolved).length,
          },
          {
            id: "resolved",
            label: "Resolved",
            count: initialErrors.filter((e) => e.isResolved).length,
          },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Captured Technical Errors"
        leftContent={
          filteredErrors.length > 0 ? (
            filteredErrors.map((err) => (
              <MasterListItem
                key={err.id}
                selected={selectedError?.id === err.id}
                onClick={() => setSelectedId(err.id)}
                avatarText={getSeverityPrefix(err.severity)}
                title={`${err.referenceCode} · ${err.friendlyMessage}`}
                subtitle={`${err.source} · ${formatUtcTimestamp(err.createdAt)}`}
                statusLabel={err.isResolved ? "Resolved" : "Open"}
                rightMetric={err.severity}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada error pada filter ini. Sistem berjalan normal!
            </div>
          )
        }
        rightContent={
          selectedError ? (
            <div className="flex flex-col justify-between h-full gap-5">
              {/* Top 3-Column Incident Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Incident Reference
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-semibold text-xl tracking-tight text-white">
                      {selectedError.referenceCode}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                        selectedError.isResolved
                          ? "border-[#86FF00]/35 bg-[#86FF00]/15 text-[#86FF00]"
                          : "border-rose-500/40 bg-rose-500/15 text-rose-300"
                      )}
                    >
                      {selectedError.isResolved ? "Resolved" : "Unresolved"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Source & Severity
                  </p>
                  <p className="font-display font-semibold text-sm text-white">
                    {selectedError.source} · {selectedError.severity}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-400">
                    Actor & Endpoint
                  </p>
                  <p className="text-xs font-semibold text-white truncate">
                    {selectedError.actorName ?? "System / Visitor"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {selectedError.requestUrl ?? "-"}
                  </p>
                </div>
              </div>

              {/* Friendly Message vs Technical Exception */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#1C2029] border border-[#86FF00]/25 rounded-2xl p-4 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86FF00]">
                    Friendly Message (Shown to User)
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedError.friendlyMessage}
                  </p>
                </div>

                <div className="bg-[#1C2029] border border-rose-500/30 rounded-2xl p-4 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                    Technical Exception (Admin Only)
                  </p>
                  <p className="text-xs font-mono text-rose-200 leading-relaxed break-words">
                    {selectedError.technicalMessage}
                  </p>
                </div>
              </div>

              {/* Stack Trace & Sanitized Payload Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#0B0D12] border border-white/8 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Stack Trace
                  </p>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36 whitespace-pre-wrap break-words">
                    {selectedError.stackTrace || "// No stack trace captured"}
                  </pre>
                </div>

                <div className="bg-[#0B0D12] border border-white/8 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Sanitized Payload Snapshot
                  </p>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36 whitespace-pre-wrap break-words">
                    {selectedError.payloadSnapshot &&
                    Object.keys(selectedError.payloadSnapshot).length > 0
                      ? JSON.stringify(selectedError.payloadSnapshot, null, 2)
                      : "{}"}
                  </pre>
                </div>
              </div>

              {/* Bottom Summary Bar + Resolve / Reopen Lime Button */}
              <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Captured At
                    </p>
                    <p className="font-display font-semibold text-xs sm:text-sm text-white">
                      {formatUtcTimestamp(selectedError.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Resolved By
                    </p>
                    <p className="font-display font-semibold text-xs sm:text-sm text-white truncate">
                      {selectedError.resolvedBy ?? "-"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-slate-400">
                      Severity
                    </p>
                    <p className="font-display font-semibold text-xs sm:text-sm text-white">
                      {selectedError.severity}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggleResolve(selectedError)}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-60",
                    selectedError.isResolved
                      ? "bg-white text-[#090A0F] hover:bg-slate-200"
                      : "bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] shadow-[0_4px_18px_rgba(134,255,0,0.25)]"
                  )}
                >
                  {selectedError.isResolved ? (
                    <>
                      <IconRotateClockwise size={15} />
                      <span>Reopen Issue</span>
                    </>
                  ) : (
                    <>
                      <IconCheck size={15} stroke={2.5} />
                      <span>Mark as Resolved</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3 text-slate-400">
              <IconShieldCheck size={36} className="text-[#86FF00]" />
              <p className="text-sm font-medium text-white">
                Tidak ada error teknis yang terbuka.
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Klik tombol &ldquo;Test Error Guard&rdquo; di kanan atas untuk
                menguji bagaimana sistem menangkap error teknis tanpa
                menampilkannya ke pengguna.
              </p>
            </div>
          )
        }
      />
    </div>
  );
}
