"use client";

import { IconAlertTriangle } from "@tabler/icons-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md bg-[#14171E] border border-white/15 rounded-[28px] p-6 sm:p-7 space-y-5 shadow-2xl">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <IconAlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-full bg-[#1C2029] border border-white/15 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
