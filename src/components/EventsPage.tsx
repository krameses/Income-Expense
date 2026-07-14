"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Check, Pencil, Trash } from "./Icons";

type EventItem = {
  id: number;
  name: string;
  date: string;
  category: string;
  isRecurring: boolean;
  notes: string | null;
  nextOccurrence: string;
  daysUntil: number;
};

const CATEGORIES = [
  { value: "birthday",           label: "Birthday",            color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
  { value: "wedding_anniversary",label: "Wedding Anniversary", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  { value: "death_anniversary",  label: "Death Anniversary",   color: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
  { value: "license",            label: "License Renewal",     color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "insurance",          label: "Insurance",           color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "medical",            label: "Medical",             color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { value: "holiday",            label: "Holiday",             color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { value: "other",              label: "Other",               color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
];

const CATEGORY_ICONS: Record<string, string> = {
  birthday: "🎂", wedding_anniversary: "💍", death_anniversary: "🕯️",
  license: "📋", insurance: "🛡️", medical: "🏥", holiday: "🎉", other: "📌",
};

function catInfo(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysLabel(days: number) {
  if (days === 0) return { text: "Today!", cls: "text-red-600 font-bold" };
  if (days === 1) return { text: "Tomorrow", cls: "text-orange-500 font-semibold" };
  if (days <= 7)  return { text: `In ${days} days`, cls: "text-amber-500 font-medium" };
  if (days < 0)   return { text: `${Math.abs(days)} days ago`, cls: "text-gray-400" };
  return { text: `In ${days} days`, cls: "text-gray-500" };
}

// ─── Event Form Modal ─────────────────────────────────────────────────────────
function EventFormModal({ event, onClose, onSaved }: { event: EventItem | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(event?.name ?? "");
  const [date, setDate] = useState(event?.date?.slice(0, 10) ?? "");
  const [category, setCategory] = useState(event?.category ?? "birthday");
  const [isRecurring, setIsRecurring] = useState(event?.isRecurring ?? true);
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) { setError("Name and date are required."); return; }
    setSaving(true); setError("");
    const url = event ? `/api/events/${event.id}` : "/api/events";
    const method = event ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), date, category, isRecurring, notes: notes.trim() || null }) });
    if (!res.ok) { setError("Failed to save."); setSaving(false); return; }
    onSaved();
  }

  const cls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{event ? "Edit Event" : "Add Event"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mom's Birthday" className={cls} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={cls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{CATEGORY_ICONS[c.value]} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={cls} required />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
            <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">
              Yearly recurring <span className="text-gray-400 text-xs">(birthdays, anniversaries)</span>
            </label>
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
              {saving ? "Saving..." : <><Check className="w-4 h-4" />{event ? "Update" : "Add Event"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────
function EventRow({ event, onEdit, onDelete }: { event: EventItem; onEdit: () => void; onDelete: () => void }) {
  const cat = catInfo(event.category);
  const { text, cls } = daysLabel(event.daysUntil);
  const isUpcoming = event.daysUntil >= 0 && event.daysUntil <= 7;

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${isUpcoming ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
      <span className="text-2xl shrink-0">{CATEGORY_ICONS[event.category] ?? "📌"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-800 dark:text-gray-100">{event.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
          {event.isRecurring && <span className="text-xs text-gray-400">↻ yearly</span>}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-xs text-gray-400">{event.isRecurring ? fmtDate(event.nextOccurrence) : fmtDate(event.date)}</p>
          {event.notes && <p className="text-xs text-gray-400 truncate max-w-[200px]">{event.notes}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-sm ${cls}`}>{text}</span>
        <button onClick={onEdit} className="text-gray-300 hover:text-indigo-500 transition-colors"><Pencil className="w-4 h-4" /></button>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors"><Trash className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<EventItem | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/events").then(r => r.json()).then(data => { setEvents(data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteEvent(id: number) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const upcoming = events.filter(e => e.daysUntil >= 0 && e.daysUntil <= 7);
  const q = search.trim().toLowerCase();
  const filtered = events
    .filter(e => filterCat === "all" || e.category === filterCat)
    .filter(e => !q || e.name.toLowerCase().includes(q) || (e.notes ?? "").toLowerCase().includes(q));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Events & Reminders</h1>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />Add Event
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full pl-9 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upcoming banner */}
      {upcoming.length > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-3">Coming up this week</p>
          <div className="flex flex-col gap-2">
            {upcoming.map(e => {
              const { text, cls } = daysLabel(e.daysUntil);
              return (
                <div key={e.id} className="flex items-center gap-3">
                  <span className="text-lg">{CATEGORY_ICONS[e.category]}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100 text-sm">{e.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(e.nextOccurrence)}</span>
                  <span className={`text-xs ml-auto ${cls}`}>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setFilterCat("all")} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
          All ({events.length})
        </button>
        {CATEGORIES.map(c => {
          const count = events.filter(e => e.category === c.value).length;
          if (count === 0) return null;
          return (
            <button key={c.value} onClick={() => setFilterCat(c.value)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === c.value ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
              {CATEGORY_ICONS[c.value]} {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Events list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No events yet</p>
            <button onClick={() => setShowForm(true)} className="text-indigo-600 hover:underline text-sm">Add your first event →</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {filtered.map(e => (
              <EventRow key={e.id} event={e} onEdit={() => { setEditTarget(e); setShowForm(true); }} onDelete={() => deleteEvent(e.id)} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <EventFormModal
          event={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { setShowForm(false); setEditTarget(null); load(); }}
        />
      )}
    </div>
  );
}
