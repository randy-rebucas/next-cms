import Link from "next/link";
import type { NavItem } from "./Navbar";
import type { SiteData } from "@/models/content";

interface Props {
  site?:        Partial<SiteData>;
  footerItems?: NavItem[];
}

export default function MinimalFooter({ site, footerItems = [] }: Props) {
  const year = new Date().getFullYear();
  const name = site?.name ?? "Law Firm";

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          {/* Brand */}
          <div>
            <p className="font-semibold text-slate-800 mb-1">{name}</p>
            {site?.phone && (
              <a
                href={site.phoneHref ?? `tel:${site.phone}`}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {site.phone}
              </a>
            )}
            {site?.email && (
              <a
                href={site.emailHref ?? `mailto:${site.email}`}
                className="block text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {site.email}
              </a>
            )}
          </div>

          {/* Footer links */}
          {footerItems.length > 0 && (
            <nav className="flex flex-wrap gap-4">
              {footerItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          &copy; {year} {name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
