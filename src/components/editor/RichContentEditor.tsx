"use client";

import { useRef, useState } from "react";
import {
  IconBold,
  IconItalic,
  IconH2,
  IconBlockquote,
  IconList,
  IconCode,
  IconPilcrow,
  IconEye,
  IconEdit,
} from "@tabler/icons-react";
import { cn, sanitizePreviewHtml } from "@/lib/utils";

interface RichContentEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  mode?: "html" | "markdown";
}

function markdownToPreviewHtml(md: string): string {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs">$1</code>')
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br/>");
}

export default function RichContentEditor({
  label = "Content",
  value,
  onChange,
  placeholder = "Write your content here...",
  minRows = 8,
  mode = "html",
}: RichContentEditorProps) {
  const [viewMode, setViewMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertSnippet = (before: string, after: string, fallbackText: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChange(`${value}${value ? "\n" : ""}${before}${fallbackText}${after}`);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || fallbackText;
    const nextValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(nextValue);

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length + after.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const toolbarButtons =
    mode === "html"
      ? [
          {
            title: "Heading 2",
            icon: IconH2,
            before: '<h2 class="text-2xl font-bold mt-6 mb-3">',
            after: "</h2>\n",
            fallbackText: "Section Heading",
          },
          {
            title: "Paragraph",
            icon: IconPilcrow,
            before: '<p class="mb-4">',
            after: "</p>\n",
            fallbackText: "Paragraph text...",
          },
          {
            title: "Bold",
            icon: IconBold,
            before: "<strong>",
            after: "</strong>",
            fallbackText: "bold text",
          },
          {
            title: "Italic",
            icon: IconItalic,
            before: "<em>",
            after: "</em>",
            fallbackText: "italic text",
          },
          {
            title: "Blockquote",
            icon: IconBlockquote,
            before:
              '<blockquote class="my-4 pl-4 border-l-4 border-blue-500 italic">',
            after: "</blockquote>\n",
            fallbackText: "Key insight quote",
          },
          {
            title: "Bullet List",
            icon: IconList,
            before: '<ul class="list-disc pl-5 mb-4">\n  <li>',
            after: "</li>\n</ul>\n",
            fallbackText: "List item",
          },
          {
            title: "Inline Code",
            icon: IconCode,
            before: "<code>",
            after: "</code>",
            fallbackText: "code",
          },
        ]
      : [
          {
            title: "Bold",
            icon: IconBold,
            before: "**",
            after: "**",
            fallbackText: "bold text",
          },
          {
            title: "Italic",
            icon: IconItalic,
            before: "*",
            after: "*",
            fallbackText: "italic text",
          },
          {
            title: "Bullet List",
            icon: IconList,
            before: "\n- ",
            after: "",
            fallbackText: "List item",
          },
          {
            title: "Inline Code",
            icon: IconCode,
            before: "`",
            after: "`",
            fallbackText: "code",
          },
        ];

  const previewHtml =
    mode === "html"
      ? sanitizePreviewHtml(value || "<p><em>No content yet.</em></p>")
      : `<p>${markdownToPreviewHtml(value || "*No content yet.*")}</p>`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-[11px] font-medium text-slate-400">
          {label}
        </label>

        <div className="inline-flex items-center gap-1 bg-[#0B0D12] p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode("write")}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer",
              viewMode === "write"
                ? "bg-[#86FF00] text-[#090A0F]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <IconEdit size={12} />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer",
              viewMode === "preview"
                ? "bg-[#86FF00] text-[#090A0F]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <IconEye size={12} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {viewMode === "write" ? (
        <div className="bg-[#1C2029] border border-white/10 focus-within:border-[#86FF00] rounded-2xl overflow-hidden transition-colors">
          <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-[#171A22] border-b border-white/8">
            {toolbarButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.title}
                  type="button"
                  title={btn.title}
                  onClick={() =>
                    insertSnippet(btn.before, btn.after, btn.fallbackText)
                  }
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#86FF00] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Icon size={15} />
                </button>
              );
            })}
            <span className="ml-auto text-[10px] font-mono uppercase text-slate-500">
              {mode}
            </span>
          </div>

          <textarea
            ref={textareaRef}
            rows={minRows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent px-4 py-3 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none resize-y leading-relaxed"
          />
        </div>
      ) : (
        <div
          className="bg-[#0B0D12] border border-white/10 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed min-h-[160px] max-h-80 overflow-y-auto space-y-2"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}
    </div>
  );
}
