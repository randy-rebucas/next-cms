import { notFound } from "next/navigation";
import db from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import { Clock, User } from "lucide-react";

interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  author: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

function getPage(slug: string): Page | undefined {
  return db
    .prepare("SELECT * FROM pages WHERE slug = ? AND status = 'published'")
    .get(slug) as Page | undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return { title: "Page Not Found" };

  const siteTitle = "Baligod Law Office";
  return {
    title: page.meta_title || `${page.title} | ${siteTitle}`,
    description: page.meta_description || page.excerpt,
    openGraph: {
      title: page.meta_title || page.title,
      description: page.meta_description || page.excerpt,
      images: page.og_image ? [{ url: page.og_image }] : [],
    },
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  const date = new Date(page.updated_at).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 pt-28">
        {/* Featured image */}
        {page.featured_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.featured_image}
            alt={page.title}
            className="w-full rounded-2xl object-cover max-h-80 mb-8 bg-slate-800"
          />
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
          {page.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-800">
          {page.author && (
            <span className="flex items-center gap-1.5">
              <User size={13} />
              {page.author}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            {date}
          </span>
        </div>

        <div
          className="prose prose-invert prose-amber max-w-none prose-headings:font-bold prose-headings:text-amber-300 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-amber-500 prose-blockquote:text-slate-400 prose-hr:border-slate-700"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>

      <Footer />
    </div>
  );
}
