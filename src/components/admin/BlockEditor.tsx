"use client";

import { useState, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Type,
  AlignLeft,
  ImageIcon,
  Quote as QuoteIcon,
  Code2,
  List,
  Minus,
  Code,
  ExternalLink,
  Play,
  Table2,
  AlertCircle,
  Layers,
  LayoutGrid,
  Globe,
  MoveVertical,
  Columns2,
} from "lucide-react";
import type { Block, BlockType } from "@/models/content";
import { parseBlocks, stringifyBlocks } from "@/models/content";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const BLOCK_META: {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  defaultBlock: () => Block;
}[] = [
  {
    type: "paragraph",
    label: "Paragraph",
    icon: <AlignLeft size={14} />,
    defaultBlock: () => ({ type: "paragraph", content: "" }),
  },
  {
    type: "heading",
    label: "Heading",
    icon: <Type size={14} />,
    defaultBlock: () => ({ type: "heading", level: 2, content: "" }),
  },
  {
    type: "image",
    label: "Image",
    icon: <ImageIcon size={14} />,
    defaultBlock: () => ({ type: "image", src: "", alt: "", caption: "" }),
  },
  {
    type: "quote",
    label: "Quote",
    icon: <QuoteIcon size={14} />,
    defaultBlock: () => ({ type: "quote", content: "", cite: "" }),
  },
  {
    type: "code",
    label: "Code",
    icon: <Code2 size={14} />,
    defaultBlock: () => ({ type: "code", content: "", language: "" }),
  },
  {
    type: "list",
    label: "List",
    icon: <List size={14} />,
    defaultBlock: () => ({ type: "list", items: [""], ordered: false }),
  },
  {
    type: "divider",
    label: "Divider",
    icon: <Minus size={14} />,
    defaultBlock: () => ({ type: "divider" }),
  },
  {
    type: "html",
    label: "Raw HTML",
    icon: <Code size={14} />,
    defaultBlock: () => ({ type: "html", content: "" }),
  },
  {
    type: "button",
    label: "Button",
    icon: <ExternalLink size={14} />,
    defaultBlock: () => ({ type: "button", label: "Click here", href: "#", variant: "primary", target: "_self" }),
  },
  {
    type: "video",
    label: "Video",
    icon: <Play size={14} />,
    defaultBlock: () => ({ type: "video", url: "", caption: "" }),
  },
  {
    type: "table",
    label: "Table",
    icon: <Table2 size={14} />,
    defaultBlock: () => ({ type: "table", headers: ["Column 1", "Column 2"], rows: [["", ""]] }),
  },
  {
    type: "callout",
    label: "Callout",
    icon: <AlertCircle size={14} />,
    defaultBlock: () => ({ type: "callout", kind: "info", title: "", content: "" }),
  },
  {
    type: "accordion",
    label: "Accordion",
    icon: <Layers size={14} />,
    defaultBlock: () => ({ type: "accordion", title: "", content: "" }),
  },
  {
    type: "gallery",
    label: "Gallery",
    icon: <LayoutGrid size={14} />,
    defaultBlock: () => ({ type: "gallery", images: [{ src: "", alt: "", caption: "" }], columns: 3 }),
  },
  {
    type: "embed",
    label: "Embed",
    icon: <Globe size={14} />,
    defaultBlock: () => ({ type: "embed", url: "", height: 400, title: "" }),
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: <MoveVertical size={14} />,
    defaultBlock: () => ({ type: "spacer", size: "md" }),
  },
  {
    type: "columns",
    label: "Columns",
    icon: <Columns2 size={14} />,
    defaultBlock: () => ({ type: "columns", left: "", right: "", split: "50/50" }),
  },
];

const BLOCK_TYPE_COLORS: Record<BlockType, string> = {
  paragraph: "bg-slate-700 text-slate-300",
  heading: "bg-amber-900/50 text-amber-300",
  image: "bg-blue-900/50 text-blue-300",
  quote: "bg-violet-900/50 text-violet-300",
  code: "bg-green-900/50 text-green-300",
  list: "bg-teal-900/50 text-teal-300",
  divider: "bg-slate-700 text-slate-400",
  html: "bg-rose-900/50 text-rose-300",
  button: "bg-amber-800/60 text-amber-200",
  video: "bg-red-900/50 text-red-300",
  table: "bg-cyan-900/50 text-cyan-300",
  callout: "bg-sky-900/50 text-sky-300",
  accordion: "bg-indigo-900/50 text-indigo-300",
  gallery: "bg-pink-900/50 text-pink-300",
  embed: "bg-lime-900/50 text-lime-300",
  spacer: "bg-slate-800 text-slate-500",
  columns: "bg-orange-900/50 text-orange-300",
};

