import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  category: string;
  author: string;
  read_time: string;
  tag_css: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = db.prepare("SELECT title, excerpt FROM posts WHERE slug = ? AND status = 'published'").get(slug) as Pick<Post, "title" | "excerpt"> | undefined;
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | Baligod Law Office`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = db
    .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'")
    .get(slug) as Post | undefined;

  if (!post) notFound();

  const date = new Date(post.created_at).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 pt-28">
        {/* Back link */}
        <Link
          href="/#blog"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Articles
        </Link>

        {/* Category badge */}
        {post.category && (
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${post.tag_css || "bg-amber-900/40 text-amber-300"}`}>
            {post.category}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-800">
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User size={13} />
              {post.author}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            {date}
          </span>
          {post.read_time && (
            <span className="flex items-center gap-1.5">
              <Tag size={13} />
              {post.read_time}
            </span>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-invert prose-amber max-w-none prose-headings:font-bold prose-headings:text-amber-300 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-amber-500 prose-blockquote:text-slate-400 prose-hr:border-slate-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Bottom CTA */}
        <div className="mt-16 p-6 bg-slate-900 border border-amber-500/20 rounded-2xl text-center">
          <p className="text-sm text-slate-400 mb-1">Need legal assistance?</p>
          <p className="text-lg font-semibold text-white mb-4">Schedule a consultation with Atty. Baligod</p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Book a Consultation →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
