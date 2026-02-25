import type { ParagraphBlock } from "@/models/content";

export default function Paragraph({ block }: { block: ParagraphBlock }) {
  return (
    <p
      className="text-slate-300 leading-relaxed mb-4"
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
}
