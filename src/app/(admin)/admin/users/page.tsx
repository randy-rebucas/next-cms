"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  ShieldCheck,
  Eye,
  PenLine,
  BookOpen,
} from "lucide-react";
import type { Role } from "@/core/rbac";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
  createdAt: string;
}

const ROLE_LABELS: Record<Role, { label: string; color: string; icon: React.ReactNode }> = {
  admin: {
    label: "Admin",
    color: "bg-amber-900/50 text-amber-300 border-amber-700",
    icon: <ShieldCheck size={12} />,
  },
  editor: {
    label: "Editor",
    color: "bg-blue-900/50 text-blue-300 border-blue-700",
    icon: <PenLine size={12} />,
  },
  author: {
    label: "Author",
    color: "bg-violet-900/50 text-violet-300 border-violet-700",
    icon: <BookOpen size={12} />,
  },
  subscriber: {
    label: "Subscriber",
    color: "bg-slate-700 text-slate-300 border-slate-600",
    icon: <Eye size={12} />,
  },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const EMPTY: Partial<UserRow & { password: string }> = {
  name: "",
  email: "",
  role: "author",
  password: "",
};

export default function UsersPage() {
  const { pin: _pin } = useAdminAuth(); // pin reserved for future admin-only API calls
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<Partial<UserRow & { password: string }>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((data: UserRow[]) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY);
    setModal("create");
  };

  const openEdit = (u: UserRow) => {
    setForm({ ...u, password: "" });
    setModal("edit");
  };

  const save = async () => {
    setSaving(true);
    const isNew = modal === "create";
    const url = isNew ? "/api/users" : `/api/users/${form._id}`;
    const method = isNew ? "POST" : "PUT";
    const body = { ...form };
    if (!isNew && !body.password) delete body.password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      showToast(isNew ? "User created" : "User updated");
      setModal(null);
      load();
    } else {
      const j = await res.json();
      showToast((j as { error?: string }).error ?? "Error");
    }
    setSaving(false);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Deleted");
      load();
    }
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const INPUT =
    "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500";

  return (
    <div className="max-w-4xl">
      {/* Fixed toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-800 border border-slate-700 text-sm text-green-400 px-4 py-2.5 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">Manage admin users and their roles</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-amber-500" size={28} />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const roleMeta = ROLE_LABELS[u.role];
                return (
                  <tr key={u._id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${roleMeta.color}`}>
                        {roleMeta.icon}
                        {roleMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">
                {modal === "create" ? "Add User" : "Edit User"}
              </h2>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
                <input type="text" className={INPUT} value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                <input type="email" className={INPUT} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {modal === "edit" ? "New Password (leave blank to keep)" : "Password"}
                </label>
                <input type="password" className={INPUT} value={form.password ?? ""} onChange={(e) => set("password", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
                <select
                  className={INPUT}
                  value={form.role ?? "subscriber"}
                  onChange={(e) => set("role", e.target.value as Role)}
                >
                  <option value="admin">Admin — full access</option>
                  <option value="editor">Editor — manage content</option>
                  <option value="author">Author — create own posts</option>
                  <option value="subscriber">Subscriber — read only</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {modal === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
