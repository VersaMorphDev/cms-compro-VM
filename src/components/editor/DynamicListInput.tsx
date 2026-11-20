"use client";

import { useState } from "react";
import { IconPlus, IconX } from "@tabler/icons-react";

interface DynamicListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

export default function DynamicListInput({
  label,
  items,
  onChange,
  placeholder = "Type item and press Add...",
  addLabel = "Add",
}: DynamicListInputProps) {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setDraft("");
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium text-slate-400">
        {label}
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C2029] border border-white/15 hover:border-[#86FF00] hover:text-[#86FF00] text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
        >
          <IconPlus size={14} />
          <span>{addLabel}</span>
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C2029] border border-white/10 text-xs text-slate-200"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                aria-label={`Remove ${item}`}
                className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <IconX size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
