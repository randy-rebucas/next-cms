"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export interface NavItem {
  label: string;
  href:  string;
}

interface Props {
  items?:    NavItem[];
  siteName?: string;
  logoUrl?:  string;
}

export default function MinimalNavbar({ items = [], siteName = "Law Firm", logoUrl }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo / site name */}
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <Image src={logoUrl} alt={siteName} width={112} height={28} className="h-7 w-auto object-contain" />
          ) : (
            <span className="font-bold text-slate-900 text-base tracking-tight">
              {siteName}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="#contact"
            className="text-sm font-medium px-4 py-1.5 rounded-full border border-current text-[var(--gold,#2563eb)] hover:bg-[var(--gold,#2563eb)] hover:text-white transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="sm:hidden text-slate-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-slate-700 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
