export type SiteData = {
  name: string;
  nameHighlight: string;
  title: string;
  tagline: string;
  description: string;
  stats: { value: string; label: string }[];
  credentials: string;
  badges: string[];
  bio: string;
  bioExtended: string;
  highlightStats: { icon: string; value: string; label: string }[];
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  address: string;
  mapAddress: string;
  mapAddress2: string;
  hours: string;
  contactDescription: string;
  footerDescription: string;
  metaTitle: string;
  metaDescription: string;
};

export type PracticeArea = {
  id: string;
  icon: string;
  title: string;
  description: string;
  bullets: string[];
  color: string;
  bg: string;
};

export type ExperienceEvent = {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
};

export type Testimonial = {
  id: string;
  name: string;
  case: string;
  rating: number;
  text: string;
  initials: string;
  color: string;
};

export type BlogPost = {
  id: string;
  slug?: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  tag: string;
};

export type FAQItem = {
  id: string;
  q: string;
  a: string;
};

// ── Block-based content system ───────────────────────────────────────────────

export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "quote"
  | "code"
  | "list"
  | "divider"
  | "html"
  | "button"
  | "video"
  | "table"
  | "callout"
  | "accordion"
  | "gallery"
  | "embed"
  | "spacer"
  | "columns";

export interface HeadingBlock {
  type: "heading";
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  content: string;
}

export interface ImageBlock {
  type: "image";
  src: string;
  alt?: string;
  caption?: string;
}

export interface QuoteBlock {
  type: "quote";
  content: string;
  cite?: string;
}

export interface CodeBlock {
  type: "code";
  content: string;
  language?: string;
}

export interface ListBlock {
  type: "list";
  items: string[];
  ordered?: boolean;
}

export interface DividerBlock {
  type: "divider";
}

/** Backwards-compat: raw HTML string from TipTap */
export interface HtmlBlock {
  type: "html";
  content: string;
}

export interface ButtonBlock {
  type: "button";
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
  target?: "_blank" | "_self";
}

export interface VideoBlock {
  type: "video";
  url: string;
  caption?: string;
}

export interface TableBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}

export interface CalloutBlock {
  type: "callout";
  kind?: "info" | "warning" | "success" | "error" | "tip";
  title?: string;
  content: string;
}

export interface AccordionBlock {
  type: "accordion";
  title: string;
  content: string;
}

export interface GalleryBlock {
  type: "gallery";
  images: { src: string; alt?: string; caption?: string }[];
  columns?: 2 | 3 | 4;
}

export interface EmbedBlock {
  type: "embed";
  url: string;
  height?: number;
  title?: string;
}

export interface SpacerBlock {
  type: "spacer";
  size?: "sm" | "md" | "lg" | "xl";
}

export interface ColumnsBlock {
  type: "columns";
  left: string;
  right: string;
  split?: "50/50" | "33/67" | "67/33";
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | QuoteBlock
  | CodeBlock
  | ListBlock
  | DividerBlock
  | HtmlBlock
  | ButtonBlock
  | VideoBlock
  | TableBlock
  | CalloutBlock
  | AccordionBlock
  | GalleryBlock
  | EmbedBlock
  | SpacerBlock
  | ColumnsBlock;

/**
 * Parse a post's `content` field into a Block array.
 * Handles three formats:
 *  - Already-parsed Block array (Mongoose `Mixed` returned as object)
 *  - JSON array string (new block format): `[{ "type": "heading", ... }]`
 *  - Plain HTML string (legacy TipTap output): wrapped into a single HtmlBlock
 */
export function parseBlocks(content: unknown): Block[] {
  if (!content) return [];
  // Already a parsed array (Mongoose Mixed)
  if (Array.isArray(content)) return content as Block[];
  if (typeof content !== "string") return [];
  const trimmed = content.trimStart();
  if (trimmed.startsWith("[")) {
    try {
      const blocks = JSON.parse(content) as Block[];
      if (Array.isArray(blocks)) return blocks;
    } catch {
      // fall through to HTML fallback
    }
  }
  return [{ type: "html", content }];
}

/**
 * Serialise a Block array back to the string stored in the DB.
 */
export function stringifyBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks);
}
