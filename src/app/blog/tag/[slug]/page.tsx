import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import { ArrowLeft, Clock, User } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  read_time: string;
  category: string;
  tag_css: string;
  created_at: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = db.prepare("SELECT * FROM tags WHERE slug = ?").get(slug) as Tag | undefined;
  if (!tag) return { title: "Tag Not Found" };
  return {
    title: `#${tag.name} Articles | Baligod Law Office`,
    description: `Browse all articles tagged with ${tag.name}`,
  };
}

export default async function TagArchive({ params }: Props) {
  const { slug } = await params;
  const tag = db.prepare("SELECT * FROM tags WHERE slug = ?").get(slug) as Tag | undefined;
  if (!tag) notFound();

  const posts = db
    .prepare(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.author, p.read_time, p.category, p.tag_css, p.created_at
       FROM posts p
       JOIN post_tags pt ON pt.post_id = p.id
       WHERE pt.tag_id = ? AND p.status = 'published'
       ORDER BY p.created_at DESC`
    )
    .all(tag.id) as Post[];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 pt-28">
        <Link
          href="/#blog"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Articles
        </Link>

        <div className="mb-10">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Tag</span>
          <h1 className="text-3xl font-bold text-white mt-1">#{tag.name}</h1>
          <p className="text-slate-500 text-xs mt-1">{posts.length} article{posts.length !== 1 ? "s" : ""}</p>
        </div>

        {posts.length === 0 ? (
          <p className="text-slate-500 text-sm">No articles with this tag yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col hover:border-amber-500/30 transition-colors">
                {post.category && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start mb-3 ${post.tag_css || "bg-amber-900/40 text-amber-300"}`}>
                    {post.category}
                  </span>
                )}
                <h2 className="font-bold text-white text-lg mb-2 leading-snug">{post.title}</h2>
                {post.excerpt && <p className="text-slate-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>}
                <div className="mt-auto flex items-center gap-3 text-xs text-slate-500">
                  {post.author && <span className="flex items-center gap-1"><User size={11} />{post.author}</span>}
                  {post.read_time && <span className="flex items-center gap-1"><Clock size={11} />{post.read_time}</span>}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
