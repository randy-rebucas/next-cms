/**
 * plugins/bootstrap.ts
 *
 * Singleton that registers all plugins exactly once per process.
 * All plugins are registered synchronously at startup; individual plugins
 * control their own activation based on their settings (e.g., analyticsId).
 *
 * Usage — import as a side-effect anywhere that runs once at startup:
 *   import "@/plugins/bootstrap";
 */
import { seoPlugin } from "@/plugins/seo";
import { analyticsPlugin } from "@/plugins/analytics";
import { toolsSectionPlugin } from "@/plugins/tools-section";
import { testimonialsPlugin } from "@/plugins/testimonials";
import { solCalculatorPlugin } from "@/plugins/sol-calculator";
import { legalGlossaryPlugin } from "@/plugins/legal-glossary";
import { documentChecklistPlugin } from "@/plugins/document-checklist";
import { consultationBookingPlugin } from "@/plugins/consultation-booking";
import { caseEvaluationPlugin } from "@/plugins/case-evaluation";
import type { PluginManifest } from "@/core/plugins";

const ALL_PLUGINS: PluginManifest[] = [
  seoPlugin,
  analyticsPlugin,
  toolsSectionPlugin,
  testimonialsPlugin,
  solCalculatorPlugin,
  legalGlossaryPlugin,
  documentChecklistPlugin,
  consultationBookingPlugin,
  caseEvaluationPlugin,
];

let _bootstrapped = false;

export function bootstrap(): void {
  if (_bootstrapped) return;
  _bootstrapped = true;

  for (const plugin of ALL_PLUGINS) {
    plugin.register();
  }
}

// Auto-run on import
bootstrap();
