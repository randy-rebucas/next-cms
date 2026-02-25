import type { QuoteBlock } from "@/models/content";

export default function Quote({ block }: { block: QuoteBlock }) {
  return (
    <blockquote className="border-l-4 border-amber-500 pl-4 my-6 text-slate-400 italic">
      <p dangerouslySetInnerHTML={{ __html: block.content }} />
      {block.cite && (
        <cite className="block mt-2 text-xs text-slate-500 not-italic">
          — {block.cite}
        </cite>
      )}
    </blockquote>
  );
}
