"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Clock,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  ExternalLink,
  Scale,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

// ── Auth Context ─────────────────────────────────────────────────────────────

const AuthCtx = createContext<{ pin: string; logout: () => void }>({ pin: "", logout: () => {} });
export const useAdminAuth = () => useContext(AuthCtx);

// ── Nav Items ────────────────────────────────────────────────────────────────

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/practice-areas", label: "Practice Areas", icon: Briefcase },
  { href: "/admin/experience", label: "Experience", icon: Clock },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// ── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (pin: string) => Promise<boolean> }) {
  const [val, setVal] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const attempt = async () => {
    if (!val || checking) return;
    setChecking(true);
    setError(false);
    const ok = await onLogin(val);
    if (!ok) {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-2xl mb-4">
            <Scale size={32} className="text-white" />
          </div>
          <h1 className="text-white font-bold text-2xl">Baligod Law</h1>
          <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
          <label className="block text-xs font-semibold text-slate-400 mb-2">Enter Admin PIN</label>
          <input
            type="password"
            autoFocus
            placeholder="••••"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors mb-4 ${
              error ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-amber-500"
            }`}
          />
          {error && <p className="text-red-400 text-xs mb-3">Incorrect PIN. Try again.</p>}
          <button
            onClick={attempt}
            disabled={checking}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {checking ? "Verifying…" : "Log In"}
          </button>
          <p className="text-slate-600 text-xs text-center mt-4">
            Default PIN: 1234 &bull; Change in Admin → Settings
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const auth = useAdminAuth();

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-slate-900 border-r border-slate-800 z-30 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
          <Scale size={20} className="text-amber-500 shrink-0" />
          <span className="text-white font-bold text-base">
            <span className="text-amber-500">Baligod</span> Law
          </span>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors group ${
                  active
                    ? "bg-amber-600/15 text-amber-400 border-r-2 border-amber-500"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon size={16} className={active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-amber-500/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ExternalLink size={13} />
            View Site
          </a>
          <button
            onClick={auth.logout}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={13} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pin, setPin] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("adminPin");
    setPin(stored ?? ""); // null (nothing stored) → "" = show login
  }, []);

  const doLogin = async (attempt: string): Promise<boolean> => {
    const verifyRes = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": attempt },
      body: JSON.stringify({}),
    });
    if (verifyRes.ok) {
      sessionStorage.setItem("adminPin", attempt);
      setPin(attempt);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem("adminPin");
    setPin(null);
    router.push("/admin");
  };

  useEffect(() => {
    if (pin && pathname === "/admin") {
      router.replace("/admin/dashboard");
    }
  }, [pin, pathname, router]);

  // Still loading from sessionStorage
  if (pin === null) return null;

  // Not authenticated
  if (!pin) return <LoginScreen onLogin={doLogin} />;

  // Redirect /admin → /admin/dashboard (handled in useEffect above)
  if (pathname === "/admin") return null;

  return (
    <AuthCtx.Provider value={{ pin, logout }}>
      <div className="min-h-screen bg-slate-950 text-slate-100 lg:pl-56">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm text-slate-400">
            {NAV.find((n) => pathname === n.href || (n.href !== "/admin/dashboard" && pathname.startsWith(n.href)))?.label ?? "Admin"}
          </span>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </AuthCtx.Provider>
  );
}
