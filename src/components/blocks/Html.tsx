import type { HtmlBlock } from "@/models/content";

export default function Html({ block }: { block: HtmlBlock }) {
  return (
    <div
      className="prose prose-invert prose-amber max-w-none prose-headings:font-bold prose-headings:text-amber-300 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-amber-500 prose-blockquote:text-slate-400 prose-hr:border-slate-700"
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
}
