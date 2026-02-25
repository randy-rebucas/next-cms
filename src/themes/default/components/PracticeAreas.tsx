import type { PracticeArea } from "@/models/content";

const defaultAreas = [
  {
    icon: "🔍",
    title: "Anti-Corruption & Graft",
    description:
      "Filing and prosecuting cases of graft, corruption, malversation, and plunder before the Sandiganbayan, Ombudsman, and other bodies. Holding public officials accountable for misuse of government funds.",
    bullets: ["PDAF / Pork Barrel Cases", "Malversation of Public Funds", "Plunder Complaints", "Ombudsman Proceedings"],
    color: "border-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: "⚖️",
    title: "Criminal Defense & Prosecution",
    description:
      "Representing clients in serious criminal matters before Philippine Regional Trial Courts, the Sandiganbayan, and the Court of Appeals — both as defense counsel and as private complainant.",
    bullets: ["Criminal Complaints Filing", "Sandiganbayan Litigation", "Criminal Defense (RTC)", "Private Prosecution"],
    color: "border-red-500",
    bg: "bg-red-50",
  },
  {
    icon: "🏦",
    title: "Public Interest Litigation",
    description:
      "Pursuing cases that serve the broader public good — whistleblower protection, government transparency, and accountability of public officials and government-owned corporations.",
    bullets: ["Whistleblower Representation", "Government Transparency Cases", "Public Accountability Suits", "Constitutional Petitions"],
    color: "border-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: "🏗️",
    title: "Infrastructure & Procurement Law",
    description:
      "Investigating and litigating irregularities in government procurement, infrastructure contracts, and public works projects, including anomalous bidding and overpriced contracts.",
    bullets: ["Procurement Fraud", "Infrastructure Contract Disputes", "COA Referrals", "Bidding Irregularities"],
    color: "border-green-500",
    bg: "bg-green-50",
  },
  {
    icon: "📜",
    title: "Civil Litigation",
    description:
      "Handling civil disputes involving contracts, property, damages, and other private legal matters before Philippine trial courts and appellate bodies.",
    bullets: ["Contract Disputes", "Property & Real Estate", "Damages Claims", "Court of Appeals Appeals"],
    color: "border-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: "📰",
    title: "Political & Electoral Law",
    description:
      "Advising on matters of electoral law, political party regulations, campaign finance, and election-related complaints before COMELEC and other electoral bodies.",
    bullets: ["COMELEC Proceedings", "Election Protests", "Campaign Finance", "Political Accountability"],
    color: "border-teal-500",
    bg: "bg-teal-50",
  },
] as PracticeArea[];

export default function PracticeAreas({ areas = defaultAreas }: { areas?: PracticeArea[] }) {
  return (
    <section id="practice" className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
            What We Do
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">
            Practice Areas
          </h2>
          <p className="text-slate-500 mt-6 max-w-xl mx-auto">
            We provide comprehensive legal services across multiple disciplines, ensuring expert
            representation wherever your needs may lie.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div
              key={area.title}
              className={`bg-white rounded-2xl border-t-4 ${area.color} shadow-sm hover:shadow-md transition-shadow p-6 group`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${area.bg} flex items-center justify-center text-2xl mb-4`}
              >
                {area.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                {area.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{area.description}</p>
              <ul className="space-y-1.5">
                {area.bullets.map((b) => (
                  <li key={b} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="text-amber-500 text-xs">●</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
