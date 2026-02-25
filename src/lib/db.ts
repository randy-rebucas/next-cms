import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Singleton — one connection reused across Next.js hot reloads
const DB_PATH = path.join(DATA_DIR, "baligod.db");
const globalForDb = globalThis as unknown as { _db: Database.Database | undefined };
if (!globalForDb._db) {
  globalForDb._db = new Database(DB_PATH);
  globalForDb._db.pragma("journal_mode = WAL");
  globalForDb._db.pragma("foreign_keys = ON");
}
const db = globalForDb._db;

// ── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    UNIQUE NOT NULL,
  title       TEXT    NOT NULL DEFAULT '',
  content     TEXT    DEFAULT '',
  excerpt     TEXT    DEFAULT '',
  status      TEXT    DEFAULT 'draft',
  category    TEXT    DEFAULT '',
  author      TEXT    DEFAULT 'Atty. Levi Baligod',
  read_time   TEXT    DEFAULT '5 min read',
  tag_css     TEXT    DEFAULT 'bg-slate-100 text-slate-600',
  created_at  TEXT    DEFAULT (datetime('now')),
  updated_at  TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS practice_areas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  icon        TEXT    DEFAULT '📌',
  title       TEXT    NOT NULL DEFAULT '',
  description TEXT    DEFAULT '',
  bullets     TEXT    DEFAULT '[]',
  color       TEXT    DEFAULT 'border-amber-500',
  bg          TEXT    DEFAULT 'bg-amber-50',
  sort_order  INTEGER DEFAULT 0,
  status      TEXT    DEFAULT 'published'
);

CREATE TABLE IF NOT EXISTS experience_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  year        TEXT    NOT NULL DEFAULT '',
  title       TEXT    NOT NULL DEFAULT '',
  subtitle    TEXT    DEFAULT '',
  description TEXT    DEFAULT '',
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL DEFAULT '',
  case_type   TEXT    DEFAULT '',
  rating      INTEGER DEFAULT 5,
  text        TEXT    DEFAULT '',
  initials    TEXT    DEFAULT '',
  color       TEXT    DEFAULT 'bg-slate-600',
  status      TEXT    DEFAULT 'published'
);

CREATE TABLE IF NOT EXISTS faqs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question    TEXT    NOT NULL DEFAULT '',
  answer      TEXT    DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  status      TEXT    DEFAULT 'published'
);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT    PRIMARY KEY,
  value       TEXT    NOT NULL DEFAULT ''
);
`);

// ── Seed from JSON files if tables are empty ───────────────────────────────
function seeded(table: string): boolean {
  const row = db.prepare(`SELECT COUNT(*) as cnt FROM ${table}`).get() as { cnt: number };
  return row.cnt > 0;
}

function jsonPath(name: string) {
  return path.join(process.cwd(), "src", "data", `${name}.json`);
}

function readJson<T>(name: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(jsonPath(name), "utf-8")) as T;
  } catch {
    return null;
  }
}

if (!seeded("practice_areas")) {
  type PA = { icon: string; title: string; description: string; bullets: string[]; color: string; bg: string };
  const areas = readJson<PA[]>("practiceAreas");
  if (areas) {
    const stmt = db.prepare(
      "INSERT INTO practice_areas (icon, title, description, bullets, color, bg, sort_order) VALUES (?,?,?,?,?,?,?)"
    );
    const ins = db.transaction((rows: PA[]) => rows.forEach((r, i) => stmt.run(r.icon, r.title, r.description, JSON.stringify(r.bullets), r.color, r.bg, i)));
    ins(areas);
  }
}

if (!seeded("experience_events")) {
  type EE = { year: string; title: string; subtitle: string; description: string };
  const evs = readJson<EE[]>("experience");
  if (evs) {
    const stmt = db.prepare(
      "INSERT INTO experience_events (year, title, subtitle, description, sort_order) VALUES (?,?,?,?,?)"
    );
    const ins = db.transaction((rows: EE[]) => rows.forEach((r, i) => stmt.run(r.year, r.title, r.subtitle, r.description, i)));
    ins(evs);
  }
}

if (!seeded("testimonials")) {
  type T = { name: string; case: string; rating: number; text: string; initials: string; color: string };
  const revs = readJson<T[]>("testimonials");
  if (revs) {
    const stmt = db.prepare(
      "INSERT INTO testimonials (name, case_type, rating, text, initials, color) VALUES (?,?,?,?,?,?)"
    );
    const ins = db.transaction((rows: T[]) => rows.forEach((r) => stmt.run(r.name, r.case, r.rating, r.text, r.initials, r.color)));
    ins(revs);
  }
}

if (!seeded("faqs")) {
  type F = { q: string; a: string };
  const items = readJson<F[]>("faq");
  if (items) {
    const stmt = db.prepare("INSERT INTO faqs (question, answer, sort_order) VALUES (?,?,?)");
    const ins = db.transaction((rows: F[]) => rows.forEach((r, i) => stmt.run(r.q, r.a, i)));
    ins(items);
  }
}

if (!seeded("posts")) {
  type P = { category: string; title: string; excerpt: string; author: string; date: string; readTime: string; tag: string };
  const items = readJson<P[]>("blog");
  if (items) {
    const stmt = db.prepare(
      "INSERT INTO posts (slug, title, content, excerpt, status, category, author, read_time, tag_css, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)"
    );
    const ins = db.transaction((rows: P[]) =>
      rows.forEach((r) => {
        const slug = r.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 80);
        stmt.run(slug, r.title, "", r.excerpt, "published", r.category, r.author, r.readTime, r.tag, r.date);
      })
    );
    ins(items);
  }
}

if (!seeded("settings")) {
  type S = Record<string, unknown>;
  const site = readJson<S>("site");
  if (site) {
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    const ins = db.transaction((obj: S) => {
      for (const [k, v] of Object.entries(obj)) {
        stmt.run(k, typeof v === "string" ? v : JSON.stringify(v));
      }
    });
    ins(site);
  }
}

export default db;
