"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconWand } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import DynamicListInput from "@/components/editor/DynamicListInput";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { slugify } from "@/lib/utils";
import { deleteJobOpeningAction, saveJobOpeningAction } from "../actions";
import {
  JOB_CATEGORIES,
  JOB_STATUSES,
  JOB_TYPES,
  WORK_ECOSYSTEMS,
  type JobOpeningDTO,
} from "../schema";

interface CareersManagerClientProps {
  initialJobs: JobOpeningDTO[];
  storageMode: "database" | "memory";
}

function JobOpeningForm({
  job,
  onSaved,
  onDeleted,
}: {
  job: JobOpeningDTO | null;
  onSaved: (saved: JobOpeningDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [title, setTitle] = useState(job?.title ?? "");
  const [slug, setSlug] = useState(job?.slug ?? "");
  const [department, setDepartment] = useState(job?.department ?? "Engineering");
  const [location, setLocation] = useState(
    job?.location ?? "Jakarta, Indonesia (Hybrid)"
  );
  const [type, setType] = useState<(typeof JOB_TYPES)[number]>(
    job?.type ?? "Full-time"
  );
  const [workEcosystem, setWorkEcosystem] = useState<
    (typeof WORK_ECOSYSTEMS)[number]
  >(job?.workEcosystem ?? "Hybrid");
  const [category, setCategory] = useState<(typeof JOB_CATEGORIES)[number]>(
    job?.category ?? "Technology"
  );
  const [status, setStatus] = useState<(typeof JOB_STATUSES)[number]>(
    job?.status ?? "OPEN"
  );
  const [description, setDescription] = useState(job?.description ?? "");
  const [requirements, setRequirements] = useState<string[]>(
    job?.requirements ?? []
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveJobOpeningAction({
        id: job?.id,
        slug: slug || slugify(title),
        title,
        department,
        location,
        type,
        workEcosystem,
        category,
        description,
        requirements,
        status,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: job ? "Lowongan diperbarui" : "Lowongan baru dibuat",
          description: `"${res.data.title}" (${res.data.status}) tersimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input lowongan"
            : "Gagal menyimpan lowongan",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!job) return;
    startTransition(async () => {
      const res = await deleteJobOpeningAction(job.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Lowongan dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus lowongan",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              {job ? `Job Opening #${job.id}` : "Create New Job Opening"}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {title || "Untitled Position"}
            </h3>
          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as (typeof JOB_STATUSES)[number])
            }
            className="bg-[#1C2029] border border-white/15 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Job Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!job) setSlug(slugify(e.target.value));
              }}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Slug
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSlug(slugify(title))}
                className="px-2.5 rounded-xl bg-[#1C2029] border border-white/10 hover:border-[#86FF00] text-slate-300 cursor-pointer"
              >
                <IconWand size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Department
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Location
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 sm:col-span-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as (typeof JOB_TYPES)[number])
                }
                className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Work Ecosystem
              </label>
              <select
                value={workEcosystem}
                onChange={(e) =>
                  setWorkEcosystem(
                    e.target.value as (typeof WORK_ECOSYSTEMS)[number]
                  )
                }
                className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
              >
                {WORK_ECOSYSTEMS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as (typeof JOB_CATEGORIES)[number])
                }
                className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
              >
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Role Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <DynamicListInput
          label="Candidate Requirements"
          items={requirements}
          onChange={setRequirements}
          placeholder="e.g. 5+ years TypeScript & Next.js experience"
        />

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400">Compro URL</span>
            <span className="font-mono text-slate-300">
              /careers/{slug || "auto"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {job && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="w-9 h-9 rounded-full bg-[#14171E] border border-white/10 hover:border-rose-500/50 hover:text-rose-400 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <IconTrash size={16} />
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Opening"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Lowongan Kerja?"
        description={`Lowongan "${job?.title}" akan dihapus dari halaman Careers.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function CareersManagerClient({
  initialJobs,
  storageMode,
}: CareersManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [ecosystemFilter, setEcosystemFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialJobs[0]?.id ?? "new"
  );
  const [activeMiniCard, setActiveMiniCard] = useState("all");

  const filtered = useMemo(() => {
    return initialJobs.filter((j) => {
      if (activeTab === "open" && j.status !== "OPEN") return false;
      if (activeTab === "closed" && j.status === "OPEN") return false;
      if (ecosystemFilter !== "all" && j.workEcosystem !== ecosystemFilter) {
        return false;
      }
      if (categoryFilter !== "all" && j.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !j.title.toLowerCase().includes(q) &&
          !j.department.toLowerCase().includes(q) &&
          !j.location.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialJobs, activeTab, ecosystemFilter, categoryFilter, searchQuery]);

  const selectedJob =
    selectedId === "new"
      ? null
      : filtered.find((j) => j.id === selectedId) ?? filtered[0] ?? null;

  const openCount = initialJobs.filter((j) => j.status === "OPEN").length;
  const closedCount = initialJobs.length - openCount;
  const remoteCount = initialJobs.filter(
    (j) => j.workEcosystem === "Remote"
  ).length;
  const departmentsCount = new Set(initialJobs.map((j) => j.department)).size;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Careers & Openings"
        backHref="/company/team"
        primaryActionLabel="New Job Opening"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Open Positions", value: String(openCount), unit: "roles" },
          { label: "Remote Roles", value: String(remoteCount), unit: "remote" },
          { label: "Departments", value: String(departmentsCount), unit: "teams" },
        ]}
        timelineSegments={[
          {
            label: "Remote",
            endLabel: `${remoteCount} roles`,
            progressPercent: 70,
            avatars: ["RM"],
          },
          {
            label: "Hybrid",
            endLabel: `${initialJobs.filter((j) => j.workEcosystem === "Hybrid").length} roles`,
            progressPercent: 50,
            avatars: ["HY"],
          },
          {
            label: "On-site",
            endLabel: `${initialJobs.filter((j) => j.workEcosystem === "On-site").length} roles`,
            progressPercent: 35,
            avatars: ["OS"],
          },
        ]}
        rightTitle="Talent Pipeline"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /careers"
        rightActionLabel="View Applicants"
        onRightAction={() => router.push("/crm/applicants")}
        miniCards={[
          {
            id: "Remote",
            code: "Remote",
            title: `${remoteCount} Roles`,
            subtitle: "Work Anywhere",
            highlighted: activeMiniCard === "Remote",
          },
          {
            id: "Hybrid",
            code: "Hybrid",
            title: `${initialJobs.filter((j) => j.workEcosystem === "Hybrid").length} Roles`,
            subtitle: "Jakarta Office",
            highlighted: activeMiniCard === "Hybrid",
          },
          {
            id: "On-site",
            code: "On-site",
            title: `${initialJobs.filter((j) => j.workEcosystem === "On-site").length} Roles`,
            subtitle: "Hardware & Lab",
            highlighted: activeMiniCard === "On-site",
          },
        ]}
        onMiniCardClick={(id) => {
          if (activeMiniCard === id) {
            setActiveMiniCard("all");
            setEcosystemFilter("all");
          } else {
            setActiveMiniCard(id);
            setEcosystemFilter(id);
          }
        }}
      />

      <FilterPillBar
        activeCount={
          (ecosystemFilter !== "all" ? 1 : 0) +
          (categoryFilter !== "all" ? 1 : 0) +
          (searchQuery.trim() ? 1 : 0)
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search job title, department, location..."
        selects={[
          {
            id: "ecosystem",
            value: ecosystemFilter,
            onChange: (v) => {
              setEcosystemFilter(v);
              setActiveMiniCard(v);
            },
            options: [
              { label: "All ecosystems", value: "all" },
              ...WORK_ECOSYSTEMS.map((w) => ({ label: w, value: w })),
            ],
          },
          {
            id: "category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: "All categories", value: "all" },
              ...JOB_CATEGORIES.map((c) => ({ label: c, value: c })),
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Roles", count: initialJobs.length },
          { id: "open", label: "Open", count: openCount },
          { id: "closed", label: "Closed / Draft", count: closedCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Job Openings"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((job) => (
              <MasterListItem
                key={job.id}
                selected={selectedId !== "new" && selectedJob?.id === job.id}
                onClick={() => setSelectedId(job.id)}
                avatarText={job.department.slice(0, 2).toUpperCase()}
                title={job.title}
                subtitle={`${job.type} · ${job.workEcosystem}`}
                statusLabel={job.status}
                rightMetric={job.category}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada lowongan sesuai filter.
            </div>
          )
        }
        rightContent={
          <JobOpeningForm
            key={selectedId === "new" ? "new" : String(selectedJob?.id ?? "new")}
            job={selectedJob}
            onSaved={(saved) => {
              setSelectedId(saved.id);
              router.refresh();
            }}
            onDeleted={() => {
              setSelectedId("new");
              router.refresh();
            }}
          />
        }
      />
    </div>
  );
}
