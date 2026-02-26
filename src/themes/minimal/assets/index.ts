/**
 * Minimal theme — assets/index.ts
 * Overrides the accent-line color and provides minimal theme-specific CSS.
 */
export const themeStyles = `
/* ── Minimal theme: accent-line maps to primary accent ───────────────────── */
:root {
  --accent-line: var(--gold, #2563eb);
  --min-surface: #ffffff;
  --min-border:  #e2e8f0;
  --min-text:    #0f172a;
  --min-muted:   #64748b;
}

/* ── Smooth section transitions ──────────────────────────────────────────── */
.min-section {
  border-top: 1px solid var(--min-border);
  padding: 4rem 0;
}

/* ── Minimal card ────────────────────────────────────────────────────────── */
.min-card {
  background: var(--min-surface);
  border: 1px solid var(--min-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.min-card:hover {
  border-color: var(--gold, #2563eb);
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

/* ── Focus ring ──────────────────────────────────────────────────────────── */
.min-focus:focus-visible {
  outline: 2px solid var(--gold, #2563eb);
  outline-offset: 2px;
}
`.trim();
