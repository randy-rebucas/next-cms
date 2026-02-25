/**
 * plugins/sol-calculator/index.ts
 *
 * SOL Calculator plugin — interactive statute-of-limitations deadline
 * estimator rendered as a tab inside the Tools Section on the public home page.
 *
 * Case type data is hardcoded by default; the admin panel allows editing
 * entries which are persisted as `solCaseTypes` in site settings.
 *
 * Admin panel: src/plugins/sol-calculator/admin.tsx
 * Component:   src/plugins/sol-calculator/Component.tsx
 */
import type { PluginManifest } from "@/core/plugins";

export const solCalculatorPlugin: PluginManifest = {
  id: "sol-calculator",
  register() {
    // UI-only plugin — no data hooks to register.
  },
};

// Re-export component and types for convenience
export { default as SOLCalculator, defaultCaseTypes } from "./Component";
export type { SOLCalculatorProps, CaseType } from "./Component";