const INPUT_CLS =
  "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none";

// ── Block field editors ──────────────────────────────────────────────────────

function BlockFields({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (b: Block) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5, 6] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onUpdate({ ...block, level: l })}
                className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                  (block.level ?? 2) === l
                    ? "bg-amber-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                H{l}
              </button>
            ))}
          </div>
          <input
            type="text"
            className={INPUT_CLS}
            placeholder="Heading text…"
            value={block.content}
            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
          />
        </div>
      );

    case "paragraph":
      return (
        <textarea
          rows={4}
          className={INPUT_CLS}
          placeholder="Paragraph content (HTML allowed)…"
          value={block.content}
          onChange={(e) => onUpdate({ ...block, content: e.target.value })}
        />
      );

    case "image":
      return (
        <div className="space-y-2">
          <input
            type="text"
            className={INPUT_CLS}
            placeholder="Image URL (/uploads/…)"
            value={block.src}
            onChange={(e) => onUpdate({ ...block, src: e.target.value })}
          />
          <input
            type="text"
            className={INPUT_CLS}
            placeholder="Alt text"
            value={block.alt ?? ""}
            onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
          />
          <input
            type="text"
            className={INPUT_CLS}
            placeholder="Caption (optional)"
            value={block.caption ?? ""}
            onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
          />
        </div>
      );

    case "quote":
      return (
        <div className="space-y-2">
          <textarea
            rows={3}
            className={INPUT_CLS}
            placeholder="Quote text…"
            value={block.content}
            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
          />
          <input
            type="text"
            className={INPUT_CLS}
            placeholder="Attribution (optional)"
            value={block.cite ?? ""}
            onChange={(e) => onUpdate({ ...block, cite: e.target.value })}
          />
        </div>
      );

    case "code":
      return (
        <div className="space-y-2">
          <input
            type="text"
            className={INPUT_CLS}
            placeholder="Language (e.g. javascript, bash)"
            value={block.language ?? ""}
            onChange={(e) => onUpdate({ ...block, language: e.target.value })}
          />
          <textarea
            rows={6}
            className={`${INPUT_CLS} font-mono text-xs`}
            placeholder="Code…"
            value={block.content}
            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
          />
        </div>
      );

    case "list": {
      const updateItem = (idx: number, val: string) => {
        const items = [...block.items];
        items[idx] = val;
        onUpdate({ ...block, items });
      };
      const addItem = () => onUpdate({ ...block, items: [...block.items, ""] });
      const removeItem = (idx: number) =>
        onUpdate({ ...block, items: block.items.filter((_, i) => i !== idx) });

      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            {(["unordered", "ordered"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() =>
                  onUpdate({ ...block, ordered: kind === "ordered" })
                }
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  (kind === "ordered") === (block.ordered ?? false)
                    ? "bg-amber-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {kind === "ordered" ? "Numbered" : "Bulleted"}
              </button>
            ))}
          </div>
          {block.items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                className={INPUT_CLS}
                placeholder={`Item ${idx + 1}…`}
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <Plus size={12} /> Add item
          </button>
        </div>
      );
    }

    case "divider":
      return (
        <p className="text-xs text-slate-600 italic">
          Horizontal rule — no content needed.
        </p>
      );

    case "html":
      return (
        <textarea
          rows={6}
          className={`${INPUT_CLS} font-mono text-xs`}
          placeholder="Raw HTML…"
          value={block.content}
          onChange={(e) => onUpdate({ ...block, content: e.target.value })}
        />
      );

    case "button":
      return (
        <div className="space-y-2">
          <input type="text" className={INPUT_CLS} placeholder="Button label…" value={block.label} onChange={(e) => onUpdate({ ...block, label: e.target.value })} />
          <input type="text" className={INPUT_CLS} placeholder="URL (https://… or /path)" value={block.href} onChange={(e) => onUpdate({ ...block, href: e.target.value })} />
          <div className="flex gap-2">
            {(["primary", "secondary", "outline"] as const).map((v) => (
              <button key={v} type="button" onClick={() => onUpdate({ ...block, variant: v })} className={`text-xs px-2 py-1 rounded capitalize transition-colors ${block.variant === v ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>{v}</button>
            ))}
            <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={block.target === "_blank"} onChange={(e) => onUpdate({ ...block, target: e.target.checked ? "_blank" : "_self" })} className="accent-amber-500" />
              Open in new tab
            </label>
          </div>
        </div>
      );

    case "video":
      return (
        <div className="space-y-2">
          <input type="text" className={INPUT_CLS} placeholder="YouTube / Vimeo URL or direct .mp4 URL" value={block.url} onChange={(e) => onUpdate({ ...block, url: e.target.value })} />
          <input type="text" className={INPUT_CLS} placeholder="Caption (optional)" value={block.caption ?? ""} onChange={(e) => onUpdate({ ...block, caption: e.target.value })} />
        </div>
      );

    case "table": {
      const updateHeader = (ci: number, val: string) => {
        const headers = [...block.headers];
        headers[ci] = val;
        onUpdate({ ...block, headers });
      };
      const updateCell = (ri: number, ci: number, val: string) => {
        const rows = block.rows.map((r) => [...r]);
        rows[ri][ci] = val;
        onUpdate({ ...block, rows });
      };
      const addCol = () => onUpdate({ ...block, headers: [...block.headers, ""], rows: block.rows.map((r) => [...r, ""]) });
      const addRow = () => onUpdate({ ...block, rows: [...block.rows, block.headers.map(() => "")] });
      const removeRow = (ri: number) => onUpdate({ ...block, rows: block.rows.filter((_, i) => i !== ri) });
      return (
        <div className="space-y-2 overflow-x-auto">
          <div className="flex gap-1 mb-1">
            {block.headers.map((h, ci) => (
              <input key={ci} type="text" className={INPUT_CLS} placeholder={`Header ${ci + 1}`} value={h} onChange={(e) => updateHeader(ci, e.target.value)} />
            ))}
            <button type="button" onClick={addCol} title="Add column" className="px-2 text-amber-400 hover:text-amber-300"><Plus size={14} /></button>
          </div>
          {block.rows.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((cell, ci) => (
                <input key={ci} type="text" className={INPUT_CLS} placeholder={`Row ${ri + 1}, Col ${ci + 1}`} value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)} />
              ))}
              <button type="button" onClick={() => removeRow(ri)} className="px-2 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={addRow} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"><Plus size={12} /> Add row</button>
        </div>
      );
    }

    case "callout":
      return (
        <div className="space-y-2">
          <div className="flex gap-1">
            {(["info", "warning", "success", "error", "tip"] as const).map((k) => (
              <button key={k} type="button" onClick={() => onUpdate({ ...block, kind: k })} className={`text-xs px-2 py-1 rounded capitalize transition-colors ${block.kind === k ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>{k}</button>
            ))}
          </div>
          <input type="text" className={INPUT_CLS} placeholder="Title (optional)" value={block.title ?? ""} onChange={(e) => onUpdate({ ...block, title: e.target.value })} />
          <textarea rows={3} className={INPUT_CLS} placeholder="Callout content (HTML allowed)…" value={block.content} onChange={(e) => onUpdate({ ...block, content: e.target.value })} />
        </div>
      );

    case "accordion":
      return (
        <div className="space-y-2">
          <input type="text" className={INPUT_CLS} placeholder="Panel title…" value={block.title} onChange={(e) => onUpdate({ ...block, title: e.target.value })} />
          <textarea rows={4} className={INPUT_CLS} placeholder="Expanded content (HTML allowed)…" value={block.content} onChange={(e) => onUpdate({ ...block, content: e.target.value })} />
        </div>
      );

    case "gallery": {
      const updateImg = (idx: number, key: string, val: string) => {
        const images = block.images.map((img, i) => i === idx ? { ...img, [key]: val } : img);
        onUpdate({ ...block, images });
      };
      const addImg = () => onUpdate({ ...block, images: [...block.images, { src: "", alt: "", caption: "" }] });
      const removeImg = (idx: number) => onUpdate({ ...block, images: block.images.filter((_, i) => i !== idx) });
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Columns:</span>
            {([2, 3, 4] as const).map((n) => (
              <button key={n} type="button" onClick={() => onUpdate({ ...block, columns: n })} className={`w-7 h-7 rounded text-xs font-bold transition-colors ${(block.columns ?? 3) === n ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>{n}</button>
            ))}
          </div>
          {block.images.map((img, idx) => (
            <div key={idx} className="flex gap-2 items-start bg-slate-800/50 rounded-lg p-2">
              <div className="flex-1 space-y-1">
                <input type="text" className={INPUT_CLS} placeholder="Image URL (/uploads/…)" value={img.src} onChange={(e) => updateImg(idx, "src", e.target.value)} />
                <input type="text" className={INPUT_CLS} placeholder="Alt text" value={img.alt ?? ""} onChange={(e) => updateImg(idx, "alt", e.target.value)} />
                <input type="text" className={INPUT_CLS} placeholder="Caption (optional)" value={img.caption ?? ""} onChange={(e) => updateImg(idx, "caption", e.target.value)} />
              </div>
              <button type="button" onClick={() => removeImg(idx)} className="mt-1 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={addImg} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"><Plus size={12} /> Add image</button>
        </div>
      );
    }

    case "embed":
      return (
        <div className="space-y-2">
          <input type="text" className={INPUT_CLS} placeholder="iframe URL (Google Maps, Calendly, etc.)" value={block.url} onChange={(e) => onUpdate({ ...block, url: e.target.value })} />
          <input type="text" className={INPUT_CLS} placeholder="Label / title" value={block.title ?? ""} onChange={(e) => onUpdate({ ...block, title: e.target.value })} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Height (px):</span>
            <input type="number" className={`${INPUT_CLS} w-28`} value={block.height ?? 400} onChange={(e) => onUpdate({ ...block, height: Number(e.target.value) })} />
          </div>
        </div>
      );

    case "spacer":
      return (
        <div className="flex gap-2">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (
            <button key={s} type="button" onClick={() => onUpdate({ ...block, size: s })} className={`text-xs px-3 py-1 rounded uppercase transition-colors ${block.size === s ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>{s}</button>
          ))}
        </div>
      );

    case "columns":
      return (
        <div className="space-y-2">
          <div className="flex gap-1">
            {(["50/50", "33/67", "67/33"] as const).map((sp) => (
              <button key={sp} type="button" onClick={() => onUpdate({ ...block, split: sp })} className={`text-xs px-2 py-1 rounded transition-colors ${(block.split ?? "50/50") === sp ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>{sp}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-slate-500 mb-1">Left column (HTML)</p>
              <textarea rows={5} className={`${INPUT_CLS} text-xs`} placeholder="Left column HTML…" value={block.left} onChange={(e) => onUpdate({ ...block, left: e.target.value })} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Right column (HTML)</p>
              <textarea rows={5} className={`${INPUT_CLS} text-xs`} placeholder="Right column HTML…" value={block.right} onChange={(e) => onUpdate({ ...block, right: e.target.value })} />
            </div>
          </div>
        </div>
      );
  }
}

// ── Main editor ──────────────────────────────────────────────────────────────

export default function BlockEditor({ value, onChange, placeholder }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(value));
  const [pickerOpen, setPickerOpen] = useState(false);

  const commit = useCallback(
    (next: Block[]) => {
      setBlocks(next);
      onChange(stringifyBlocks(next));
    },
    [onChange]
  );

  const updateBlock = (i: number, b: Block) => {
    const next = [...blocks];
    next[i] = b;
    commit(next);
  };

  const removeBlock = (i: number) => {
    commit(blocks.filter((_, idx) => idx !== i));
  };

  const moveBlock = (i: number, dir: -1 | 1) => {
    const next = [...blocks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const addBlock = (meta: (typeof BLOCK_META)[number]) => {
    commit([...blocks, meta.defaultBlock()]);
    setPickerOpen(false);
  };

  if (blocks.length === 0 && !pickerOpen) {
    return (
      <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
        <p className="text-slate-500 text-sm mb-4">
          {placeholder ?? "No blocks yet. Add your first block to get started."}
        </p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 mx-auto bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} /> Add Block
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const meta = BLOCK_META.find((m) => m.type === block.type);
        const colorCls =
          BLOCK_TYPE_COLORS[block.type] ?? "bg-slate-700 text-slate-300";

        return (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
          >
            {/* Block header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/50">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${colorCls}`}
              >
                {meta?.icon}
                {meta?.label ?? block.type}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(i, -1)}
                  disabled={i === 0}
                  title="Move up"
                  className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(i, 1)}
                  disabled={i === blocks.length - 1}
                  title="Move down"
                  className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(i)}
                  title="Delete block"
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Block fields */}
            <div className="p-3">
              <BlockFields
                block={block}
                onUpdate={(b) => updateBlock(i, b)}
              />
            </div>
          </div>
        );
      })}

      {/* Add block row */}
      {pickerOpen ? (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            Choose block type
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BLOCK_META.map((meta) => (
              <button
                key={meta.type}
                type="button"
                onClick={() => addBlock(meta)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition-colors"
              >
                {meta.icon}
                {meta.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="mt-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-700 hover:border-amber-600 text-slate-500 hover:text-amber-400 text-sm py-3 rounded-xl transition-colors"
        >
          <Plus size={14} /> Add Block
        </button>
      )}
    </div>
  );
}
