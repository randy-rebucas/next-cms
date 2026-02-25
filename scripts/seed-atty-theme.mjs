/**
 * scripts/seed-atty-theme.mjs
 *
 * Seeds MongoDB with the "atty-theme" starter template.
 * Reads from src/data/templates/atty-theme.json and upserts every
 * collection so the script is safe to run multiple times.
 *
 * Usage:
 *   node scripts/seed-atty-theme.mjs
 *
 * Options:
 *   --clear    Drop all existing documents before seeding (fresh install)
 *
 * Requires MONGODB_URI in .env.local (loaded automatically).
 */

import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CLEAR = process.argv.includes("--clear");

// ── Load .env.local ───────────────────────────────────────────────────────────
const require = createRequire(import.meta.url);
const { config } = require("dotenv");
config({ path: resolve(ROOT, ".env.local") });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌  MONGODB_URI not set in .env.local");
  process.exit(1);
}

// ── Connect via Mongoose ──────────────────────────────────────────────────────
const mongoose = require("mongoose");

async function connect() {
  await mongoose.connect(MONGO_URI, { dbName: "baligodlaw" });
  console.log("✅  Connected to MongoDB");
}

// ── Lazy model definitions (mirrors src/models/) ────────────────────────────
const { Schema, model, models } = mongoose;

const PracticeAreaSchema = new Schema({
  icon: String, title: String, description: String,
  bullets: [String], color: String, bg: String,
  sort_order: Number, status: { type: String, default: "published" },
}, { timestamps: true });

const ExperienceSchema = new Schema({
  year: String, title: String, subtitle: String,
  description: String, sort_order: Number,
}, { timestamps: true });

const TestimonialSchema = new Schema({
  name: String, case_type: String, rating: Number,
  text: String, initials: String, color: String,
  status: { type: String, default: "published" },
}, { timestamps: true });

const FAQSchema = new Schema({
  question: String, answer: String,
  sort_order: Number, status: { type: String, default: "published" },
}, { timestamps: true });

const PostSchema = new Schema({
  title: String, slug: { type: String, unique: true },
  content: mongoose.Schema.Types.Mixed,
  excerpt: String, status: { type: String, default: "draft" },
  type: { type: String, default: "post" },
  author_name: String, tag_css: String, read_time: String,
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  preview_token: { type: String, default: null },
}, { timestamps: true });

const SettingSchema = new Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

// Safe model registration (avoid OverwriteModelError on re-runs)
const PracticeArea = models.PracticeArea || model("PracticeArea", PracticeAreaSchema);
const Experience   = models.Experience   || model("Experience",   ExperienceSchema);
const Testimonial  = models.Testimonial  || model("Testimonial",  TestimonialSchema);
const FAQ          = models.FAQ          || model("FAQ",          FAQSchema);
const Post         = models.Post         || model("Post",         PostSchema);
const Setting      = models.Setting      || model("Setting",      SettingSchema);

// ── Load template ─────────────────────────────────────────────────────────────
const templatePath = resolve(ROOT, "src/data/templates/atty-theme.json");
const template = JSON.parse(readFileSync(templatePath, "utf-8"));
const { data } = template;

console.log(`\n📦  Template: ${template.name} v${template.version}`);
console.log(`    ${template.description}\n`);

// ── Helpers ───────────────────────────────────────────────────────────────────
async function clearCollection(Model) {
  if (CLEAR) {
    await Model.deleteMany({});
    console.log(`   🗑  Cleared ${Model.modelName}`);
  }
}

async function upsertMany(Model, docs, keyField = "title") {
  let inserted = 0, updated = 0;
  for (const doc of docs) {
    const filter = { [keyField]: doc[keyField] };
    const result = await Model.updateOne(filter, { $set: doc }, { upsert: true });
    if (result.upsertedCount) inserted++;
    else updated++;
  }
  console.log(`   ✔  ${Model.modelName}: ${inserted} inserted, ${updated} updated`);
}

// ── Seed each collection ──────────────────────────────────────────────────────
async function seed() {
  await connect();

  console.log("── Practice Areas ──────────────────────────────────────────────");
  await clearCollection(PracticeArea);
  await upsertMany(PracticeArea, data.practiceAreas, "title");

  console.log("── Experience ──────────────────────────────────────────────────");
  await clearCollection(Experience);
  await upsertMany(Experience, data.experience, "title");

  console.log("── Testimonials ─────────────────────────────────────────────────");
  await clearCollection(Testimonial);
  await upsertMany(Testimonial, data.testimonials, "name");

  console.log("── FAQ ──────────────────────────────────────────────────────────");
  await clearCollection(FAQ);
  await upsertMany(FAQ, data.faq, "question");

  console.log("── Posts ────────────────────────────────────────────────────────");
  await clearCollection(Post);
  await upsertMany(Post, data.posts, "slug");

  console.log("── Settings ─────────────────────────────────────────────────────");
  await clearCollection(Setting);
  await upsertMany(Setting, data.settings, "key");

  console.log("\n✅  Done! Seeded template \"atty-theme\" into MongoDB.\n");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
