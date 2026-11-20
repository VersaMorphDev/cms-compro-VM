"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconWand } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import RichContentEditor from "@/components/editor/RichContentEditor";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { slugify } from "@/lib/utils";
import { deleteLegalPageAction, saveLegalPageAction } from "../actions";
import type { LegalPageDTO } from "../schema";

interface LegalPagesManagerClientProps {
  initialPages: LegalPageDTO[];
  storageMode: "database" | "memory";
}

const CORE_POLICY_SLUGS = new Set([
  "privacy-policy",
  "terms-conditions",
  "cookie-policy",
  "applicant-privacy",
  "newsletter-policy",
]);

function LegalPageForm({
  page,
  onSaved,
  onDeleted,
}: {
  page: LegalPageDTO | null;
  onSaved: (saved: LegalPageDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [version, setVersion] = useState(page?.version ?? "1.0");
  const [lastUpdated, setLastUpdated] = useState(page?.lastUpdated ?? "June 2026");
  const [subtitle, setSubtitle] = useState(page?.subtitle ?? "");
  const [content, setContent] = useState(page?.content ?? "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveLegalPageAction({
        id: page?.id,
        slug: slug || slugify(title),
        title,
        subtitle,
        lastUpdated,
        tocSections: page?.tocSections ?? [],
        version,
        content,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: page ? "Dokumen legal diperbarui" : "Dokumen legal dibuat",
          description: `"${res.data.title}" (v${res.data.version}) tersimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input dokumen"
            : "Gagal menyimpan dokumen",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!page) return;
    startTransition(async () => {
      const res = await deleteLegalPageAction(page.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Dokumen legal dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus dokumen",
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
              {page ? `Legal Document #${page.id}` : "Create Legal Document"}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {title || "Untitled Legal Document"}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#1C2029] border border-white/15 text-xs font-mono font-semibold text-[#86FF00]">
            v{version}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Document Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!page) setSlug(slugify(e.target.value));
              }}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Route Slug
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSlug(slugify(title))}
                className="px-2 rounded-xl bg-[#1C2029] border border-white/10 hover:border-[#86FF00] text-slate-300 cursor-pointer"
              >
                <IconWand size={13} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Version
            </label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Last Updated Label
            </label>
            <input
              type="text"
              value={lastUpdated}
              onChange={(e) => setLastUpdated(e.target.value)}
              placeholder="June 2026"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Document Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <RichContentEditor
          label="Legal Document Content (HTML)"
          value={content}
          onChange={setContent}
          mode="html"
          minRows={8}
        />

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400">Compro Route</span>
            <span className="font-mono text-slate-300">
              /{slug || "legal-slug"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {page && (
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
              {isPending ? "Saving..." : "Save Legal Document"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Dokumen Legal?"
        description={`Dokumen "${page?.title}" akan dihapus dari daftar halaman legal.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function LegalPagesManagerClient({
  initialPages,
  storageMode,
}: LegalPagesManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialPages[0]?.id ?? "new"
  );

  const filtered = useMemo(() => {
    return initialPages.filter((p) => {
      if (activeTab === "policies" && !CORE_POLICY_SLUGS.has(p.slug)) {
        return false;
      }
      if (activeTab === "agreements" && CORE_POLICY_SLUGS.has(p.slug)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.slug.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialPages, activeTab, searchQuery]);

  const selectedPage =
    selectedId === "new"
      ? null
      : filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const policiesCount = initialPages.filter((p) =>
    CORE_POLICY_SLUGS.has(p.slug)
  ).length;
  const agreementsCount = initialPages.length - policiesCount;

  const quickJump = (slug: string) => {
    const found = initialPages.find((p) => p.slug === slug);
    if (found) {
      setActiveTab("all");
      setSelectedId(found.id);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Legal Pages"
        backHref="/company/team"
        primaryActionLabel="New Legal Doc"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Legal Documents", value: String(initialPages.length), unit: "pages" },
          { label: "Core Policies", value: String(policiesCount), unit: "docs" },
          { label: "Enterprise Contracts", value: String(agreementsCount), unit: "SLA/DPA/NDA" },
        ]}
        timelineSegments={[
          {
            label: "Privacy & Cookies",
            endLabel: "GDPR / UU PDP",
            progressPercent: 100,
            avatars: ["PP", "CP"],
          },
          {
            label: "Enterprise SLA/DPA",
            endLabel: "B2B Ready",
            progressPercent: 100,
            avatars: ["SL", "DP"],
          },
          {
            label: "Partner & Affiliate",
            endLabel: "Agreements",
            progressPercent: 90,
            avatars: ["AF", "PT"],
          },
        ]}
        rightTitle="Compliance Repository"
        rightValue={storageMode === "database" ? "SQLite" : "Memory Store"}
        rightBadge={`${initialPages.length} Legal Routes`}
        rightActionLabel="+ Add Document"
        onRightAction={() => setSelectedId("new")}
        miniCards={[
          {
            id: "privacy-policy",
            code: "Policy",
            title: "Privacy Policy",
            subtitle: "/privacy-policy",
            highlighted: selectedPage?.slug === "privacy-policy",
          },
          {
            id: "sla",
            code: "Enterprise",
            title: "SLA Agreement",
            subtitle: "/sla",
            highlighted: selectedPage?.slug === "sla",
          },
          {
            id: "dpa",
            code: "Compliance",
            title: "DPA Notice",
            subtitle: "/dpa",
            highlighted: selectedPage?.slug === "dpa",
          },
        ]}
        onMiniCardClick={quickJump}
      />

      <FilterPillBar
        activeCount={searchQuery.trim() ? 1 : 0}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search legal document title or slug..."
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Legal Docs", count: initialPages.length },
          { id: "policies", label: "Core Policies", count: policiesCount },
          { id: "agreements", label: "Agreements", count: agreementsCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Compliance Documents"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((doc) => (
              <MasterListItem
                key={doc.id}
                selected={selectedId !== "new" && selectedPage?.id === doc.id}
                onClick={() => setSelectedId(doc.id)}
                avatarText={doc.slug.slice(0, 2).toUpperCase()}
                title={doc.title}
                subtitle={`/${doc.slug}`}
                statusLabel={`v${doc.version}`}
                rightMetric={`#${doc.id}`}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Dokumen legal tidak ditemukan.
            </div>
          )
        }
        rightContent={
          <LegalPageForm
            key={selectedId === "new" ? "new" : String(selectedPage?.id ?? "new")}
            page={selectedPage}
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
