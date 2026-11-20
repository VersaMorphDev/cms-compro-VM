"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconWand } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { cn, formatIDR, slugify } from "@/lib/utils";
import {
  deleteCalculatorConfigAction,
  saveCalculatorConfigAction,
} from "../actions";
import {
  isMultiplierConfigType,
  SERVICE_INTEREST_OPTIONS,
  type CalculatorConfigDTO,
  type CalculatorConfigType,
} from "../schema";

interface CalculatorManagerClientProps {
  initialConfigs: CalculatorConfigDTO[];
  storageMode: "database" | "memory";
}

function CalculatorConfigForm({
  item,
  defaultType,
  onSaved,
  onDeleted,
}: {
  item: CalculatorConfigDTO | null;
  defaultType: CalculatorConfigType;
  onSaved: (saved: CalculatorConfigDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [configType, setConfigType] = useState<CalculatorConfigType>(
    item?.configType ?? defaultType
  );
  const [name, setName] = useState(item?.name ?? "");
  const [keyVal, setKeyVal] = useState(item?.key ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [cost, setCost] = useState<string>(
    item?.cost !== null && item?.cost !== undefined ? String(item.cost) : "10000000"
  );
  const [weeks, setWeeks] = useState<string>(
    item?.weeks !== null && item?.weeks !== undefined ? String(item.weeks) : "2"
  );
  const [multiplier, setMultiplier] = useState<string>(
    item?.multiplier ?? "1.0"
  );
  const [interestValue, setInterestValue] = useState<string>(
    item?.interestValue ?? SERVICE_INTEREST_OPTIONS[1]
  );
  const [isActive, setIsActive] = useState<boolean>(item?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState<number>(item?.sortOrder ?? 0);

  const isMult = isMultiplierConfigType(configType);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveCalculatorConfigAction({
        id: item?.id,
        configType,
        key: keyVal || slugify(name),
        name,
        description:
          isMult || configType === "INFRA_TIER" || configType === "SCOPE_RATE"
            ? description
            : null,
        cost: isMult ? null : cost,
        weeks: isMult ? null : weeks,
        multiplier: isMult ? multiplier : null,
        interestValue: configType === "SERVICE" ? interestValue : null,
        isActive,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: item ? "Tarif kalkulator diperbarui" : "Item kalkulator ditambahkan",
          description: `"${res.data.name}" berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input konfigurasi"
            : "Gagal menyimpan tarif",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!item) return;
    startTransition(async () => {
      const res = await deleteCalculatorConfigAction(item.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({
          type: "success",
          title: "Konfigurasi dihapus",
          description: `"${item.name}" telah dihapus.`,
        });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus item",
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
              {item ? `Rate Config #${item.id}` : `New ${configType} Parameter`}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {name || "Untitled Parameter"}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsActive((prev) => !prev)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
              isActive
                ? "bg-[#86FF00] text-[#090A0F] border-[#86FF00]"
                : "bg-[#1C2029] text-slate-400 border-white/15"
            )}
          >
            {isActive ? "Active in Calculator" : "Disabled"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Parameter Type
            </label>
            <select
              value={configType}
              onChange={(e) =>
                setConfigType(e.target.value as CalculatorConfigType)
              }
              disabled={Boolean(item)}
              className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none disabled:opacity-60"
            >
              <option value="SERVICE">SERVICE (Simple Base Cost &amp; Weeks)</option>
              <option value="SCALE">SCALE (Simple Multiplier)</option>
              <option value="ADDON">ADDON (Simple Feature Add-on)</option>
              <option value="PLATFORM">PLATFORM (Advanced Target Platform)</option>
              <option value="COMPLEX_FEATURE">COMPLEX_FEATURE (Advanced Feature)</option>
              <option value="INFRA_TIER">INFRA_TIER (Advanced Hosting Tier)</option>
              <option value="UX_MULTIPLIER">UX_MULTIPLIER (Advanced UX Factor)</option>
              <option value="SCOPE_RATE">SCOPE_RATE (Per-Screen / Per-Role Rate)</option>
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

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!item) setKeyVal(slugify(e.target.value));
              }}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Config Key
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={keyVal}
                onChange={(e) => setKeyVal(e.target.value)}
                className="flex-1 bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setKeyVal(slugify(name))}
                className="px-2.5 rounded-xl bg-[#1C2029] border border-white/10 hover:border-[#86FF00] text-slate-300 cursor-pointer"
              >
                <IconWand size={14} />
              </button>
            </div>
          </div>

          {isMult ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Multiplier Factor (e.g. 1.35)
                </label>
                <input
                  type="text"
                  required
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Cost (IDR) — {formatIDR(Number(cost) || 0)}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={500000}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Estimated Weeks
                </label>
                <input
                  type="number"
                  required={configType === "SERVICE" || configType === "ADDON"}
                  min={0}
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value)}
                  className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              {(configType === "INFRA_TIER" || configType === "SCOPE_RATE") && (
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {configType === "SERVICE" && (
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Mapped Inquiry Interest Category
                  </label>
                  <select
                    value={interestValue}
                    onChange={(e) => setInterestValue(e.target.value)}
                    className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    {SERVICE_INTEREST_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-5 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Preview Rate</span>
              <span className="font-semibold text-[#86FF00]">
                {isMult
                  ? `${multiplier}x Multiplier`
                  : `${formatIDR(Number(cost) || 0)} · ${weeks || 0} wks`}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Compro Route</span>
              <span className="font-mono text-slate-300">/calculator</span>
            </div>
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
              {isPending ? "Saving..." : "Save Rate"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Parameter Kalkulator?"
        description={`Item "${item?.name}" akan dihapus dari rumus Project Calculator.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

type CalculatorTab = "SERVICE" | "SCALE" | "ADDON" | "ADVANCED";

const ADVANCED_TYPES = new Set<CalculatorConfigType>([
  "PLATFORM",
  "COMPLEX_FEATURE",
  "INFRA_TIER",
  "UX_MULTIPLIER",
  "SCOPE_RATE",
]);

function matchesTab(c: CalculatorConfigDTO, tab: CalculatorTab): boolean {
  if (tab === "ADVANCED") return ADVANCED_TYPES.has(c.configType);
  return c.configType === tab;
}

export default function CalculatorManagerClient({
  initialConfigs,
  storageMode,
}: CalculatorManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CalculatorTab>("SERVICE");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialConfigs.find((c) => c.configType === "SERVICE")?.id ?? "new"
  );

  const servicesList = useMemo(
    () => initialConfigs.filter((c) => c.configType === "SERVICE"),
    [initialConfigs]
  );
  const scalesList = useMemo(
    () => initialConfigs.filter((c) => c.configType === "SCALE"),
    [initialConfigs]
  );
  const addonsList = useMemo(
    () => initialConfigs.filter((c) => c.configType === "ADDON"),
    [initialConfigs]
  );
  const advancedList = useMemo(
    () => initialConfigs.filter((c) => ADVANCED_TYPES.has(c.configType)),
    [initialConfigs]
  );

  const currentFiltered = useMemo(() => {
    return initialConfigs.filter((c) => {
      if (!matchesTab(c, activeTab)) return false;
      if (activeFilter === "active" && !c.isActive) return false;
      if (activeFilter === "inactive" && c.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.key.toLowerCase().includes(q) &&
          !c.configType.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialConfigs, activeTab, activeFilter, searchQuery]);

  const selectedItem =
    selectedId === "new"
      ? null
      : currentFiltered.find((c) => c.id === selectedId) ??
        currentFiltered[0] ??
        null;

  const defaultFormType: CalculatorConfigType =
    activeTab === "ADVANCED" ? "PLATFORM" : activeTab;

  const editorKey =
    selectedId === "new"
      ? `new-${activeTab}`
      : String(selectedItem?.id ?? `new-${activeTab}`);

  // Sample dynamic calculation preview using live rates
  const sampleService = servicesList.find((s) => s.isActive) ?? servicesList[0];
  const sampleScale =
    scalesList.find((s) => s.key === "growing" && s.isActive) ??
    scalesList.find((s) => s.isActive) ??
    scalesList[0];
  const sampleAddon = addonsList.find((a) => a.isActive) ?? addonsList[0];

  const sampleEstimate =
    (sampleService?.cost ?? 0) * Number(sampleScale?.multiplier ?? 1) +
    (sampleAddon?.cost ?? 0);

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Project Calculator"
        backHref="/commercial/pricing"
        primaryActionLabel={`New ${activeTab === "SERVICE" ? "Service" : activeTab === "SCALE" ? "Scale" : activeTab === "ADDON" ? "Add-on" : "Advanced Rate"}`}
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Base Services", value: String(servicesList.length), unit: "rates" },
          { label: "Scales & Add-ons", value: String(scalesList.length + addonsList.length), unit: "simple" },
          { label: "Advanced Mode", value: String(advancedList.length), unit: "params" },
        ]}
        timelineSegments={[
          {
            label: "Services Active",
            endLabel: `${servicesList.filter((s) => s.isActive).length}/${servicesList.length}`,
            progressPercent: 90,
            avatars: ["SV"],
          },
          {
            label: "Scales & Add-ons",
            endLabel: `${scalesList.length + addonsList.length} items`,
            progressPercent: 100,
            avatars: ["SC"],
          },
          {
            label: "Advanced Mode",
            endLabel: `${advancedList.filter((a) => a.isActive).length}/${advancedList.length}`,
            progressPercent: 95,
            avatars: ["AD"],
          },
        ]}
        rightTitle="Live Sample Estimate (Growing)"
        rightValue={formatIDR(sampleEstimate)}
        rightBadge={storageMode === "database" ? "SQLite" : "Memory Store"}
        rightActionLabel="+ Add Rate"
        onRightAction={() => setSelectedId("new")}
        miniCards={[
          {
            id: "SERVICE",
            code: "Services",
            title: `${servicesList.length} Rates`,
            subtitle: "Base IDR + Weeks",
            highlighted: activeTab === "SERVICE",
          },
          {
            id: "SCALE",
            code: "Scales & Add-ons",
            title: `${scalesList.length + addonsList.length} Items`,
            subtitle: "1.0x - 1.8x + Addons",
            highlighted: activeTab === "SCALE" || activeTab === "ADDON",
          },
          {
            id: "ADVANCED",
            code: "Advanced Mode",
            title: `${advancedList.length} Params`,
            subtitle: "Platforms & Infra",
            highlighted: activeTab === "ADVANCED",
          },
        ]}
        onMiniCardClick={(id) => {
          setActiveTab(id as CalculatorTab);
          setSelectedId("new");
        }}
      />

      <FilterPillBar
        activeCount={(activeFilter !== "all" ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search rate name, type, or key..."
        selects={[
          {
            id: "status",
            value: activeFilter,
            onChange: setActiveFilter,
            options: [
              { label: "All states", value: "all" },
              { label: "Active only", value: "active" },
              { label: "Disabled only", value: "inactive" },
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "SERVICE", label: "Services", count: servicesList.length },
          { id: "SCALE", label: "Scales", count: scalesList.length },
          { id: "ADDON", label: "Add-ons", count: addonsList.length },
          { id: "ADVANCED", label: "Advanced Mode", count: advancedList.length },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => {
          const nextTab = id as CalculatorTab;
          setActiveTab(nextTab);
          const first = initialConfigs.find((c) => matchesTab(c, nextTab));
          setSelectedId(first?.id ?? "new");
        }}
        leftTitle={`${activeTab} Parameters`}
        leftContent={
          currentFiltered.length > 0 ? (
            currentFiltered.map((item) => (
              <MasterListItem
                key={item.id}
                selected={selectedId !== "new" && selectedItem?.id === item.id}
                onClick={() => setSelectedId(item.id)}
                avatarText={item.configType.slice(0, 2)}
                title={item.name}
                subtitle={`[${item.configType}] key: ${item.key}${item.weeks ? ` · ${item.weeks} wks` : ""}`}
                statusLabel={item.isActive ? "Active" : "Disabled"}
                rightMetric={
                  isMultiplierConfigType(item.configType)
                    ? `${item.multiplier ?? "1.0"}x`
                    : formatIDR(item.cost ?? 0)
                }
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada parameter pada tab ini.
            </div>
          )
        }
        rightContent={
          <CalculatorConfigForm
            key={editorKey}
            item={selectedItem}
            defaultType={defaultFormType}
            onSaved={(saved) => {
              const nextTab: CalculatorTab = ADVANCED_TYPES.has(saved.configType)
                ? "ADVANCED"
                : (saved.configType as CalculatorTab);
              setActiveTab(nextTab);
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
