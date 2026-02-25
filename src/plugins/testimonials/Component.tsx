import { Star } from "lucide-react";
import type { Testimonial } from "@/models/content";

export const defaultReviews: Testimonial[] = [
  {
    name: "R. dela Cruz",
    case: "PDAF Whistleblower Client",
    rating: 5,
    text: "Atty. Levi stood by us when no one else would. He guided us through the entire process of coming forward against powerful politicians. His courage gave us courage.",
    initials: "RC",
    color: "bg-blue-600",
  },
  {
    name: "M. Santos",
    case: "Criminal Defense",
    rating: 5,
    text: "I was facing trumped-up charges for exposing anomalies in our local government. Atty. Baligod took my case and fought aggressively until all charges were dismissed.",
    initials: "MS",
    color: "bg-rose-600",
  },
  {
    name: "J. Reyes",
    case: "Malversation Case",
    rating: 5,
    text: "He filed the complaint against the official who stole our barangay funds. What seemed impossible—going up against someone with political connections—Atty. Levi made it happen.",
    initials: "JR",
    color: "bg-green-600",
  },
  {
    name: "Civil Society Organization",
    case: "Public Interest Litigation",
    rating: 5,
    text: "We engaged Atty. Baligod for a petition challenging a government contract. His command of administrative and constitutional law was exceptional. Highly recommended.",
    initials: "CS",
    color: "bg-purple-600",
  },
  {
    name: "A. Villanueva",
    case: "Infrastructure Fraud Case",
    rating: 5,
    text: "Atty. Levi helped us document and file a complaint on a severely overpriced government infrastructure project in our province. He is thorough, brave, and relentless.",
    initials: "AV",
    color: "bg-amber-600",
  },
  {
    name: "Former Government Employee",
    case: "Whistleblower Protection",
    rating: 5,
    text: "After I decided to expose anomalies in my agency, I feared for my safety. Atty. Baligod advised and protected me every step of the way. I never felt alone.",
    initials: "GE",
    color: "bg-teal-600",
  },
] as Testimonial[];

export interface TestimonialsProps {
  reviews?: Testimonial[];
}

export default function Testimonials({ reviews = defaultReviews }: TestimonialsProps) {
  return (
    <section id="testimonials" className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Client Stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">
            What Clients Say
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{r.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                >
                  {r.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                  <p className="text-xs text-amber-600">{r.case}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating summary */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center text-white">
          <div className="flex justify-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={24} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-3xl font-bold mb-1">5.0 / 5.0</p>
          <p className="text-slate-400 text-sm">
            Based on verified client and partner feedback — Avvo, IBP Referrals, and direct engagements
          </p>
        </div>
      </div>
    </section>
  );
}
