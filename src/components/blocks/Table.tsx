import type { TableBlock } from "@/models/content";

export default function Table({ block }: { block: TableBlock }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm text-left">
        {block.headers.length > 0 && (
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 font-semibold border-b border-slate-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-3 text-slate-300"
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
