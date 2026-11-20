"use client";

import { IconChevronDown, IconSearch, IconCalendar } from "@tabler/icons-react";

export interface FilterSelectOption {
  label: string;
  value: string;
}

export interface FilterSelectConfig {
  id: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  icon?: "calendar" | "none";
}

interface FilterPillBarProps {
  activeCount?: number;
  selects?: FilterSelectConfig[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

export default function FilterPillBar({
  activeCount = 0,
  selects = [],
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search items...",
}: FilterPillBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      {/* Left: Active Filters Label + Pill Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 pr-2">
          <span className="text-xs font-medium text-slate-300">
            Active filters
          </span>
          <span className="w-5 h-5 rounded-full bg-white text-[#090A0F] text-[11px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        </div>

        {selects.map((sel) => (
          <div key={sel.id} className="relative">
            <select
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="appearance-none bg-[#161920] border border-white/10 hover:border-white/25 text-slate-200 text-xs font-medium rounded-full pl-4 pr-9 py-2.5 focus:outline-none focus:border-[#86FF00] transition-colors cursor-pointer"
            >
              {sel.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#14171E] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {sel.icon === "calendar" ? (
                <IconCalendar size={14} />
              ) : (
                <IconChevronDown size={14} />
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Right: Pill Search Input */}
      <div className="relative w-full sm:w-64">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-[#161920] border border-white/10 focus:border-[#86FF00] text-white placeholder:text-slate-500 text-xs font-medium rounded-full pl-4 pr-10 py-2.5 focus:outline-none transition-colors"
        />
        <IconSearch
          size={15}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
