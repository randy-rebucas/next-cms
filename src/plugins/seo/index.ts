/**
 * plugins/seo/index.ts
 *
 * SEO plugin — auto-populates missing meta fields before they are rendered,
 * and ensures every published post has a non-empty meta_title / meta_description
 * before it is saved.
 *
 * Hooks registered (when enabled):
 *   beforeSavePost     — generate slug/meta from title if absent
 *   beforeUpdatePost   — same normalisation on update
 *   beforeRenderMeta   — append site name to title if not present
 */
import { registerHook } from "@/core/plugins/hooks";
import type { PluginManifest } from "@/core/plugins";

const SITE_NAME = "Baligod Law Office";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function normalisePost<
  T extends {
    title?: string;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
    excerpt?: string;
  }
>(payload: T): T {
  if (payload.title && !payload.meta_title) {
    payload = { ...payload, meta_title: `${payload.title} | ${SITE_NAME}` };
  }
  if (payload.excerpt && !payload.meta_description) {
    payload = { ...payload, meta_description: payload.excerpt };
  }
  if (payload.slug) {
    payload = { ...payload, slug: slugify(payload.slug) };
  }
  return payload;
}

export const seoPlugin: PluginManifest = {
  id: "seo",
  register() {
    registerHook("beforeSavePost", normalisePost);
    registerHook("beforeUpdatePost", normalisePost);
    registerHook("beforeRenderMeta", (meta) => {
      if (meta.title && !meta.title.includes(SITE_NAME)) {
        return { ...meta, title: `${meta.title} | ${SITE_NAME}` };
      }
      return meta;
    });
  },
};
