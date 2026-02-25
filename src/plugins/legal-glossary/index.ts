/**
 * plugins/legal-glossary/index.ts
 *
 * Legal Glossary plugin — searchable A–Z legal term reference rendered as a
 * tab inside the Tools Section on the public home page.
 *
 * Terms are hardcoded by default; the admin panel allows adding, editing, and
 * removing terms, persisted as `glossaryTerms` in site settings.
 *
 * Admin panel: src/plugins/legal-glossary/admin.tsx
 * Component:   src/plugins/legal-glossary/Component.tsx
 */
import type { PluginManifest } from "@/core/plugins";

export const legalGlossaryPlugin: PluginManifest = {
  id: "legal-glossary",
  register() {
    // UI-only plugin — no data hooks to register.
  },
};

// Re-export component and types for convenience
export { default as LegalGlossary, defaultTerms } from "./Component";
export type { LegalGlossaryProps, GlossaryTerm } from "./Component";
