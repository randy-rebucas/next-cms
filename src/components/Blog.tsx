"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types/content";

const defaultPosts = [
  {
    category: "Criminal Defense",
    title: "What to Do If You're Arrested: Your 5 Most Important Rights",
    excerpt:
      "An arrest is a terrifying experience. Knowing your constitutional rights — especially your right to remain silent and your right to counsel — can make all the difference in the outcome of your case.",
    author: "James R. Harrington",
    date: "February 10, 2026",
    readTime: "5 min read",
    tag: "bg-blue-100 text-blue-700",
  },
  {
    category: "Personal Injury",
    title: "The 7 Mistakes That Can Destroy Your Personal Injury Claim",
    excerpt:
      "After an accident, the decisions you make in the first 72 hours can significantly impact your ability to recover fair compensation. Learn what to avoid to protect your claim.",
    author: "James R. Harrington",
    date: "January 28, 2026",
    readTime: "7 min read",
    tag: "bg-red-100 text-red-700",
  },
  {
    category: "Family Law",
    title: "Child Custody in New York: What Judges Actually Look For",
    excerpt:
      "When parents can't agree on custody, a judge decides based on the 'best interests of the child' standard. Understanding exactly what that means can help you prepare a stronger case.",
    author: "James R. Harrington",
    date: "January 14, 2026",
    readTime: "6 min read",
    tag: "bg-green-100 text-green-700",
  },
  {
    category: "Business Law",
    title: "Why Every Small Business Needs an Operating Agreement",
    excerpt:
      "Skipping the operating agreement when forming an LLC is one of the most costly mistakes entrepreneurs make. Here's why this document is essential and what it must include.",
    author: "James R. Harrington",
    date: "December 20, 2025",
    readTime: "4 min read",
    tag: "bg-purple-100 text-purple-700",
  },
  {
    category: "Legal Tips",
    title: "Understanding Contingency Fees: When You Pay Nothing Unless You Win",
    excerpt:
      "Contingency fee agreements can make high-quality legal representation accessible to everyone. This guide explains exactly how they work and what questions to ask.",
    author: "James R. Harrington",
    date: "December 5, 2025",
    readTime: "4 min read",
    tag: "bg-amber-100 text-amber-700",
  },
  {
    category: "Criminal Defense",
    title: "Expungement in New York: Can Your Criminal Record Be Sealed?",
    excerpt:
      "New York's Clean Slate Act changes the landscape for sealing criminal records. Find out if you qualify, what offenses are eligible, and how to begin the process.",
    author: "James R. Harrington",
    date: "November 18, 2025",
    readTime: "6 min read",
    tag: "bg-teal-100 text-teal-700",
  },
] as BlogPost[];

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
              key={post.title}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
            >
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl">
              {post.category === "Anti-Corruption" ? "🔍" :
                post.category === "Criminal Law PH" ? "⚖️" :
                post.category === "Whistleblower Rights" ? "📣" :
                post.category === "Procurement Law" ? "🏗️" :
                post.category === "Public Accountability" ? "🏦" : "📜"}
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
          <button className="px-8 py-3 border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold rounded-xl transition-colors">
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
}
