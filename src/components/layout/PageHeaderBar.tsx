"use client";

import Link from "next/link";
import { IconArrowLeft, IconAdjustmentsHorizontal, IconPlus } from "@tabler/icons-react";

interface PageHeaderBarProps {
  title: string;
  backHref?: string;
  onFilterToggle?: () => void;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  onPrimaryAction?: () => void;
  secondarySlot?: React.ReactNode;
}

export default function PageHeaderBar({
  title,
  backHref = "/",
  onFilterToggle,
  primaryActionLabel,
  primaryActionHref,
  onPrimaryAction,
  secondarySlot,
}: PageHeaderBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-[#161920] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/25 transition-colors shrink-0"
        >
          <IconArrowLeft size={18} />
        </Link>
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        {secondarySlot}

        {onFilterToggle && (
          <button
            type="button"
            onClick={onFilterToggle}
            title="Toggle Filters"
            className="w-10 h-10 rounded-full bg-[#161920] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
          >
            <IconAdjustmentsHorizontal size={18} />
          </button>
        )}

        {primaryActionLabel && primaryActionHref && (
          <Link
            href={primaryActionHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#161920] border border-white/15 text-sm font-medium text-white hover:bg-[#86FF00] hover:text-[#090A0F] hover:border-[#86FF00] transition-all"
          >
            <IconPlus size={16} />
            <span>{primaryActionLabel}</span>
          </Link>
        )}

        {primaryActionLabel && !primaryActionHref && onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#161920] border border-white/15 text-sm font-medium text-white hover:bg-[#86FF00] hover:text-[#090A0F] hover:border-[#86FF00] transition-all cursor-pointer"
          >
            <IconPlus size={16} />
            <span>{primaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
