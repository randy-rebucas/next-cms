"use client";

import { Scale, Phone, Mail } from "lucide-react";
import type { SiteData } from "@/models/content";

const links = {
  "Practice Areas": [
    "Anti-Corruption & Graft",
    "Criminal Defense",
    "Public Interest Litigation",
    "Infrastructure & Procurement",
    "Civil Litigation",
    "Political & Electoral Law",
  ],
  "Client Tools": [
    "SOL Calculator",
    "Legal Glossary",
    "Document Checklist",
    "Book Consultation",
    "Case Evaluation",
  ],
  "Quick Links": [
    "About",
    "Experience",
    "Testimonials",
    "Blog",
    "FAQ",
    "Contact",
  ],
};

export default function Footer({ site }: { site?: SiteData }) {
  const scrollTo = (id: string) => {
    document.querySelector(`#${id.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "")}`)?.scrollIntoView({ behavior: "smooth" });
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
              href={site?.phoneHref ?? "tel:+6329XXXXXXX"}
              className="flex items-center gap-2 bg-white text-amber-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-amber-50 transition-colors"
            >
              <Phone size={16} />
              Call Now
            </a>
            <a
              href={site?.emailHref ?? "mailto:levi@baligodlaw.ph"}
              className="flex items-center gap-2 border border-white text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-amber-700 transition-colors"
            >
              <Mail size={16} />
              Email Us
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale size={22} className="text-amber-500" />
              <span className="text-white font-bold text-lg">
                <span className="text-amber-500">Baligod</span> Law
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              {site?.footerDescription ?? "Anti-corruption lawyer and public interest advocate fighting for government accountability and the rights of Filipinos."}
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <p>{site?.mapAddress ?? "Quezon City, Metro Manila"}</p>
              <p>{site?.mapAddress2 ?? "Philippines"}</p>
              <p>{site?.phone ?? "+63 (2) 9XX-XXXX"}</p>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollTo(item)}
                      className="text-slate-400 hover:text-amber-400 text-sm transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {site?.name ?? "Atty. Levito"} {site?.nameHighlight ?? '"Levi" Baligod'}. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Use</span>
            <span className="hover:text-slate-300 cursor-pointer">Attorney Advertising Disclaimer</span>
          </div>
        </div>
        <p className="max-w-7xl mx-auto mt-3 text-xs text-slate-600">
          Attorney Advertising. Prior results do not guarantee a similar outcome. The information on this website is for general informational purposes only and does not constitute legal advice. No attorney-client relationship is formed by use of this website.
        </p>
      </div>
    </footer>
  );
}
