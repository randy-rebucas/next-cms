"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Scale,
  ChevronRight,
  Menu,
  X,
  Image as ImageIcon,
  Layout,
  Tag,
  FolderOpen,
  Palette,
  Puzzle,
  Users,
  Loader2,
  MessageSquare,
  Navigation,
  Wrench,
} from "lucide-react";
import type { Role } from "@/core/rbac";

// ── Auth Context ──────────────────────────────────────────────────────────────

interface AuthCtxValue {
  pin: string;
  user: { id: string; name?: string | null; email?: string | null; role: Role } | null;
  logout: () => void;
}

const AuthCtx = createContext<AuthCtxValue>({
  pin: "",
  user: null,
  logout: () => {},
});
export const useAdminAuth = () => useContext(AuthCtx);

// ── Nav Items ─────────────────────────────────────────────────────────────────

// ── Nav Groups ───────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    group: null,
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/posts",      label: "Posts",      icon: FileText },
      { href: "/admin/pages",      label: "Pages",      icon: Layout },
      { href: "/admin/comments",   label: "Comments",   icon: MessageSquare },
      { href: "/admin/media",      label: "Media",      icon: ImageIcon },
      { href: "/admin/categories", label: "Categories", icon: FolderOpen },
      { href: "/admin/tags",       label: "Tags",       icon: Tag },
    ],
  },
  {
    group: "Appearance",
    items: [
      { href: "/admin/theme",   label: "Theme",   icon: Palette },
      { href: "/admin/menus",   label: "Menus",   icon: Navigation },
      { href: "/admin/plugins", label: "Plugins", icon: Puzzle },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/users",    label: "Users",    icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/tools",    label: "Tools",    icon: Wrench },
    ],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const ctx = useAdminAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-slate-900 border-r border-slate-800 z-30 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
          <Scale size={20} className="text-amber-500 shrink-0" />
          <span className="text-white font-bold text-base">
            <span className="text-amber-500">next</span>CMS
          </span>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white lg:hidden">
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_GROUPS.map(({ group, items }) => (
            <div key={group ?? "__root"} className="mb-1">
              {group && (
                <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600 select-none">
                  {group}
                </p>
              )}
              {items.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href ||
                  (href !== "/admin/dashboard" && pathname.startsWith(href));
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
                    <Icon
                      size={16}
                      className={active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"}
                    />
                    {label}
                    {active && <ChevronRight size={14} className="ml-auto text-amber-500/60" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4 space-y-2">
          {ctx.user && (
            <p className="text-xs text-slate-500 truncate px-1">
              {ctx.user.email}
              <span className="ml-1 text-slate-600">({ctx.user.role})</span>
            </p>
          )}
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
            onClick={ctx.logout}
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

// ── Inner shell — lives inside SessionProvider, uses useSession() ─────────────

function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [pin, setPin] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [status, router, pathname]);

  // After session is established, fetch the legacy admin PIN for backward compat
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/pin")
      .then((r) => r.json())
      .then((j: { pin?: string }) => setPin(j.pin ?? ""))
      .catch(() => {});
  }, [status]);

  // Redirect /admin root → /admin/dashboard
  useEffect(() => {
    if (status === "authenticated" && pathname === "/admin") {
      router.replace("/admin/dashboard");
    }
  }, [status, pathname, router]);

  // Login page: render it directly — it manages its own UI
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-amber-500 animate-spin" size={32} />
      </div>
    );
  }

  if (pathname === "/admin") return null;

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  const logout = () => signOut({ callbackUrl: "/admin/login" });

  return (
    <AuthCtx.Provider value={{ pin, user, logout }}>
      <div className="min-h-screen bg-slate-950 text-slate-100 lg:pl-56">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm text-slate-400">
            {NAV_GROUPS.flatMap((g) => g.items).find(
              (n) =>
                pathname === n.href ||
                (n.href !== "/admin/dashboard" && pathname.startsWith(n.href))
            )?.label ?? "Admin"}
          </span>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </AuthCtx.Provider>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
