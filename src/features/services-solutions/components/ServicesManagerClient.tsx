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
import type { ServiceProcessStep, ServiceUseCase } from "@/db/schema";
import {
  deleteServiceAction,
  deleteSolutionAction,
  saveApproachStepAction,
  saveServiceAction,
  saveSolutionAction,
  saveWhyChooseUsAction,
} from "../actions";
import {
  SERVICE_ICONS,
  type ApproachStepDTO,
  type ServiceDTO,
  type SolutionDTO,
  type WhyChooseUsDTO,
} from "../schema";

interface ServicesManagerClientProps {
  initialServices: ServiceDTO[];
  initialSolutions: SolutionDTO[];
  initialApproachSteps: ApproachStepDTO[];
  initialWhyChooseUs: WhyChooseUsDTO[];
  storageMode: "database" | "memory";
}

function ServiceEditorForm({
  service,
  onSaved,
  onDeleted,
}: {
  service: ServiceDTO | null;
  onSaved: (saved: ServiceDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [subTab, setSubTab] = useState<"core" | "items" | "process">("core");

  const [title, setTitle] = useState(service?.title ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [tagline, setTagline] = useState(service?.tagline ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [icon, setIcon] = useState(service?.icon ?? "code");
  const [gradient, setGradient] = useState(
    service?.gradient ?? "from-[rgba(59,130,246,0.15)] to-transparent"
  );
  const [items, setItems] = useState<string[]>(service?.items ?? []);
  const [benefits, setBenefits] = useState<string[]>(service?.benefits ?? []);
  const [technologies, setTechnologies] = useState<string[]>(
    service?.technologies ?? []
  );
  const [process, setProcess] = useState<ServiceProcessStep[]>(
    service?.process ?? [{ step: "Discovery", desc: "Initial scoping." }]
  );
  const [useCases, setUseCases] = useState<ServiceUseCase[]>(
    service?.useCases ?? [{ title: "Enterprise Rollout", desc: "Core use case." }]
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    service?.status ?? "PUBLISHED"
  );
  const [sortOrder, setSortOrder] = useState<number>(service?.sortOrder ?? 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveServiceAction({
        id: service?.id,
        slug: slug || slugify(title),
        title,
        tagline,
        description,
        icon,
        items,
        benefits,
        process,
        technologies,
        useCases,
        gradient,
        status,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: service ? "Layanan diperbarui" : "Layanan baru dibuat",
          description: `"${res.data.title}" berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input layanan"
            : "Gagal menyimpan layanan",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!service) return;
    startTransition(async () => {
      const res = await deleteServiceAction(service.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({
          type: "success",
          title: "Layanan dihapus",
          description: `"${service.title}" telah dihapus.`,
        });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus layanan",
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
              {service ? `Service #${service.id}` : "Create New Service"}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {title || "Untitled Service"}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#0B0D12] p-1 rounded-full border border-white/10">
            {(
              [
                { id: "core", label: "Core Info" },
                { id: "items", label: "Items & Tech" },
                { id: "process", label: "Process & Cases" },
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

        {subTab === "core" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Service Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!service) setSlug(slugify(e.target.value));
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

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Icon Key
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  {SERVICE_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                  }
                  className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
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
                Tagline (Detail Hero Subtitle)
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Gradient Class
              </label>
              <input
                type="text"
                value={gradient}
                onChange={(e) => setGradient(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Full Description
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

        {subTab === "items" && (
          <div className="space-y-4">
            <DynamicListInput
              label="Sub-Service Items (Card Checklist)"
              items={items}
              onChange={setItems}
              placeholder="e.g. Enterprise Applications"
            />
            <DynamicListInput
              label="Key Benefits"
              items={benefits}
              onChange={setBenefits}
              placeholder="e.g. Modular API-first architecture"
            />
            <DynamicListInput
              label="Supported Technologies"
              items={technologies}
              onChange={setTechnologies}
              placeholder="e.g. TypeScript, Next.js, Kubernetes"
            />
          </div>
        )}

        {subTab === "process" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  Delivery Process Steps ({process.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setProcess((p) => [...p, { step: "New Step", desc: "Details..." }])
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#86FF00] cursor-pointer"
                >
                  <IconPlus size={13} /> Add Step
                </button>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {process.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1C2029] border border-white/8 rounded-xl p-2.5 flex items-start gap-2"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={step.step}
                        onChange={(e) =>
                          setProcess((prev) =>
                            prev.map((s, i) =>
                              i === idx ? { ...s, step: e.target.value } : s
                            )
                          )
                        }
                        placeholder="Step name"
                        className="bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={step.desc}
                        onChange={(e) =>
                          setProcess((prev) =>
                            prev.map((s, i) =>
                              i === idx ? { ...s, desc: e.target.value } : s
                            )
                          )
                        }
                        placeholder="Description"
                        className="sm:col-span-2 bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setProcess((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  Use Cases ({useCases.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setUseCases((u) => [
                      ...u,
                      { title: "New Use Case", desc: "Impact summary..." },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#86FF00] cursor-pointer"
                >
                  <IconPlus size={13} /> Add Use Case
                </button>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {useCases.map((uc, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1C2029] border border-white/8 rounded-xl p-2.5 flex items-start gap-2"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={uc.title}
                        onChange={(e) =>
                          setUseCases((prev) =>
                            prev.map((s, i) =>
                              i === idx ? { ...s, title: e.target.value } : s
                            )
                          )
                        }
                        placeholder="Title"
                        className="bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={uc.desc}
                        onChange={(e) =>
                          setUseCases((prev) =>
                            prev.map((s, i) =>
                              i === idx ? { ...s, desc: e.target.value } : s
                            )
                          )
                        }
                        placeholder="Outcome description"
                        className="sm:col-span-2 bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setUseCases((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-5 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Deliverables</span>
              <span className="font-semibold text-white">{items.length} Items</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Compro URL</span>
              <span className="font-mono text-[11px] text-slate-300">
                /services/{slug || "auto"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {service && (
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
              {isPending ? "Saving..." : "Save Service"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Layanan?"
        description={`Layanan "${service?.title}" akan dihapus dari halaman Services & Footer.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function SolutionEditorForm({
  solution,
  onSaved,
  onDeleted,
}: {
  solution: SolutionDTO | null;
  onSaved: (saved: SolutionDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [title, setTitle] = useState(solution?.title ?? "");
  const [description, setDescription] = useState(solution?.description ?? "");
  const [icon, setIcon] = useState(solution?.icon ?? "transform");
  const [gradient, setGradient] = useState(
    solution?.gradient ?? "from-[rgba(59,130,246,0.15)] to-transparent"
  );
  const [items, setItems] = useState<string[]>(solution?.items ?? []);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    solution?.status ?? "PUBLISHED"
  );
  const [sortOrder, setSortOrder] = useState<number>(solution?.sortOrder ?? 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveSolutionAction({
        id: solution?.id,
        title,
        description,
        icon,
        gradient,
        items,
        status,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: solution ? "Solusi diperbarui" : "Solusi baru dibuat",
          description: `"${res.data.title}" berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: "Gagal menyimpan solusi",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!solution) return;
    startTransition(async () => {
      const res = await deleteSolutionAction(solution.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Solusi dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus solusi",
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
              {solution ? `Solution #${solution.id}` : "Create New Solution"}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {title || "Untitled Solution"}
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
              Solution Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Icon
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-2 py-2 text-xs text-white"
              >
                {SERVICE_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-400">
                Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Gradient Class
            </label>
            <input
              type="text"
              value={gradient}
              onChange={(e) => setGradient(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>
        </div>

        <DynamicListInput
          label="Solution Capabilities"
          items={items}
          onChange={setItems}
          placeholder="e.g. Digital Maturity Assessment"
        />

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400">Compro Route</span>
            <span className="font-mono text-slate-200">/solutions</span>
          </div>

          <div className="flex items-center gap-2">
            {solution && (
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
              {isPending ? "Saving..." : "Save Solution"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Solusi?"
        description={`Solusi "${solution?.title}" akan dihapus dari halaman Solutions.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

type MethodologyEntry =
  | { kind: "approach"; data: ApproachStepDTO }
  | { kind: "why"; data: WhyChooseUsDTO };

function MethodologyEditorForm({
  entry,
  onSaved,
}: {
  entry: MethodologyEntry;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [num, setNum] = useState(
    entry.kind === "approach" ? entry.data.num : ""
  );
  const [title, setTitle] = useState(entry.data.title);
  const [description, setDescription] = useState(entry.data.description);
  const [sortOrder, setSortOrder] = useState(entry.data.sortOrder);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res =
        entry.kind === "approach"
          ? await saveApproachStepAction({
              id: entry.data.id,
              num,
              title,
              description,
              sortOrder,
            })
          : await saveWhyChooseUsAction({
              id: entry.data.id,
              title,
              description,
              sortOrder,
            });

      if (res.ok) {
        toast({
          type: "success",
          title: "Metodologi diperbarui",
          description: `"${title}" berhasil disimpan.`,
        });
        onSaved();
      } else {
        toast({
          type: "error",
          title: "Gagal memperbarui metodologi",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
      <div className="border-b border-white/8 pb-4">
        <p className="text-[11px] font-medium text-slate-400">
          {entry.kind === "approach"
            ? "DSDDO Methodology Step"
            : "Why Choose Us Pillar"}
        </p>
        <h3 className="font-display font-bold text-lg text-white">
          {entry.kind === "approach" ? `${num} · ${title}` : title}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entry.kind === "approach" && (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Step Number
            </label>
            <input
              type="text"
              required
              value={num}
              onChange={(e) => setNum(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        )}

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

        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Description
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

      <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
        <div className="text-xs">
          <span className="block text-[10px] text-slate-400">Shown On</span>
          <span className="font-mono text-slate-200">/ & /services</span>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Pillar"}
        </button>
      </div>
    </form>
  );
}

export default function ServicesManagerClient({
  initialServices,
  initialSolutions,
  initialApproachSteps,
  initialWhyChooseUs,
  storageMode,
}: ServicesManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"services" | "solutions" | "methodology">(
    "services"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedServiceId, setSelectedServiceId] = useState<number | "new">(
    initialServices[0]?.id ?? "new"
  );
  const [selectedSolutionId, setSelectedSolutionId] = useState<number | "new">(
    initialSolutions[0]?.id ?? "new"
  );
  const [selectedMethodologyKey, setSelectedMethodologyKey] = useState<string>(
    initialApproachSteps[0]
      ? `approach-${initialApproachSteps[0].id}`
      : initialWhyChooseUs[0]
        ? `why-${initialWhyChooseUs[0].id}`
        : ""
  );

  const filteredServices = useMemo(() => {
    return initialServices.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.title.toLowerCase().includes(q) && !s.tagline.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [initialServices, statusFilter, searchQuery]);

  const filteredSolutions = useMemo(() => {
    return initialSolutions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [initialSolutions, statusFilter, searchQuery]);

  const methodologyList: MethodologyEntry[] = useMemo(() => {
    const combined: MethodologyEntry[] = [
      ...initialApproachSteps.map((data) => ({
        kind: "approach" as const,
        data,
      })),
      ...initialWhyChooseUs.map((data) => ({
        kind: "why" as const,
        data,
      })),
    ];
    if (!searchQuery.trim()) return combined;
    const q = searchQuery.toLowerCase();
    return combined.filter(
      (m) =>
        m.data.title.toLowerCase().includes(q) ||
        m.data.description.toLowerCase().includes(q)
    );
  }, [initialApproachSteps, initialWhyChooseUs, searchQuery]);

  const selectedService =
    selectedServiceId === "new"
      ? null
      : filteredServices.find((s) => s.id === selectedServiceId) ??
        filteredServices[0] ??
        null;

  const selectedSolution =
    selectedSolutionId === "new"
      ? null
      : filteredSolutions.find((s) => s.id === selectedSolutionId) ??
        filteredSolutions[0] ??
        null;

  const selectedMethodology =
    methodologyList.find(
      (m) => `${m.kind}-${m.data.id}` === selectedMethodologyKey
    ) ??
    methodologyList[0] ??
    null;

  const handlePrimaryNew = () => {
    if (activeTab === "solutions") {
      setSelectedSolutionId("new");
    } else {
      setActiveTab("services");
      setSelectedServiceId("new");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Services & Solutions"
        backHref="/"
        primaryActionLabel={
          activeTab === "solutions" ? "New Solution" : "New Service"
        }
        onPrimaryAction={handlePrimaryNew}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Core Services", value: String(initialServices.length), unit: "pages" },
          { label: "Industry Solutions", value: String(initialSolutions.length), unit: "cards" },
          {
            label: "DSDDO & Pillars",
            value: String(initialApproachSteps.length + initialWhyChooseUs.length),
            unit: "items",
          },
        ]}
        timelineSegments={[
          {
            label: "Services",
            endLabel: "/services/[slug]",
            progressPercent: 90,
            avatars: ["SV"],
          },
          {
            label: "Solutions",
            endLabel: "/solutions",
            progressPercent: 75,
            avatars: ["SL"],
          },
          {
            label: "DSDDO Process",
            endLabel: "6 steps",
            progressPercent: 100,
            avatars: ["DS"],
          },
        ]}
        rightTitle="Offerings Catalog"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro Live"
        rightActionLabel={
          activeTab === "solutions" ? "+ New Solution" : "+ New Service"
        }
        onRightAction={handlePrimaryNew}
        miniCards={[
          {
            id: "services",
            code: "Services",
            title: `${initialServices.length} Services`,
            subtitle: "Detail Pages",
            highlighted: activeTab === "services",
          },
          {
            id: "solutions",
            code: "Solutions",
            title: `${initialSolutions.length} Solutions`,
            subtitle: "Industry Focus",
            highlighted: activeTab === "solutions",
          },
          {
            id: "methodology",
            code: "Methodology",
            title: "DSDDO & Why",
            subtitle: "6+6 Pillars",
            highlighted: activeTab === "methodology",
          },
        ]}
        onMiniCardClick={(id) =>
          setActiveTab(id as "services" | "solutions" | "methodology")
        }
      />

      <FilterPillBar
        activeCount={(statusFilter !== "all" ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search services, solutions, steps..."
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
          { id: "services", label: "Services", count: initialServices.length },
          { id: "solutions", label: "Solutions", count: initialSolutions.length },
          {
            id: "methodology",
            label: "DSDDO & Why Us",
            count: initialApproachSteps.length + initialWhyChooseUs.length,
          },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) =>
          setActiveTab(id as "services" | "solutions" | "methodology")
        }
        leftTitle={
          activeTab === "services"
            ? "Core Services"
            : activeTab === "solutions"
              ? "Industry Solutions"
              : "DSDDO Steps & Why Choose Us"
        }
        leftContent={
          activeTab === "services" ? (
            filteredServices.length > 0 ? (
              filteredServices.map((svc) => (
                <MasterListItem
                  key={svc.id}
                  selected={
                    selectedServiceId !== "new" && selectedService?.id === svc.id
                  }
                  onClick={() => setSelectedServiceId(svc.id)}
                  avatarText={svc.icon.slice(0, 2).toUpperCase()}
                  title={svc.title}
                  subtitle={`/services/${svc.slug}`}
                  statusLabel={svc.status}
                  rightMetric={`${svc.items.length} items`}
                />
              ))
            ) : (
              <div className="py-12 text-center text-sm text-slate-500">
                Tidak ada layanan ditemukan.
              </div>
            )
          ) : activeTab === "solutions" ? (
            filteredSolutions.length > 0 ? (
              filteredSolutions.map((sol) => (
                <MasterListItem
                  key={sol.id}
                  selected={
                    selectedSolutionId !== "new" && selectedSolution?.id === sol.id
                  }
                  onClick={() => setSelectedSolutionId(sol.id)}
                  avatarText={sol.icon.slice(0, 2).toUpperCase()}
                  title={sol.title}
                  subtitle={`${sol.items.length} capabilities`}
                  statusLabel={sol.status}
                  rightMetric={`#${sol.sortOrder}`}
                />
              ))
            ) : (
              <div className="py-12 text-center text-sm text-slate-500">
                Tidak ada solusi ditemukan.
              </div>
            )
          ) : methodologyList.length > 0 ? (
            methodologyList.map((entry) => {
              const key = `${entry.kind}-${entry.data.id}`;
              return (
                <MasterListItem
                  key={key}
                  selected={
                    selectedMethodology
                      ? `${selectedMethodology.kind}-${selectedMethodology.data.id}` ===
                        key
                      : false
                  }
                  onClick={() => setSelectedMethodologyKey(key)}
                  avatarText={
                    entry.kind === "approach" ? entry.data.num : "WY"
                  }
                  title={entry.data.title}
                  subtitle={entry.data.description}
                  statusLabel={entry.kind === "approach" ? "DSDDO" : "Why Us"}
                  rightMetric={`#${entry.data.sortOrder}`}
                />
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada item metodologi ditemukan.
            </div>
          )
        }
        rightContent={
          activeTab === "services" ? (
            <ServiceEditorForm
              key={
                selectedServiceId === "new"
                  ? "svc-new"
                  : `svc-${selectedService?.id ?? "new"}`
              }
              service={selectedService}
              onSaved={(saved) => {
                setSelectedServiceId(saved.id);
                router.refresh();
              }}
              onDeleted={() => {
                setSelectedServiceId("new");
                router.refresh();
              }}
            />
          ) : activeTab === "solutions" ? (
            <SolutionEditorForm
              key={
                selectedSolutionId === "new"
                  ? "sol-new"
                  : `sol-${selectedSolution?.id ?? "new"}`
              }
              solution={selectedSolution}
              onSaved={(saved) => {
                setSelectedSolutionId(saved.id);
                router.refresh();
              }}
              onDeleted={() => {
                setSelectedSolutionId("new");
                router.refresh();
              }}
            />
          ) : selectedMethodology ? (
            <MethodologyEditorForm
              key={`${selectedMethodology.kind}-${selectedMethodology.data.id}`}
              entry={selectedMethodology}
              onSaved={() => router.refresh()}
            />
          ) : (
            <div className="py-16 text-center text-sm text-slate-400">
              Pilih item metodologi di panel kiri untuk diedit.
            </div>
          )
        }
      />
    </div>
  );
}
