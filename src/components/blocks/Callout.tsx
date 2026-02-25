import type { CalloutBlock } from "@/models/content";

const STYLES = {
  info: {
    wrapper: "bg-blue-950/60 border-blue-700",
    icon: "ℹ️",
    title: "text-blue-300",
  },
  warning: {
    wrapper: "bg-amber-950/60 border-amber-600",
    icon: "⚠️",
    title: "text-amber-300",
  },
  success: {
    wrapper: "bg-green-950/60 border-green-700",
    icon: "✅",
    title: "text-green-300",
  },
  error: {
    wrapper: "bg-red-950/60 border-red-700",
    icon: "🚫",
    title: "text-red-300",
  },
  tip: {
    wrapper: "bg-violet-950/60 border-violet-700",
    icon: "💡",
    title: "text-violet-300",
  },
};

export default function Callout({ block }: { block: CalloutBlock }) {
  const kind = block.kind ?? "info";
  const s = STYLES[kind];
  return (
    <div className={`my-6 border-l-4 rounded-r-xl p-4 ${s.wrapper}`}>
      {block.title && (
        <p className={`font-semibold mb-1 flex items-center gap-2 ${s.title}`}>
          <span>{s.icon}</span>
          {block.title}
        </p>
      )}
      <div
        className="text-slate-300 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
}
