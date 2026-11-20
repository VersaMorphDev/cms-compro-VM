"use client";

import { useState, type FormEvent } from "react";
import {
  IconSparkles,
  IconLock,
  IconMail,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconShieldCheck,
  IconAlertTriangle,
  IconCircleCheck,
  IconLoader2,
  IconActivity,
  IconRefresh,
} from "@tabler/icons-react";
import { loginAction } from "@/features/auth/actions";
import { useToast } from "@/components/ui/ToastProvider";

interface LoginClientProps {
  nextPath: string;
  reason?: "expired" | "logout";
}

export default function LoginClient({ nextPath, reason }: LoginClientProps) {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg(null);
    setFieldErrors({});

    const nextFieldErrors: Record<string, string[]> = {};
    if (!email.trim()) {
      nextFieldErrors.email = ["Email wajib diisi."];
    }
    if (!password) {
      nextFieldErrors.password = ["Password wajib diisi."];
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setErrorMsg("Mohon lengkapi email dan password terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginAction({
        email: email.trim(),
        password,
        next: nextPath,
      });

      if (!res.ok) {
        setErrorMsg(res.error.message);
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
        toast({
          type: "error",
          title: "Login Gagal",
          description: res.error.message,
          referenceCode: res.error.referenceCode,
        });
        setSubmitting(false);
        return;
      }

      toast({
        type: "success",
        title: `Selamat datang, ${res.data.user.name}`,
        description: res.message ?? "Mengalihkan ke CMS Studio...",
      });

      window.location.assign(res.data.redirectTo || "/");
    } catch {
      const fallback = "Terjadi gangguan koneksi. Silakan coba beberapa saat lagi.";
      setErrorMsg(fallback);
      toast({
        type: "error",
        title: "Login Gagal",
        description: fallback,
      });
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0D12] bg-diagonal-hatch relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Subtle Ambient Electric Lime Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-40 -left-32 w-[480px] h-[480px] rounded-full bg-[#86FF00]/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-48 -right-32 w-[520px] h-[520px] rounded-full bg-[#86FF00]/8 blur-[140px]"
      />

      <div className="relative z-10 w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Showcase Bento Card (7 cols) */}
        <section className="lg:col-span-7 bg-[#14171E] border border-white/10 rounded-[32px] p-7 sm:p-10 flex flex-col justify-between gap-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          {/* Top Brand Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#86FF00] text-[#090A0F] flex items-center justify-center shadow-[0_0_24px_rgba(134,255,0,0.35)]">
                <IconSparkles size={22} stroke={2.3} />
              </div>
              <div>
                <p className="font-display font-bold text-lg tracking-tight text-white leading-tight">
                  Versa Morph
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  CMS Studio · Control Center
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C2029] border border-white/10 text-xs font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#86FF00] animate-pulse" />
              <span>Protected Workspace</span>
            </div>
          </div>

          {/* Center Hero Copy */}
          <div className="space-y-4 py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86FF00]/12 border border-[#86FF00]/25 text-[#86FF00] text-[11px] font-bold uppercase tracking-wider">
              <IconShieldCheck size={14} />
              <span>Authenticated Admin Access</span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-[40px] leading-[1.12] tracking-tight text-white">
              Kelola Seluruh Konten &amp; Sistem{" "}
              <span className="text-[#86FF00]">Versa Morph</span> dalam Satu Studio.
            </h1>

            <p className="text-sm sm:text-[15px] text-slate-400 leading-relaxed max-w-xl">
              Akses terpusat untuk mengatur section halaman, portofolio, blog,
              kalkulator harga, profil tim, hingga pipeline CRM dengan audit log
              dan proteksi peran admin.
            </p>
          </div>

          {/* Bottom 3 Bento Mini-Cards (Matching BentoKpiSection) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Highlighted Electric Lime Bento Mini-Card */}
              <div className="rounded-2xl p-4 bg-[#86FF00] text-[#090A0F] shadow-[0_10px_28px_rgba(134,255,0,0.2)] flex flex-col justify-between min-h-[112px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#090A0F]/80">
                    RBAC
                  </span>
                  <IconShieldCheck size={17} />
                </div>
                <div className="mt-3">
                  <p className="font-display font-bold text-sm leading-tight">
                    Role-Based Access
                  </p>
                  <p className="text-[11px] text-[#090A0F]/75 mt-1 leading-snug">
                    Super Admin, Editor, HR &amp; Sales
                  </p>
                </div>
              </div>

              {/* Dark Bento Mini-Card 2 */}
              <div className="rounded-2xl p-4 bg-[#1C2029] border border-white/8 text-white flex flex-col justify-between min-h-[112px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    AUDIT
                  </span>
                  <IconActivity size={17} className="text-[#86FF00]" />
                </div>
                <div className="mt-3">
                  <p className="font-display font-semibold text-sm leading-tight">
                    Real Actor Trail
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Setiap edit tercatat per akun user
                  </p>
                </div>
              </div>

              {/* Dark Bento Mini-Card 3 */}
              <div className="rounded-2xl p-4 bg-[#1C2029] border border-white/8 text-white flex flex-col justify-between min-h-[112px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    SYNC
                  </span>
                  <IconRefresh size={17} className="text-[#86FF00]" />
                </div>
                <div className="mt-3">
                  <p className="font-display font-semibold text-sm leading-tight">
                    Instant ISR Push
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Terhubung aman ke Compro publik
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/8 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Scrypt Password Hash · Signed HttpOnly Cookie</span>
              <span className="font-mono text-slate-500">SQLite Persistent Auth</span>
            </div>
          </div>
        </section>

        {/* Right Login Bento Container (5 cols) — White Shell + Dark Charcoal Inset */}
        <section className="lg:col-span-5 bg-white text-slate-900 rounded-[32px] p-4 sm:p-5 shadow-[0_28px_80px_rgba(0,0,0,0.6)] flex flex-col">
          {/* Top White Container Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-[#86FF00] flex items-center justify-center">
                <IconLock size={17} />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 leading-tight">
                  Sign In
                </h2>
                <p className="text-[11px] text-slate-500">
                  Masuk ke workspace admin
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
              CMS Access
            </span>
          </div>

          {/* Dark Charcoal Inset Form Card */}
          <div className="bg-[#14171E] text-white rounded-[24px] p-6 sm:p-7 flex-1 flex flex-col justify-between gap-6 shadow-inner">
            <div className="space-y-4">
              {reason === "expired" && (
                <div className="rounded-2xl bg-amber-500/12 border border-amber-400/30 p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
                  <IconAlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    Sesi Anda telah berakhir atau akun sedang dinonaktifkan. Silakan
                    login kembali untuk melanjutkan.
                  </span>
                </div>
              )}

              {reason === "logout" && (
                <div className="rounded-2xl bg-[#86FF00]/12 border border-[#86FF00]/30 p-3.5 flex items-start gap-2.5 text-xs text-[#C7FF8A]">
                  <IconCircleCheck size={16} className="shrink-0 mt-0.5 text-[#86FF00]" />
                  <span>
                    Anda telah keluar dari CMS Studio. Sesi cookie telah dibersihkan
                    dengan aman.
                  </span>
                </div>
              )}

              {nextPath && nextPath !== "/" && !reason && (
                <div className="rounded-2xl bg-[#1C2029] border border-white/10 px-3.5 py-2.5 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-400">Halaman tujuan:</span>
                  <span className="font-mono text-[#86FF00] truncate">
                    {nextPath}
                  </span>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-2xl bg-rose-500/12 border border-rose-500/35 p-3.5 flex items-start gap-2.5 text-xs text-rose-200"
                >
                  <IconAlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Email Admin
                  </label>
                  <div className="relative">
                    <IconMail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@versamorph.id"
                      className="w-full rounded-2xl bg-[#0B0D12] border border-white/12 focus:border-[#86FF00] focus:outline-none text-sm text-white placeholder:text-slate-500 pl-11 pr-4 py-3.5 transition-colors"
                    />
                  </div>
                  {fieldErrors.email?.[0] && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      {fieldErrors.email[0]}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <IconLock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password admin"
                      className="w-full rounded-2xl bg-[#0B0D12] border border-white/12 focus:border-[#86FF00] focus:outline-none text-sm text-white placeholder:text-slate-500 pl-11 pr-12 py-3.5 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                    </button>
                  </div>
                  {fieldErrors.password?.[0] && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      {fieldErrors.password[0]}
                    </p>
                  )}
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_10px_28px_rgba(134,255,0,0.28)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <IconLoader2 size={18} className="animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke CMS Studio</span>
                        <IconArrowRight size={17} stroke={2.4} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Helper Note inside Dark Inset */}
            <div className="rounded-2xl bg-[#0B0D12] border border-white/8 p-4 space-y-1">
              <p className="text-[11px] font-semibold text-slate-300">
                Keamanan &amp; Akun Admin
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Seluruh route studio dan Server Action dilindungi autentikasi sesi.
                Akun baru hanya dapat dibuat oleh{" "}
                <span className="text-white font-medium">Super Admin</span> di
                menu Admin Users.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
