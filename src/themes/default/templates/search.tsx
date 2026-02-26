import Link from "next/link";
import { Search, FileText, Layout, Clock } from "lucide-react";
import PageHeader from "../template-parts/page-header";

export interface SearchResult {
  type: "post" | "page";
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  url: string;
  date: string;
}

export interface SearchTemplateProps {
  query: string;
  results: SearchResult[];
  total: number;
}

/**
 * Default theme — templates/search.tsx
 * WordPress: search.php equivalent.
 *
 * Rendered inside DefaultLayout (Navbar + Footer already provided).
 * Receives pre-fetched results from the page component.
 */
export default function SearchTemplate({ query, results, total }: SearchTemplateProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 pt-28">
      <PageHeader title="Search" backHref="/" backLabel="Back to Home" />

      {/* Search Form */}
      <form method="GET" action="/search" className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search posts and pages…"
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {query ? (
        <div>
          <p className="text-slate-400 text-sm mb-6">
            {total > 0
              ? `Found ${total} result${total !== 1 ? "s" : ""} for &ldquo;${query}&rdquo;`
              : `No results found for &ldquo;${query}&rdquo;`}
          </p>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result._id}
                  href={result.url}
                  className="block bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl p-5 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.type === "post" ? (
                      <FileText size={14} className="text-amber-400 shrink-0" />
                    ) : (
                      <Layout size={14} className="text-cyan-400 shrink-0" />
                    )}
                    <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                      {result.type}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-slate-600">
                      <Clock size={10} />
                      {new Date(result.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-white font-semibold group-hover:text-amber-400 transition-colors mb-1">
                    {result.title}
                  </h2>
                  {result.excerpt && (
                    <p className="text-slate-400 text-sm line-clamp-2">{result.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search size={40} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500">No results found. Try different keywords.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-600">
          <Search size={40} className="mx-auto mb-4 opacity-40" />
          <p>Enter a search term to find content.</p>
        </div>
      )}
    </main>
  );
}
