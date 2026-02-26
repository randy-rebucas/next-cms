"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Scale } from "lucide-react";

export interface NavItem {
  label: string;
  url: string;
  target?: "_self" | "_blank";
}

// Fallback when no primary menu is configured in Appearance > Menus
const FALLBACK_NAV: NavItem[] = [
  { label: "Home",          url: "/"         },
  { label: "About",         url: "/#about"   },
  { label: "Practice Areas",url: "/#practice"},
  { label: "Blog",          url: "/#blog"    },
  { label: "Contact",       url: "/#contact" },
];

interface NavbarProps {
  items?: NavItem[];
  siteName?: string;
  logoUrl?: string;
}

function NavLink({ link, mobile, onClose }: { link: NavItem; mobile?: boolean; onClose: () => void }) {
  const base = mobile
    ? "text-left px-3 py-2 text-slate-300 hover:text-amber-400 transition-colors text-sm block"
    : "px-3 py-2 text-sm text-slate-300 hover:text-amber-400 transition-colors rounded";

  const isAnchor = link.url.startsWith("#") || link.url.includes("/#");
  if (isAnchor) {
    const hash = link.url.includes("/#") ? link.url.split("/#")[1] : link.url.slice(1);
    return (
      <button
        className={base}
        onClick={() => {
          onClose();
          document.querySelector(`#${hash}`)?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        {link.label}
      </button>
    );
  }
  return (
    <Link href={link.url} target={link.target ?? "_self"} onClick={onClose} className={base}>
      {link.label}
    </Link>
  );
}

export default function Navbar({ items, siteName, logoUrl }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = items?.length ? items : FALLBACK_NAV;

  const displayName = siteName || "Law Firm";
  const spaceIdx = displayName.indexOf(" ");
  const namePart1 = spaceIdx > 0 ? displayName.slice(0, spaceIdx) : displayName;
  const namePart2 = spaceIdx > 0 ? displayName.slice(spaceIdx) : "";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-slate-900 shadow-lg" : "bg-slate-900/95"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-wide">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={displayName} className="h-8 w-auto object-contain" />
          ) : (
            <>
              <Scale size={22} className="text-amber-500" />
              <span>
                <span className="text-amber-500">{namePart1}</span>
                {namePart2 && <span className="text-white">{namePart2}</span>}
              </span>
            </>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <NavLink key={link.url + link.label} link={link} onClose={close} />
          ))}
          <Link
            href="/#consultation"
            className="ml-4 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded transition-colors"
          >
            Free Consultation
          </Link>
        </nav>

        <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-700 px-6 py-4 flex flex-col gap-1">
          {links.map((link) => (
            <NavLink key={link.url + link.label} link={link} mobile onClose={close} />
          ))}
          <Link
            href="/#consultation"
            onClick={close}
            className="mt-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded transition-colors text-center"
          >
            Free Consultation
          </Link>
        </div>
      )}
    </header>
  );
}
