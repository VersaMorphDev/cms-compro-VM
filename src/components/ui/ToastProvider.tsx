"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconX,
  IconCopy,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastInput {
  type: ToastType;
  title: string;
  description?: string;
  referenceCode?: string;
}

interface ToastItem extends ToastInput {
  id: string;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: ToastItem = { ...input, id };
      setToasts((prev) => [item, ...prev].slice(0, 4));

      const duration = input.type === "error" ? 8000 : 5000;
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const handleCopyRef = async (id: string, refCode: string) => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}

      {/* Floating Bento Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 w-[calc(100%-2.5rem)] max-w-sm pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto bg-[#14171E]/95 backdrop-blur-xl rounded-2xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)] border transition-all flex items-start gap-3",
              item.type === "success" && "border-[#86FF00]/40",
              item.type === "error" && "border-rose-500/45",
              item.type === "info" && "border-white/15"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                item.type === "success" && "bg-[#86FF00] text-[#090A0F]",
                item.type === "error" && "bg-rose-500/20 text-rose-400",
                item.type === "info" && "bg-[#1C2029] text-slate-200"
              )}
            >
              {item.type === "success" && <IconCheck size={16} stroke={2.5} />}
              {item.type === "error" && <IconAlertTriangle size={16} />}
              {item.type === "info" && <IconInfoCircle size={16} />}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-semibold text-white leading-snug">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.referenceCode && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyRef(item.id, item.referenceCode!)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C2029] border border-white/10 hover:border-[#86FF00]/50 text-[10px] font-mono font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>{item.referenceCode}</span>
                    <IconCopy size={11} className="text-slate-400" />
                  </button>
                  {copiedId === item.id && (
                    <span className="text-[10px] text-[#86FF00] font-medium">
                      Copied
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Close notification"
              className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
            >
              <IconX size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
