"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface KpiStat {
  label: string;
  value: string;
  unit?: string;
}

export interface TimelineSegment {
  label: string;
  endLabel?: string;
  progressPercent: number;
  avatars?: string[]; // initials or short tags
}

export interface MiniHighlightCard {
  id: string;
  code: string;
  title: string;
  subtitle?: string;
  highlighted?: boolean;
}

interface BentoKpiSectionProps {
  leftStats: [KpiStat, KpiStat, KpiStat];
  timelineSegments?: TimelineSegment[];
  rightTitle: string;
  rightValue: string;
  rightBadge?: string;
  rightActionLabel?: string;
  onRightAction?: () => void;
  miniCards: MiniHighlightCard[];
  onMiniCardClick?: (id: string) => void;
}

export default function BentoKpiSection({
  leftStats,
  timelineSegments = [],
  rightTitle,
  rightValue,
  rightBadge,
  rightActionLabel = "Sync Now",
  onRightAction,
  miniCards,
  onMiniCardClick,
}: BentoKpiSectionProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Wide Dark Bento Card (7 cols) */}
      <div className="lg:col-span-7 bg-[#14171E] border border-white/8 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {leftStats.map((stat) => (
            <div key={stat.label} className="space-y-1.5">
              <p className="text-xs font-medium text-slate-400">{stat.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-semibold text-2xl sm:text-[28px] tracking-tight text-white">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-xs text-slate-400 font-medium">
                    {stat.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {timelineSegments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {timelineSegments.map((seg, idx) => (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>{seg.label}</span>
                  {seg.endLabel && <span>{seg.endLabel}</span>}
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#1F2430] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#86FF00] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(4, seg.progressPercent))}%` }}
                  />
                </div>
                {seg.avatars && seg.avatars.length > 0 && (
                  <div className="flex items-center -space-x-2 pt-0.5">
                    {seg.avatars.slice(0, 5).map((av, aIdx) => (
                      <div
                        key={aIdx}
                        className="w-7 h-7 rounded-full bg-[#1E2330] border-2 border-[#14171E] text-[10px] font-semibold text-slate-200 flex items-center justify-center uppercase"
                      >
                        {av}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Highlight Bento Card (5 cols) */}
      <div className="lg:col-span-5 bg-[#14171E] border border-white/8 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between gap-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400">{rightTitle}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-display font-semibold text-2xl sm:text-[30px] tracking-tight text-white">
                {rightValue}
              </span>
              {rightBadge && (
                <span className="px-3 py-1 rounded-full border border-white/15 bg-[#1C2029] text-[11px] font-medium text-slate-300">
                  {rightBadge}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onRightAction}
            aria-label="Open details"
            className="w-9 h-9 rounded-full bg-[#1C2029] border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#86FF00] hover:border-[#86FF00]/40 transition-colors shrink-0 cursor-pointer"
          >
            <IconArrowUpRight size={17} />
          </button>
        </div>

        {/* Bottom 3 Mini Vertical Cards + Action Pill */}
        <div className="flex items-end gap-2.5 overflow-x-auto no-scrollbar pt-1">
          <div className="grid grid-cols-3 gap-2.5 flex-1 min-w-[240px]">
            {miniCards.slice(0, 3).map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onMiniCardClick?.(card.id)}
                className={cn(
                  "text-left rounded-2xl p-3.5 transition-all flex flex-col justify-between min-h-[96px] cursor-pointer",
                  card.highlighted
                    ? "bg-[#86FF00] text-[#090A0F] shadow-[0_8px_24px_rgba(134,255,0,0.22)] -translate-y-0.5"
                    : "bg-[#1C2029] text-white border border-white/5 hover:border-white/15"
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold tracking-wide",
                    card.highlighted ? "text-[#090A0F]/80" : "text-slate-400"
                  )}
                >
                  {card.code}
                </span>
                <div className="mt-2">
                  <div
                    className={cn(
                      "text-xs font-semibold leading-tight truncate",
                      card.highlighted ? "text-[#090A0F]" : "text-white"
                    )}
                  >
                    {card.title}
                  </div>
                  {card.subtitle && (
                    <div
                      className={cn(
                        "text-[10px] mt-0.5 truncate",
                        card.highlighted ? "text-[#090A0F]/70" : "text-slate-400"
                      )}
                    >
                      {card.subtitle}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {onRightAction && (
            <button
              type="button"
              onClick={onRightAction}
              className="px-4 py-2.5 rounded-full bg-white text-[#090A0F] text-xs font-semibold hover:bg-[#86FF00] transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              {rightActionLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
