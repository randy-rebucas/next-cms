import connectDB from "@/lib/mongoose";
import { PracticeArea as PracticeAreaModel } from "@/models/PracticeArea";
import type { PracticeArea } from "@/models/content";

const defaultAreas: PracticeArea[] = [
  { id: "1", icon: "⚖️", title: "Criminal Law",         description: "Representation in criminal proceedings, from pre-charge advice through to trial and appeal. Add your specific criminal practice details in the admin panel.", bullets: ["Criminal Defense", "Plea Negotiations", "Appeals", "Pre-charge Advice"], color: "border-red-500",    bg: "bg-red-50" },
  { id: "2", icon: "📜", title: "Civil Litigation",      description: "Handling disputes between individuals and organisations involving contracts, property, damages, and other civil matters.", bullets: ["Contract Disputes", "Property Matters", "Damages Claims", "Injunctions"], color: "border-blue-500",   bg: "bg-blue-50" },
  { id: "3", icon: "🏠", title: "Family Law",            description: "Compassionate legal guidance for family matters including divorce, child custody, adoption, and related disputes.", bullets: ["Divorce & Separation", "Child Custody", "Adoption", "Domestic Relations"], color: "border-pink-500",   bg: "bg-pink-50" },
  { id: "4", icon: "💼", title: "Corporate & Business",  description: "Legal services for businesses of all sizes — formation, contracts, compliance, and dispute resolution.", bullets: ["Business Formation", "Commercial Contracts", "Compliance", "Dispute Resolution"], color: "border-amber-500",  bg: "bg-amber-50" },
  { id: "5", icon: "🏡", title: "Real Estate",           description: "Comprehensive legal services for property transactions, title issues, landlord-tenant disputes, and real estate litigation.", bullets: ["Property Transactions", "Title Review", "Landlord-Tenant", "Property Disputes"], color: "border-green-500",  bg: "bg-green-50" },
  { id: "6", icon: "📋", title: "Estate Planning",       description: "Helping clients plan for the future through wills, trusts, powers of attorney, and probate administration.", bullets: ["Wills & Trusts", "Powers of Attorney", "Probate", "Estate Administration"], color: "border-purple-500", bg: "bg-purple-50" },
];

/** Self-fetching async server component — like a WordPress widget. */
export default async function PracticeAreas() {
  let areas = defaultAreas;
  try {
    await connectDB();
    const raw = await PracticeAreaModel.find({ status: "published" }).sort({ sort_order: 1 }).lean();
    if (raw.length > 0) {
      areas = raw.map((r) => ({
        id: String(r._id),
        icon: r.icon,
        title: r.title,
        description: r.description,
        bullets: r.bullets ?? [],
        color: r.color,
        bg: r.bg,
      }));
    }
  } catch { /* use defaults */ }

  return (
    <section id="practice" className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">What We Do</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">Practice Areas</h2>
          <p className="text-slate-500 mt-6 max-w-xl mx-auto">
            We provide comprehensive legal services across multiple disciplines, ensuring expert representation wherever your needs may lie.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div key={area.title} className={`bg-white rounded-2xl border-t-4 ${area.color} shadow-sm hover:shadow-md transition-shadow p-6 group`}>
              <div className={`w-12 h-12 rounded-xl ${area.bg} flex items-center justify-center text-2xl mb-4`}>{area.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">{area.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{area.description}</p>
              <ul className="space-y-1.5">
                {area.bullets.map((b) => (
                  <li key={b} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="text-amber-500 text-xs">●</span>{b}
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
