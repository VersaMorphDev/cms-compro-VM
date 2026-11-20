"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconShieldLock,
  IconUserPlus,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconPower,
  IconCheck,
  IconAlertTriangle,
  IconKey,
} from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import type { AuthUser } from "@/lib/auth";
import { ADMIN_ROLES, type AdminRole } from "@/lib/session-token";
import { cn } from "@/lib/utils";
import { ROLE_META, type AdminUserDTO } from "@/features/users/schema";
import {
  deleteAdminUserAction,
  saveAdminUserAction,
  toggleAdminUserActiveAction,
} from "@/features/users/actions";

interface UsersManagerClientProps {
  initialUsers: AdminUserDTO[];
  currentUser: AuthUser;
}

function AdminUserForm({
  user,
  isSuperAdmin,
  currentUserId,
  onSaved,
  onDeleted,
  onCancelNew,
}: {
  user: AdminUserDTO | null;
  isSuperAdmin: boolean;
  currentUserId: number;
  onSaved: (saved: AdminUserDTO, isNew: boolean) => void;
  onDeleted: (deletedId: number) => void;
  onCancelNew: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isCreating = user === null;
  const isSelf = user !== null && user.id === currentUserId;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<AdminRole>(user?.role ?? "CONTENT_EDITOR");
  const [avatarInitials, setAvatarInitials] = useState(
    user?.avatarInitials ?? ""
  );
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const roleMeta = ROLE_META[role];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setFieldErrors({});

    startTransition(async () => {
      const res = await saveAdminUserAction({
        id: user?.id,
        name,
        email,
        role,
        avatarInitials,
        isActive,
        password: password || undefined,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: isCreating ? "Akun admin dibuat" : "Akun admin diperbarui",
          description: res.message ?? `${res.data.name} (${res.data.email}) disimpan.`,
        });
        setPassword("");
        onSaved(res.data, isCreating);
      } else {
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
        toast({
          type: "error",
          title: res.error.isValidation
            ? "Periksa input akun"
            : "Gagal menyimpan akun",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  const handleToggleActive = () => {
    if (!user || !isSuperAdmin) return;
    startTransition(async () => {
      const res = await toggleAdminUserActiveAction(user.id);
      if (res.ok) {
        setIsActive(res.data.isActive);
        toast({
          type: "success",
          title: res.data.isActive
            ? "Akun diaktifkan"
            : "Akun dinonaktifkan",
          description: `${res.data.email} sekarang berstatus ${
            res.data.isActive ? "Active" : "Inactive"
          }.`,
        });
        onSaved(res.data, false);
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

  const handleConfirmDelete = () => {
    if (!user || !isSuperAdmin) return;
    startTransition(async () => {
      const res = await deleteAdminUserAction(user.id);
      if (res.ok) {
        setDeleteOpen(false);
        toast({
          type: "success",
          title: "Akun admin dihapus",
          description: `${user.email} telah dihapus dari sistem.`,
        });
        onDeleted(res.data.deletedId);
      } else {
        setDeleteOpen(false);
        toast({
          type: "error",
          title: "Gagal menghapus akun",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top Editor Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#86FF00] text-[#090A0F] font-bold text-sm flex items-center justify-center uppercase shrink-0">
              {avatarInitials.trim() ||
                (name.trim() ? name.trim().slice(0, 2).toUpperCase() : "NEW")}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-lg text-white">
                  {isCreating ? "Tambah Akun Admin Baru" : user.name}
                </h3>
                {isSelf && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#86FF00]/15 text-[#86FF00] text-[10px] font-bold uppercase tracking-wider">
                    Akun Anda
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isCreating
                  ? "Berikan email dan password awal agar user bisa login ke CMS Studio."
                  : `${user.email} · ID #${user.id}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCreating ? (
              <button
                type="button"
                onClick={onCancelNew}
                className="px-3.5 py-1.5 rounded-full bg-[#1C2029] border border-white/10 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            ) : (
              isSuperAdmin && (
                <>
                  <button
                    type="button"
                    disabled={isPending || isSelf}
                    onClick={handleToggleActive}
                    title={
                      isSelf
                        ? "Tidak dapat menonaktifkan akun yang sedang login"
                        : isActive
                          ? "Nonaktifkan akun"
                          : "Aktifkan akun"
                    }
                    className={cn(
                      "px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    )}
                  >
                    <IconPower size={14} />
                    <span>{isActive ? "Active" : "Inactive"}</span>
                  </button>

                  {!isSelf && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeleteOpen(true)}
                      title="Hapus akun admin"
                      className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <IconTrash size={15} />
                    </button>
                  )}
                </>
              )
            )}
          </div>
        </div>

        {!isSuperAdmin && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-400/25 p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
            <IconAlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <span>
              Mode Read-Only: Hanya akun dengan role{" "}
              <strong className="text-white">Super Admin</strong> yang dapat
              membuat, mengubah, atau menonaktifkan user CMS.
            </span>
          </div>
        )}

        {/* Basic Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Nama Lengkap
            </label>
            <input
              type="text"
              disabled={!isSuperAdmin || isPending}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Nadia Kusuma"
              className="w-full rounded-2xl bg-[#0B0D12] border border-white/10 focus:border-[#86FF00] focus:outline-none px-4 py-2.5 text-sm text-white placeholder:text-slate-500 disabled:opacity-60"
            />
            {fieldErrors.name?.[0] && (
              <p className="text-[11px] text-rose-400">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Email Login
            </label>
            <input
              type="email"
              disabled={!isSuperAdmin || isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@versamorph.id"
              className="w-full rounded-2xl bg-[#0B0D12] border border-white/10 focus:border-[#86FF00] focus:outline-none px-4 py-2.5 text-sm text-white placeholder:text-slate-500 disabled:opacity-60"
            />
            {fieldErrors.email?.[0] && (
              <p className="text-[11px] text-rose-400">{fieldErrors.email[0]}</p>
            )}
          </div>
        </div>

        {/* Role & Initials */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Role Hak Akses
            </label>
            <select
              disabled={!isSuperAdmin || isPending || isSelf}
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full rounded-2xl bg-[#0B0D12] border border-white/10 focus:border-[#86FF00] focus:outline-none px-4 py-2.5 text-sm text-white disabled:opacity-60 cursor-pointer"
            >
              {ADMIN_ROLES.map((r) => (
                <option key={r} value={r} className="bg-[#14171E] text-white">
                  {ROLE_META[r].label} ({ROLE_META[r].badge})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 leading-snug pt-0.5">
              {roleMeta.description}
            </p>
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Inisial Avatar
            </label>
            <input
              type="text"
              maxLength={4}
              disabled={!isSuperAdmin || isPending}
              value={avatarInitials}
              onChange={(e) => setAvatarInitials(e.target.value.toUpperCase())}
              placeholder="Otomatis"
              className="w-full rounded-2xl bg-[#0B0D12] border border-white/10 focus:border-[#86FF00] focus:outline-none px-4 py-2.5 text-sm text-white uppercase placeholder:text-slate-500 disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-500">
              Kosongkan untuk auto-inisial.
            </p>
          </div>
        </div>

        {/* Password Section */}
        <div className="rounded-2xl bg-[#0B0D12] border border-white/8 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IconKey size={15} className="text-[#86FF00]" />
              <label className="text-xs font-semibold text-white">
                {isCreating ? "Password Awal (Wajib)" : "Reset Password (Opsional)"}
              </label>
            </div>
            <span className="text-[11px] text-slate-500">Min. 8 karakter</span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              disabled={!isSuperAdmin || isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                isCreating
                  ? "Minimal 8 karakter..."
                  : "Biarkan kosong jika tidak ingin mengganti password"
              }
              className="w-full rounded-xl bg-[#14171E] border border-white/10 focus:border-[#86FF00] focus:outline-none pl-4 pr-11 py-2.5 text-sm text-white placeholder:text-slate-500 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
          {fieldErrors.password?.[0] && (
            <p className="text-[11px] text-rose-400">{fieldErrors.password[0]}</p>
          )}
        </div>

        {/* Active Checkbox + Save Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={!isSuperAdmin || isPending || isSelf}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-[#86FF00] rounded cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs font-medium text-slate-200">
              Izinkan user ini login ke CMS Studio
            </span>
          </label>

          {isSuperAdmin && (
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold flex items-center gap-1.5 shadow-[0_6px_20px_rgba(134,255,0,0.25)] transition-colors cursor-pointer disabled:opacity-60"
            >
              <IconCheck size={15} stroke={2.5} />
              <span>
                {isPending
                  ? "Menyimpan..."
                  : isCreating
                    ? "Buat Akun Admin"
                    : "Simpan Perubahan"}
              </span>
            </button>
          )}
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Akun Admin?"
        description={`Akun ${user?.name ?? ""} (${user?.email ?? ""}) akan dihapus permanen dan tidak lagi memiliki akses ke CMS Studio.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function UsersManagerClient({
  initialUsers,
  currentUser,
}: UsersManagerClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserDTO[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialUsers[0]?.id ?? "new"
  );

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab === "active" && !u.isActive) return false;
      if (activeTab === "inactive" && u.isActive) return false;
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [users, activeTab, roleFilter, search]);

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.length - activeCount;
  const superAdminCount = users.filter(
    (u) => u.role === "SUPER_ADMIN" && u.isActive
  ).length;
  const editorCount = users.filter(
    (u) => u.role !== "SUPER_ADMIN" && u.isActive
  ).length;

  const selectedUser =
    selectedId === "new"
      ? null
      : users.find((u) => u.id === selectedId) ?? filteredUsers[0] ?? null;

  const editorKey = selectedId === "new" ? "new" : `user-${selectedUser?.id ?? "none"}`;

  const handleSaved = (saved: AdminUserDTO, isNew: boolean) => {
    setUsers((prev) => {
      if (isNew) return [...prev, saved];
      return prev.map((u) => (u.id === saved.id ? saved : u));
    });
    setSelectedId(saved.id);
    router.refresh();
  };

  const handleDeleted = (deletedId: number) => {
    const remaining = users.filter((u) => u.id !== deletedId);
    setUsers(remaining);
    setSelectedId(remaining[0]?.id ?? "new");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Admin Users & Access"
        backHref="/company/team"
        primaryActionLabel={isSuperAdmin ? "Tambah Admin" : undefined}
        onPrimaryAction={
          isSuperAdmin ? () => setSelectedId("new") : undefined
        }
        secondarySlot={
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#161920] border border-white/10 text-xs text-slate-300">
            <IconShieldLock size={15} className="text-[#86FF00]" />
            <span>{ROLE_META[currentUser.role].label}</span>
          </div>
        }
      />

      <BentoKpiSection
        leftStats={[
          {
            label: "Total Admin Accounts",
            value: String(users.length),
            unit: "users",
          },
          {
            label: "Active Accounts",
            value: String(activeCount),
            unit: `${inactiveCount} nonaktif`,
          },
          {
            label: "Super Admins",
            value: String(superAdminCount),
            unit: `${editorCount} staff roles`,
          },
        ]}
        timelineSegments={[
          {
            label: "Active Rate",
            endLabel: `${users.length ? Math.round((activeCount / users.length) * 100) : 0}%`,
            progressPercent: users.length
              ? (activeCount / users.length) * 100
              : 0,
            avatars: users.slice(0, 5).map((u) => u.avatarInitials),
          },
          {
            label: "Super Admin Shield",
            endLabel: `${superAdminCount} aktif`,
            progressPercent: users.length
              ? (superAdminCount / users.length) * 100
              : 0,
          },
          {
            label: "Auth Protection",
            endLabel: "Scrypt + HMAC",
            progressPercent: 100,
          },
        ]}
        rightTitle="Current Session"
        rightValue={currentUser.name}
        rightBadge={ROLE_META[currentUser.role].label}
        rightActionLabel={isSuperAdmin ? "Tambah Admin" : "Lihat Log"}
        onRightAction={() => {
          if (isSuperAdmin) {
            setSelectedId("new");
          } else {
            router.push("/monitoring");
          }
        }}
        miniCards={users.slice(0, 3).map((u) => ({
          id: String(u.id),
          code: u.avatarInitials,
          title: u.name,
          subtitle: ROLE_META[u.role].label,
          highlighted: u.id === selectedUser?.id,
        }))}
        onMiniCardClick={(id) => setSelectedId(Number(id))}
      />

      <FilterPillBar
        activeCount={(roleFilter !== "ALL" ? 1 : 0) + (search.trim() ? 1 : 0)}
        selects={[
          {
            id: "role-filter",
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { label: "All Roles", value: "ALL" },
              ...ADMIN_ROLES.map((r) => ({
                label: ROLE_META[r].label,
                value: r,
              })),
            ],
          },
        ]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama atau email admin..."
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Users", count: users.length },
          { id: "active", label: "Active", count: activeCount },
          { id: "inactive", label: "Inactive", count: inactiveCount },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => setActiveTab(id as "all" | "active" | "inactive")}
        leftTitle={`Admin Directory (${filteredUsers.length})`}
        leftContent={
          filteredUsers.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-medium text-slate-600">
                Tidak ada akun yang cocok dengan filter.
              </p>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setSelectedId("new")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#14171E] text-white text-xs font-semibold cursor-pointer"
                >
                  <IconUserPlus size={14} />
                  <span>Buat Akun Baru</span>
                </button>
              )}
            </div>
          ) : (
            filteredUsers.map((u) => (
              <MasterListItem
                key={u.id}
                selected={selectedId !== "new" && selectedUser?.id === u.id}
                onClick={() => setSelectedId(u.id)}
                avatarText={u.avatarInitials}
                title={u.id === currentUser.id ? `${u.name} (Anda)` : u.name}
                subtitle={u.email}
                statusLabel={u.isActive ? "Active" : "Inactive"}
                rightMetric={ROLE_META[u.role].badge}
              />
            ))
          )
        }
        rightContent={
          <AdminUserForm
            key={editorKey}
            user={selectedId === "new" ? null : selectedUser}
            isSuperAdmin={isSuperAdmin}
            currentUserId={currentUser.id}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
            onCancelNew={() => setSelectedId(users[0]?.id ?? "new")}
          />
        }
      />
    </div>
  );
}
