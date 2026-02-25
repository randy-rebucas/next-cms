"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen } from "lucide-react";

export interface GlossaryTerm {
  term: string;
  def: string;
}

export interface LegalGlossaryProps {
  terms?: GlossaryTerm[];
}

export const defaultTerms: GlossaryTerm[] = [
  { term: "Affidavit", def: "A written statement confirmed by oath or affirmation, used as evidence in court proceedings." },
  { term: "Arraignment", def: "The initial court proceeding where a defendant is formally charged and enters a plea of guilty, not guilty, or no contest." },
  { term: "Brief", def: "A written legal document submitted to a court arguing why one side should prevail in a legal dispute." },
  { term: "Statute of Limitations", def: "The legally prescribed deadline by which a lawsuit must be filed or criminal charges must be brought." },
  { term: "Deposition", def: "Out-of-court oral testimony given under oath, recorded for later use and as part of the discovery process." },
  { term: "Discovery", def: "Pre-trial process by which parties exchange relevant information and evidence through depositions, interrogatories, and document requests." },
  { term: "Damages", def: "Monetary compensation awarded to a party who has suffered loss or injury as a result of another's wrongful act." },
  { term: "Indictment", def: "A formal accusation that a person has committed a crime, issued by a grand jury." },
  { term: "Injunction", def: "A court order requiring a person or entity to do or refrain from doing a specific act." },
  { term: "Judgment", def: "The final decision of a court in a legal proceeding. A money judgment orders one party to pay another." },
  { term: "Jurisdiction", def: "The authority of a court to hear and decide cases of a specific type or in a given geographic area." },
  { term: "Liability", def: "Legal responsibility for one's acts or omissions; the obligation to make good any loss or damage that results." },
  { term: "Litigation", def: "The process of resolving disputes through the court system, including filing lawsuits, pretrial motions, trial, and appeals." },
  { term: "Negligence", def: "Failure to exercise the standard of care a reasonably prudent person would take in similar circumstances, resulting in harm." },
  { term: "No Contest (Nolo Contendere)", def: "A plea in a criminal case where the defendant accepts punishment without admitting guilt." },
  { term: "Plaintiff", def: "The party who initiates a lawsuit by filing a complaint with a court seeking a legal remedy." },
  { term: "Defendant", def: "The party against whom a lawsuit or criminal charge is brought." },
  { term: "Plea Bargain", def: "A negotiated agreement between the defendant and prosecutor where the defendant pleads guilty in exchange for a reduced charge or lighter sentence." },
  { term: "Precedent (Stare Decisis)", def: "The principle that courts should follow earlier decisions (case law) when deciding similar cases." },
  { term: "Subpoena", def: "A legal order commanding a witness to appear and testify, or to produce documents." },
  { term: "Summary Judgment", def: "A court ruling in favor of one party before trial when there are no disputed material facts and one side is entitled to judgment as a matter of law." },
  { term: "Tort", def: "A civil wrong that causes another person to suffer loss or harm, giving rise to legal liability." },
  { term: "Voir Dire", def: "The process of questioning prospective jurors before a trial to determine their suitability." },
  { term: "Writ of Habeas Corpus", def: "A court order requiring that a detained person be brought before a judge to determine whether the detention is lawful." },
  { term: "Class Action", def: "A lawsuit where one or several plaintiffs sue on behalf of a larger group of injured people who share the same claims." },
  { term: "Contingency Fee", def: "A legal fee arrangement where the attorney is paid a percentage of the recovery only if the client wins the case." },
  { term: "Culpability", def: "The degree to which a person is responsible for committing an offense, ranging from intentional to negligent conduct." },
  { term: "Due Process", def: "Constitutional guarantee that the government will not deprive a person of life, liberty, or property without fair procedures." },
  { term: "Eminent Domain", def: "The power of the government to take private property for public use, with just compensation paid to the owner." },
  { term: "Hearsay", def: "An out-of-court statement offered to prove the truth of the matter asserted; generally inadmissible as evidence unless an exception applies." },
];

export default function LegalGlossary({ terms = defaultTerms }: LegalGlossaryProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return terms.filter(
      (t) => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
    );
  }, [query, terms]);

  const alphabet = useMemo(() => {
    const letters = new Set(filtered.map((t) => t.term[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [filtered]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <BookOpen size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Legal Glossary</h3>
          <p className="text-xs text-slate-500">Search {terms.length} legal terms</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search terms or definitions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Alphabet jumper */}
      <div className="flex flex-wrap gap-1 mb-4">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => {
              const el = document.getElementById(`glossary-${letter}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
            className="w-6 h-6 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Terms */}
      <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">No terms found.</p>
        )}
        {alphabet.map((letter) => {
          const group = filtered.filter((t) => t.term[0].toUpperCase() === letter);
          return (
            <div key={letter}>
              <div
                id={`glossary-${letter}`}
                className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2 mb-1"
              >
                {letter}
              </div>
              {group.map((t) => (
                <div
                  key={t.term}
                  className="border border-slate-100 rounded-lg overflow-hidden mb-1"
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => setExpanded(expanded === t.term ? null : t.term)}
                  >
                    {t.term}
                    <span className="text-slate-400 text-xs">{expanded === t.term ? "▲" : "▼"}</span>
                  </button>
                  {expanded === t.term && (
                    <div className="px-4 pb-3 text-xs text-slate-500 leading-relaxed bg-slate-50">
                      {t.def}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
