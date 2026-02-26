/**
 * core/theme/template-resolver.ts
 *
 * Maps a URL content-kind → a TemplateType to load.
 * WordPress equivalent: the template hierarchy resolution step that turns
 * "this is a category archive" into "try category.php → archive.php → index.php".
 *
 * Our hierarchy:
 *   post      → post.tsx      (single.php)
 *   page      → page.tsx      (page.php)
 *   category  → category.tsx  (category.php → archive.php)
 *   tag       → archive.tsx   (tag.php → archive.php — we combine into one)
 *   blog      → archive.tsx   (home.php → archive.php — blog index)
 *   search    → search.tsx    (search.php)
 *   404       → 404.tsx       (404.php)
 */
import type { TemplateType } from "./theme-registry";

/**
 * Resolve a content-kind string to the template slot to load.
 *
 * @param kind - One of: "post" | "page" | "category" | "tag" | "blog" | "search" | "404"
 * @returns    The TemplateType key used by the loader
 */
export function resolveTemplate(kind: string): TemplateType {
  switch (kind) {
    case "post":     return "post";
    case "page":     return "page";
    case "category": return "category";
    case "search":   return "search";
    case "404":      return "404";
    // tag archives and the blog index both use the generic archive template
    default:         return "archive";
  }
}
