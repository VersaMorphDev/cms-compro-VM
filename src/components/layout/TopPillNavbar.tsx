"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutGrid,
  IconLayoutDashboard,
  IconFileText,
  IconCurrencyDollar,
  IconBuilding,
  IconInbox,
  IconActivity,
  IconBell,
  IconRefresh,
  IconMenu2,
  IconX,
  IconSparkles,
  IconChevronDown,
  IconArrowUpRight,
  IconLayoutRows,
  IconBriefcase,
  IconStack2,
  IconArticle,
  IconHelpCircle,
  IconTag,
  IconCalculator,
  IconHeartHandshake,
  IconUsers,
  IconQuote,
  IconUserPlus,
  IconScale,
  IconShieldLock,
  IconMail,
  IconShare,
  IconHistory,
  IconShieldExclamation,
  IconKey,
  IconLogout,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import {
  NAV_GROUPS,
  getActiveNavGroup,
  type NavGroup,
  type NavGroupId,
  type NavSubIconName,
} from "@/lib/nav-config";
import type { AuthUser } from "@/lib/auth";
import { ROLE_META } from "@/features/users/schema";
import {
  changeOwnPasswordAction,
  logoutAction,
} from "@/features/auth/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

const GROUP_ICONS: Record<
  NavGroup["iconName"],
  React.ComponentType<{ size?: number; className?: string }>
> = {
  "layout-dashboard": IconLayoutDashboard,
  "file-text": IconFileText,
  "currency-dollar": IconCurrencyDollar,
  building: IconBuilding,
  inbox: IconInbox,
  activity: IconActivity,
};

const SUB_ICONS: Record<
  NavSubIconName,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  dashboard: IconLayoutDashboard,
  refresh: IconRefresh,
  "layout-sections": IconLayoutRows,
  briefcase: IconBriefcase,
  stack: IconStack2,
  article: IconArticle,
  help: IconHelpCircle,
  tag: IconTag,
  calculator: IconCalculator,
  handshake: IconHeartHandshake,
  users: IconUsers,
  quote: IconQuote,
  "user-plus": IconUserPlus,
  scale: IconScale,
  "shield-lock": IconShieldLock,
  mail: IconMail,
  affiliate: IconShare,
  "file-cv": IconFileText,
  history: IconHistory,
  "shield-alert": IconShieldExclamation,
};

const TOTAL_MODULES_COUNT = NAV_GROUPS.reduce(
  (sum, group) => sum + group.items.length,
  0
);

