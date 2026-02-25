import type { ImageBlock } from "@/models/content";

export default function Image({ block }: { block: ImageBlock }) {
  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.src}
        alt={block.alt ?? ""}
        className="w-full rounded-xl object-cover max-h-96 bg-slate-800"
      />
      {block.caption && (
        <figcaption className="text-center text-xs text-slate-500 mt-2">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
