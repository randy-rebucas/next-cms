import type { GalleryBlock } from "@/models/content";

const GRID: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export default function Gallery({ block }: { block: GalleryBlock }) {
  const cols = block.columns ?? 3;
  return (
    <div className={`my-6 grid ${GRID[cols] ?? GRID[3]} gap-3`}>
      {block.images.map((img, i) => (
        <figure key={i} className="group overflow-hidden rounded-xl bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt ?? ""}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {img.caption && (
            <figcaption className="text-xs text-slate-500 text-center px-2 py-1">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