function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await changeOwnPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.ok) {
        toast({
          type: "success",
          title: "Password diperbarui",
          description: res.message ?? "Gunakan password baru untuk login berikutnya.",
        });
        onClose();
      } else {
        setErrorMsg(res.error.message);
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
        toast({
          type: "error",
          title: "Gagal mengganti password",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md bg-[#14171E] border border-white/15 rounded-[28px] p-6 sm:p-7 space-y-5 shadow-[0_28px_80px_rgba(0,0,0,0.8)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#86FF00]/15 border border-[#86FF00]/30 text-[#86FF00] flex items-center justify-center shrink-0">
              <IconKey size={19} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Ganti Password Akun
              </h3>
              <p className="text-xs text-slate-400">
                Perbarui kredensial login CMS Anda secara berkala.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-[#1C2029] border border-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <IconX size={15} />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-2xl bg-rose-500/12 border border-rose-500/35 px-3.5 py-2.5 text-xs text-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Password Saat Ini
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                disabled={isPending}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="w-full rounded-xl bg-[#0B0D12] border border-white/12 focus:border-[#86FF00] focus:outline-none text-sm text-white placeholder:text-slate-500 pl-3.5 pr-10 py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showCurrent ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
            {fieldErrors.currentPassword?.[0] && (
              <p className="text-[11px] text-rose-400">
                {fieldErrors.currentPassword[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Password Baru (Min. 8 karakter)
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                disabled={isPending}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kombinasi minimal 8 karakter"
                className="w-full rounded-xl bg-[#0B0D12] border border-white/12 focus:border-[#86FF00] focus:outline-none text-sm text-white placeholder:text-slate-500 pl-3.5 pr-10 py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showNew ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
            {fieldErrors.newPassword?.[0] && (
              <p className="text-[11px] text-rose-400">
                {fieldErrors.newPassword[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Konfirmasi Password Baru
            </label>
            <input
              type={showNew ? "text" : "password"}
              disabled={isPending}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full rounded-xl bg-[#0B0D12] border border-white/12 focus:border-[#86FF00] focus:outline-none text-sm text-white placeholder:text-slate-500 px-3.5 py-2.5"
            />
            {fieldErrors.confirmPassword?.[0] && (
              <p className="text-[11px] text-rose-400">
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#1C2029] border border-white/15 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <IconCheck size={14} stroke={2.5} />
                  <span>Simpan Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TopPillNavbarProps {
  currentUser?: AuthUser | null;
}

export default function TopPillNavbar({ currentUser = null }: TopPillNavbarProps) {
  const pathname = usePathname();
  const { toast } = useToast();
  const activeGroup = getActiveNavGroup(pathname);
  const [openMenu, setOpenMenu] = useState<NavGroupId | "all" | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const isSubItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/monitoring") return pathname === "/monitoring";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const cancelScheduledClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const handlePointerDown = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    if (isLoggingOut) return;
    startLogoutTransition(async () => {
      const res = await logoutAction();
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      toast({
        type: "info",
        title: "Keluar dari CMS Studio",
        description: res.ok
          ? res.message ?? "Sesi Anda telah diakhiri."
          : "Mengalihkan ke halaman login...",
      });
      window.location.assign(
        res.ok ? res.data.redirectTo : "/login?reason=logout"
      );
    });
  };

  const activeMegaGroup =
    openMenu && openMenu !== "all"
      ? NAV_GROUPS.find((g) => g.id === openMenu) ?? null
      : null;

  const ActiveMegaIcon = activeMegaGroup
    ? GROUP_ICONS[activeMegaGroup.iconName]
    : null;

  const displayName = currentUser?.name ?? "Admin";
  const displayInitials = currentUser?.avatarInitials ?? "VM";
  const displayRoleLabel = currentUser
    ? ROLE_META[currentUser.role].label
    : "CMS Access";

  return (
    <>
      {/* Subtle Backdrop When Mega Menu is Open */}
      {openMenu && (
        <div
          aria-hidden="true"
          onClick={() => setOpenMenu(null)}
          className="fixed inset-0 top-[73px] bg-black/45 backdrop-blur-[2px] z-40 hidden lg:block"
        />
      )}

      <header
        onMouseLeave={scheduleClose}
        className="sticky top-0 z-50 w-full bg-[#0B0D12]/90 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 relative">
          {/* Single-Row Fixed Header */}
          <div className="flex items-center justify-between gap-4">
            {/* Brand Logo (Left) */}
            <Link
              href="/"
              onClick={() => {
                setOpenMenu(null);
                setProfileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <div className="w-9 h-9 rounded-full bg-[#86FF00] text-[#090A0F] flex items-center justify-center shadow-[0_0_20px_rgba(134,255,0,0.3)] group-hover:scale-105 transition-transform">
                <IconSparkles size={19} stroke={2.4} />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-display font-bold text-[15px] leading-tight tracking-tight text-white">
                  Versa Morph
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  CMS Studio
                </span>
              </div>
            </Link>

            {/* Fixed-Order Primary Module Dock (Center - Triggers Mega Menu) */}
            <nav
              aria-label="Primary module navigation"
              className="hidden lg:flex items-center gap-1 bg-[#161920] border border-white/10 p-1.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            >
              {NAV_GROUPS.map((group) => {
                const Icon = GROUP_ICONS[group.iconName];
                const isRouteActive = group.id === activeGroup.id;
                const isMenuOpen = openMenu === group.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    aria-expanded={isMenuOpen}
                    onMouseEnter={() => {
                      cancelScheduledClose();
                      setProfileMenuOpen(false);
                      setOpenMenu(group.id);
                    }}
                    onClick={() => {
                      cancelScheduledClose();
                      setProfileMenuOpen(false);
                      setOpenMenu((prev) =>
                        prev === group.id ? null : group.id
                      );
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      isRouteActive
                        ? "bg-[#86FF00] text-[#090A0F] font-semibold shadow-sm"
                        : isMenuOpen
                          ? "bg-white/12 text-white"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={15} />
                    <span>{group.shortLabel}</span>
                    <IconChevronDown
                      size={13}
                      className={cn(
                        "transition-transform duration-200 opacity-75",
                        isMenuOpen && "rotate-180"
                      )}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Right Utility Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-expanded={openMenu === "all"}
                title="All Modules Directory"
                onMouseEnter={() => {
                  cancelScheduledClose();
                  setProfileMenuOpen(false);
                  setOpenMenu("all");
                }}
                onClick={() => {
                  cancelScheduledClose();
                  setProfileMenuOpen(false);
                  setOpenMenu((prev) => (prev === "all" ? null : "all"));
                }}
                className={cn(
                  "hidden lg:flex w-10 h-10 rounded-full border items-center justify-center transition-colors cursor-pointer",
                  openMenu === "all"
                    ? "bg-[#86FF00] text-[#090A0F] border-[#86FF00]"
                    : "bg-[#161920] border-white/10 text-slate-300 hover:text-[#86FF00] hover:border-[#86FF00]/40"
                )}
              >
                <IconLayoutGrid size={18} />
              </button>

              <Link
                href="/sync"
                onClick={() => {
                  setOpenMenu(null);
                  setProfileMenuOpen(false);
                }}
                title="Quick Sync Compro"
                className="hidden sm:flex w-10 h-10 rounded-full bg-[#161920] border border-white/10 items-center justify-center text-slate-300 hover:text-[#86FF00] hover:border-[#86FF00]/40 transition-colors"
              >
                <IconRefresh size={18} />
              </Link>

              <Link
                href="/monitoring/errors"
                onClick={() => {
                  setOpenMenu(null);
                  setProfileMenuOpen(false);
                }}
                title="System Monitor & Error Alerts"
                className="relative w-10 h-10 rounded-full bg-[#161920] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/20 transition-colors"
              >
                <IconBell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#86FF00] ring-2 ring-[#161920]" />
              </Link>

              {/* Interactive Admin Profile Pill + Account Dropdown */}
              <div ref={profileMenuRef} className="relative hidden sm:block">
                <button
                  type="button"
                  aria-expanded={profileMenuOpen}
                  onClick={() => {
                    setOpenMenu(null);
                    setProfileMenuOpen((prev) => !prev);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border transition-colors cursor-pointer",
                    profileMenuOpen
                      ? "bg-[#1C2029] border-[#86FF00]/50"
                      : "bg-[#161920] border-white/10 hover:border-white/25"
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#86FF00] to-emerald-500 text-[#090A0F] font-bold text-xs flex items-center justify-center uppercase">
                    {displayInitials}
                  </div>
                  <div className="hidden md:flex flex-col text-left max-w-[125px]">
                    <span className="text-xs font-semibold text-white leading-none truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">
                      {displayRoleLabel}
                    </span>
                  </div>
                  <IconChevronDown
                    size={13}
                    className={cn(
                      "hidden md:block text-slate-400 transition-transform",
                      profileMenuOpen && "rotate-180 text-[#86FF00]"
                    )}
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-72 rounded-[24px] bg-[#14171E] border border-white/12 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.85)] z-50 space-y-3">
                    <div className="rounded-2xl bg-[#0B0D12] border border-white/8 p-3.5 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#86FF00] text-[#090A0F] font-bold text-xs flex items-center justify-center uppercase shrink-0">
                          {displayInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {currentUser?.email ?? "Authenticated Session"}
                          </p>
                        </div>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#86FF00]/15 text-[#86FF00] text-[10px] font-bold uppercase tracking-wider">
                        {displayRoleLabel}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/company/users"
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-[#1C2029] hover:text-[#86FF00] transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <IconShieldLock size={16} />
                          <span>
                            {currentUser?.role === "SUPER_ADMIN"
                              ? "Kelola Admin Users"
                              : "Lihat Direktori Admin"}
                          </span>
                        </span>
                        <IconArrowUpRight size={14} className="text-slate-500" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setPasswordModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-[#1C2029] hover:text-white transition-colors cursor-pointer"
                      >
                        <IconKey size={16} />
                        <span>Ganti Password Saya</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-white/8">
                      <button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-full bg-rose-500/12 border border-rose-500/25 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <IconLogout size={15} />
                        <span>
                          {isLoggingOut ? "Keluar..." : "Sign Out / Logout"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden w-10 h-10 rounded-full bg-[#161920] border border-white/10 flex items-center justify-center text-white cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <IconX size={19} /> : <IconMenu2 size={19} />}
              </button>
            </div>
          </div>

          {/* Desktop Per-Group Bento Mega Menu */}
          {activeMegaGroup && ActiveMegaIcon && (
            <div
              onMouseEnter={cancelScheduledClose}
              onMouseLeave={scheduleClose}
              className="hidden lg:block absolute left-0 right-0 top-full pt-2.5 px-4 sm:px-6 lg:px-8 z-50"
            >
              <div className="max-w-[940px] mx-auto rounded-[28px] bg-[#14171E] border border-white/12 p-5 shadow-[0_32px_90px_rgba(0,0,0,0.8)]">
                <div className="grid grid-cols-12 gap-5 items-stretch">
                  {/* Left: Sub-Menu Cards (8 cols) */}
                  <div className="col-span-8 flex flex-col">
                    <div className="flex items-center justify-between px-1 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {activeMegaGroup.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#1C2029] border border-white/10 text-[10px] font-mono text-slate-300">
                          {activeMegaGroup.items.length} modules
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenMenu(null)}
                        className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        Esc to close
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 flex-1">
                      {activeMegaGroup.items.map((item) => {
                        const SubIcon = SUB_ICONS[item.iconName];
                        const active = isSubItemActive(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className={cn(
                              "group/card flex items-start gap-3 p-3.5 rounded-2xl border transition-all",
                              active
                                ? "bg-[#1C2029] border-[#86FF00]/50 shadow-[0_0_0_1px_rgba(134,255,0,0.15)]"
                                : "bg-[#0F1218] border-white/6 hover:bg-[#191D26] hover:border-white/15"
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                active
                                  ? "bg-[#86FF00] text-[#090A0F]"
                                  : "bg-[#1C2029] text-slate-300 group-hover/card:bg-[#86FF00] group-hover/card:text-[#090A0F]"
                              )}
                            >
                              <SubIcon size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    "text-[13px] font-semibold truncate transition-colors",
                                    active
                                      ? "text-[#86FF00]"
                                      : "text-white group-hover/card:text-[#86FF00]"
                                  )}
                                >
                                  {item.label}
                                </span>
                                {active ? (
                                  <span className="px-2 py-0.5 rounded-full bg-[#86FF00]/15 text-[#86FF00] text-[10px] font-semibold shrink-0">
                                    Active
                                  </span>
                                ) : (
                                  <IconArrowUpRight
                                    size={14}
                                    className="text-slate-500 opacity-0 group-hover/card:opacity-100 group-hover/card:text-[#86FF00] transition-all shrink-0"
                                  />
                                )}
                              </div>
                              <p className="text-[11.5px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                                {item.description}
                              </p>
                              {item.comproRoute && (
                                <span className="inline-block mt-1.5 text-[10px] font-mono text-slate-500">
                                  Compro: {item.comproRoute}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Bento Spotlight Card (4 cols) */}
                  <div className="col-span-4 bg-[#0B0D12] border border-white/8 rounded-[22px] p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-[#86FF00]/15 text-[#86FF00] text-[10px] font-bold uppercase tracking-wider">
                          {activeMegaGroup.accentBadge}
                        </span>
                        <span className="w-8 h-8 rounded-full bg-[#161920] border border-white/10 flex items-center justify-center text-slate-300">
                          <ActiveMegaIcon size={16} />
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-bold text-base text-white">
                          {activeMegaGroup.label}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                          {activeMegaGroup.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/8 space-y-2">
                      <Link
                        href={activeMegaGroup.quickActionHref}
                        onClick={() => setOpenMenu(null)}
                        className="w-full py-2.5 px-4 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>{activeMegaGroup.quickActionLabel}</span>
                        <IconArrowUpRight size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setOpenMenu("all")}
                        className="w-full py-2 px-4 rounded-full bg-[#161920] hover:bg-[#1C2029] border border-white/10 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Browse All {TOTAL_MODULES_COUNT} Modules
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop All-Modules Bento Directory Mega Menu */}
          {openMenu === "all" && (
            <div
              onMouseEnter={cancelScheduledClose}
              onMouseLeave={scheduleClose}
              className="hidden lg:block absolute left-0 right-0 top-full pt-2.5 px-4 sm:px-6 lg:px-8 z-50"
            >
              <div className="max-w-[1180px] mx-auto rounded-[28px] bg-[#14171E] border border-white/12 p-6 shadow-[0_32px_90px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#86FF00] text-[#090A0F] flex items-center justify-center">
                      <IconLayoutGrid size={16} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-white">
                        CMS Studio Directory
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Jump directly to any module across all 6 workspaces
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/sync"
                      onClick={() => setOpenMenu(null)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors"
                    >
                      <IconRefresh size={14} />
                      <span>Quick Sync Compro</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpenMenu(null)}
                      className="w-8 h-8 rounded-full bg-[#1C2029] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                      aria-label="Close directory"
                    >
                      <IconX size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  {NAV_GROUPS.map((group) => {
                    const GroupIcon = GROUP_ICONS[group.iconName];
                    const isCurrentGroup = group.id === activeGroup.id;

                    return (
                      <div
                        key={group.id}
                        className={cn(
                          "rounded-2xl p-4 border bg-[#0B0D12]",
                          isCurrentGroup
                            ? "border-[#86FF00]/35"
                            : "border-white/8"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <GroupIcon
                              size={15}
                              className={
                                isCurrentGroup
                                  ? "text-[#86FF00]"
                                  : "text-slate-400"
                              }
                            />
                            <span className="font-display font-semibold text-xs text-white">
                              {group.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {group.items.length}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const SubIcon = SUB_ICONS[item.iconName];
                            const active = isSubItemActive(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpenMenu(null)}
                                className={cn(
                                  "flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors",
                                  active
                                    ? "bg-[#86FF00] text-[#090A0F] font-semibold"
                                    : "text-slate-300 hover:bg-[#161920] hover:text-white"
                                )}
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <SubIcon size={14} className="shrink-0" />
                                  <span className="truncate">{item.label}</span>
                                </span>
                                {item.comproRoute && (
                                  <span
                                    className={cn(
                                      "text-[10px] font-mono shrink-0",
                                      active
                                        ? "text-[#090A0F]/75"
                                        : "text-slate-500"
                                    )}
                                  >
                                    {item.comproRoute}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tablet/Mobile Expanded Mega Navigation + Account Controls */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 p-4 rounded-3xl bg-[#14171E] border border-white/10 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Mobile Logged-in User Card */}
              <div className="rounded-2xl bg-[#0B0D12] border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#86FF00] text-[#090A0F] font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {displayInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser?.email ?? displayRoleLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setPasswordModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#1C2029] border border-white/10 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <IconKey size={13} />
                    <span>Password</span>
                  </button>
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-semibold text-rose-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <IconLogout size={13} />
                    <span>{isLoggingOut ? "..." : "Logout"}</span>
                  </button>
                </div>
              </div>

              {NAV_GROUPS.map((group) => {
                const Icon = GROUP_ICONS[group.iconName];
                const isCurrentGroup = group.id === activeGroup.id;
                return (
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                      <Icon
                        size={14}
                        className={isCurrentGroup ? "text-[#86FF00]" : ""}
                      />
                      <span>{group.label}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.items.map((item) => {
                        const SubIcon = SUB_ICONS[item.iconName];
                        const active = isSubItemActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-start gap-2.5 p-3 rounded-2xl border transition-colors",
                              active
                                ? "bg-[#86FF00] text-[#090A0F] border-[#86FF00]"
                                : "bg-[#0B0D12] border-white/8 text-slate-200 hover:border-white/20"
                            )}
                          >
                            <SubIcon size={16} className="shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="block text-xs font-semibold">
                                {item.label}
                              </span>
                              <span
                                className={cn(
                                  "block text-[11px] leading-snug mt-0.5",
                                  active ? "text-[#090A0F]/80" : "text-slate-400"
                                )}
                              >
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {passwordModalOpen && (
        <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />
      )}
    </>
  );
}
