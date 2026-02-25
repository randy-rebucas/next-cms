import { Award, BookOpen, Users, Briefcase } from "lucide-react";
import type { SiteData } from "@/models/content";

type HL = typeof Award;
const iconMap: Record<string, HL> = { Award, BookOpen, Users, Briefcase };

const credentials = [
  { icon: "🎓", title: "Education", items: ["B.A. Economics & Political Science, University of the Philippines", "LL.B., San Beda College of Law", "LL.B. (continued), University of the East School of Law", "Philippine Bar Exams Passer, 2000"] },
  { icon: "📜", title: "Practice Admissions", items: ["Integrated Bar of the Philippines (IBP)", "Roll of Attorneys – Supreme Court of the Philippines", "Sandiganbayan (Anti-Graft Court)", "Court of Appeals & Regional Trial Courts"] },
  { icon: "🏆", title: "Notable Recognition", items: ["Lead Counsel – PDAF Scam Whistleblowers (2013–present)", "Independent Senate Candidate – 2016 Philippine National Elections", "Featured Advocate – Anti-Corruption Task Force Cases", "Press Conference Presenter – Infrastructure Corruption Allegations (Feb 2026)"] },
];

const defaultHighlightStats = [
  { icon: "Award", value: "25+", label: "Years of Practice" },
  { icon: "BookOpen", value: "2000", label: "Bar Exam Passer" },
  { icon: "Users", value: "₱10B+", label: "Public Funds Exposed" },
  { icon: "Briefcase", value: "100+", label: "Corruption Cases Filed" },
];

export default function About({ site }: { site?: SiteData }) {
  const highlights = site?.highlightStats ?? defaultHighlightStats;
  return (
    <section id="about" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
            About Me
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">
            Fighting for Accountability
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Bio */}
          <div>
            <div className="w-full h-[320px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-8 flex flex-col items-center justify-center border border-slate-200">
              <div className="text-7xl mb-4">👨‍⚖️</div>
              <p className="text-slate-500 text-sm font-medium">Atty. Levito &ldquo;Levi&rdquo; Baligod</p>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Atty. Levito &ldquo;Levi&rdquo; Baligod is a Filipino lawyer and public interest advocate who has
              dedicated his career to fighting corruption and holding public officials accountable under
              Philippine law. A graduate of the University of the Philippines and a 2000 bar passer,
              he has become one of the country&apos;s most recognized voices in anti-corruption litigation.
            </p>
            <p className="text-slate-600 leading-relaxed">
              He rose to national prominence as lead counsel for the whistleblowers in the
              Priority Development Assistance Fund (PDAF) or &ldquo;pork barrel&rdquo; scam — one of the
              biggest corruption scandals in Philippine history, involving the alleged misuse of
              billions in public funds by legislators in connivance with businesswoman Janet
              Lim-Napoles. Baligod has filed malversation and plunder complaints against numerous
              former and incumbent lawmakers and continues to pursue accountability in the
              Sandiganbayan and other courts. In February 2026, he appeared at a press conference
              presenting new corruption allegations involving infrastructure projects and testimony
              from former military personnel.
            </p>
          </div>

          {/* Credentials & Stats */}
          <div className="space-y-8">
            {/* Stats */}
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

            {/* Credentials */}
            <div className="space-y-4">
              {credentials.map((cred) => (
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
