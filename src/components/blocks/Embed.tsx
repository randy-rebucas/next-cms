import type { EmbedBlock } from "@/models/content";

export default function Embed({ block }: { block: EmbedBlock }) {
  return (
    <div className="my-6">
      <div
        className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
        style={{ height: block.height ?? 400 }}
      >
        <iframe
          src={block.url}
          title={block.title ?? "Embedded content"}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
      {block.title && (
        <p className="text-xs text-slate-500 text-center mt-2">{block.title}</p>
      )}
    </div>
  );
}
