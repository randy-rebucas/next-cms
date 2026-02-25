import type { ColumnsBlock } from "@/models/content";

const SPLITS: Record<string, string> = {
  "50/50": "grid-cols-1 md:grid-cols-2",
  "33/67": "grid-cols-1 md:grid-cols-[1fr_2fr]",
  "67/33": "grid-cols-1 md:grid-cols-[2fr_1fr]",
};

const PROSE =
  "prose prose-invert prose-amber max-w-none prose-headings:text-amber-300 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline";

export default function Columns({ block }: { block: ColumnsBlock }) {
  const gridCls = SPLITS[block.split ?? "50/50"] ?? SPLITS["50/50"];
  return (
    <div className={`my-6 grid ${gridCls} gap-6`}>
      <div
        className={PROSE}
        dangerouslySetInnerHTML={{ __html: block.left }}
      />
      <div
        className={PROSE}
        dangerouslySetInnerHTML={{ __html: block.right }}
      />
    </div>
  );
}
