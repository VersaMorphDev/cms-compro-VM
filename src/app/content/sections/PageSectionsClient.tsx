"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconRotate, IconEye, IconEyeOff, IconPlus, IconTrash } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import DynamicListInput from "@/components/editor/DynamicListInput";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import {
  resetPageSectionToDefaultAction,
  savePageSectionAction,
} from "@/features/page-sections/actions";
import {
  PAGE_SLUG_OPTIONS,
  type PageSectionDTO,
} from "@/features/page-sections/schema";

interface PageSectionsClientProps {
  initialSections: PageSectionDTO[];
  storageMode: "database" | "memory";
}

function PageSectionForm({
  section,
  onSaved,
}: {
  section: PageSectionDTO;
  onSaved: (saved: PageSectionDTO) => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [sectionLabel, setSectionLabel] = useState(section.sectionLabel);
  const [badge, setBadge] = useState(section.badge ?? "");
  const [badgeSubtext, setBadgeSubtext] = useState(section.badgeSubtext ?? "");
  const [headline, setHeadline] = useState(section.headline ?? "");
  const [highlight, setHighlight] = useState(section.highlight ?? "");
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [body, setBody] = useState(section.body ?? "");
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(
    section.ctaPrimaryLabel ?? ""
  );
  const [ctaPrimaryHref, setCtaPrimaryHref] = useState(
    section.ctaPrimaryHref ?? ""
  );
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(
    section.ctaSecondaryLabel ?? ""
  );
  const [ctaSecondaryHref, setCtaSecondaryHref] = useState(
    section.ctaSecondaryHref ?? ""
  );
  const [isVisible, setIsVisible] = useState(section.isVisible);
  const [sortOrder, setSortOrder] = useState(section.sortOrder);

  const initialExtra = section.extraData ?? {};
  const [extraDataState, setExtraDataState] = useState<Record<string, unknown>>(
    () => structuredClone(initialExtra)
  );

  // Identify keys inside extraData for friendly editors
  const extraEntries = Object.entries(extraDataState);
  const stringArrayEntries = extraEntries.filter(
    ([, v]) => Array.isArray(v) && v.every((item) => typeof item === "string")
  ) as [string, string[]][];
  const objectArrayEntries = extraEntries.filter(
    ([, v]) =>
      Array.isArray(v) &&
      v.length > 0 &&
      typeof v[0] === "object" &&
      v[0] !== null
  ) as [string, Record<string, unknown>[]][];
  const scalarEntries = extraEntries.filter(
    ([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean"
  );

  const updateExtraKey = (key: string, value: unknown) => {
    setExtraDataState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await savePageSectionAction({
        id: section.id,
        sectionLabel,
        badge: badge || null,
        badgeSubtext: badgeSubtext || null,
        headline: headline || null,
        highlight: highlight || null,
        subtitle: subtitle || null,
        body: body || null,
        ctaPrimaryLabel: ctaPrimaryLabel || null,
        ctaPrimaryHref: ctaPrimaryHref || null,
        ctaSecondaryLabel: ctaSecondaryLabel || null,
        ctaSecondaryHref: ctaSecondaryHref || null,
        extraData: extraDataState,
        isVisible,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: "Section diperbarui",
          description: `"${res.data.sectionLabel}" (${res.data.pageSlug}) berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input section"
            : "Gagal menyimpan section",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const res = await resetPageSectionToDefaultAction(section.id);
      if (res.ok) {
        toast({
          type: "info",
          title: "Dikembalikan ke default Compro",
          description: `"${res.data.sectionLabel}" berhasil di-reset ke teks bawaan website.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: "Gagal reset section",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-[#1C2029] text-[#86FF00] font-mono uppercase">
              /{section.pageSlug === "home" ? "" : section.pageSlug}
            </span>
            <span className="font-mono">{section.sectionKey}</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white mt-1">
            {sectionLabel}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsVisible((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
              isVisible
                ? "bg-[#86FF00] text-[#090A0F] border-[#86FF00]"
                : "bg-[#1C2029] text-slate-400 border-white/15"
            )}
          >
            {isVisible ? <IconEye size={14} /> : <IconEyeOff size={14} />}
            <span>{isVisible ? "Visible" : "Hidden"}</span>
          </button>
        </div>
      </div>

      {/* Core Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Admin Section Label
          </label>
          <input
            type="text"
            required
            value={sectionLabel}
            onChange={(e) => setSectionLabel(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Sort Order
          </label>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Pill Badge / Eyebrow
          </label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="e.g. Services, About Us"
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Badge Subtext
          </label>
          <input
            type="text"
            value={badgeSubtext}
            onChange={(e) => setBadgeSubtext(e.target.value)}
            placeholder="e.g. What We Deliver"
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Headline Text
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Main heading text before italic highlight"
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Italic Highlight Word(s)
          </label>
          <input
            type="text"
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
            placeholder="Serif italic accent text"
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Subtitle / Section Description
          </label>
          <textarea
            rows={3}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Body Copy / Secondary Note (Optional)
          </label>
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Primary CTA Label
          </label>
          <input
            type="text"
            value={ctaPrimaryLabel}
            onChange={(e) => setCtaPrimaryLabel(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Primary CTA Href
          </label>
          <input
            type="text"
            value={ctaPrimaryHref}
            onChange={(e) => setCtaPrimaryHref(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Secondary CTA Label
          </label>
          <input
            type="text"
            value={ctaSecondaryLabel}
            onChange={(e) => setCtaSecondaryLabel(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Secondary CTA Href
          </label>
          <input
            type="text"
            value={ctaSecondaryHref}
            onChange={(e) => setCtaSecondaryHref(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Adaptive Extra Data Editors */}
      {(scalarEntries.length > 0 ||
        stringArrayEntries.length > 0 ||
        objectArrayEntries.length > 0) && (
        <div className="bg-[#0B0D12] border border-white/10 rounded-2xl p-4 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86FF00]">
            Structured Section Items &amp; Attributes
          </p>

          {scalarEntries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scalarEntries.map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <label className="block text-[11px] font-mono text-slate-400">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={String(val ?? "")}
                    onChange={(e) => updateExtraKey(key, e.target.value)}
                    className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {stringArrayEntries.map(([key, list]) => (
            <DynamicListInput
              key={key}
              label={`List: ${key} (${list.length} items)`}
              items={list}
              onChange={(next) => updateExtraKey(key, next)}
              placeholder={`Add entry to ${key}...`}
            />
          ))}

          {objectArrayEntries.map(([key, arr]) => (
            <div key={key} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300">
                  Cards / Items: <span className="font-mono text-[#86FF00]">{key}</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const sample = arr[0] ?? {};
                    const blank = Object.fromEntries(
                      Object.keys(sample).map((k) => [k, ""])
                    );
                    updateExtraKey(key, [...arr, blank]);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1C2029] border border-white/15 hover:border-[#86FF00] text-[11px] text-white cursor-pointer"
                >
                  <IconPlus size={12} /> Add Row
                </button>
              </div>
              <div className="space-y-2">
                {arr.map((obj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#14171E] border border-white/8 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Item #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateExtraKey(
                            key,
                            arr.filter((_, rIdx) => rIdx !== idx)
                          )
                        }
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Remove row"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(obj).map(([fieldKey, fieldVal]) => (
                        <div key={fieldKey} className="space-y-1">
                          <span className="block text-[10px] font-mono text-slate-500">
                            {fieldKey}
                          </span>
                          <input
                            type="text"
                            value={String(fieldVal ?? "")}
                            onChange={(e) => {
                              const nextArr = arr.map((item, rIdx) =>
                                rIdx === idx
                                  ? { ...item, [fieldKey]: e.target.value }
                                  : item
                              );
                              updateExtraKey(key, nextArr);
                            }}
                            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 mt-auto">
        <div className="text-xs">
          <span className="block text-[10px] text-slate-400">
            Compro Target Page
          </span>
          <span className="font-mono text-[#86FF00]">
            /{section.pageSlug === "home" ? "" : section.pageSlug}#{section.sectionKey}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#14171E] border border-white/15 hover:border-amber-400/50 hover:text-amber-300 text-xs font-semibold text-slate-300 transition-colors cursor-pointer disabled:opacity-60"
            title="Restore exact original Compro copy"
          >
            <IconRotate size={14} />
            <span>Reset to Default</span>
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save Section"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function PageSectionsClient({
  initialSections,
  storageMode,
}: PageSectionsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [pageFilter, setPageFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number>(
    initialSections[0]?.id ?? 0
  );

  const customizedCount = useMemo(() => {
    return initialSections.filter((s) => {
      const snap = s.defaultSnapshot;
      if (!snap || Object.keys(snap).length === 0) return false;
      return (
        (s.headline ?? null) !== (snap.headline ?? null) ||
        (s.highlight ?? null) !== (snap.highlight ?? null) ||
        (s.subtitle ?? null) !== (snap.subtitle ?? null) ||
        (s.body ?? null) !== (snap.body ?? null) ||
        JSON.stringify(s.extraData) !== JSON.stringify(snap.extraData ?? {})
      );
    }).length;
  }, [initialSections]);

  const filteredSections = useMemo(() => {
    return initialSections.filter((s) => {
      if (activeTab === "visible" && !s.isVisible) return false;
      if (activeTab === "hidden" && s.isVisible) return false;
      if (pageFilter !== "all" && s.pageSlug !== pageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${s.pageSlug} ${s.sectionKey} ${s.sectionLabel} ${s.headline ?? ""} ${s.highlight ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [initialSections, activeTab, pageFilter, searchQuery]);

  const selectedSection =
    filteredSections.find((s) => s.id === selectedId) ??
    filteredSections[0] ??
    initialSections[0] ??
    null;

  const visibleCount = initialSections.filter((s) => s.isVisible).length;
  const uniquePagesCount = new Set(initialSections.map((s) => s.pageSlug)).size;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Page Sections Editor"
        backHref="/"
        primaryActionLabel="Sync to Compro"
        primaryActionHref="/sync"
      />

      <BentoKpiSection
        leftStats={[
          { label: "Total Sections", value: String(initialSections.length), unit: "blocks" },
          { label: "Pages Covered", value: String(uniquePagesCount), unit: "routes" },
          { label: "Customized", value: String(customizedCount), unit: "edited" },
        ]}
        timelineSegments={[
          {
            label: "Landing & About",
            endLabel: `${initialSections.filter((s) => s.pageSlug === "home" || s.pageSlug === "about").length} blocks`,
            progressPercent: 100,
            avatars: ["HM", "AB"],
          },
          {
            label: "Catalog & Commercial",
            endLabel: `${initialSections.filter((s) => ["services", "solutions", "portfolio", "pricing", "calculator"].includes(s.pageSlug)).length} blocks`,
            progressPercent: 100,
            avatars: ["SV", "PR"],
          },
          {
            label: "Company & CRM Pages",
            endLabel: `${initialSections.filter((s) => !["home", "about", "services", "solutions", "portfolio", "pricing", "calculator"].includes(s.pageSlug)).length} blocks`,
            progressPercent: 100,
            avatars: ["TM", "CT"],
          },
        ]}
        rightTitle="Default Parity"
        rightValue={storageMode === "database" ? "SQLite" : "Memory Store"}
        rightBadge={`${visibleCount}/${initialSections.length} Visible`}
        rightActionLabel="View API JSON"
        onRightAction={() => window.open("/api/v1/content?section=sections", "_blank")}
        miniCards={[
          {
            id: "home",
            code: "/",
            title: "Home Page",
            subtitle: `${initialSections.filter((s) => s.pageSlug === "home").length} Sections`,
            highlighted: pageFilter === "home",
          },
          {
            id: "about",
            code: "/about",
            title: "About Us",
            subtitle: `${initialSections.filter((s) => s.pageSlug === "about").length} Sections`,
            highlighted: pageFilter === "about",
          },
          {
            id: "all",
            code: "All Routes",
            title: `${uniquePagesCount} Pages`,
            subtitle: "Reset to Default Ready",
            highlighted: pageFilter === "all",
          },
        ]}
        onMiniCardClick={(id) => {
          setPageFilter(id);
          setActiveTab("all");
        }}
      />

      <FilterPillBar
        activeCount={(pageFilter !== "all" ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search section headline, label, or page..."
        selects={[
          {
            id: "pageSlug",
            value: pageFilter,
            onChange: setPageFilter,
            options: [
              { label: "All pages", value: "all" },
              ...PAGE_SLUG_OPTIONS.map((p) => ({
                label: `${p.label} (/${p.slug === "home" ? "" : p.slug})`,
                value: p.slug,
              })),
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Sections", count: initialSections.length },
          { id: "visible", label: "Visible", count: visibleCount },
          {
            id: "hidden",
            label: "Hidden",
            count: initialSections.length - visibleCount,
          },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Website Sections"
        leftContent={
          filteredSections.length > 0 ? (
            filteredSections.map((sec) => (
              <MasterListItem
                key={sec.id}
                selected={selectedSection?.id === sec.id}
                onClick={() => setSelectedId(sec.id)}
                avatarText={sec.pageSlug.slice(0, 2).toUpperCase()}
                title={sec.sectionLabel}
                subtitle={`/${sec.pageSlug === "home" ? "" : sec.pageSlug} · ${sec.sectionKey}`}
                statusLabel={sec.isVisible ? "Visible" : "Hidden"}
                rightMetric={`#${sec.sortOrder}`}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada section ditemukan.
            </div>
          )
        }
        rightContent={
          selectedSection ? (
            <PageSectionForm
              key={`${selectedSection.id}-${selectedSection.updatedAt}`}
              section={selectedSection}
              onSaved={(saved) => {
                setSelectedId(saved.id);
                router.refresh();
              }}
            />
          ) : (
            <div className="py-16 text-center text-sm text-slate-400">
              Pilih section dari daftar di kiri untuk mengedit teks dan atributnya.
            </div>
          )
        }
      />
    </div>
  );
}
