"use client";

import Link from "next/link";
import { Scale, Home, ArrowLeft, Search } from "lucide-react";

/**
 * Default theme — 404 Not Found template.
 * WordPress equivalent: 404.php
 * Rendered inside DefaultLayout (Navbar + Footer provided by layout.tsx).
 */
export interface NotFoundTemplateProps {
  title?: string;
  message?: string;
}

export default function NotFoundTemplate({
  title = "Page Not Found",
  message = "The page you\u2019re looking for doesn\u2019t exist, has been moved, or is temporarily unavailable.",
}: NotFoundTemplateProps) {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24 pt-28">
      <div className="text-center max-w-lg">
        {/* Large 404 */}
        <div className="relative mb-8">
          <p className="text-[8rem] sm:text-[10rem] font-black text-slate-800 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Scale size={48} className="text-amber-500 opacity-80" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{title}</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">{message}</p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
          >
            <Home size={16} /> Go Home
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 px-6 py-3 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 font-semibold rounded-lg transition-colors"
          >
            <Search size={16} /> Search
          </Link>
          <button
            onClick={() => history.back()}
            className="flex items-center gap-2 px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
