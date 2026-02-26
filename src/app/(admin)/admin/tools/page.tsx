"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download, Upload, Activity, CheckCircle, XCircle,
  AlertCircle, Loader2, RefreshCw, FileJson, Database,
  Server, Cpu,
} from "lucide-react";
import { useAdminAuth } from "../layout";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HealthData {
  db: { status: "connected" | "disconnected" | "error"; posts: number; pages: number };
  runtime: { nodeVersion: string; platform: string; nextVersion: string; appVersion: string; uptime: number };
  env: { key: string; set: boolean }[];
  timestamp: string;
}

interface ImportResult {
  posts: { inserted: number; skipped: number };
  pages: { inserted: number; skipped: number };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function StatusDot({ ok }: { ok: boolean | "warn" }) {
  if (ok === "warn") return <AlertCircle size={16} className="text-yellow-400" />;
  return ok
    ? <CheckCircle size={16} className="text-emerald-400" />
    : <XCircle size={16} className="text-red-400" />;
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
        <Icon size={17} className="text-amber-500" />
        <h2 className="font-semibold text-white text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const { pin } = useAdminAuth();
  const headers = { "x-admin-pin": pin };

  // ── Site Health ──────────────────────────────────────────────────────────
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  async function loadHealth() {
    setHealthLoading(true);
    try {
      const r = await fetch("/api/admin/tools/health", { headers });
      const j = await r.json() as { data?: HealthData };
      if (j.data) setHealth(j.data);
    } finally {
      setHealthLoading(false);
    }
  }

  useEffect(() => { if (pin) loadHealth(); }, [pin]); // eslint-disable-line

  // ── Export ───────────────────────────────────────────────────────────────
  const [exportType, setExportType] = useState<"all" | "posts" | "pages">("all");
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const r = await fetch(`/api/admin/tools/export?type=${exportType}`, { headers });
      const blob = await r.blob();
      const cd = r.headers.get("Content-Disposition") ?? "";
      const name = cd.match(/filename="([^"]+)"/)?.[1] ?? `export-${exportType}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  // ── Import ───────────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleImport(file: File) {
    setImportError(""); setImportResult(null);
    if (!file.name.endsWith(".json")) { setImportError("Only .json files are accepted"); return; }
    setImporting(true);
    try {
      const text = await file.text();
      const r = await fetch("/api/admin/tools/import", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: text,
      });
      const j = await r.json() as { data?: ImportResult; error?: string };
      if (j.data) setImportResult(j.data);
      else setImportError(j.error ?? "Import failed");
    } catch (e) {
      setImportError(String(e));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tools</h1>
        <p className="text-slate-400 text-sm mt-1">Import, export, and monitor your site.</p>
      </div>

      {/* ── Site Health ─────────────────────────────────────────────────── */}
      <Section title="Site Health" icon={Activity}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            {health ? `Last checked: ${new Date(health.timestamp).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", second: "2-digit" })}` : "Not checked yet"}
          </p>
          <button
            onClick={loadHealth}
            disabled={healthLoading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {healthLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Refresh
          </button>
        </div>

        {healthLoading && !health && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> Checking…
          </div>
        )}

        {health && (
          <div className="space-y-5">
            {/* Database */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database size={14} className="text-slate-500" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Database</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Connection", value: health.db.status, ok: health.db.status === "connected" },
                  { label: "Posts",      value: String(health.db.posts),  ok: true },
                  { label: "Pages",      value: String(health.db.pages),  ok: true },
                ].map((row) => (
                  <div key={row.label} className="bg-slate-800/60 rounded-lg p-3 flex flex-col gap-1">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <div className="flex items-center gap-1.5">
                      <StatusDot ok={row.ok} />
                      <span className="text-sm text-white font-medium">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Runtime */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={14} className="text-slate-500" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Runtime</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Node.js",  value: health.runtime.nodeVersion },
                  { label: "Next.js",  value: health.runtime.nextVersion },
                  { label: "Platform", value: health.runtime.platform },
                  { label: "Uptime",   value: formatUptime(health.runtime.uptime) },
                ].map((row) => (
                  <div key={row.label} className="bg-slate-800/60 rounded-lg p-3">
                    <span className="text-xs text-slate-500 block">{row.label}</span>
                    <span className="text-sm text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Server size={14} className="text-slate-500" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Environment Variables</span>
              </div>
              <div className="space-y-1.5">
                {health.env.map((e) => (
                  <div key={e.key} className="flex items-center gap-2 text-sm">
                    <StatusDot ok={e.set} />
                    <code className="text-slate-300 font-mono text-xs">{e.key}</code>
                    <span className={`text-xs ml-auto ${e.set ? "text-emerald-400" : "text-red-400"}`}>
                      {e.set ? "Set" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Export ─────────────────────────────────────────────────────────── */}
      <Section title="Export" icon={Download}>
        <p className="text-sm text-slate-400 mb-4">
          Download your content as a JSON file. Use this to back up or migrate to another instance.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-slate-700 overflow-hidden text-sm">
            {(["all", "posts", "pages"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setExportType(t)}
                className={`px-4 py-2 capitalize transition-colors ${
                  exportType === t
                    ? "bg-amber-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {t === "all" ? "All Content" : t}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Download JSON
          </button>
        </div>
      </Section>

      {/* ── Import ─────────────────────────────────────────────────────────── */}
      <Section title="Import" icon={Upload}>
        <p className="text-sm text-slate-400 mb-4">
          Upload a previously exported JSON file. Existing posts/pages (matched by slug) will be skipped.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleImport(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-amber-500 bg-amber-500/5"
              : "border-slate-700 hover:border-slate-600 bg-slate-800/30"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }}
          />
          {importing ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">Importing…</span>
            </div>
          ) : (
            <>
              <FileJson size={28} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-300 font-medium">Drop export.json here or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">Only .json files from this system&apos;s Export tool</p>
            </>
          )}
        </div>

        {importError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-900/20 rounded-lg px-4 py-3">
            <XCircle size={15} /> {importError}
          </div>
        )}
        {importResult && (
          <div className="mt-3 bg-emerald-900/20 border border-emerald-800/40 rounded-lg px-4 py-3 text-sm text-emerald-300 space-y-1">
            <p className="font-semibold">Import complete</p>
            <p>Posts: {importResult.posts.inserted} inserted, {importResult.posts.skipped} skipped</p>
            <p>Pages: {importResult.pages.inserted} inserted, {importResult.pages.skipped} skipped</p>
          </div>
        )}
      </Section>
    </div>
  );
}
