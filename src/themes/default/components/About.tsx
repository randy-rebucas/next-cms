import { Award, BookOpen, Users, Briefcase } from "lucide-react";
import type { SiteData } from "@/models/content";

type LucideIcon = typeof Award;
const iconMap: Record<string, LucideIcon> = { Award, BookOpen, Users, Briefcase };

/** Generic credential sections — shown when no DB data is configured. */
const defaultCredentials = [
  {
    icon: "🎓",
    title: "Education",
    items: [
      "Configure your law school and degrees in Settings → Site Information.",
      "Add your undergraduate and graduate qualifications here.",
    ],
  },
  {
    icon: "📜",
    title: "Practice Admissions",
    items: [
      "List the bar associations you are admitted to.",
      "Include courts and jurisdictions where you are licensed to practice.",
    ],
  },
  {
    icon: "🏆",
    title: "Notable Recognition",
    items: [
      "Add awards, publications, or notable cases in Settings.",
      "Recognition by peers and professional organisations can be listed here.",
    ],
  },
];

const defaultHighlightStats = [
  { icon: "Award",     value: "—",   label: "Years of Practice" },
  { icon: "BookOpen",  value: "—",   label: "Bar Exam Year" },
  { icon: "Users",     value: "—",   label: "Clients Served" },
  { icon: "Briefcase", value: "—",   label: "Cases Handled" },
];

export default function About({ site }: { site?: SiteData }) {
  const highlights = site?.highlightStats?.length ? site.highlightStats : defaultHighlightStats;

  return (
    <section id="about" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
            About Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">
            {site?.tagline ?? "Dedicated Legal Representation"}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Bio */}
          <div>
            <div className="w-full h-[320px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-8 flex flex-col items-center justify-center border border-slate-200">
              <div className="text-7xl mb-4">👨‍⚖️</div>
              <p className="text-slate-500 text-sm font-medium">{site?.name ?? "Attorney Name"}</p>
            </div>
            {site?.bio ? (
              <p className="text-slate-600 leading-relaxed mb-4">{site.bio}</p>
            ) : (
              <p className="text-slate-600 leading-relaxed mb-4">
                A dedicated legal professional committed to providing expert representation and
                protecting your rights. Configure your professional bio in{" "}
                <strong>Settings → Site Information</strong> to display your background and
                expertise here.
              </p>
            )}
            {site?.bioExtended && (
              <p className="text-slate-600 leading-relaxed">{site.bioExtended}</p>
            )}
          </div>

          {/* Credentials & Stats */}
          <div className="space-y-8">
            {/* Highlight stats */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map(({ icon: iconKey, value, label }) => {
                const Icon = iconMap[iconKey] ?? Award;
                return (
                  <div
                    key={label}
                    className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center hover:border-amber-300 transition-colors"
                  >
                    <Icon size={22} className="text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900">{value}</div>
                    <div className="text-xs text-slate-500 mt-1">{label}</div>
                  </div>
                );
              })}
            </div>

            {/* Credentials accordion */}
            <div className="space-y-4">
              {defaultCredentials.map((cred) => (
                <div
                  key={cred.title}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{cred.icon}</span>
                    <h3 className="font-semibold text-slate-800">{cred.title}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {cred.items.map((item) => (
                      <li key={item} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
