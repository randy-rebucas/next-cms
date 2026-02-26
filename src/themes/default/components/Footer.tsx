"use client";

import Link from "next/link";
import { Scale, Phone, Mail } from "lucide-react";
import type { SiteData } from "@/models/content";
import type { NavItem } from "./Navbar";

interface FooterProps {
  site?: SiteData;
  /** Items from the footer menu location. Falls back to quick-links if empty. */
  footerItems?: NavItem[];
}

const FALLBACK_FOOTER: NavItem[] = [
  { label: "Home",           url: "/"         },
  { label: "About",          url: "/#about"   },
  { label: "Blog",           url: "/#blog"    },
  { label: "FAQ",            url: "/#faq"     },
  { label: "Contact",        url: "/#contact" },
  { label: "Privacy Policy", url: "/privacy"  },
];

export default function Footer({ site, footerItems }: FooterProps) {
  const links = footerItems?.length ? footerItems : FALLBACK_FOOTER;

  const scrollOrNav = (url: string) => {
    const isAnchor = url.startsWith("#") || url.includes("/#");
    if (isAnchor) {
      const hash = url.includes("/#") ? url.split("/#")[1] : url.slice(1);
      document.querySelector(`#${hash}`)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* CTA bar */}
      <div className="bg-amber-600 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-xl">Ready to Get Started?</h3>
            <p className="text-amber-100 text-sm">Free consultations available. Available 24/7 for emergencies.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href={site?.phoneHref ?? "tel:+10000000000"}
              className="flex items-center gap-2 bg-white text-amber-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-amber-50 transition-colors"
            >
              <Phone size={16} /> Call Now
            </a>
            <a
              href={site?.emailHref ?? "mailto:contact@lawfirm.com"}
              className="flex items-center gap-2 border border-white text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-amber-700 transition-colors"
            >
              <Mail size={16} /> Email Us
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale size={22} className="text-amber-500" />
              <span className="text-white font-bold text-lg">
                <span className="text-amber-500">{site?.name ?? "Law Firm"}</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              {site?.footerDescription ?? "Professional legal services. Contact us for a free consultation."}
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              {site?.mapAddress && <p>{site.mapAddress}</p>}
              {site?.phone && <p>{site.phone}</p>}
              {site?.email && <p>{site.email}</p>}
            </div>
          </div>

          {/* Navigation links from menu */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-2">
              {links.map((item) => {
                const isAnchor = item.url.startsWith("#") || item.url.includes("/#");
                return (
                  <li key={item.url + item.label}>
                    {isAnchor ? (
                      <button
                        onClick={() => scrollOrNav(item.url)}
                        className="text-slate-400 hover:text-amber-400 text-sm transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        href={item.url}
                        target={item.target ?? "_self"}
                        className="text-slate-400 hover:text-amber-400 text-sm transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {site?.name ?? "Law Firm"}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Use</Link>
          </div>
        </div>
        <p className="max-w-7xl mx-auto mt-3 text-xs text-slate-600">
          Attorney Advertising. Prior results do not guarantee a similar outcome. The information on this website is for general informational purposes only and does not constitute legal advice.
        </p>
      </div>
    </footer>
  );
}
