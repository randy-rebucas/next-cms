/** Persisted as `settings.enabledPlugins` — array of plugin IDs that are ON */
export interface PluginDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: "section" | "tool";
  defaultEnabled: boolean;
}

/**
 * Canonical plugin registry — add new entries here to make them
 * toggleable from /admin/plugins
 */
export const PLUGIN_REGISTRY: PluginDef[] = [
  // ── Home page sections ───────────────────────────────────────────────
  {
    id: "practice-areas",
    label: "Practice Areas",
    description: "Grid of legal practice areas on the home page.",
    icon: "⚖️",
    category: "section",
    defaultEnabled: true,
  },
  {
    id: "experience",
    label: "Experience Timeline",
    description: "Professional career timeline section.",
    icon: "⏳",
    category: "section",
    defaultEnabled: true,
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Client testimonials carousel on the home page.",
    icon: "⭐",
    category: "section",
    defaultEnabled: true,
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Frequently asked questions accordion.",
    icon: "❓",
    category: "section",
    defaultEnabled: true,
  },
  {
    id: "blog",
    label: "Blog / Articles",
    description: "Latest articles preview on the home page.",
    icon: "📝",
    category: "section",
    defaultEnabled: true,
  },
  {
    id: "tools-section",
    label: "Legal Tools Suite",
    description: "Tabbed tools section (calculator, glossary, booking, etc.).",
    icon: "🔧",
    category: "section",
    defaultEnabled: true,
  },
  // ── Individual tools (within the tools section tab bar) ──────────────
  {
    id: "sol-calculator",
    label: "SOL Calculator",
    description: "Statute of limitations calculator tab.",
    icon: "⏱",
    category: "tool",
    defaultEnabled: true,
  },
  {
    id: "legal-glossary",
    label: "Legal Glossary",
    description: "Searchable legal terms dictionary tab.",
    icon: "📖",
    category: "tool",
    defaultEnabled: true,
  },
  {
    id: "document-checklist",
    label: "Document Checklist",
    description: "Client document checklist tab.",
    icon: "✅",
    category: "tool",
    defaultEnabled: true,
  },
  {
    id: "consultation-booking",
    label: "Consultation Booking",
    description: "Book a consultation tab.",
    icon: "📅",
    category: "tool",
    defaultEnabled: true,
  },
  {
    id: "case-evaluation",
    label: "Case Evaluation",
    description: "Interactive case evaluation form tab.",
    icon: "📋",
    category: "tool",
    defaultEnabled: true,
  },
];

/** Default enabled list — all plugins ON */
export const DEFAULT_ENABLED: string[] = PLUGIN_REGISTRY
  .filter((p) => p.defaultEnabled)
  .map((p) => p.id);

/** Read enabled plugins from settings, falling back to all-enabled */
export function resolvePlugins(s: Record<string, unknown>): Set<string> {
  const raw = s.enabledPlugins;
  if (Array.isArray(raw)) return new Set(raw as string[]);
  return new Set(DEFAULT_ENABLED);
}
