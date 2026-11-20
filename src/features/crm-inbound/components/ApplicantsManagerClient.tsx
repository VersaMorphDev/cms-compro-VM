"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconBrandLinkedin,
  IconFileText,
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
import { deleteApplicantAction, updateApplicantAction } from "../actions";
import { APPLICANT_STATUSES, type JobApplicantDTO } from "../schema";

interface ApplicantsManagerClientProps {
  initialApplicants: JobApplicantDTO[];
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

function ApplicantDetailForm({
  applicant,
  onUpdated,
  onDeleted,
}: {
  applicant: JobApplicantDTO;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [status, setStatus] = useState<JobApplicantDTO["status"]>(
    applicant.status
  );
  const [notes, setNotes] = useState(applicant.notes ?? "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateApplicantAction({
        id: applicant.id,
        status,
        notes: notes || null,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: "Status kandidat diperbarui",
          description: `${applicant.name} berada di tahap ${res.data.status}.`,
        });
        onUpdated();
      } else {
        toast({
          type: "error",
          title: "Gagal memperbarui kandidat",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const res = await deleteApplicantAction(applicant.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Data pelamar dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus pelamar",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-5 h-full">
        {/* Top Metadata Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-4">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-slate-400">
              Candidate #{applicant.id} · {applicant.position}
            </p>
            <h3 className="font-display font-bold text-xl text-white">
              {applicant.name}
            </h3>
            <p className="text-xs text-slate-300">
              {applicant.email}
              {applicant.phone ? ` · ${applicant.phone}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {applicant.linkedin && (
              <a
                href={applicant.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C2029] border border-white/10 hover:border-[#86FF00] text-[11px] font-semibold text-white"
              >
                <IconBrandLinkedin size={14} className="text-sky-400" />
                LinkedIn
              </a>
            )}
            {applicant.portfolioUrl && (
              <a
                href={applicant.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C2029] border border-white/10 hover:border-[#86FF00] text-[11px] font-semibold text-white"
              >
                <IconWorld size={14} className="text-[#86FF00]" />
                Portfolio
              </a>
            )}
            {applicant.resumeUrl && (
              <a
                href={applicant.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#86FF00] text-[#090A0F] text-[11px] font-bold"
              >
                <IconFileText size={14} />
                {applicant.resumeFileName || "View CV"}
              </a>
            )}
          </div>
        </div>

        {/* Spec Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase text-slate-400">
              Expected Salary
            </span>
            <p className="text-xs font-semibold text-[#86FF00]">
              {applicant.expectedSalary || "Negotiable"}
            </p>
          </div>
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase text-slate-400">
              Earliest Start Date
            </span>
            <p className="text-xs font-semibold text-white">
              {applicant.startDate || "Immediate"}
            </p>
          </div>
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase text-slate-400">
              Work Authorization
            </span>
            <p className="text-xs font-semibold text-white">
              {applicant.workAuth || "Verified"}
            </p>
          </div>
        </div>

        {/* Candidate Cover Letter */}
        <div className="bg-[#0B0D12] border border-white/8 rounded-2xl p-4 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Cover Note / Experience Summary
          </p>
          <p className="text-xs text-slate-200 leading-relaxed">
            {applicant.message || "No cover message submitted."}
          </p>
        </div>

        {/* Hiring Stage Pills + HR Notes */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Recruitment Stage
            </label>
            <div className="flex flex-wrap gap-1.5">
              {APPLICANT_STATUSES.map((st) => (
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
              Recruiter & Technical Panel Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write interview feedback, technical scores, or offer terms..."
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400">Applied At</span>
            <span className="font-semibold text-white">
              {formatUtcTimestamp(applicant.createdAt)}
            </span>
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
              {isPending ? "Saving..." : "Update Candidate"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Data Pelamar?"
        description={`Profil kandidat "${applicant.name}" akan dihapus permanen.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function ApplicantsManagerClient({
  initialApplicants,
  storageMode,
}: ApplicantsManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number>(
    initialApplicants[0]?.id ?? 0
  );
  const [activeMiniCard, setActiveMiniCard] = useState("all");

  const positions = useMemo(
    () => Array.from(new Set(initialApplicants.map((a) => a.position))).sort(),
    [initialApplicants]
  );

  const filtered = useMemo(() => {
    return initialApplicants.filter((a) => {
      if (activeTab === "applied" && a.status !== "APPLIED") return false;
      if (
        activeTab === "interview" &&
        !["SCREENING", "INTERVIEW", "OFFERED"].includes(a.status)
      ) {
        return false;
      }
      if (
        activeTab === "closed" &&
        !["HIRED", "REJECTED"].includes(a.status)
      ) {
        return false;
      }
      if (positionFilter !== "all" && a.position !== positionFilter) {
        return false;
      }
      if (statusFilter !== "all" && a.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !a.name.toLowerCase().includes(q) &&
          !a.email.toLowerCase().includes(q) &&
          !a.position.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialApplicants, activeTab, positionFilter, statusFilter, searchQuery]);

  const selectedApplicant =
    filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  const appliedCount = initialApplicants.filter(
    (a) => a.status === "APPLIED"
  ).length;
  const activeStageCount = initialApplicants.filter((a) =>
    ["SCREENING", "INTERVIEW", "OFFERED"].includes(a.status)
  ).length;
  const closedCount = initialApplicants.filter((a) =>
    ["HIRED", "REJECTED"].includes(a.status)
  ).length;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Job Applicants (ATS)"
        backHref="/company/careers"
        primaryActionLabel="Manage Openings"
        primaryActionHref="/company/careers"
      />

      <BentoKpiSection
        leftStats={[
          { label: "Total Candidates", value: String(initialApplicants.length), unit: "applicants" },
          { label: "In Screening / Panel", value: String(activeStageCount), unit: "active" },
          { label: "New Applications", value: String(appliedCount), unit: "unread" },
        ]}
        timelineSegments={[
          {
            label: "Applied & Screening",
            endLabel: `${initialApplicants.filter((a) => a.status === "APPLIED" || a.status === "SCREENING").length}`,
            progressPercent: 75,
            avatars: ["NA", "FN"],
          },
          {
            label: "Technical Interview",
            endLabel: `${initialApplicants.filter((a) => a.status === "INTERVIEW").length}`,
            progressPercent: 55,
            avatars: ["RM"],
          },
          {
            label: "Offer Extended",
            endLabel: `${initialApplicants.filter((a) => a.status === "OFFERED" || a.status === "HIRED").length}`,
            progressPercent: 85,
            avatars: ["AW"],
          },
        ]}
        rightTitle="Recruitment ATS"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /careers"
        rightActionLabel="Open Roles"
        onRightAction={() => router.push("/company/careers")}
        miniCards={[
          {
            id: "APPLIED",
            code: "Stage 1",
            title: `${appliedCount} Applied`,
            subtitle: "New Resumes",
            highlighted: activeMiniCard === "APPLIED",
          },
          {
            id: "INTERVIEW",
            code: "Stage 2",
            title: `${initialApplicants.filter((a) => a.status === "INTERVIEW").length} Interview`,
            subtitle: "Tech Panel",
            highlighted: activeMiniCard === "INTERVIEW",
          },
          {
            id: "OFFERED",
            code: "Stage 3",
            title: `${initialApplicants.filter((a) => a.status === "OFFERED").length} Offered`,
            subtitle: "Finalizing",
            highlighted: activeMiniCard === "OFFERED",
          },
        ]}
        onMiniCardClick={(id) => {
          if (activeMiniCard === id) {
            setActiveMiniCard("all");
            setStatusFilter("all");
          } else {
            setActiveMiniCard(id);
            setStatusFilter(id);
          }
        }}
      />

      <FilterPillBar
        activeCount={
          (positionFilter !== "all" ? 1 : 0) +
          (statusFilter !== "all" ? 1 : 0) +
          (searchQuery.trim() ? 1 : 0)
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search candidate name, email, role..."
        selects={[
          {
            id: "position",
            value: positionFilter,
            onChange: setPositionFilter,
            options: [
              { label: "All positions", value: "all" },
              ...positions.map((p) => ({ label: p, value: p })),
            ],
          },
          {
            id: "status",
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              setActiveMiniCard(v);
            },
            options: [
              { label: "All stages", value: "all" },
              ...APPLICANT_STATUSES.map((s) => ({ label: s, value: s })),
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Candidates", count: initialApplicants.length },
          { id: "applied", label: "New Applied", count: appliedCount },
          { id: "interview", label: "In Interview", count: activeStageCount },
          { id: "closed", label: "Hired / Closed", count: closedCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Applicant Pipeline"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((cand) => (
              <MasterListItem
                key={cand.id}
                selected={selectedApplicant?.id === cand.id}
                onClick={() => setSelectedId(cand.id)}
                avatarText={cand.name.slice(0, 2).toUpperCase()}
                title={cand.name}
                subtitle={`${cand.position} · ${formatUtcTimestamp(cand.createdAt)}`}
                statusLabel={cand.status}
                rightMetric={cand.expectedSalary || "-"}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada pelamar pada filter ini.
            </div>
          )
        }
        rightContent={
          selectedApplicant ? (
            <ApplicantDetailForm
              key={selectedApplicant.id}
              applicant={selectedApplicant}
              onUpdated={() => router.refresh()}
              onDeleted={() => router.refresh()}
            />
          ) : (
            <div className="py-16 text-center text-sm text-slate-400">
              Pilih kandidat di panel kiri untuk meninjau CV & evaluasi.
            </div>
          )
        }
      />
    </div>
  );
}
