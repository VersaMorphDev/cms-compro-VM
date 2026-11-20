"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconMail,
  IconPhone,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import {
  createLeadAction,
  deleteLeadAction,
  updateLeadAction,
} from "../actions";
import { LEAD_SOURCES, LEAD_STATUSES, type LeadDTO } from "../schema";

interface LeadsInboxClientProps {
  initialLeads: LeadDTO[];
  storageMode: "database" | "memory";
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

function CreateLeadForm({
  onCreated,
  onCancel,
}: {
  onCreated: (created: LeadDTO) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [service, setService] = useState("Software Development");
  const [source, setSource] = useState<string>("contact");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createLeadAction({
        name,
        email,
        phone: phone || null,
        company: company || null,
        website: website || null,
        service,
        source,
        message: message || null,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: "Lead baru dicatat",
          description: `${res.data.name} berhasil masuk ke Leads Inbox.`,
        });
        onCreated(res.data);
      } else {
        toast({
          type: "error",
          title: "Gagal mencatat lead",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between border-b border-white/8 pb-4">
        <div>
          <p className="text-[11px] font-medium text-slate-400">
            Manual CRM Entry
          </p>
          <h3 className="font-display font-bold text-lg text-white">
            Log New Client Inquiry
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-full bg-[#1C2029] border border-white/10 text-xs text-slate-300 hover:text-white cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Contact Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Company
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Phone / WhatsApp
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Service Interest
          </label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Source Channel
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
          >
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Website
          </label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://company.com"
            className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Project Brief / Inquiry Message
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-end gap-3 mt-auto">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Manual Lead"}
        </button>
      </div>
    </form>
  );
}

function LeadDetailForm({
  lead,
  onUpdated,
  onDeleted,
}: {
  lead: LeadDTO;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [status, setStatus] = useState<LeadDTO["status"]>(lead.status);
  const [salesNotes, setSalesNotes] = useState(lead.salesNotes ?? "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateLeadAction({
        id: lead.id,
        status,
        salesNotes: salesNotes || null,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: "Pipeline lead diperbarui",
          description: `${lead.name} dipindahkan ke status ${res.data.status}.`,
        });
        onUpdated();
      } else {
        toast({
          type: "error",
          title: "Gagal memperbarui lead",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const res = await deleteLeadAction(lead.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Lead dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus lead",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-5 h-full">
        {/* Top 3-Column Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start border-b border-white/8 pb-4">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-slate-400">
              Lead #{lead.id}
            </p>
            <h3 className="font-display font-bold text-lg text-white leading-tight">
              {lead.name}
            </h3>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 truncate">
              <IconMail size={12} className="text-[#86FF00]" />
              {lead.email}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium text-slate-400">
              Company & Contact
            </p>
            <p className="text-xs font-semibold text-white">
              {lead.company ?? "Individual / Unspecified"}
            </p>
            {lead.phone && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <IconPhone size={12} /> {lead.phone}
              </p>
            )}
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#86FF00] hover:underline flex items-center gap-1"
              >
                <IconWorld size={12} /> {lead.website}
              </a>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-slate-400">
              Channel & Newsletter
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1C2029] border border-white/15 text-[11px] font-semibold text-white">
                {lead.source}
              </span>
              {lead.subscribeNewsletter && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#86FF00]/15 border border-[#86FF00]/30 text-[10px] font-semibold text-[#86FF00]">
                  Newsletter Opt-in
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bento Spec Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Service Interest
            </span>
            <p className="text-xs font-semibold text-white">
              {lead.service || lead.partnerType || "General Inquiry"}
            </p>
          </div>
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Submitted At
            </span>
            <p className="text-xs font-semibold text-white">
              {formatUtcTimestamp(lead.createdAt)}
            </p>
          </div>
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Metadata
            </span>
            <p className="text-[11px] font-mono text-slate-300 truncate">
              {lead.metadata && Object.keys(lead.metadata).length > 0
                ? JSON.stringify(lead.metadata)
                : "No extra metadata"}
            </p>
          </div>
        </div>

        {/* Client Brief Message */}
        <div className="bg-[#0B0D12] border border-white/8 rounded-2xl p-4 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Submitted Message / Brief
          </p>
          <p className="text-xs text-slate-200 leading-relaxed">
            {lead.message || "No detailed message provided."}
          </p>
        </div>

        {/* Pipeline Stage Pills + Sales Notes */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Sales Pipeline Stage
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LEAD_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer",
                    status === st
                      ? "bg-[#86FF00] text-[#090A0F] border-[#86FF00]"
                      : "bg-[#1C2029] text-slate-300 border-white/10 hover:border-white/30"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Internal Sales Notes
            </label>
            <textarea
              rows={3}
              value={salesNotes}
              onChange={(e) => setSalesNotes(e.target.value)}
              placeholder="Record meeting outcomes, quote link, or next follow-up date..."
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400">Current Stage</span>
            <span className="font-semibold text-[#86FF00]">{status}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="w-9 h-9 rounded-full bg-[#14171E] border border-white/10 hover:border-rose-500/50 hover:text-rose-400 flex items-center justify-center text-slate-400 cursor-pointer"
            >
              <IconTrash size={16} />
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              {isPending ? "Updating..." : "Save Lead Update"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Lead?"
        description={`Data inquiry dari "${lead.name}" akan dihapus permanen.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function LeadsInboxClient({
  initialLeads,
  storageMode,
}: LeadsInboxClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialLeads[0]?.id ?? "new"
  );
  const [activeMiniCard, setActiveMiniCard] = useState("all");

  const filtered = useMemo(() => {
    return initialLeads.filter((l) => {
      if (activeTab === "new" && l.status !== "NEW") return false;
      if (
        activeTab === "progress" &&
        !["CONTACTED", "QUALIFIED", "PROPOSAL_SENT"].includes(l.status)
      ) {
        return false;
      }
      if (
        activeTab === "closed" &&
        !["WON", "LOST"].includes(l.status)
      ) {
        return false;
      }
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !l.name.toLowerCase().includes(q) &&
          !l.email.toLowerCase().includes(q) &&
          !(l.company ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialLeads, activeTab, sourceFilter, statusFilter, searchQuery]);

  const selectedLead =
    selectedId === "new"
      ? null
      : filtered.find((l) => l.id === selectedId) ?? filtered[0] ?? null;

  const newCount = initialLeads.filter((l) => l.status === "NEW").length;
  const progressCount = initialLeads.filter((l) =>
    ["CONTACTED", "QUALIFIED", "PROPOSAL_SENT"].includes(l.status)
  ).length;
  const wonCount = initialLeads.filter((l) => l.status === "WON").length;
  const closedCount = initialLeads.filter((l) =>
    ["WON", "LOST"].includes(l.status)
  ).length;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Leads Inbox"
        backHref="/"
        primaryActionLabel="Log Manual Lead"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Total Leads", value: String(initialLeads.length), unit: "inquiries" },
          { label: "New Unread", value: String(newCount), unit: "new" },
          { label: "Won Deals", value: String(wonCount), unit: "converted" },
        ]}
        timelineSegments={[
          {
            label: "Service & Contact",
            endLabel: `${initialLeads.filter((l) => l.source === "service-page" || l.source === "contact").length}`,
            progressPercent: 80,
            avatars: ["BS", "HG"],
          },
          {
            label: "AI Chat & Meeting",
            endLabel: `${initialLeads.filter((l) => l.source === "chat" || l.source === "meeting").length}`,
            progressPercent: 60,
            avatars: ["CW", "RK"],
          },
          {
            label: "Partnerships",
            endLabel: `${initialLeads.filter((l) => l.source === "partners-apply").length}`,
            progressPercent: 40,
            avatars: ["MC"],
          },
        ]}
        rightTitle="CRM Inbound Pipeline"
        rightValue={`${newCount + progressCount} Active`}
        rightBadge={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightActionLabel="+ Log Lead"
        onRightAction={() => setSelectedId("new")}
        miniCards={[
          {
            id: "service-page",
            code: "Services",
            title: `${initialLeads.filter((l) => l.source === "service-page").length} Leads`,
            subtitle: "/services Form",
            highlighted: activeMiniCard === "service-page",
          },
          {
            id: "chat",
            code: "AI Bot",
            title: `${initialLeads.filter((l) => l.source === "chat").length} Leads`,
            subtitle: "Chat Capture",
            highlighted: activeMiniCard === "chat",
          },
          {
            id: "partners-apply",
            code: "Partners",
            title: `${initialLeads.filter((l) => l.source === "partners-apply").length} Leads`,
            subtitle: "/partners Form",
            highlighted: activeMiniCard === "partners-apply",
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
        activeCount={
          (sourceFilter !== "all" ? 1 : 0) +
          (statusFilter !== "all" ? 1 : 0) +
          (searchQuery.trim() ? 1 : 0)
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search lead name, email, company..."
        selects={[
          {
            id: "source",
            value: sourceFilter,
            onChange: (v) => {
              setSourceFilter(v);
              setActiveMiniCard(v);
            },
            options: [
              { label: "All sources", value: "all" },
              ...LEAD_SOURCES.map((s) => ({ label: s, value: s })),
            ],
          },
          {
            id: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All stages", value: "all" },
              ...LEAD_STATUSES.map((s) => ({ label: s, value: s })),
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Leads", count: initialLeads.length },
          { id: "new", label: "New", count: newCount },
          { id: "progress", label: "In Progress", count: progressCount },
          { id: "closed", label: "Won / Closed", count: closedCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Inbound Submissions"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((lead) => (
              <MasterListItem
                key={lead.id}
                selected={selectedId !== "new" && selectedLead?.id === lead.id}
                onClick={() => setSelectedId(lead.id)}
                avatarText={lead.name.slice(0, 2).toUpperCase()}
                title={`${lead.name} · ${lead.company || lead.email}`}
                subtitle={`${lead.source} · ${formatUtcTimestamp(lead.createdAt)}`}
                statusLabel={lead.status}
                rightMetric={lead.service || "Inquiry"}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada lead yang sesuai filter.
            </div>
          )
        }
        rightContent={
          selectedId === "new" || !selectedLead ? (
            <CreateLeadForm
              key="create-lead"
              onCreated={(created) => {
                setSelectedId(created.id);
                router.refresh();
              }}
              onCancel={() => setSelectedId(initialLeads[0]?.id ?? "new")}
            />
          ) : (
            <LeadDetailForm
              key={selectedLead.id}
              lead={selectedLead}
              onUpdated={() => router.refresh()}
              onDeleted={() => {
                setSelectedId(initialLeads[0]?.id ?? "new");
                router.refresh();
              }}
            />
          )
        }
      />
    </div>
  );
}
