"use client";

import { useState, useEffect } from "react";
import { Menu, X, Scale } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Practice Areas", href: "#practice" },
  { label: "Experience", href: "#experience" },
  { label: "Tools", href: "#tools" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-slate-900 shadow-lg" : "bg-slate-900/95"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => handleClick("#home")}
          className="flex items-center gap-2 text-white font-bold text-lg tracking-wide"
        >
          <Scale size={22} className="text-amber-500" />
          <span>
            <span className="text-amber-500">Baligod</span>
            <span className="text-white"> Law</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="px-3 py-2 text-sm text-slate-300 hover:text-amber-400 transition-colors rounded"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleClick("#consultation")}
            className="ml-4 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded transition-colors"
          >
            Free Consultation
          </button>
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-700 px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="text-left px-3 py-2 text-slate-300 hover:text-amber-400 transition-colors text-sm"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleClick("#consultation")}
            className="mt-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded transition-colors"
          >
            Free Consultation
          </button>
        </div>
      )}
    </header>
  );
}
