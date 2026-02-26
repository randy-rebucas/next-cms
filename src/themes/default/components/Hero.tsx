"use client";

import { Phone, Mail, ChevronDown } from "lucide-react";
import type { SiteData } from "@/models/content";

const DEFAULT_STATS = [
  { value: "—", label: "Years Experience" },
  { value: "—", label: "Cases Handled" },
  { value: "—", label: "Clients Served" },
];

const DEFAULT_BADGES = [
  "Licensed Attorney",
  "Bar Member",
  "Free Consultations",
  "Available for Inquiries",
];

export default function Hero({ site }: { site?: SiteData }) {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const stats  = site?.stats?.length  ? site.stats  : DEFAULT_STATS;
  const badges = site?.badges?.length ? site.badges : DEFAULT_BADGES;

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-slate-900 overflow-hidden"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Diagonal overlay */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-amber-900/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Text */}
        <div className="text-white">
          <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Accepting New Clients
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            {site?.name ?? "Your Law Firm"}{" "}
            {site?.nameHighlight && (
              <span className="text-amber-500">{site.nameHighlight}</span>
            )}
          </h1>
          <p className="text-xl text-slate-300 font-medium mb-2">
            {site?.title ?? "Experienced Legal Representation"}
          </p>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
            {site?.description ?? "Dedicated legal services tailored to your needs. We are committed to protecting your rights and achieving the best possible outcome for your case."}
          </p>

          {/* Stats */}
          <div className="flex gap-8 mb-10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-amber-400">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => scrollTo("#consultation")}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded transition-colors"
            >
              Book Free Consultation
            </button>
            <button
              onClick={() => scrollTo("#contact")}
              className="px-8 py-3 border border-slate-500 hover:border-amber-500 hover:text-amber-400 text-white font-semibold rounded transition-colors"
            >
              Contact Now
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="hidden lg:block">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
            {/* Photo placeholder */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-4 border-amber-500/40 mx-auto mb-6 flex items-center justify-center text-5xl">
              ⚖️
            </div>
            <h2 className="text-white text-center text-xl font-bold mb-1">
              {site?.name ?? "Attorney Name"}
            </h2>
            <p className="text-amber-400 text-center text-sm mb-6">
              {site?.credentials ?? "Licensed Attorney"}
            </p>

            <div className="space-y-3 border-t border-slate-700 pt-6">
              <a
                href={site?.phoneHref ?? "tel:+10000000000"}
                className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors text-sm"
              >
                <Phone size={16} className="text-amber-500 shrink-0" />
                {site?.phone ?? "Phone not configured"}
              </a>
              <a
                href={site?.emailHref ?? "mailto:contact@lawfirm.com"}
                className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors text-sm"
              >
                <Mail size={16} className="text-amber-500 shrink-0" />
                {site?.email ?? "Email not configured"}
              </a>
              {(site?.mapAddress || site?.mapAddress2) && (
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="text-amber-500 text-base shrink-0">📍</span>
                  {[site.mapAddress, site.mapAddress2].filter(Boolean).join(", ")}
                </div>
              )}
              {site?.hours && (
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="text-amber-500 text-base shrink-0">🕐</span>
                  {site.hours}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-2 gap-2">
              {badges.map((badge) => (
                <div
                  key={badge}
                  className="bg-slate-700/50 rounded px-2 py-1.5 text-xs text-slate-300 text-center"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo("#about")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 hover:text-amber-400 transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
