/**
 * core/tenancy
 * Multi-tenancy support (per-tenant settings and plugin/theme overrides).
 * Extend here when multi-site mode is needed.
 */
export type Tenant = { id: string; name: string };

// Placeholder — single-tenant default
export const DEFAULT_TENANT: Tenant = {
  id: "default",
  name: "Atty. Levi Baligod",
};
