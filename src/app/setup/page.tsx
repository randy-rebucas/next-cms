"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  Database,
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type WizardStep = "loading" | "welcome" | "database" | "site" | "admin" | "installing" | "complete";

interface FormData {
  uri: string;
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirm: string;
}

interface StepMeta {
  id: number;
  label: string;
  icon: React.ReactNode;
  step: WizardStep;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STEPS: StepMeta[] = [
  { id: 1, label: "Database",   icon: <Database size={14} />,  step: "database" },
  { id: 2, label: "Site Info",  icon: <Globe size={14} />,     step: "site" },
  { id: 3, label: "Admin",      icon: <User size={14} />,      step: "admin" },
  { id: 4, label: "Install",    icon: <Sparkles size={14} />,  step: "installing" },
];

const ACTIVE_STEPS: WizardStep[] = ["database", "site", "admin", "installing", "complete"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function currentStepIndex(step: WizardStep): number {
  return ACTIVE_STEPS.indexOf(step);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: WizardStep }) {
  const idx = currentStepIndex(current);
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((s, i) => {
        const stepIdx = currentStepIndex(s.step);
        const done = idx > stepIdx || current === "complete";
        const active = idx === stepIdx;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                done
                  ? "bg-amber-600 text-white"
                  : active
                  ? "bg-amber-600/20 border border-amber-500 text-amber-400"
                  : "bg-slate-800 border border-slate-700 text-slate-500"
              }`}
            >
              {done ? <CheckCircle size={12} /> : s.icon}
              <span className="hidden sm:inline">{s.label}</span>
              {!done && <span className="sm:hidden">{s.id}</span>}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-6 transition-colors ${
                  done ? "bg-amber-600" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InputField({
  label, type = "text", value, onChange, placeholder, hint, required = false, autoComplete,
  rightEl,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  rightEl?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-amber-500 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none transition-colors"
        />
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function Alert({ type, message }: { type: "error" | "success"; message: string }) {
  const isError = type === "error";
  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm ${
        isError
          ? "bg-red-950/50 border border-red-800 text-red-300"
          : "bg-green-950/50 border border-green-800 text-green-300"
      }`}
    >
      {isError ? <XCircle size={16} className="shrink-0 mt-0.5" /> : <CheckCircle size={16} className="shrink-0 mt-0.5" />}
      <span>{message}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("loading");
  const [skipDbStep, setSkipDbStep] = useState(false);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const [dbOk, setDbOk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState<FormData>({
    uri: "",
    siteName: "",
    siteTagline: "",
    siteUrl: typeof window !== "undefined" ? window.location.origin : "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPasswordConfirm: "",
  });

  const set = (key: keyof FormData) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  // ── Check setup status on mount ─────────────────────────────────────────
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/setup/status");
        const data = await res.json() as {
          complete?: boolean;
          hasUri?: boolean;
          hasAdmin?: boolean;
          autoCompleted?: boolean;
        };

        if (data.complete) {
          router.replace("/admin/dashboard");
          return;
        }

        if (data.hasUri) {
          // URI already in .env.local — skip DB step
          setSkipDbStep(true);
          setDbOk(true);
          setStep("welcome");
        } else {
          setStep("welcome");
        }
      } catch {
        setStep("welcome");
      }
    }
    void checkStatus();
  }, [router]);

  // ── Test DB connection ──────────────────────────────────────────────────
  const testConnection = async () => {
    setError("");
    setDbOk(false);
    setTesting(true);
    try {
      const res = await fetch("/api/setup/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri: form.uri }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setDbOk(true);
      } else {
        setError(data.error ?? "Connection failed.");
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setTesting(false);
    }
  };

  // ── Run installation ────────────────────────────────────────────────────
  const runInstall = async () => {
    setStep("installing");
    setError("");
    try {
      const res = await fetch("/api/setup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uri: form.uri || "", // empty string → API falls back to existing MONGODB_URI env var
          siteName: form.siteName,
          siteTagline: form.siteTagline,
          siteUrl: form.siteUrl,
          adminName: form.adminName,
          adminEmail: form.adminEmail,
          adminPassword: form.adminPassword,
        }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setStep("complete");
      } else {
        setError(data.error ?? "Installation failed.");
        setStep("admin");
      }
    } catch {
      setError("Network error during installation.");
      setStep("admin");
    }
  };

  // ── Navigation guards ───────────────────────────────────────────────────
  const canProceedDb = skipDbStep || dbOk;

  const canProceedSite = form.siteName.trim().length > 0;

  const canProceedAdmin =
    form.adminName.trim() &&
    form.adminEmail.includes("@") &&
    form.adminPassword.length >= 8 &&
    form.adminPassword === form.adminPasswordConfirm;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Scale size={28} className="text-amber-500" />
        <span className="text-white font-bold text-xl">
          <span className="text-amber-500">next</span>CMS
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 h-1" />

        <div className="p-8">

          {/* Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 size={40} className="text-amber-500 animate-spin" />
              <p className="text-slate-400 text-sm">Checking installation status…</p>
            </div>
          )}

          {/* Welcome */}
          {step === "welcome" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-amber-600/20 border border-amber-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={28} className="text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Welcome!</h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                Before getting started, we need some information about your database and site.
                This setup will only take a few minutes.
              </p>
              <p className="text-slate-500 text-xs mb-8">
                In plain terms, you will need your <span className="text-amber-400 font-medium">MongoDB connection string</span>, desired
                site title, and an admin username / password.
              </p>
              <button
                onClick={() => setStep(skipDbStep ? "site" : "database")}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
              >
                Let&apos;s go! <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 1 — Database */}
          {step === "database" && (
            <div>
              <StepIndicator current="database" />
              <h2 className="text-xl font-bold text-white mb-1">Database Connection</h2>
              <p className="text-slate-400 text-sm mb-6">
                Enter your MongoDB connection string. We&apos;ll test it before continuing.
              </p>

              <div className="space-y-4">
                <InputField
                  label="MongoDB Connection String"
                  value={form.uri}
                  onChange={(v) => { set("uri")(v); setDbOk(false); setError(""); }}
                  placeholder="mongodb+srv://user:password@cluster.mongodb.net/dbname"
                  hint="Copy this from MongoDB Atlas → Connect → Compass or Drivers."
                  autoComplete="off"
                />

                {error && <Alert type="error" message={error} />}
                {dbOk && <Alert type="success" message="Connection successful! Ready to continue." />}

                <button
                  onClick={testConnection}
                  disabled={!form.uri.trim() || testing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <><Loader2 size={15} className="animate-spin" /> Testing connection…</>
                  ) : (
                    <><Database size={15} className=" text-amber-400" /> Test Connection</>
                  )}
                </button>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep("welcome")}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => { setError(""); setStep("site"); }}
                  disabled={!canProceedDb}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Site Info */}
          {step === "site" && (
            <div>
              <StepIndicator current="site" />
              <h2 className="text-xl font-bold text-white mb-1">Site Information</h2>
              <p className="text-slate-400 text-sm mb-6">
                Tell us about your site. You can always change these later in the admin settings.
              </p>

              <div className="space-y-4">
                <InputField
                  label="Site Title"
                  value={form.siteName}
                  onChange={set("siteName")}
                  placeholder="Baligod Law Office"
                  required
                />
                <InputField
                  label="Tagline"
                  value={form.siteTagline}
                  onChange={set("siteTagline")}
                  placeholder="Fighting for accountability and justice."
                  hint="A brief description of your site."
                />
                <InputField
                  label="Site URL"
                  value={form.siteUrl}
                  onChange={set("siteUrl")}
                  placeholder="https://baligodlaw.ph"
                  hint="Full URL including https://"
                />
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(skipDbStep ? "welcome" : "database")}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setStep("admin")}
                  disabled={!canProceedSite}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Admin Account */}
          {step === "admin" && (
            <div>
              <StepIndicator current="admin" />
              <h2 className="text-xl font-bold text-white mb-1">Administrator Account</h2>
              <p className="text-slate-400 text-sm mb-6">
                Create your administrator login. Use a strong password — this is the master account.
              </p>

              {error && (
                <div className="mb-4">
                  <Alert type="error" message={error} />
                </div>
              )}

              <div className="space-y-4">
                <InputField
                  label="Full Name"
                  value={form.adminName}
                  onChange={set("adminName")}
                  placeholder="Atty. Levito Baligod"
                  required
                  autoComplete="name"
                />
                <InputField
                  label="Email Address"
                  type="email"
                  value={form.adminEmail}
                  onChange={set("adminEmail")}
                  placeholder="admin@baligodlaw.ph"
                  required
                  autoComplete="email"
                  hint="You will use this to log in."
                />
                <InputField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.adminPassword}
                  onChange={set("adminPassword")}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                  hint={
                    form.adminPassword && form.adminPassword.length < 8
                      ? "⚠ Password must be at least 8 characters."
                      : undefined
                  }
                  rightEl={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                <InputField
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  value={form.adminPasswordConfirm}
                  onChange={set("adminPasswordConfirm")}
                  placeholder="Repeat password"
                  required
                  autoComplete="new-password"
                  hint={
                    form.adminPasswordConfirm &&
                    form.adminPassword !== form.adminPasswordConfirm
                      ? "⚠ Passwords do not match."
                      : undefined
                  }
                  rightEl={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => { setError(""); setStep("site"); }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={runInstall}
                  disabled={!canProceedAdmin}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Lock size={14} /> Install Now
                </button>
              </div>
            </div>
          )}

          {/* Installing */}
          {step === "installing" && (
            <div className="flex flex-col items-center py-12 gap-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-amber-600/20 flex items-center justify-center">
                  <Loader2 size={36} className="text-amber-500 animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mt-2">Installing…</h2>
              <div className="space-y-1.5 text-left text-sm text-slate-400 mt-2">
                {[
                  "Connecting to database",
                  "Creating admin user",
                  "Saving site settings",
                  "Writing configuration",
                ].map((item, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-amber-500 shrink-0" />
                    {item}…
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Complete */}
          {step === "complete" && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-900/30 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Installation Complete!</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                Your site has been successfully configured.
                <strong className="text-white">{form.siteName && ` ${form.siteName}`}</strong> is ready.
              </p>
              <div className="bg-amber-950/40 border border-amber-700/40 rounded-xl p-4 my-6 text-left text-xs text-amber-200 space-y-1">
                <p className="font-semibold text-amber-400 text-sm mb-2">⚠ Important</p>
                <p>Your <code className="bg-slate-800 px-1 rounded">.env.local</code> has been updated with your database URI and <code className="bg-slate-800 px-1 rounded">SETUP_COMPLETE=true</code>.</p>
                <p className="mt-1.5">In <strong>production</strong>, restart your server to apply the new configuration.</p>
                <p>In <strong>development</strong>, Next.js will restart automatically.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/admin/login"
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2 justify-center"
                >
                  Log In <ArrowRight size={16} />
                </a>
                <a
                  href="/"
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-xl transition-colors inline-flex items-center gap-2 justify-center"
                >
                  Visit Site
                </a>
              </div>

              <p className="text-xs text-slate-600 mt-6 flex items-center justify-center gap-1">
                <RefreshCw size={11} />
                If the admin redirects to /setup again, refresh the page after ~2 seconds.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Footer note */}
      {step !== "loading" && step !== "complete" && step !== "installing" && (
        <p className="text-xs text-slate-600 mt-6">
          Already set up?{" "}
          <a href="/admin/login" className="text-amber-600 hover:text-amber-400 transition-colors">
            Log in to admin
          </a>
        </p>
      )}
    </div>
  );
}
