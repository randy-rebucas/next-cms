/**
 * Default theme — components/PostCard.tsx
 * WordPress equivalent: get_template_part('template-parts/content', 'post')
 *
 * Canonical name per theme structure. Re-exports the PostCard implementation
 * from template-parts/ so both paths resolve to the same component.
 *
 * Use this import path in new code:
 *   import PostCard from "@/themes/default/components/PostCard";
 *   import type { PostCardData } from "@/themes/default/components/PostCard";
 */
export { default, type PostCardData } from "../template-parts/post-card";
