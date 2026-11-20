"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconCopy, IconTrash } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";
import {
  createAffiliateAction,
  deleteReferralAction,
  toggleAffiliateStatusAction,
  updateReferralAction,
} from "../actions";
import {
  REFERRAL_STATUSES,
  type AffiliateDTO,
  type AffiliateReferralDTO,
} from "../schema";

interface AffiliatesManagerClientProps {
  initialAffiliates: AffiliateDTO[];
  initialReferrals: AffiliateReferralDTO[];
  storageMode: "database" | "memory";
}

function ReferralDetailForm({
  referral,
  onUpdated,
  onDeleted,
}: {
  referral: AffiliateReferralDTO;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [status, setStatus] = useState<AffiliateReferralDTO["status"]>(
    referral.status
  );
  const [message, setMessage] = useState(referral.message ?? "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateReferralAction({
        id: referral.id,
        status,
        message,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: "Proyek referral diperbarui",
          description: `${referral.clientCompany} berstatus ${res.data.status}.`,
        });
        onUpdated();
      } else {
        toast({
          type: "error",
          title: "Gagal memperbarui referral",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const res = await deleteReferralAction(referral.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Referral dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus referral",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/8 pb-4">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400">Affiliate Code</p>
            <span className="inline-block px-3 py-1 rounded-full bg-[#86FF00] text-[#090A0F] font-mono text-xs font-bold">
              {referral.affiliateCode}
            </span>
            <p className="text-[11px] text-slate-300 pt-1">
              Partner: {referral.affiliateName ?? "-"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] text-slate-400">Client Company</p>
            <h3 className="font-display font-bold text-base text-white">
              {referral.clientCompany}
            </h3>
            <p className="text-[11px] text-slate-400">
              {referral.companyIndustry || "Tech"} ·{" "}
              {referral.companyScale || "Enterprise"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] text-slate-400">Client PIC</p>
            <p className="text-xs font-semibold text-white">
              {referral.clientPicName}
            </p>
            <p className="text-[11px] text-slate-400">
              {referral.clientPicTitle || "Decision Maker"}
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              {referral.clientEmail}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Budget</span>
            <p className="text-xs font-semibold text-[#86FF00]">
              {referral.budget || "TBD"}
            </p>
          </div>
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Timeline</span>
            <p className="text-xs font-semibold text-white">
              {referral.timeline || "Flexible"}
            </p>
          </div>
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Platforms</span>
            <p className="text-xs font-semibold text-white truncate">
              {referral.platforms || "Web / App"}
            </p>
          </div>
          <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Contact</span>
            <p className="text-xs font-semibold text-white truncate">
              {referral.preferredChannel || "Email"}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Referral Stage
          </label>
          <div className="flex flex-wrap gap-1.5">
            {REFERRAL_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer",
                  status === st
                    ? "bg-[#86FF00] text-[#090A0F] border-[#86FF00]"
                    : "bg-[#1C2029] text-slate-300 border-white/10"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-400">
            Project Brief & Warm-Intro Notes (Tech: {referral.techStack || "TBD"})
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400">Best Time</span>
            <span className="font-semibold text-white">
              {referral.bestTime || "Business Hours"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="w-9 h-9 rounded-full bg-[#14171E] border border-white/10 hover:border-rose-500/50 hover:text-rose-400 flex items-center justify-center text-slate-400 cursor-pointer"
            >
              <IconTrash size={16} />
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              {isPending ? "Updating..." : "Update Referral"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Proyek Referral?"
        description={`Referral klien "${referral.clientCompany}" akan dihapus.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function AffiliatePartnerPanel({
  partner,
  onCreated,
  onStatusChanged,
}: {
  partner: AffiliateDTO | null;
  onCreated: (created: AffiliateDTO) => void;
  onStatusChanged: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");

  if (!partner) {
    const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(async () => {
        const res = await createAffiliateAction({
          name,
          email,
          phone: phone || null,
          company: company || null,
          affiliateCode,
        });

        if (res.ok) {
          toast({
            type: "success",
            title: "Affiliate partner terdaftar",
            description: `Kode unik ${res.data.affiliateCode} telah diterbitkan.`,
          });
          onCreated(res.data);
        } else {
          toast({
            type: "error",
            title: "Gagal mendaftarkan affiliate",
            description: res.error.message,
            referenceCode: res.error.referenceCode,
          });
        }
      });
    };

    return (
      <form onSubmit={handleCreate} className="flex flex-col gap-4 h-full">
        <div className="border-b border-white/8 pb-4">
          <p className="text-[11px] text-slate-400">Affiliate Onboarding</p>
          <h3 className="font-display font-bold text-lg text-white">
            Register New Affiliate Partner
          </h3>
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
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Company / Agency
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Phone / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Custom Affiliate Code (leave empty to auto-generate VM-AFF-XXXXXX)
            </label>
            <input
              type="text"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
              placeholder="VM-AFF-XXXXXX"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex justify-end mt-auto">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
          >
            {isPending ? "Creating..." : "Issue Affiliate ID"}
          </button>
        </div>
      </form>
    );
  }

  const nextStatus = partner.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  const referralUrl = `https://versamorph.id/calculator?ref=${partner.affiliateCode}`;

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleAffiliateStatusAction({
        id: partner.id,
        status: nextStatus,
      });
      if (res.ok) {
        toast({
          type: "success",
          title: `Affiliate ${nextStatus}`,
          description: `${partner.affiliateCode} sekarang berstatus ${nextStatus}.`,
        });
        onStatusChanged();
      } else {
        toast({
          type: "error",
          title: "Gagal mengubah status",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast({ type: "info", title: "Link referral disalin", description: referralUrl });
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-start justify-between border-b border-white/8 pb-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#86FF00] text-[#090A0F] font-mono text-xs font-bold mb-2">
            {partner.affiliateCode}
          </span>
          <h3 className="font-display font-bold text-xl text-white">
            {partner.name}
          </h3>
          <p className="text-xs text-slate-400">
            {partner.company || "Independent Partner"} · {partner.email}
          </p>
        </div>

        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold border",
            partner.status === "ACTIVE"
              ? "bg-[#86FF00]/15 text-[#86FF00] border-[#86FF00]/30"
              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
          )}
        >
          {partner.status}
        </span>
      </div>

      <div className="bg-[#0B0D12] border border-white/10 rounded-2xl p-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Custom Referral Calculator Link
        </p>
        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono text-[#86FF00] truncate">
            {referralUrl}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1C2029] border border-white/10 text-[11px] font-semibold text-white hover:border-[#86FF00] cursor-pointer shrink-0"
          >
            <IconCopy size={13} /> Copy
          </button>
        </div>
      </div>

      <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
        <div className="text-xs">
          <span className="block text-[10px] text-slate-400">Phone</span>
          <span className="font-semibold text-white">
            {partner.phone || "Not provided"}
          </span>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleToggle}
          className={cn(
            "px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-60",
            partner.status === "ACTIVE"
              ? "bg-white text-[#090A0F] hover:bg-slate-200"
              : "bg-[#86FF00] text-[#090A0F] hover:bg-[#9BFF2E]"
          )}
        >
          {partner.status === "ACTIVE" ? "Suspend Partner" : "Activate Partner"}
        </button>
      </div>
    </div>
  );
}

export default function AffiliatesManagerClient({
  initialAffiliates,
  initialReferrals,
  storageMode,
}: AffiliatesManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"referrals" | "partners" | "won">(
    "referrals"
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReferralId, setSelectedReferralId] = useState<number>(
    initialReferrals[0]?.id ?? 0
  );
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | "new">(
    initialAffiliates[0]?.id ?? "new"
  );

  const filteredReferrals = useMemo(() => {
    return initialReferrals.filter((r) => {
      if (activeTab === "won" && r.status !== "WON") return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !r.clientCompany.toLowerCase().includes(q) &&
          !r.affiliateCode.toLowerCase().includes(q) &&
          !r.clientPicName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialReferrals, activeTab, statusFilter, searchQuery]);

  const filteredPartners = useMemo(() => {
    if (!searchQuery.trim()) return initialAffiliates;
    const q = searchQuery.toLowerCase();
    return initialAffiliates.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.affiliateCode.toLowerCase().includes(q) ||
        (a.company ?? "").toLowerCase().includes(q)
    );
  }, [initialAffiliates, searchQuery]);

  const selectedReferral =
    filteredReferrals.find((r) => r.id === selectedReferralId) ??
    filteredReferrals[0] ??
    null;

  const selectedPartner =
    selectedPartnerId === "new"
      ? null
      : filteredPartners.find((p) => p.id === selectedPartnerId) ??
        filteredPartners[0] ??
        null;

  const activeAffiliatesCount = initialAffiliates.filter(
    (a) => a.status === "ACTIVE"
  ).length;
  const wonReferralsCount = initialReferrals.filter(
    (r) => r.status === "WON"
  ).length;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Affiliate & Referral Loop"
        backHref="/crm/leads"
        primaryActionLabel="Register Affiliate"
        onPrimaryAction={() => {
          setActiveTab("partners");
          setSelectedPartnerId("new");
        }}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Active Affiliates", value: String(activeAffiliatesCount), unit: "partners" },
          { label: "Project Referrals", value: String(initialReferrals.length), unit: "deals" },
          { label: "Won Referrals", value: String(wonReferralsCount), unit: "closed" },
        ]}
        timelineSegments={[
          {
            label: "Submitted / Review",
            endLabel: `${initialReferrals.filter((r) => r.status === "SUBMITTED" || r.status === "IN_REVIEW").length}`,
            progressPercent: 60,
            avatars: ["SR"],
          },
          {
            label: "Pitching",
            endLabel: `${initialReferrals.filter((r) => r.status === "PITCHING").length}`,
            progressPercent: 75,
            avatars: ["BD"],
          },
          {
            label: "Won Commission",
            endLabel: `${wonReferralsCount}`,
            progressPercent: 90,
            avatars: ["DP"],
          },
        ]}
        rightTitle="Partner Network"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /affiliate"
        rightActionLabel="+ Add Partner"
        onRightAction={() => {
          setActiveTab("partners");
          setSelectedPartnerId("new");
        }}
        miniCards={[
          {
            id: "referrals",
            code: "Deals",
            title: `${initialReferrals.length} Referrals`,
            subtitle: "Client Pipeline",
            highlighted: activeTab === "referrals",
          },
          {
            id: "partners",
            code: "VM-AFF",
            title: `${initialAffiliates.length} Partners`,
            subtitle: "Unique Codes",
            highlighted: activeTab === "partners",
          },
          {
            id: "won",
            code: "Closed",
            title: `${wonReferralsCount} Won Deals`,
            subtitle: "Commission Ready",
            highlighted: activeTab === "won",
          },
        ]}
        onMiniCardClick={(id) =>
          setActiveTab(id as "referrals" | "partners" | "won")
        }
      />

      <FilterPillBar
        activeCount={(statusFilter !== "all" ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search VM-AFF code, client company, partner..."
        selects={[
          {
            id: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All referral stages", value: "all" },
              ...REFERRAL_STATUSES.map((s) => ({ label: s, value: s })),
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          {
            id: "referrals",
            label: "Project Referrals",
            count: initialReferrals.length,
          },
          {
            id: "partners",
            label: "Affiliate Partners",
            count: initialAffiliates.length,
          },
          { id: "won", label: "Won Deals", count: wonReferralsCount },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) =>
          setActiveTab(id as "referrals" | "partners" | "won")
        }
        leftTitle={
          activeTab === "partners"
            ? "Registered Affiliates"
            : "Referred Client Projects"
        }
        leftContent={
          activeTab === "partners" ? (
            filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <MasterListItem
                  key={partner.id}
                  selected={
                    selectedPartnerId !== "new" &&
                    selectedPartner?.id === partner.id
                  }
                  onClick={() => setSelectedPartnerId(partner.id)}
                  avatarText={partner.name.slice(0, 2).toUpperCase()}
                  title={partner.name}
                  subtitle={`${partner.affiliateCode} · ${partner.company || partner.email}`}
                  statusLabel={partner.status}
                  rightMetric={`#${partner.id}`}
                />
              ))
            ) : (
              <div className="py-12 text-center text-sm text-slate-500">
                Partner affiliate tidak ditemukan.
              </div>
            )
          ) : filteredReferrals.length > 0 ? (
            filteredReferrals.map((ref) => (
              <MasterListItem
                key={ref.id}
                selected={selectedReferral?.id === ref.id}
                onClick={() => setSelectedReferralId(ref.id)}
                avatarText={ref.clientCompany.slice(0, 2).toUpperCase()}
                title={ref.clientCompany}
                subtitle={`${ref.affiliateCode} · PIC: ${ref.clientPicName}`}
                statusLabel={ref.status}
                rightMetric={ref.budget || "TBD"}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada proyek referral pada tab ini.
            </div>
          )
        }
        rightContent={
          activeTab === "partners" ? (
            <AffiliatePartnerPanel
              key={
                selectedPartnerId === "new"
                  ? "new-partner"
                  : String(selectedPartner?.id ?? "new-partner")
              }
              partner={selectedPartner}
              onCreated={(created) => {
                setSelectedPartnerId(created.id);
                router.refresh();
              }}
              onStatusChanged={() => router.refresh()}
            />
          ) : selectedReferral ? (
            <ReferralDetailForm
              key={selectedReferral.id}
              referral={selectedReferral}
              onUpdated={() => router.refresh()}
              onDeleted={() => router.refresh()}
            />
          ) : (
            <div className="py-16 text-center text-sm text-slate-400">
              Pilih proyek referral di panel kiri untuk meninjau spesifikasi.
            </div>
          )
        }
      />
    </div>
  );
}
