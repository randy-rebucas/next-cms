/**
 * plugins/document-checklist/index.ts
 *
 * Document Checklist plugin — categorized pre-consultation document checklist
 * rendered as a tab inside the Tools Section on the public home page.
 *
 * Checklist categories and items are hardcoded by default; the admin panel
 * allows full editing, persisted as `checklistData` in site settings.
 *
 * Admin panel: src/plugins/document-checklist/admin.tsx
 * Component:   src/plugins/document-checklist/Component.tsx
 */
import type { PluginManifest } from "@/core/plugins";

export const documentChecklistPlugin: PluginManifest = {
  id: "document-checklist",
  register() {
    // UI-only plugin — no data hooks to register.
  },
};

// Re-export component and types for convenience
export { default as DocumentChecklist, defaultChecklists } from "./Component";
export type { DocumentChecklistProps, ChecklistItem, ChecklistData } from "./Component";
