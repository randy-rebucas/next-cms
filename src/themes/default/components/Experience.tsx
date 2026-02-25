import type { ExperienceEvent } from "@/models/content";

const defaultEvents = [
  {
    year: "1990s",
    title: "University of the Philippines",
    subtitle: "B.A. Economics & Political Science",
    description:
      "Graduated from UP with a double degree in Economics and Political Science, building a strong foundation in public policy, governance, and the relationship between law and society.",
  },
  {
    year: "Late 1990s",
    title: "San Beda & University of the East",
    subtitle: "LL.B. – School of Law",
    description:
      "Pursued his law degree at San Beda College of Law and continued at the University of the East School of Law, developing expertise in criminal law, constitutional law, and public accountability.",
  },
  {
    year: "2000",
    title: "Philippine Bar Examinations",
    subtitle: "Roll of Attorneys – Supreme Court of the Philippines",
    description:
      "Passed the Philippine Bar Examinations and was admitted to the Roll of Attorneys, authorizing him to practice law before all courts and quasi-judicial bodies in the Philippines.",
  },
  {
    year: "2000–2012",
    title: "Private Legal Practice",
    subtitle: "Criminal, Civil & Public Interest Cases",
    description:
      "Built a practice focusing on criminal defense, civil litigation, and public interest cases before Philippine Regional Trial Courts, the Court of Appeals, and the Sandiganbayan.",
  },
  {
    year: "2013",
    title: "PDAF Scam – Lead Whistleblower Counsel",
    subtitle: "Priority Development Assistance Fund Scandal",
    description:
      "Became nationally prominent as the lead attorney for whistleblowers in the PDAF or \u2018pork barrel\u2019 scam — one of the largest corruption scandals in Philippine history — involving alleged misuse of billions in public funds by legislators and businesswoman Janet Lim-Napoles.",
  },
  {
    year: "2013–Present",
    title: "Anti-Corruption Litigation",
    subtitle: "Malversation & Plunder Cases",
    description:
      "Filed numerous malversation, plunder, and criminal complaints before the Office of the Ombudsman and the Sandiganbayan against former and incumbent lawmakers and government officials implicated in corruption schemes.",
  },
  {
    year: "2016",
    title: "Philippine Senate Campaign",
    subtitle: "Independent Candidate – Anti-Corruption Platform",
    description:
      "Ran as an independent candidate for the Philippine Senate on a dedicated anti-corruption platform, bringing national attention to systemic issues of graft and government accountability.",
  },
  {
    year: "Feb 2026",
    title: "Infrastructure Corruption Allegations",
    subtitle: "Press Conference – Military Affidavits",
    description:
      "Presented new allegations of corruption in connection with infrastructure projects at a press conference, supported by affidavits from former military personnel and related to ongoing international inquiries.",
  },
] as ExperienceEvent[];

export default function Experience({ events = defaultEvents }: { events?: ExperienceEvent[] }) {
  return (
    <section id="experience" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Career Path
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">
            Experience &amp; Education
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 md:-translate-x-0.5" />

          <div className="space-y-10">
            {events.map((ev, i) => (
              <div
                key={ev.year}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-md md:-translate-x-1.5 top-5 z-10" />

                {/* Year bubble */}
                <div
                  className={`hidden md:flex w-1/2 ${
                    i % 2 === 0 ? "justify-end pr-12" : "justify-start pl-12"
                  } items-start pt-4`}
                >
                  <span className="bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {ev.year}
                  </span>
                </div>

                {/* Content */}
                <div
                  className={`ml-12 md:ml-0 md:w-1/2 ${
                    i % 2 === 0 ? "md:pl-12" : "md:pr-12"
                  } bg-slate-50 border border-slate-100 rounded-xl p-5 hover:border-amber-300 transition-colors`}
                >
                  <span className="md:hidden text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold mb-2 inline-block">
                    {ev.year}
                  </span>
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
