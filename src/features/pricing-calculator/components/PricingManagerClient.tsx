"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconSparkles, IconTrash } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import DynamicListInput from "@/components/editor/DynamicListInput";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import { deletePricingTierAction, savePricingTierAction } from "../actions";
import type { PricingTierDTO } from "../schema";

interface PricingManagerClientProps {
  initialTiers: PricingTierDTO[];
  storageMode: "database" | "memory";
}

function PricingEditorForm({
  tier,
  onSaved,
  onDeleted,
}: {
  tier: PricingTierDTO | null;
  onSaved: (saved: PricingTierDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [name, setName] = useState(tier?.name ?? "");
  const [description, setDescription] = useState(tier?.description ?? "");
  const [price, setPrice] = useState(tier?.price ?? "IDR 5M");
  const [priceLabel, setPriceLabel] = useState(tier?.priceLabel ?? "Starting at");
  const [cta, setCta] = useState(tier?.cta ?? "Get Started");
  const [ctaHref, setCtaHref] = useState(tier?.ctaHref ?? "/contact");
  const [highlighted, setHighlighted] = useState(tier?.highlighted ?? false);
  const [features, setFeatures] = useState<string[]>(tier?.features ?? []);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    tier?.status ?? "PUBLISHED"
  );
  const [sortOrder, setSortOrder] = useState<number>(tier?.sortOrder ?? 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await savePricingTierAction({
        id: tier?.id,
        name,
        description,
        price,
        priceLabel,
        features,
        highlighted,
        cta,
        ctaHref,
        status,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: tier ? "Paket harga diperbarui" : "Paket harga baru dibuat",
          description: `"${res.data.name}" (${res.data.price}) tersimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input paket harga"
            : "Gagal menyimpan paket harga",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!tier) return;
    startTransition(async () => {
      const res = await deletePricingTierAction(tier.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({
          type: "success",
          title: "Paket harga dihapus",
          description: `"${tier.name}" telah dihapus.`,
        });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus paket",
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
              {tier ? `Tier #${tier.id}` : "Create Pricing Tier"}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {name || "New Package"} ·{" "}
              <span className="text-[#86FF00]">{price || "IDR"}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHighlighted((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                highlighted
                  ? "bg-[#86FF00] text-[#090A0F] border-[#86FF00]"
                  : "bg-[#1C2029] text-slate-300 border-white/15 hover:border-white/30"
              )}
            >
              <IconSparkles size={13} />
              <span>{highlighted ? "Most Popular (On)" : "Highlight Tier"}</span>
            </button>

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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Package Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growth"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Price Label
              </label>
              <input
                type="text"
                required
                value={priceLabel}
                onChange={(e) => setPriceLabel(e.target.value)}
                placeholder="Starting at"
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Price Display
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="IDR 5M / Custom"
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              CTA Button Text
            </label>
            <input
              type="text"
              required
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                CTA Link
              </label>
              <input
                type="text"
                required
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
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

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Tier Description
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <DynamicListInput
          label="Included Features Checklist"
          items={features}
          onChange={setFeatures}
          placeholder="e.g. Admin dashboard & analytics"
        />

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-5 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Checklist</span>
              <span className="font-semibold text-white">
                {features.length} Features
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Compro Route</span>
              <span className="font-mono text-slate-300">/pricing</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tier && (
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
              {isPending ? "Saving..." : "Save Pricing Tier"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Paket Harga?"
        description={`Paket "${tier?.name}" akan dihapus dari halaman Pricing.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function PricingManagerClient({
  initialTiers,
  storageMode,
}: PricingManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialTiers[0]?.id ?? "new"
  );

  const filtered = useMemo(() => {
    return initialTiers.filter((t) => {
      if (activeTab === "highlighted" && !t.highlighted) return false;
      if (activeTab === "draft" && t.status !== "DRAFT") return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.price.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialTiers, activeTab, statusFilter, searchQuery]);

  const selectedTier =
    selectedId === "new"
      ? null
      : filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const editorKey =
    selectedId === "new" ? "new" : String(selectedTier?.id ?? "new");

  const highlightedTier = initialTiers.find((t) => t.highlighted);
  const avgFeatures =
    initialTiers.length > 0
      ? Math.round(
          initialTiers.reduce((acc, t) => acc + t.features.length, 0) /
            initialTiers.length
        )
      : 0;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Pricing Tiers"
        backHref="/"
        primaryActionLabel="New Pricing Tier"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Total Packages", value: String(initialTiers.length), unit: "tiers" },
          {
            label: "Highlighted Plan",
            value: highlightedTier?.name ?? "None",
            unit: highlightedTier ? highlightedTier.price : undefined,
          },
          { label: "Avg. Deliverables", value: String(avgFeatures), unit: "items" },
        ]}
        timelineSegments={initialTiers.slice(0, 3).map((t) => ({
          label: t.name,
          endLabel: t.price,
          progressPercent: t.highlighted ? 100 : 60,
          avatars: [t.name.slice(0, 2).toUpperCase()],
        }))}
        rightTitle="Commercial Showcase"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /pricing"
        rightActionLabel="Open Calculator"
        onRightAction={() => router.push("/commercial/calculator")}
        miniCards={initialTiers.slice(0, 3).map((t) => ({
          id: String(t.id),
          code: t.priceLabel,
          title: t.name,
          subtitle: t.price,
          highlighted: t.highlighted,
        }))}
        onMiniCardClick={(id) => setSelectedId(Number(id))}
      />

      <FilterPillBar
        activeCount={(statusFilter !== "all" ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search package name or price..."
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
          { id: "all", label: "All Tiers", count: initialTiers.length },
          {
            id: "highlighted",
            label: "Most Popular",
            count: initialTiers.filter((t) => t.highlighted).length,
          },
          {
            id: "draft",
            label: "Draft",
            count: initialTiers.filter((t) => t.status === "DRAFT").length,
          },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Pricing Packages"
        leftContent={
          filtered.length > 0 ? (
            filtered.map((tier) => (
              <MasterListItem
                key={tier.id}
                selected={selectedId !== "new" && selectedTier?.id === tier.id}
                onClick={() => setSelectedId(tier.id)}
                avatarText={tier.name.slice(0, 2).toUpperCase()}
                title={tier.name}
                subtitle={`${tier.priceLabel} · ${tier.features.length} features`}
                statusLabel={tier.highlighted ? "Popular" : tier.status}
                rightMetric={tier.price}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada paket harga ditemukan.
            </div>
          )
        }
        rightContent={
          <PricingEditorForm
            key={editorKey}
            tier={selectedTier}
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
