import type { CodeBlock } from "@/models/content";

export default function Code({ block }: { block: CodeBlock }) {
  return (
    <div className="my-6">
      {block.language && (
        <div className="bg-slate-700 text-slate-400 text-xs px-3 py-1 rounded-t-lg font-mono">
          {block.language}
        </div>
      )}
      <pre
        className={`bg-slate-900 border border-slate-700 p-4 overflow-x-auto text-sm text-amber-200 font-mono ${
          block.language ? "rounded-b-lg" : "rounded-lg"
        }`}
      >
        <code>{block.content}</code>
      </pre>
    </div>
  );
}
