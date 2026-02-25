/**
 * plugins/tools-section/index.ts
 *
 * Tools Section plugin — renders a tabbed suite of free legal tools
 * (SOL Calculator, Legal Glossary, Document Checklist, Consultation Booking,
 * Case Evaluation) as a section on the public home page.
 *
 * Individual tabs are controlled by the sibling plugin IDs in PLUGIN_REGISTRY:
 *   sol-calculator · legal-glossary · document-checklist
 *   consultation-booking · case-evaluation
 *
 * Admin panel: src/plugins/tools-section/admin.tsx
 * Component:   src/plugins/tools-section/Component.tsx
 */
import type { PluginManifest } from "@/core/plugins";

export const toolsSectionPlugin: PluginManifest = {
  id: "tools-section",
  register() {
    // UI-only plugin — no data hooks to register.
    // Tab visibility is driven by PLUGIN_REGISTRY settings resolved at
    // render time via resolvePlugins() in the public page.
  },
};

// Re-export component and types for convenience
export { default as ToolsSection } from "./Component";
export type { ToolsSectionProps, EnabledTabs, TabId } from "./Component";
