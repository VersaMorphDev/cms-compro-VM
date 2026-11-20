"use client";

import { cn } from "@/lib/utils";

interface MasterListItemProps {
  selected?: boolean;
  onClick?: () => void;
  avatarText: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  rightMetric: string;
}

export default function MasterListItem({
  selected = false,
  onClick,
  avatarText,
  title,
  subtitle,
  statusLabel,
  rightMetric,
}: MasterListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 rounded-2xl transition-all flex items-center justify-between gap-3 cursor-pointer",
        selected
          ? "bg-[#14171E] text-white shadow-md"
          : "bg-transparent text-slate-900 hover:bg-slate-100"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center shrink-0 uppercase",
            selected
              ? "bg-[#86FF00] text-[#090A0F]"
              : "bg-slate-200 text-slate-700"
          )}
        >
          {avatarText}
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              "text-xs font-semibold truncate",
              selected ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "text-[11px] truncate",
              selected ? "text-slate-400" : "text-slate-500"
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-medium",
            selected
              ? "bg-white text-[#090A0F] font-semibold"
              : "bg-slate-100 text-slate-600"
          )}
        >
          {statusLabel}
        </span>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums min-w-[68px] text-right",
            selected ? "text-white" : "text-slate-700"
          )}
        >
          {rightMetric}
        </span>
      </div>
    </button>
  );
}
