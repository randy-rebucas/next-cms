"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle } from "lucide-react";
import type { SiteData } from "@/models/content";

export default function Contact({ site }: { site?: SiteData }) {
  const contactInfo = [
    { icon: Phone, label: "Phone", value: site?.phone ?? "Phone not configured", href: site?.phoneHref ?? "tel:+10000000000" },
    { icon: Mail, label: "Email", value: site?.email ?? "Email not configured", href: site?.emailHref ?? "mailto:contact@lawfirm.com" },
    { icon: MapPin, label: "Office", value: `${site?.mapAddress ?? "Office address not configured"}${site?.mapAddress2 ? "\n" + site.mapAddress2 : ""}`, href: "#" },
    { icon: Clock, label: "Hours", value: site?.hours ?? "Mon–Fri: 9 AM – 5 PM\nSat: By Appointment", href: "#" },
  ];
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="bg-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-2">
            Get in Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white gold-underline">
            Contact Us
          </h2>
          <p className="text-slate-400 mt-6 max-w-xl mx-auto">
            {site?.contactDescription ?? "Have a legal concern or want to discuss a case? Reach out and we will respond within 24 hours."}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            {contactInfo.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-600/20 border border-amber-600/30 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">{label}</p>
                  {href !== "#" ? (
                    <a href={href} className="text-white hover:text-amber-400 transition-colors text-sm whitespace-pre-line">
                      {value}
                    </a>
                  ) : (
                    <p className="text-white text-sm whitespace-pre-line">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="mt-8 bg-slate-800 border border-slate-700 rounded-2xl h-52 flex flex-col items-center justify-center text-slate-500">
              <MapPin size={32} className="text-amber-500 mb-2" />
              {site?.mapAddress ? (
                <>
                  <p className="text-sm">{site.mapAddress}</p>
                  {site.mapAddress2 && <p className="text-sm">{site.mapAddress2}</p>}
                </>
              ) : (
                <p className="text-sm text-slate-600">Office address not configured</p>
              )}
              {(site?.mapAddress || site?.mapAddress2) && (
                <a
                  href={`https://maps.google.com/maps?q=${encodeURIComponent([site?.mapAddress, site?.mapAddress2].filter(Boolean).join(", "))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-amber-500 hover:text-amber-400 text-xs underline"
                >
                  Open in Google Maps →
                </a>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-slate-400 text-sm">We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                  className="mt-6 text-amber-500 hover:text-amber-400 text-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h3 className="text-white font-bold text-lg mb-4">Send a Message</h3>
                {[
                  { id: "name", label: "Full Name", type: "text", placeholder: "Jane Smith" },
                  { id: "email", label: "Email Address", type: "email", placeholder: "jane@email.com" },
                  { id: "phone", label: "Phone (optional)", type: "tel", placeholder: "(555) 123-4567" },
                ].map((f) => (
                  <div key={f.id}>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      required={f.id !== "phone"}
                      placeholder={f.placeholder}
                      value={form[f.id as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Send Message
                </button>
                <p className="text-xs text-slate-500 text-center">
                  Your information is confidential and protected by attorney-client privilege.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
