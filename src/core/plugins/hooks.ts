/**
 * core/plugins/hooks.ts
 *
 * Typed, async hook (filter) system.
 *
 * Hooks are module-level singletons — they live for the lifetime of the
 * Node.js process, so plugins only need to call registerHook() once at
 * startup (via plugins/bootstrap.ts).
 *
 * Pattern: WordPress-style filters — each hook receives a payload, may
 * transform it, and must return it (possibly modified).
 */

// ── Well-known hook names + their payload types ───────────────────────────────

export interface HookPayloads {
  /** Fired before a post is written to the DB (POST /api/db/posts). */
  beforeSavePost: PostPayload;
  /** Fired after a post is written to the DB — payload includes the saved row. */
  afterSavePost: PostPayload;
  /** Fired before a post is updated (PUT /api/db/posts/[id]). */
  beforeUpdatePost: PostPayload;
  /** Fired after a post is updated. */
  afterUpdatePost: PostPayload;
  /** Fired before metadata is returned for a public page. */
  beforeRenderMeta: MetaPayload;
  /** Filter to inject <head> scripts from plugins (analytics, etc.). */
  filterHeadScripts: HeadScriptsPayload;
}

export type HookName = keyof HookPayloads;

export interface PostPayload {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: string;
  category?: string;
  author?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  [key: string]: unknown;
}

export interface MetaPayload {
  title: string;
  description?: string;
  openGraph?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface HeadScriptsPayload {
  /** Plugins push raw HTML strings to inject into <head>. */
  scripts: string[];
}

// ── Registry ──────────────────────────────────────────────────────────────────

type HookFn<T> = (payload: T) => T | Promise<T>;

const _registry: { [K in HookName]?: HookFn<HookPayloads[K]>[] } = {};

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Register a callback for a hook.
 * Callbacks are executed in registration order.
 * Each callback receives and must return the (possibly mutated) payload.
 */
export function registerHook<K extends HookName>(
  event: K,
  callback: HookFn<HookPayloads[K]>
): void {
  if (!_registry[event]) {
    (_registry as Record<string, unknown[]>)[event] = [];
  }
  (_registry[event] as HookFn<HookPayloads[K]>[]).push(callback);
}

/**
 * Run all registered callbacks for a hook in order.
 * Returns the final (transformed) payload.
 * Safe to call even if no callbacks are registered.
 */
export async function triggerHook<K extends HookName>(
  event: K,
  payload: HookPayloads[K]
): Promise<HookPayloads[K]> {
  const callbacks = _registry[event] as HookFn<HookPayloads[K]>[] | undefined;
  if (!callbacks?.length) return payload;
  let current = payload;
  for (const fn of callbacks) {
    current = await fn(current);
  }
  return current;
}

/** Remove all callbacks for a hook — useful in tests. */
export function clearHooks(event?: HookName): void {
  if (event) {
    delete _registry[event];
  } else {
    for (const k of Object.keys(_registry)) {
      delete (_registry as Record<string, unknown>)[k];
    }
  }
}
