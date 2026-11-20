"use client";

import { IconDotsVertical, IconStack2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface WorkspaceTab {
  id: string;
  label: string;
  count?: number;
}

interface SplitWorkspaceProps {
  tabs: WorkspaceTab[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  leftTitle: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  onToggleView?: () => void;
}

export default function SplitWorkspace({
  tabs,
  activeTabId,
  onTabChange,
  leftTitle,
  leftContent,
  rightContent,
  onToggleView,
}: SplitWorkspaceProps) {
  return (
    <div className="pt-2 pb-10">
      {/* Floating Folder Tabs Centered Above White Surface */}
      <div className="flex items-center justify-center gap-1.5 -mb-px relative z-10 px-4">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer",
                active
                  ? "bg-[#86FF00] text-[#090A0F] shadow-[0_-4px_20px_rgba(134,255,0,0.2)]"
                  : "bg-[#1C2029] text-slate-300 hover:text-white border-t border-x border-white/8"
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 min-w-[20px] rounded-full text-[10px] font-bold text-center",
                    active
                      ? "bg-[#090A0F] text-white"
                      : "bg-[#111319] text-slate-300"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main High-Contrast White Split Container */}
      <div className="bg-white text-slate-900 rounded-[32px] p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Panel: Master List (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between px-2 pb-4">
              <h2 className="font-display font-semibold text-base text-slate-900">
                {leftTitle}
              </h2>
              <div className="flex items-center gap-1.5 lg:hidden">
                {onToggleView && (
                  <button
                    type="button"
                    onClick={onToggleView}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600"
                  >
                    <IconStack2 size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[560px] pr-1">
              {leftContent}
            </div>
          </div>

          {/* Right Panel: Dark Charcoal Inset Detail Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Top-right subtle utility icons on white surface */}
            <div className="hidden lg:flex items-center justify-end gap-2 pb-3">
              {onToggleView && (
                <button
                  type="button"
                  onClick={onToggleView}
                  title="Compact / Detailed View"
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <IconStack2 size={15} />
                </button>
              )}
              <button
                type="button"
                aria-label="More options"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <IconDotsVertical size={15} />
              </button>
            </div>

            <div className="bg-[#14171E] text-white rounded-[24px] p-5 sm:p-7 flex-1 flex flex-col justify-between shadow-inner">
              {rightContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
