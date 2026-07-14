"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Check, Pencil, Trash } from "./Icons";

type Credential = {
  id: number;
  appName: string;
  category: string;
  username: string | null;
  email: string | null;
  password: string | null;
  url: string | null;
  notes: string | null;
};

const CATEGORIES = [
  { value: "email",    label: "Email",          icon: "📧", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "banking",  label: "Banking",        icon: "🏦", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { value: "social",   label: "Social Media",   icon: "💬", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { value: "shopping", label: "Shopping",       icon: "🛒", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  { value: "work",     label: "Work / Office",  icon: "💼", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { value: "govt",     label: "Government",     icon: "🏛️", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "other",    label: "Other",          icon: "🔑", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
];

function catInfo(v: string) { return CATEGORIES.find(c => c.value === v) ?? CATEGORIES[CATEGORIES.length - 1]; }

const cls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

function CredentialFormModal({ cred, onClose, onSaved }: { cred: Credential | null; onClose: () => void; onSaved: () => void }) {
  const [appName, setAppName] = useState(cred?.appName ?? "");
  const [category, setCategory] = useState(cred?.category ?? "other");
  const [username, setUsername] = useState(cred?.username ?? "");
  const [email, setEmail] = useState(cred?.email ?? "");
  const [password, setPassword] = useState(cred?.password ?? "");
  const [url, setUrl] = useState(cred?.url ?? "");
  const [notes, setNotes] = useState(cred?.notes ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appName.trim()) { setError("App name is required."); return; }
    setSaving(true); setError("");
    const url2 = cred ? `/api/credentials/${cred.id}` : "/api/credentials";
    const res = await fetch(url2, {
      method: cred ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appName: appName.trim(), category, username: username.trim() || null, email: email.trim() || null, password: password || null, url: url.trim() || null, notes: notes.trim() || null }),
    });
    if (!res.ok) { setError("Failed to save."); setSaving(false); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{cred ? "Edit Credential" : "Add Credential"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App / Website *</label>
              <input type="text" value={appName} onChange={e => setAppName(e.target.value)} placeholder="e.g. Gmail, HDFC" className={cls} required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={cls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username / ID</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="optional" className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="optional" className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password / PIN</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="optional" className={`${cls} pr-10`} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL / Website</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="optional" className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="optional" className={`${cls} resize-y`} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5">
              <X className="w-4 h-4" />Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
              {saving ? "Saving..." : <><Check className="w-4 h-4" />{cred ? "Update" : "Add"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CredentialCard({ cred, onEdit, onDelete }: { cred: Credential; onEdit: () => void; onDelete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const cat = catInfo(cred.category);

  function copy(value: string, field: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cat.icon}</span>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{cred.appName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-gray-300 hover:text-indigo-500 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors"><Trash className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {cred.username && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-400 shrink-0">Username</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-gray-700 dark:text-gray-200 truncate font-mono text-xs">{cred.username}</span>
              <button onClick={() => copy(cred.username!, "username")} className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700">{copied === "username" ? "✓" : "Copy"}</button>
            </div>
          </div>
        )}
        {cred.email && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-400 shrink-0">Email</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-gray-700 dark:text-gray-200 truncate font-mono text-xs">{cred.email}</span>
              <button onClick={() => copy(cred.email!, "email")} className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700">{copied === "email" ? "✓" : "Copy"}</button>
            </div>
          </div>
        )}
        {cred.password && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-400 shrink-0">Password</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-gray-700 dark:text-gray-200 font-mono text-xs">{revealed ? cred.password : "••••••••"}</span>
              <button onClick={() => setRevealed(v => !v)} className="shrink-0 text-xs text-gray-400 hover:text-gray-600">{revealed ? "Hide" : "Show"}</button>
              <button onClick={() => copy(cred.password!, "password")} className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700">{copied === "password" ? "✓" : "Copy"}</button>
            </div>
          </div>
        )}
        {cred.url && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-400 shrink-0">URL</span>
            <a href={cred.url.startsWith("http") ? cred.url : `https://${cred.url}`} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline text-xs truncate">{cred.url}</a>
          </div>
        )}
        {cred.notes && <p className="text-xs text-gray-400 pt-1 border-t border-gray-50 dark:border-gray-700">{cred.notes}</p>}
      </div>
    </div>
  );
}

export default function CredentialsPage() {
  const [creds, setCreds] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Credential | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/credentials").then(r => r.json()).then(data => { setCreds(data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteCred(id: number) {
    if (!confirm("Delete this credential?")) return;
    await fetch(`/api/credentials/${id}`, { method: "DELETE" });
    setCreds(prev => prev.filter(c => c.id !== id));
  }

  const q = search.trim().toLowerCase();
  const filtered = creds
    .filter(c => filterCat === "all" || c.category === filterCat)
    .filter(c => !q || c.appName.toLowerCase().includes(q) || (c.username ?? "").toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q) || (c.notes ?? "").toLowerCase().includes(q));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Credentials</h1>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />Add Credential
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by app, username or email..." className="w-full pl-9 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button onClick={() => setFilterCat("all")} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
          All ({creds.length})
        </button>
        {CATEGORIES.map(c => {
          const count = creds.filter(cr => cr.category === c.value).length;
          if (count === 0) return null;
          return (
            <button key={c.value} onClick={() => setFilterCat(c.value)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === c.value ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
              {c.icon} {c.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-center py-12 text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-400 mb-2">{creds.length === 0 ? "No credentials saved yet" : "No results found"}</p>
          {creds.length === 0 && <button onClick={() => setShowForm(true)} className="text-indigo-600 hover:underline text-sm">Add your first credential →</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CredentialCard key={c.id} cred={c} onEdit={() => { setEditTarget(c); setShowForm(true); }} onDelete={() => deleteCred(c.id)} />
          ))}
        </div>
      )}

      {showForm && (
        <CredentialFormModal
          cred={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { setShowForm(false); setEditTarget(null); load(); }}
        />
      )}
    </div>
  );
}
