import type { ListBlock } from "@/models/content";

export default function List({ block }: { block: ListBlock }) {
  const Tag = block.ordered ? "ol" : "ul";
  return (
    <Tag
      className={`text-slate-300 mb-4 pl-6 space-y-1 ${
        block.ordered ? "list-decimal" : "list-disc"
      }`}
    >
      {block.items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </Tag>
  );
}
