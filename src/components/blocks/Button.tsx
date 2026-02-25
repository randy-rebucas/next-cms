import type { ButtonBlock } from "@/models/content";

const VARIANTS = {
  primary:
    "inline-flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors",
  secondary:
    "inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-6 py-3 rounded-lg transition-colors",
  outline:
    "inline-flex items-center justify-center border-2 border-amber-500 hover:bg-amber-500/10 text-amber-400 font-semibold px-6 py-3 rounded-lg transition-colors",
};

export default function Button({ block }: { block: ButtonBlock }) {
  const cls = VARIANTS[block.variant ?? "primary"];
  return (
    <div className="my-4">
      <a href={block.href} target={block.target ?? "_self"} className={cls}>
        {block.label}
      </a>
    </div>
  );
}
