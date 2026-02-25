import type { HeadingBlock } from "@/models/content";

const CLASSES: Record<number, string> = {
  1: "text-3xl sm:text-4xl font-bold text-white mt-8 mb-4",
  2: "text-2xl sm:text-3xl font-bold text-amber-300 mt-7 mb-3",
  3: "text-xl sm:text-2xl font-semibold text-amber-200 mt-6 mb-2",
  4: "text-lg font-semibold text-slate-200 mt-5 mb-2",
  5: "text-base font-semibold text-slate-300 mt-4 mb-1",
  6: "text-sm font-semibold text-slate-400 mt-3 mb-1 uppercase tracking-wide",
};

export default function Heading({ block }: { block: HeadingBlock }) {
  const level = block.level ?? 2;
  const cls = CLASSES[level] ?? CLASSES[2];
  switch (level) {
    case 1: return <h1 className={cls}>{block.content}</h1>;
    case 3: return <h3 className={cls}>{block.content}</h3>;
    case 4: return <h4 className={cls}>{block.content}</h4>;
    case 5: return <h5 className={cls}>{block.content}</h5>;
    case 6: return <h6 className={cls}>{block.content}</h6>;
    default: return <h2 className={cls}>{block.content}</h2>;
  }
}
