"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconQuote, IconTrash } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { deleteTestimonialAction, saveTestimonialAction } from "../actions";
import type { TestimonialDTO } from "../schema";

interface TestimonialsManagerClientProps {
  initialTestimonials: TestimonialDTO[];
  storageMode: "database" | "memory";
}

function TestimonialForm({
  item,
  onSaved,
  onDeleted,
}: {
  item: TestimonialDTO | null;
  onSaved: (saved: TestimonialDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [quote, setQuote] = useState(item?.quote ?? "");
  const [author, setAuthor] = useState(item?.author ?? "");
  const [role, setRole] = useState(item?.role ?? "");
  const [company, setCompany] = useState(item?.company ?? "");
  const [project, setProject] = useState(item?.project ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    item?.status ?? "PUBLISHED"
  );
  const [sortOrder, setSortOrder] = useState<number>(item?.sortOrder ?? 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveTestimonialAction({
        id: item?.id,
        quote,
        author,
        role,
        company,
        project,
        status,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: item ? "Testimoni diperbarui" : "Testimoni baru ditambahkan",
          description: `Testimoni dari ${res.data.company} berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input testimoni"
            : "Gagal menyimpan testimoni",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!item) return;
    startTransition(async () => {
      const res = await deleteTestimonialAction(item.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Testimoni dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus testimoni",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
        {/* Live Quote Card Preview */}
        <div className="bg-[#1C2029] border border-[#86FF00]/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#86FF00]">
              <IconQuote size={13} /> Live Quote Preview
            </span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "DRAFT" | "PUBLISHED")
              }
              className="bg-[#14171E] border border-white/15 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
            >
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>
          <p className="text-xs italic text-slate-200 leading-relaxed">
            &ldquo;{quote || "Your client endorsement quote preview..."}&rdquo;
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            — {author || "Initials"}, {role || "Role"} at{" "}
            <span className="text-white">{company || "Client Company"}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Author Initials / Name
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. D.O."
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Client Role
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. CTO, Operations Director"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Company / Client Label
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Related Project
              </label>
              <input
                type="text"
                required
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
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
                className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Quote Text
            </label>
            <textarea
              rows={4}
              required
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400">Shown On</span>
            <span className="font-mono text-slate-300">Homepage & Portfolio</span>
          </div>

          <div className="flex items-center gap-2">
            {item && (
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
              {isPending ? "Saving..." : "Save Testimonial"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Testimoni?"
        description={`Testimoni dari "${item?.company}" akan dihapus permanen.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function TestimonialsManagerClient({
  initialTestimonials,
  storageMode,
}: TestimonialsManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialTestimonials[0]?.id ?? "new"
  );

  const filtered = useMemo(() => {
    return initialTestimonials.filter((t) => {
      if (activeTab === "draft" && t.status !== "DRAFT") return false;
      if (activeTab === "published" && t.status !== "PUBLISHED") return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !t.company.toLowerCase().includes(q) &&
          !t.project.toLowerCase().includes(q) &&
          !t.quote.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialTestimonials, activeTab, statusFilter, searchQuery]);

  const selected =
    selectedId === "new"
      ? null
      : filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const publishedCount = initialTestimonials.filter(
    (t) => t.status === "PUBLISHED"
  ).length;
  const draftCount = initialTestimonials.filter(
    (t) => t.status === "DRAFT"
  ).length;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Client Testimonials"
        backHref="/company/team"
        primaryActionLabel="New Testimonial"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Total Testimonials", value: String(initialTestimonials.length), unit: "quotes" },
          { label: "Published Live", value: String(publishedCount), unit: "active" },
          { label: "Drafts", value: String(draftCount), unit: "pending" },
        ]}
        timelineSegments={[
          {
            label: "Enterprise Banking & Gov",
            endLabel: "Verified",
            progressPercent: 85,
            avatars: ["RH", "BS"],
          },
          {
            label: "Healthcare & IoT",
            endLabel: "Verified",
            progressPercent: 75,
            avatars: ["JP", "TA"],
          },
          {
            label: "Logistics & Retail",
            endLabel: "Verified",
            progressPercent: 90,
            avatars: ["DO", "SW"],
          },
        ]}
        rightTitle="Social Proof Feed"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Homepage Carousel"
        rightActionLabel="+ Add Quote"
        onRightAction={() => setSelectedId("new")}
        miniCards={initialTestimonials.slice(0, 3).map((t, idx) => ({
          id: String(t.id),
          code: t.author,
          title: t.project,
          subtitle: t.company,
          highlighted: idx === 0,
        }))}
        onMiniCardClick={(id) => setSelectedId(Number(id))}
      />

      <FilterPillBar
        activeCount={(statusFilter !== "all" ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search company, project, quote..."
        selects={[
          {
            id: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All statuses", value: "all" },
              { label: "Published", value: "PUBLISHED" },
              { label: "Draft", value: "DRAFT" },
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Quotes", count: initialTestimonials.length },
          { id: "draft", label: "Draft", count: draftCount },
          { id: "published", label: "Published", count: publishedCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Client Endorsements"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((item) => (
              <MasterListItem
                key={item.id}
                selected={selectedId !== "new" && selected?.id === item.id}
                onClick={() => setSelectedId(item.id)}
                avatarText={item.author.replace(/[^A-Za-z]/g, "").slice(0, 2) || "CL"}
                title={`${item.author} · ${item.company}`}
                subtitle={`${item.role} — ${item.project}`}
                statusLabel={item.status}
                rightMetric={`#${item.sortOrder}`}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada testimoni ditemukan.
            </div>
          )
        }
        rightContent={
          <TestimonialForm
            key={selectedId === "new" ? "new" : String(selected?.id ?? "new")}
            item={selected}
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
