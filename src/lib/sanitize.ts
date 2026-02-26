/**
 * src/lib/sanitize.ts
 *
 * HTML sanitization helpers using sanitize-html.
 * Apply to any user-generated HTML content before rendering.
 */
import sanitizeHtmlLib from "sanitize-html";

// ── Rich content config (for TipTap/page content) ────────────────────────────

const RICH_CONTENT_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    // Structure
    "p", "div", "section", "article", "main", "aside", "header", "footer",
    // Headings
    "h1", "h2", "h3", "h4", "h5", "h6",
    // Text formatting
    "strong", "b", "em", "i", "u", "s", "del", "ins", "mark", "small", "sub", "sup",
    // Links & media
    "a", "img",
    // Lists
    "ul", "ol", "li",
    // Tables
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    // Code
    "pre", "code", "kbd", "samp",
    // Quotes & misc
    "blockquote", "q", "cite", "figcaption", "figure",
    "hr", "br", "span",
    // Interactive (allowed for accordion etc)
    "details", "summary",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
    "*": ["class", "id", "style"],
  },
  allowedStyles: {
    "*": {
      // Allow common inline styles (used by TipTap alignment, colors)
      "color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
      "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
      "text-align": [/^(left|right|center|justify)$/],
      "font-size": [/^\d+(\.\d+)?(px|em|rem|%)$/],
      "font-weight": [/^(normal|bold|\d{3})$/],
      "text-decoration": [/^(none|underline|line-through|overline)$/],
    },
  },
  // Strip event handlers (onclick, onerror, etc.) — covered by allowedAttributes
  disallowedTagsMode: "discard",
  // Ensure links use safe protocols
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

// ── Plain text config (strip all HTML) ───────────────────────────────────────

const PLAIN_TEXT_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

// ── Exports ───────────────────────────────────────────────────────────────────

/**
 * Sanitize rich HTML content (from TipTap, page editor, block HTML).
 * Keeps safe formatting tags but strips scripts, iframes, and event handlers.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return sanitizeHtmlLib(html, RICH_CONTENT_OPTIONS);
}

/**
 * Strip all HTML tags, returning plain text only.
 * Use for names, titles, excerpts displayed as text.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  return sanitizeHtmlLib(input, PLAIN_TEXT_OPTIONS);
}
