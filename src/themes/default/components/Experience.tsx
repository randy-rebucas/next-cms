import connectDB from "@/lib/mongoose";
import { Experience as ExperienceModel } from "@/models/Experience";
import type { ExperienceEvent } from "@/models/content";

const defaultEvents: ExperienceEvent[] = [
  { id: "1", year: "Year 1", title: "Undergraduate Degree",   subtitle: "Bachelor of Arts / Science",   description: "Completed undergraduate studies. Add your institution and programme in the admin panel under Experience." },
  { id: "2", year: "Year 2", title: "Law School",             subtitle: "Juris Doctor / LL.B.",          description: "Pursued legal education. Update this entry with your actual institution and programme details." },
  { id: "3", year: "Year 3", title: "Bar Admission",          subtitle: "Licensed to Practice",          description: "Admitted to the bar and licensed to practise law. Add the year and jurisdiction in the admin panel." },
  { id: "4", year: "Year 4", title: "Legal Practice",         subtitle: "Attorney at Law",               description: "Began private legal practice. Add your firm history, notable cases, and career milestones via the admin panel." },
];

/** Self-fetching async server component. */
export default async function Experience() {
  let events = defaultEvents;
  try {
    await connectDB();
    const raw = await ExperienceModel.find().sort({ sort_order: 1 }).lean();
    if (raw.length > 0) {
      events = raw.map((r) => ({
        id: String(r._id),
        year: r.year,
        title: r.title,
        subtitle: r.subtitle,
        description: r.description,
      }));
    }
  } catch { /* use defaults */ }

  return (
    <section id="experience" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">Career Path</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">Experience &amp; Education</h2>
        </div>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 md:-translate-x-0.5" />
          <div className="space-y-10">
            {events.map((ev, i) => (
              <div key={ev.year + ev.title} className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-md md:-translate-x-1.5 top-5 z-10" />
                <div className={`hidden md:flex w-1/2 ${i % 2 === 0 ? "justify-end pr-12" : "justify-start pl-12"} items-start pt-4`}>
                  <span className="bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full">{ev.year}</span>
                </div>
                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pl-12" : "md:pr-12"} bg-slate-50 border border-slate-100 rounded-xl p-5 hover:border-amber-300 transition-colors`}>
                  <span className="md:hidden text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold mb-2 inline-block">{ev.year}</span>
                  <h3 className="font-bold text-slate-900 text-base">{ev.title}</h3>
                  <p className="text-amber-600 text-sm font-medium mb-2">{ev.subtitle}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
