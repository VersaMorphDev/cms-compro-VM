"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import {
  deleteTeamMemberAction,
  saveAboutStatsValuesAction,
  saveCompanyProfileAction,
  saveTeamMemberAction,
} from "../actions";
import type {
  AboutStatItem,
  AboutValueItem,
  CompanyProfileSettings,
  TeamMemberDTO,
} from "../schema";

interface TeamAndAboutClientProps {
  initialTeam: TeamMemberDTO[];
  initialProfile: CompanyProfileSettings;
  initialStats: AboutStatItem[];
  initialValues: AboutValueItem[];
  storageMode: "database" | "memory";
}

function TeamMemberForm({
  member,
  onSaved,
  onDeleted,
}: {
  member: TeamMemberDTO | null;
  onSaved: (saved: TeamMemberDTO) => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [image, setImage] = useState(member?.image ?? "/team-member.png");
  const [linkedinUrl, setLinkedinUrl] = useState(member?.linkedinUrl ?? "");
  const [twitterUrl, setTwitterUrl] = useState(member?.twitterUrl ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    member?.status ?? "PUBLISHED"
  );
  const [sortOrder, setSortOrder] = useState<number>(member?.sortOrder ?? 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveTeamMemberAction({
        id: member?.id,
        name,
        role,
        bio,
        image,
        linkedinUrl: linkedinUrl || null,
        twitterUrl: twitterUrl || null,
        status,
        sortOrder,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: member ? "Profil tim diperbarui" : "Anggota tim ditambahkan",
          description: `"${res.data.name}" berhasil disimpan.`,
        });
        onSaved(res.data);
      } else {
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input profil tim"
            : "Gagal menyimpan anggota tim",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!member) return;
    startTransition(async () => {
      const res = await deleteTeamMemberAction(member.id);
      setDeleteOpen(false);
      if (res.ok) {
        toast({ type: "success", title: "Anggota tim dihapus" });
        onDeleted();
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus anggota tim",
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#86FF00] text-[#090A0F] font-bold text-xs flex items-center justify-center uppercase">
              {(name || "TM").slice(0, 2)}
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">
                {member ? `Member #${member.id}` : "New Team Member"}
              </p>
              <h3 className="font-display font-bold text-lg text-white">
                {name || "Unnamed Member"}
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
              Full Name
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
              Role / Title
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Avatar Image Path
            </label>
            <input
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Display Order
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
              LinkedIn URL
            </label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Twitter / X URL
            </label>
            <input
              type="text"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Biography
            </label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400">Compro Route</span>
            <span className="font-mono text-slate-300">/team & /about</span>
          </div>

          <div className="flex items-center gap-2">
            {member && (
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
              {isPending ? "Saving..." : "Save Member"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Anggota Tim?"
        description={`Profil "${member?.name}" akan dihapus dari halaman Team.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function CompanyProfileForm({
  profile,
  onSaved,
}: {
  profile: CompanyProfileSettings;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CompanyProfileSettings>(profile);

  const updateField = (key: keyof CompanyProfileSettings, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveCompanyProfileAction(form);
      if (res.ok) {
        toast({
          type: "success",
          title: "Profil perusahaan diperbarui",
          description: "Kontak, alamat legal, dan link WhatsApp tersimpan.",
        });
        onSaved();
      } else {
        toast({
          type: "error",
          title: "Gagal menyimpan profil perusahaan",
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
          Global Constants & Contact Settings
        </p>
        <h3 className="font-display font-bold text-lg text-white">
          {form.name} — {form.tagline}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {(
          [
            ["name", "Company Name"],
            ["tagline", "Tagline"],
            ["email", "Primary Contact Email"],
            ["phone", "Phone Number"],
            ["whatsappPhone", "WhatsApp Phone (628xxx)"],
            ["url", "Website URL"],
            ["address", "Short City Address"],
            ["companyNumber", "Registration / Company No."],
            ["dpoEmail", "DPO Email"],
            ["privacyEmail", "Privacy Email"],
            ["linkedin", "LinkedIn URL"],
            ["instagram", "Instagram URL"],
          ] as [keyof CompanyProfileSettings, string][]
        ).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-400">
              {label}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => updateField(key, e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        ))}

        <div className="sm:col-span-2 space-y-1">
          <label className="block text-[11px] font-medium text-slate-400">
            Registered Office Address
          </label>
          <input
            type="text"
            value={form.registeredAddress}
            onChange={(e) => updateField("registeredAddress", e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="block text-[11px] font-medium text-slate-400">
            Default WhatsApp Greeting
          </label>
          <input
            type="text"
            value={form.whatsappMessage}
            onChange={(e) => updateField("whatsappMessage", e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="block text-[11px] font-medium text-slate-400">
            Company Meta Description
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
        <div className="text-xs">
          <span className="block text-[10px] text-slate-400">Syncs With</span>
          <span className="font-mono text-slate-300">
            Navbar, Footer, Contact & Legal
          </span>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Company Profile"}
        </button>
      </div>
    </form>
  );
}

function AboutStatsValuesForm({
  initialStats,
  initialValues,
  onSaved,
}: {
  initialStats: AboutStatItem[];
  initialValues: AboutValueItem[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<AboutStatItem[]>(initialStats);
  const [values, setValues] = useState<AboutValueItem[]>(initialValues);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveAboutStatsValuesAction({ stats, values });
      if (res.ok) {
        toast({
          type: "success",
          title: "Statistik & Nilai diperbarui",
          description: "Data About Us berhasil disimpan.",
        });
        onSaved();
      } else {
        toast({
          type: "error",
          title: "Gagal menyimpan statistik",
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
          About Us Page Metrics & Core Values
        </p>
        <h3 className="font-display font-bold text-lg text-white">
          Stats ({stats.length}) & Core Values ({values.length})
        </h3>
      </div>

      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86FF00]">
            Headline Metrics (ABOUT_STATS)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {stats.map((st, idx) => (
              <div
                key={idx}
                className="bg-[#1C2029] border border-white/8 rounded-xl p-3 space-y-2"
              >
                <input
                  type="text"
                  value={st.value}
                  onChange={(e) =>
                    setStats((prev) =>
                      prev.map((s, i) =>
                        i === idx ? { ...s, value: e.target.value } : s
                      )
                    )
                  }
                  className="w-full bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm font-bold text-[#86FF00]"
                />
                <input
                  type="text"
                  value={st.label}
                  onChange={(e) =>
                    setStats((prev) =>
                      prev.map((s, i) =>
                        i === idx ? { ...s, label: e.target.value } : s
                      )
                    )
                  }
                  className="w-full bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Company Values (ABOUT_VALUES)
            </p>
            <button
              type="button"
              onClick={() =>
                setValues((prev) => [
                  ...prev,
                  { icon: "Bulb", title: "New Value", desc: "Describe value..." },
                ])
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#86FF00] cursor-pointer"
            >
              <IconPlus size={13} /> Add Value
            </button>
          </div>

          <div className="space-y-2">
            {values.map((val, idx) => (
              <div
                key={idx}
                className="bg-[#1C2029] border border-white/8 rounded-xl p-3 flex items-start gap-2"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={val.title}
                    onChange={(e) =>
                      setValues((prev) =>
                        prev.map((v, i) =>
                          i === idx ? { ...v, title: e.target.value } : v
                        )
                      )
                    }
                    placeholder="Title"
                    className="bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white"
                  />
                  <input
                    type="text"
                    value={val.desc}
                    onChange={(e) =>
                      setValues((prev) =>
                        prev.map((v, i) =>
                          i === idx ? { ...v, desc: e.target.value } : v
                        )
                      )
                    }
                    placeholder="Description"
                    className="sm:col-span-2 bg-[#14171E] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
                {values.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setValues((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-3 mt-auto">
        <div className="text-xs">
          <span className="block text-[10px] text-slate-400">Compro Route</span>
          <span className="font-mono text-slate-300">/about</span>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Stats & Values"}
        </button>
      </div>
    </form>
  );
}

export default function TeamAndAboutClient({
  initialTeam,
  initialProfile,
  initialStats,
  initialValues,
  storageMode,
}: TeamAndAboutClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"team" | "profile" | "about">(
    "team"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialTeam[0]?.id ?? "new"
  );

  const filteredTeam = useMemo(() => {
    if (!searchQuery.trim()) return initialTeam;
    const q = searchQuery.toLowerCase();
    return initialTeam.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)
    );
  }, [initialTeam, searchQuery]);

  const selectedMember =
    selectedId === "new"
      ? null
      : filteredTeam.find((m) => m.id === selectedId) ?? filteredTeam[0] ?? null;

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="About & Team"
        backHref="/"
        primaryActionLabel="New Team Member"
        onPrimaryAction={() => {
          setActiveTab("team");
          setSelectedId("new");
        }}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Team Members", value: String(initialTeam.length), unit: "leaders" },
          { label: "About Metrics", value: String(initialStats.length), unit: "KPIs" },
          { label: "Core Values", value: String(initialValues.length), unit: "pillars" },
        ]}
        timelineSegments={[
          {
            label: "Leadership",
            endLabel: `${initialTeam.length} profiles`,
            progressPercent: 85,
            avatars: initialTeam.map((t) => t.name.slice(0, 2).toUpperCase()),
          },
          {
            label: "Global Contact",
            endLabel: initialProfile.email,
            progressPercent: 100,
            avatars: ["VM"],
          },
          {
            label: "Company Values",
            endLabel: `${initialValues.length} values`,
            progressPercent: 90,
            avatars: ["IN", "EX"],
          },
        ]}
        rightTitle="Organization Settings"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /about & /team"
        rightActionLabel="+ Add Member"
        onRightAction={() => {
          setActiveTab("team");
          setSelectedId("new");
        }}
        miniCards={[
          {
            id: "team",
            code: "Team",
            title: `${initialTeam.length} Members`,
            subtitle: "Leadership Bios",
            highlighted: activeTab === "team",
          },
          {
            id: "profile",
            code: "Profile",
            title: "Contact & WA",
            subtitle: initialProfile.email,
            highlighted: activeTab === "profile",
          },
          {
            id: "about",
            code: "About Us",
            title: "Stats & Values",
            subtitle: `${initialStats[0]?.value ?? "150+"} Clients`,
            highlighted: activeTab === "about",
          },
        ]}
        onMiniCardClick={(id) =>
          setActiveTab(id as "team" | "profile" | "about")
        }
      />

      <FilterPillBar
        activeCount={searchQuery.trim() ? 1 : 0}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search team member name or role..."
      />

      <SplitWorkspace
        tabs={[
          { id: "team", label: "Team Members", count: initialTeam.length },
          { id: "profile", label: "Company Profile" },
          { id: "about", label: "Stats & Values" },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) =>
          setActiveTab(id as "team" | "profile" | "about")
        }
        leftTitle={
          activeTab === "team"
            ? "Leadership & Team"
            : activeTab === "profile"
              ? "Company Profile Sections"
              : "About Us Configuration"
        }
        leftContent={
          activeTab === "team" ? (
            filteredTeam.length > 0 ? (
              filteredTeam.map((m) => (
                <MasterListItem
                  key={m.id}
                  selected={
                    selectedId !== "new" && selectedMember?.id === m.id
                  }
                  onClick={() => setSelectedId(m.id)}
                  avatarText={m.name.slice(0, 2).toUpperCase()}
                  title={m.name}
                  subtitle={m.role}
                  statusLabel={m.status}
                  rightMetric={`#${m.sortOrder}`}
                />
              ))
            ) : (
              <div className="py-12 text-center text-sm text-slate-500">
                Tidak ada anggota tim ditemukan.
              </div>
            )
          ) : activeTab === "profile" ? (
            <div className="space-y-2">
              <MasterListItem
                selected
                avatarText="CO"
                title={initialProfile.name}
                subtitle={initialProfile.email}
                statusLabel="Active"
                rightMetric="Contact"
              />
              <MasterListItem
                avatarText="WA"
                title="WhatsApp Widget"
                subtitle={initialProfile.whatsappPhone}
                statusLabel="Live"
                rightMetric="Chat"
              />
              <MasterListItem
                avatarText="LG"
                title="Legal & DPO Contacts"
                subtitle={initialProfile.dpoEmail}
                statusLabel="Verified"
                rightMetric={initialProfile.companyNumber}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {initialStats.map((st, idx) => (
                <MasterListItem
                  key={idx}
                  selected={idx === 0}
                  avatarText="ST"
                  title={st.value}
                  subtitle={st.label}
                  statusLabel="Stat"
                  rightMetric={`#${idx + 1}`}
                />
              ))}
            </div>
          )
        }
        rightContent={
          activeTab === "team" ? (
            <TeamMemberForm
              key={selectedId === "new" ? "new" : String(selectedMember?.id ?? "new")}
              member={selectedMember}
              onSaved={(saved) => {
                setSelectedId(saved.id);
                router.refresh();
              }}
              onDeleted={() => {
                setSelectedId("new");
                router.refresh();
              }}
            />
          ) : activeTab === "profile" ? (
            <CompanyProfileForm
              key={initialProfile.email + initialProfile.whatsappPhone}
              profile={initialProfile}
              onSaved={() => router.refresh()}
            />
          ) : (
            <AboutStatsValuesForm
              key={`${initialStats.length}-${initialValues.length}`}
              initialStats={initialStats}
              initialValues={initialValues}
              onSaved={() => router.refresh()}
            />
          )
        }
      />
    </div>
  );
}
