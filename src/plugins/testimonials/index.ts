/**
 * plugins/testimonials/index.ts
 *
 * Testimonials plugin — renders a client testimonials grid on the public
 * home page. Data is pulled from MongoDB (Testimonial collection) and
 * falls back to built-in defaults when the DB is empty.
 *
 * Admin panel: src/plugins/testimonials/admin.tsx
 * Component:   src/plugins/testimonials/Component.tsx
 */
import type { PluginManifest } from "@/core/plugins";

export const testimonialsPlugin: PluginManifest = {
  id: "testimonials",
  register() {
    // UI-only plugin — no data hooks to register.
  },
};

// Re-export component and types for convenience
export { default as Testimonials, defaultReviews } from "./Component";
export type { TestimonialsProps } from "./Component";
