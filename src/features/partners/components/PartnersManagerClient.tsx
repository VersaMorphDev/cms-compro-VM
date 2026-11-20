"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { deletePartnerAction, savePartnerAction } from "../actions";
import { PARTNER_CATEGORIES, type PartnerDTO } from "../schema";

interface PartnersManagerClientProps {
  initialPartners: PartnerDTO[];
  storageMode: "database" | "memory";
}

function PartnerEditorForm({
  partner,
  onSaved,
  onDeleted,
}: {
  partner: PartnerDTO | null;
  onSaved: (saved: PartnerDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [name, setName] = useState(partner?.name ?? "");
  const [category, setCategory] = useState<string>(
    partner?.category ?? PARTNER_CATEGORIES[0]
  );
  const [url, setUrl] = useState(partner?.url ?? "");
  const [logo, setLogo] = useState(partner?.logo ?? "");
  const [color, setColor] = useState(partner?.color ?? "86FF00");
  const [description, setDescription] = useState(partner?.description ?? "");
  const [details, setDetails] = useState(partner?.details ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    partner?.status ?? "PUBLISHED"
  );
  const [sortOrder, setSortOrder] = useState<number>(partner?.sortOrder ?? 0);

  const normalizedHex = color.replace(/^#/, "").slice(0, 6);
  const isValidHex = /^[0-9A-Fa-f]{6}$/.test(normalizedHex);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await savePartnerAction({
        id: partner?.id,
        name,
        category,
        url: url || null,
        logo,
        color: normalizedHex,
        description,
        details,
        status,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: partner ? "Mitra diperbarui" : "Mitra baru ditambahkan",
          description: `"${res.data.name}" berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input mitra"
            : "Gagal menyimpan mitra",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!partner) return;
    startTransition(async () => {
      const res = await deletePartnerAction(partner.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Mitra dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus mitra",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
        {/* Top Brand Badge Preview */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl border border-white/15 flex items-center justify-center text-xs font-bold uppercase text-white shrink-0"
              style={{
                backgroundColor: isValidHex ? `#${normalizedHex}22` : "#1C2029",
                borderColor: isValidHex ? `#${normalizedHex}66` : undefined,
              }}
            >
              {name ? name.slice(0, 2) : "PT"}
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">
                {partner ? `Partner #${partner.id}` : "New Technology Partner"}
              </p>
              <h3 className="font-display font-bold text-lg text-white">
                {name || "Untitled Partner"}
              </h3>
            </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Partner Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS, Cloudflare"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
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
              {PARTNER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              SimpleIcons Logo Slug
            </label>
            <input
              type="text"
              required
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="amazonwebservices"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Brand Color (Hex)
              </label>
              <div className="flex items-center gap-2 bg-[#1C2029] border border-white/10 rounded-xl px-2.5 py-1.5">
                <input
                  type="color"
                  value={isValidHex ? `#${normalizedHex}` : "#86FF00"}
                  onChange={(e) => setColor(e.target.value.replace("#", "").toUpperCase())}
                  className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  required
                  value={normalizedHex}
                  onChange={(e) => setColor(e.target.value.replace("#", "").toUpperCase())}
                  maxLength={6}
                  className="w-full bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                />
              </div>
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
              Partner Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://aws.amazon.com"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Short Headline Description
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Partnership Capabilities & Details
            </label>
            <textarea
              rows={4}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Compro Route</span>
              <span className="font-mono text-slate-300">/partners</span>
            </div>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#86FF00] hover:underline"
              >
                <span>Visit Site</span>
                <IconExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {partner && (
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
              {isPending ? "Saving..." : "Save Partner"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Mitra Teknologi?"
        description={`Mitra "${partner?.name}" akan dihapus dari halaman Partners.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function PartnersManagerClient({
  initialPartners,
  storageMode,
}: PartnersManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialPartners[0]?.id ?? "new"
  );
  const [activeMiniCard, setActiveMiniCard] = useState("all");

  const filtered = useMemo(() => {
    return initialPartners.filter((p) => {
      if (activeTab === "draft" && p.status !== "DRAFT") return false;
      if (activeTab === "published" && p.status !== "PUBLISHED") return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialPartners, activeTab, categoryFilter, statusFilter, searchQuery]);

  const selectedPartner =
    selectedId === "new"
      ? null
      : filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const editorKey =
    selectedId === "new" ? "new" : String(selectedPartner?.id ?? "new");

  const publishedCount = initialPartners.filter(
    (p) => p.status === "PUBLISHED"
  ).length;
  const draftCount = initialPartners.filter((p) => p.status === "DRAFT").length;
  const categoriesCovered = new Set(initialPartners.map((p) => p.category)).size;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Technology Partners"
        backHref="/"
        primaryActionLabel="New Partner"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Total Partners", value: String(initialPartners.length), unit: "brands" },
          { label: "Published Live", value: String(publishedCount), unit: "active" },
          { label: "Categories Covered", value: String(categoriesCovered), unit: "domains" },
        ]}
        timelineSegments={[
          {
            label: "Cloud Infrastructure",
            endLabel: `${initialPartners.filter((p) => p.category === "Cloud Infrastructure").length}`,
            progressPercent: 85,
            avatars: ["AW", "GC", "AZ"],
          },
          {
            label: "DevOps & Automation",
            endLabel: `${initialPartners.filter((p) => p.category === "DevOps & Automation").length}`,
            progressPercent: 60,
            avatars: ["DK", "GH"],
          },
          {
            label: "AI & Security",
            endLabel: `${initialPartners.filter((p) => p.category === "AI & Machine Learning" || p.category === "Security & Identity").length}`,
            progressPercent: 35,
            avatars: ["AI"],
          },
        ]}
        rightTitle="Ecosystem Directory"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /partners"
        rightActionLabel="+ Add Partner"
        onRightAction={() => setSelectedId("new")}
        miniCards={[
          {
            id: "all",
            code: "All Partners",
            title: `${initialPartners.length} Brands`,
            subtitle: "Full Ecosystem",
            highlighted: activeMiniCard === "all",
          },
          {
            id: "Cloud Infrastructure",
            code: "Cloud",
            title: `${initialPartners.filter((p) => p.category === "Cloud Infrastructure").length} Partners`,
            subtitle: "AWS, GCP, Azure",
            highlighted: activeMiniCard === "Cloud Infrastructure",
          },
          {
            id: "DevOps & Automation",
            code: "DevOps",
            title: `${initialPartners.filter((p) => p.category === "DevOps & Automation").length} Partners`,
            subtitle: "CI/CD & Containers",
            highlighted: activeMiniCard === "DevOps & Automation",
          },
        ]}
        onMiniCardClick={(id) => {
          setActiveMiniCard(id);
          setCategoryFilter(id);
        }}
      />

      <FilterPillBar
        activeCount={
          (categoryFilter !== "all" ? 1 : 0) +
          (statusFilter !== "all" ? 1 : 0) +
          (searchQuery.trim() ? 1 : 0)
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search partner name or capability..."
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
              ...PARTNER_CATEGORIES.map((c) => ({ label: c, value: c })),
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
          { id: "all", label: "All Partners", count: initialPartners.length },
          { id: "draft", label: "Draft", count: draftCount },
          { id: "published", label: "Published", count: publishedCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Partner Directory"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((partner) => (
              <MasterListItem
                key={partner.id}
                selected={
                  selectedId !== "new" && selectedPartner?.id === partner.id
                }
                onClick={() => setSelectedId(partner.id)}
                avatarText={partner.name.slice(0, 2).toUpperCase()}
                title={partner.name}
                subtitle={partner.category}
                statusLabel={partner.status}
                rightMetric={`#${partner.color}`}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada mitra ditemukan.
            </div>
          )
        }
        rightContent={
          <PartnerEditorForm
            key={editorKey}
            partner={selectedPartner}
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
