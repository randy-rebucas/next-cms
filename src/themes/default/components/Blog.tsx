"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/models/content";

const defaultPosts: BlogPost[] = [
  {
    id: "sample-1",
    category: "Legal Tips",
    title: "Your First Consultation: What to Bring and What to Expect",
    excerpt:
      "Preparing for your first meeting with an attorney can feel overwhelming. This guide walks you through the documents to gather, questions to ask, and what happens during a typical initial consultation.",
    author: "The Firm",
    date: "Sample Post",
    readTime: "4 min read",
    tag: "bg-amber-100 text-amber-700",
  },
  {
    id: "sample-2",
    category: "Client Rights",
    title: "Understanding Attorney-Client Privilege: What It Protects",
    excerpt:
      "Attorney-client privilege is one of the most important protections in the legal system. Learn what it covers, when it applies, and the rare exceptions that can break confidentiality.",
    author: "The Firm",
    date: "Sample Post",
    readTime: "5 min read",
    tag: "bg-blue-100 text-blue-700",
  },
  {
    id: "sample-3",
    category: "Legal Process",
    title: "How Long Does a Lawsuit Take? A Realistic Timeline",
    excerpt:
      "One of the most common questions clients ask is how long their case will take. The honest answer depends on many factors — here is a realistic breakdown of what to expect at each stage.",
    author: "The Firm",
    date: "Sample Post",
    readTime: "6 min read",
    tag: "bg-green-100 text-green-700",
  },
];

export default function Blog({ posts = defaultPosts }: { posts?: BlogPost[] }) {
  return (
    <section id="blog" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Legal Insights
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">
            Articles &amp; Resources
          </h2>
          <p className="text-slate-500 mt-6 max-w-xl mx-auto">
            Practical legal guidance written in plain language to help you understand your rights.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id || post.slug || post.title}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
            >
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl">
                📜
              </div>

              <div className="p-5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${post.tag}`}>
                  {post.category}
                </span>

                <h3 className="font-bold text-slate-800 mt-3 mb-2 text-base leading-snug group-hover:text-amber-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                  <span>{post.date}</span>
                </div>

                {post.slug ? (
                  <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-amber-600 hover:text-amber-500 text-sm font-medium transition-colors">
                    Read More <ArrowRight size={14} />
                  </Link>
                ) : (
                  <span className="mt-4 inline-flex items-center gap-1 text-amber-300 text-sm font-medium">
                    Read More <ArrowRight size={14} />
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/blog" className="inline-block px-8 py-3 border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold rounded-xl transition-colors">
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
