"use client";

import { IconArrowUpRight, IconPlus, IconPaperclip, IconCalendar } from "@tabler/icons-react";

export interface BentoSubCard {
  id: string;
  metric: string;
  label: string;
  onClick?: () => void;
}

interface DetailInsetPanelProps {
  eyebrow: string;
  codeOrTitle: string;
  statusBadge: string;
  middleLabel?: string;
  middleValue?: string;
  ownerLabel?: string;
  ownerName?: string;
  ownerRole?: string;
  ownerAvatarText?: string;
  subCards: BentoSubCard[];
  onAddSubCard?: () => void;
  summaryItems: { label: string; value: string }[];
  primaryActionLabel: string;
  onPrimaryAction?: () => void;
  onSecondaryIconA?: () => void;
  onSecondaryIconB?: () => void;
}

export default function DetailInsetPanel({
  eyebrow,
  codeOrTitle,
  statusBadge,
  middleLabel = "Module",
  middleValue = "Versa Morph",
  ownerLabel = "Author / PIC",
  ownerName = "Admin",
  ownerRole = "Super Admin",
  ownerAvatarText = "VM",
  subCards,
  onAddSubCard,
  summaryItems,
  primaryActionLabel,
  onPrimaryAction,
  onSecondaryIconA,
  onSecondaryIconB,
}: DetailInsetPanelProps) {
  return (
    <div className="flex flex-col justify-between h-full gap-6">
      {/* Top Metadata Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-slate-400">{eyebrow}</p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-display font-semibold text-xl tracking-tight text-white">
              {codeOrTitle}
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-white/15 bg-[#1C2029] text-[11px] font-medium text-slate-300">
              {statusBadge}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-slate-400">{middleLabel}</p>
          <p className="font-display font-semibold text-base text-white truncate">
            {middleValue}
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-slate-400">{ownerLabel}</p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#242936] border border-white/10 text-xs font-bold text-[#86FF00] flex items-center justify-center shrink-0 uppercase">
              {ownerAvatarText}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {ownerName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{ownerRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Bento Sub-Cards Grid + Diagonal Hatch Add Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {subCards.slice(0, 3).map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={card.onClick}
            className="bg-[#1C2029] hover:bg-[#222733] border border-white/8 rounded-2xl p-4 text-left flex flex-col justify-between min-h-[92px] transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 w-full">
              <span className="font-display font-semibold text-sm sm:text-base text-white">
                {card.metric}
              </span>
              <IconArrowUpRight
                size={15}
                className="text-slate-400 group-hover:text-[#86FF00] transition-colors shrink-0"
              />
            </div>
            <span className="text-[11px] text-slate-400 leading-snug mt-3">
              {card.label}
            </span>
          </button>
        ))}

        {onAddSubCard && (
          <button
            type="button"
            onClick={onAddSubCard}
            aria-label="Add item"
            className="bg-diagonal-hatch border border-dashed border-white/15 hover:border-[#86FF00]/60 rounded-2xl p-4 flex items-center justify-center min-h-[92px] transition-colors group cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full bg-[#1C2029] border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-[#86FF00] group-hover:text-[#090A0F] transition-colors">
              <IconPlus size={16} />
            </span>
          </button>
        )}
      </div>

      {/* Bottom Summary Footer Bar */}
      <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-4 flex-1">
          {summaryItems.slice(0, 3).map((item) => (
            <div key={item.label} className="space-y-0.5">
              <p className="text-[10px] font-medium text-slate-400">
                {item.label}
              </p>
              <p className="font-display font-semibold text-sm sm:text-base text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSecondaryIconA && (
            <button
              type="button"
              onClick={onSecondaryIconA}
              aria-label="Attachment"
              className="w-9 h-9 rounded-full bg-[#14171E] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <IconPaperclip size={15} />
            </button>
          )}
          {onSecondaryIconB && (
            <button
              type="button"
              onClick={onSecondaryIconB}
              aria-label="Schedule"
              className="w-9 h-9 rounded-full bg-[#14171E] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <IconCalendar size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={onPrimaryAction}
            className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer shadow-[0_4px_18px_rgba(134,255,0,0.25)]"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
