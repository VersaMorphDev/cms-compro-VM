"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash, IconWand, IconX } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import DynamicListInput from "@/components/editor/DynamicListInput";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { cn, slugify } from "@/lib/utils";
import type { ProjectTimelinePhase } from "@/db/schema";
import { deleteProjectAction, saveProjectAction } from "../actions";
import {
  PROJECT_CATEGORIES,
  PROJECT_GRADIENTS,
  type ProjectDTO,
} from "../schema";

interface PortfolioManagerClientProps {
  initialProjects: ProjectDTO[];
  storageMode: "database" | "memory";
}

function ProjectEditorForm({
  project,
  onSaved,
  onDeleted,
}: {
  project: ProjectDTO | null;
  onSaved: (saved: ProjectDTO) => void;
  onDeleted: (deletedId: number) => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [subTab, setSubTab] = useState<"overview" | "casestudy" | "timeline">(
    "overview"
  );

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [client, setClient] = useState(project?.client ?? "");
  const [industry, setIndustry] = useState(project?.industry ?? "");
  const [year, setYear] = useState(project?.year ?? "2026");
  const [category, setCategory] = useState(
    project?.category ?? PROJECT_CATEGORIES[0]
  );
  const [image, setImage] = useState(project?.image ?? "");
  const [gradient, setGradient] = useState(
    project?.gradient ?? PROJECT_GRADIENTS[0].value
  );
  const [description, setDescription] = useState(project?.description ?? "");
  const [problem, setProblem] = useState(project?.problem ?? "");
  const [solution, setSolution] = useState(project?.solution ?? "");
  const [result, setResult] = useState(project?.result ?? "");
  const [tech, setTech] = useState<string[]>(project?.tech ?? []);
  const [timeline, setTimeline] = useState<ProjectTimelinePhase[]>(
    project?.timeline ?? [
      { phase: "Phase 1", title: "Discovery & Audit", desc: "Initial assessment." },
    ]
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    project?.status ?? "PUBLISHED"
  );
  const [sortOrder, setSortOrder] = useState<number>(project?.sortOrder ?? 0);

  const handleAddPhase = () => {
    setTimeline((prev) => [
      ...prev,
      {
        phase: `Phase ${prev.length + 1}`,
        title: "New Milestone",
        desc: "Describe key deliverables in this phase...",
      },
    ]);
  };

  const handlePhaseChange = (
    idx: number,
    field: keyof ProjectTimelinePhase,
    val: string
  ) => {
    setTimeline((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleRemovePhase = (idx: number) => {
    setTimeline((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveProjectAction({
        id: project?.id,
        slug: slug || slugify(title),
        title,
        client,
        industry,
        year,
        category,
        description,
        problem,
        solution,
        result,
        tech,
        gradient,
        image: image || null,
        timeline,
        status,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: project ? "Studi kasus diperbarui" : "Proyek baru dibuat",
          description: `"${res.data.title}" berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Lengkapi semua tab formulir"
            : "Gagal menyimpan proyek",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!project) return;
    startTransition(async () => {
      const res = await deleteProjectAction(project.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({
          type: "success",
          title: "Proyek dihapus",
          description: `"${project.title}" telah dihapus.`,
        });
        onDeleted(project.id);
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus proyek",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
        {/* Header & Sub-Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              {project ? `Case Study #${project.id}` : "New Case Study"}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {title || "Untitled Project"}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B0D12] p-1 rounded-full border border-white/10">
            {(
              [
                { id: "overview", label: "Overview" },
                { id: "casestudy", label: "Case Study" },
                { id: "timeline", label: "Tech & Timeline" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer",
                  subTab === t.id
                    ? "bg-[#86FF00] text-[#090A0F]"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-tab 1: Overview */}
        {subTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Project Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!project) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. AI-Powered Patient Monitoring Ecosystem"
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
                Client Name
              </label>
              <input
                type="text"
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Industry
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Healthcare, Finance, Logistics..."
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Year
                </label>
                <input
                  type="text"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Status & Theme Gradient
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                  }
                  className="bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
                <select
                  value={gradient}
                  onChange={(e) => setGradient(e.target.value)}
                  className="bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  {PROJECT_GRADIENTS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Project Image Path / URL
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/projects/ai-patient-monitoring.jpg"
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Overview Description
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Sub-tab 2: Case Study (Problem, Solution, Result) */}
        {subTab === "casestudy" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-rose-400">
                The Problem (Challenge)
              </label>
              <textarea
                rows={4}
                required
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe client bottlenecks, costs, and technical limitations..."
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-sky-400">
                The Solution (Architecture & Engineering)
              </label>
              <textarea
                rows={4}
                required
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Explain how Versa Morph architected and delivered the system..."
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-[#86FF00]">
                The Result (Measurable Impact)
              </label>
              <textarea
                rows={4}
                required
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Quantified outcomes, SLA improvements, savings..."
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Sub-tab 3: Tech Stack & Timeline Builder */}
        {subTab === "timeline" && (
          <div className="space-y-4">
            <DynamicListInput
              label="Technology Stack"
              items={tech}
              onChange={setTech}
              placeholder="e.g. Next.js, TensorFlow, PostgreSQL"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-400">
                  Delivery Timeline Phases ({timeline.length})
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1C2029] border border-white/8 rounded-2xl p-3 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.phase}
                        onChange={(e) =>
                          handlePhaseChange(idx, "phase", e.target.value)
                        }
                        placeholder="Phase 1"
                        className="w-24 bg-[#14171E] border border-white/10 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#86FF00] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhase(idx)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        aria-label="Remove phase"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handlePhaseChange(idx, "title", e.target.value)
                      }
                      placeholder="Milestone Title"
                      className="w-full bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) =>
                        handlePhaseChange(idx, "desc", e.target.value)
                      }
                      placeholder="Milestone description..."
                      className="w-full bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                    />
                  </div>
                ))}

                {/* Diagonal-hatch Add Phase Card matching reference UI */}
                <button
                  type="button"
                  onClick={handleAddPhase}
                  className="bg-diagonal-hatch border border-dashed border-white/15 hover:border-[#86FF00]/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[124px] transition-colors group cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-[#1C2029] border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-[#86FF00] group-hover:text-[#090A0F] transition-colors">
                    <IconPlus size={16} />
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-white">
                    Add Timeline Phase
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Action Bar */}
        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-5 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Tech Stack</span>
              <span className="font-semibold text-white">
                {tech.length} Technologies
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Timeline</span>
              <span className="font-semibold text-white">
                {timeline.length} Phases
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Compro URL</span>
              <span className="font-mono text-[11px] text-slate-300">
                /portfolio/{slug || "auto"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
                className="w-9 h-9 rounded-full bg-[#14171E] border border-white/10 hover:border-rose-500/50 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
              >
                <IconTrash size={16} />
              </button>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 shadow-[0_4px_18px_rgba(134,255,0,0.25)]"
            >
              {isPending ? "Saving..." : "Save Case Study"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Studi Kasus?"
        description={`Proyek "${project?.title}" akan dihapus dari portofolio website.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function PortfolioManagerClient({
  initialProjects,
  storageMode,
}: PortfolioManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialProjects[0]?.id ?? "new"
  );
  const [activeMiniCard, setActiveMiniCard] = useState("all");

  const industries = useMemo(
    () => Array.from(new Set(initialProjects.map((p) => p.industry))).sort(),
    [initialProjects]
  );

  const filtered = useMemo(() => {
    return initialProjects.filter((p) => {
      if (activeTab === "draft" && p.status !== "DRAFT") return false;
      if (activeTab === "published" && p.status !== "PUBLISHED") return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }
      if (industryFilter !== "all" && p.industry !== industryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.client.toLowerCase().includes(q) &&
          !p.industry.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialProjects, activeTab, categoryFilter, industryFilter, searchQuery]);

  const selectedProject =
    selectedId === "new"
      ? null
      : filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const editorKey =
    selectedId === "new" ? "new" : String(selectedProject?.id ?? "new");

  const publishedCount = initialProjects.filter(
    (p) => p.status === "PUBLISHED"
  ).length;
  const draftCount = initialProjects.filter((p) => p.status === "DRAFT").length;

  const activeFiltersCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (industryFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Portfolio & Case Studies"
        backHref="/"
        primaryActionLabel="New Project"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          {
            label: "Total Case Studies",
            value: String(initialProjects.length),
            unit: "projects",
          },
          {
            label: "Published Live",
            value: String(publishedCount),
            unit: "cases",
          },
          {
            label: "Industries Served",
            value: String(industries.length),
            unit: "sectors",
          },
        ]}
        timelineSegments={[
          {
            label: "AI & ML",
            endLabel: "Cases",
            progressPercent: 75,
            avatars: ["AI", "ML"],
          },
          {
            label: "Enterprise Software",
            endLabel: "Cases",
            progressPercent: 85,
            avatars: ["SW", "DB"],
          },
          {
            label: "IoT & Hardware",
            endLabel: "Cases",
            progressPercent: 60,
            avatars: ["IO"],
          },
        ]}
        rightTitle="Portfolio Showcase"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /portfolio"
        rightActionLabel="+ Add Project"
        onRightAction={() => setSelectedId("new")}
        miniCards={[
          {
            id: "all",
            code: "All Cases",
            title: `${initialProjects.length} Projects`,
            subtitle: "Full Archive",
            highlighted: activeMiniCard === "all",
          },
          {
            id: "AI & ML",
            code: "AI & ML",
            title: `${initialProjects.filter((p) => p.category === "AI & ML").length} Cases`,
            subtitle: "Intelligent Systems",
            highlighted: activeMiniCard === "AI & ML",
          },
          {
            id: "Software",
            code: "Software",
            title: `${initialProjects.filter((p) => p.category === "Software").length} Cases`,
            subtitle: "Core Platforms",
            highlighted: activeMiniCard === "Software",
          },
        ]}
        onMiniCardClick={(id) => {
          setActiveMiniCard(id);
          setCategoryFilter(id);
        }}
      />

      <FilterPillBar
        activeCount={activeFiltersCount}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search project, client, industry..."
        selects={[
          {
            id: "category",
            value: categoryFilter,
            onChange: (v) => {
              setCategoryFilter(v);
              setActiveMiniCard(v);
            },
            options: [
              { label: "All categories", value: "all" },
              ...PROJECT_CATEGORIES.map((c) => ({ label: c, value: c })),
            ],
          },
          {
            id: "industry",
            value: industryFilter,
            onChange: setIndustryFilter,
            options: [
              { label: "All industries", value: "all" },
              ...industries.map((ind) => ({ label: ind, value: ind })),
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Cases", count: initialProjects.length },
          { id: "draft", label: "Draft", count: draftCount },
          { id: "published", label: "Published", count: publishedCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Case Studies List"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((proj) => (
              <MasterListItem
                key={proj.id}
                selected={
                  selectedId !== "new" && selectedProject?.id === proj.id
                }
                onClick={() => setSelectedId(proj.id)}
                avatarText={proj.industry.slice(0, 2).toUpperCase()}
                title={proj.title}
                subtitle={`${proj.client} · ${proj.year}`}
                statusLabel={proj.category}
                rightMetric={proj.status}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada studi kasus yang sesuai filter.
            </div>
          )
        }
        rightContent={
          <ProjectEditorForm
            key={editorKey}
            project={selectedProject}
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
