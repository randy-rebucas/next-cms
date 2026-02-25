/**
 * plugins/case-evaluation/index.ts
 *
 * Case Evaluation plugin — inquiry form for potential clients to submit their
 * case details and receive a free evaluation, rendered as a tab inside the
 * Tools Section on the public home page.
 *
 * Practice area options are hardcoded by default; the admin panel allows
 * editing them, persisted as `evaluationAreas` in site settings.
 *
 * Admin panel: src/plugins/case-evaluation/admin.tsx
 * Component:   src/plugins/case-evaluation/Component.tsx
 */
import type { PluginManifest } from "@/core/plugins";

export const caseEvaluationPlugin: PluginManifest = {
  id: "case-evaluation",
  register() {
    // UI-only plugin — no data hooks to register.
  },
};

// Re-export component and types for convenience
export { default as CaseEvaluation, defaultPracticeAreas } from "./Component";
export type { CaseEvaluationProps } from "./Component";
