"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import RichContentEditor from "@/components/editor/RichContentEditor";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { deleteFaqAction, saveFaqAction } from "../actions";
import { FAQ_CATEGORIES, type FaqItemDTO } from "../schema";

interface FaqManagerClientProps {
  initialFaqs: FaqItemDTO[];
  storageMode: "database" | "memory";
}

function FaqEditorForm({
  faq,
  onSaved,
  onDeleted,
}: {
  faq: FaqItemDTO | null;
  onSaved: (saved: FaqItemDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState<string>(
    faq?.category ?? FAQ_CATEGORIES[0]
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    faq?.status ?? "PUBLISHED"
  );
  const [sortOrder, setSortOrder] = useState<number>(faq?.sortOrder ?? 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveFaqAction({
        id: faq?.id,
        question,
        answer,
        category,
        status,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: faq ? "FAQ diperbarui" : "FAQ baru ditambahkan",
          description: `"${res.data.question}" berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input FAQ"
            : "Gagal menyimpan FAQ",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!faq) return;
    startTransition(async () => {
      const res = await deleteFaqAction(faq.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({
          type: "success",
          title: "FAQ dihapus",
          description: "Pertanyaan telah dihapus dari daftar FAQ.",
        });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus FAQ",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              {faq ? `FAQ #${faq.id}` : "Create New FAQ"}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {question || "New Frequently Asked Question"}
            </h3>
          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "DRAFT" | "PUBLISHED")
            }
            className="bg-[#1C2029] border border-white/15 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            >
              {FAQ_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Question
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What does Versa Morph do?"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <RichContentEditor
          label="Answer (Markdown Supported)"
          value={answer}
          onChange={setAnswer}
          mode="markdown"
          minRows={7}
          placeholder="Write a clear answer using **bold** and - bullet points..."
        />

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-5 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Category</span>
              <span className="font-semibold text-white">{category}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Compro Route</span>
              <span className="font-mono text-slate-300">/faq</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {faq && (
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
              {isPending ? "Saving..." : "Save FAQ"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus FAQ?"
        description={`Pertanyaan "${faq?.question}" akan dihapus permanen.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function FaqManagerClient({
  initialFaqs,
  storageMode,
}: FaqManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialFaqs[0]?.id ?? "new"
  );
  const [activeMiniCard, setActiveMiniCard] = useState("all");

  const filtered = useMemo(() => {
    return initialFaqs.filter((item) => {
      if (activeTab === "draft" && item.status !== "DRAFT") return false;
      if (activeTab === "published" && item.status !== "PUBLISHED") return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.question.toLowerCase().includes(q) &&
          !item.answer.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialFaqs, activeTab, categoryFilter, statusFilter, searchQuery]);

  const selectedFaq =
    selectedId === "new"
      ? null
      : filtered.find((f) => f.id === selectedId) ?? filtered[0] ?? null;

  const editorKey =
    selectedId === "new" ? "new" : String(selectedFaq?.id ?? "new");

  const publishedCount = initialFaqs.filter(
    (f) => f.status === "PUBLISHED"
  ).length;
  const draftCount = initialFaqs.filter((f) => f.status === "DRAFT").length;

  const activeFiltersCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="FAQ Management"
        backHref="/"
        primaryActionLabel="New FAQ"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Total Questions", value: String(initialFaqs.length), unit: "items" },
          { label: "Published Live", value: String(publishedCount), unit: "live" },
          { label: "Categories", value: String(FAQ_CATEGORIES.length), unit: "groups" },
        ]}
        timelineSegments={[
          {
            label: "General & Services",
            endLabel: `${initialFaqs.filter((f) => f.category === "General" || f.category === "Services").length}`,
            progressPercent: 70,
            avatars: ["GN", "SV"],
          },
          {
            label: "Process & Tech",
            endLabel: `${initialFaqs.filter((f) => f.category === "Process" || f.category === "Technical").length}`,
            progressPercent: 60,
            avatars: ["PR", "TX"],
          },
          {
            label: "Support",
            endLabel: `${initialFaqs.filter((f) => f.category === "Support").length}`,
            progressPercent: 40,
            avatars: ["SP"],
          },
        ]}
        rightTitle="Knowledge Base"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /faq"
        rightActionLabel="+ Add FAQ"
        onRightAction={() => setSelectedId("new")}
        miniCards={[
          {
            id: "all",
            code: "All FAQs",
            title: `${initialFaqs.length} Questions`,
            subtitle: "Full Index",
            highlighted: activeMiniCard === "all",
          },
          {
            id: "Services",
            code: "Services",
            title: `${initialFaqs.filter((f) => f.category === "Services").length} Items`,
            subtitle: "Pricing & Scope",
            highlighted: activeMiniCard === "Services",
          },
          {
            id: "Technical",
            code: "Technical",
            title: `${initialFaqs.filter((f) => f.category === "Technical").length} Items`,
            subtitle: "Stack & Security",
            highlighted: activeMiniCard === "Technical",
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
        searchPlaceholder="Search question or answer..."
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
              ...FAQ_CATEGORIES.map((c) => ({ label: c, value: c })),
            ],
          },
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
          { id: "all", label: "All FAQs", count: initialFaqs.length },
          { id: "draft", label: "Draft", count: draftCount },
          { id: "published", label: "Published", count: publishedCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="FAQ Entries"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((item) => (
              <MasterListItem
                key={item.id}
                selected={selectedId !== "new" && selectedFaq?.id === item.id}
                onClick={() => setSelectedId(item.id)}
                avatarText={item.category.slice(0, 2).toUpperCase()}
                title={item.question}
                subtitle={`Order #${item.sortOrder} · ${item.category}`}
                statusLabel={item.status}
                rightMetric={`#${item.id}`}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada FAQ yang sesuai filter.
            </div>
          )
        }
        rightContent={
          <FaqEditorForm
            key={editorKey}
            faq={selectedFaq}
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
