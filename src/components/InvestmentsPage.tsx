"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Check, Pencil, Trash, ChevronDown, ChevronUp } from "./Icons";

const TYPES = [
  { value: "chit", label: "Chit Fund", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
  { value: "mutual_fund", label: "Mutual Fund", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  { value: "stocks", label: "Stocks", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  { value: "fd", label: "Fixed Deposit", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
  { value: "rd", label: "Recurring Deposit", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400" },
  { value: "gold", label: "Gold", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
];

function typeLabel(value: string) { return TYPES.find(t => t.value === value)?.label ?? value; }
function typeBadge(value: string) { return TYPES.find(t => t.value === value)?.color ?? "bg-gray-100 text-gray-600"; }

type Investment = {
  id: number;
  name: string;
  type: string;
  targetAmount: number | null;
  isActive: boolean;
  notes: string | null;
  totalInvested: number;
  entryCount: number;
  lastEntryDate: string | null;
};

type Entry = { id: number; investmentId: number; date: string; amount: number; notes: string | null };
type InvestmentDetail = Investment & { entries: Entry[] };

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Investment Form Modal ────────────────────────────────────────────────────
function InvestmentFormModal({ inv, onClose, onSaved }: { inv: Investment | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(inv?.name ?? "");
  const [type, setType] = useState(inv?.type ?? "chit");
  const [targetAmount, setTargetAmount] = useState(inv?.targetAmount?.toString() ?? "");
  const [notes, setNotes] = useState(inv?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError("");
    const payload = { name: name.trim(), type, targetAmount: targetAmount ? parseFloat(targetAmount) : null, notes: notes.trim() || null };
    const url = inv ? `/api/investments/${inv.id}` : "/api/investments";
    const res = await fetch(url, { method: inv ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { setError("Failed to save."); setSaving(false); return; }
    onSaved();
  }

  const cls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{inv ? "Edit Investment" : "Add Investment"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gold Chit - NAC" className={cls} required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select value={type} onChange={e => setType(e.target.value)} className={cls}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount (₹) <span className="text-gray-400 font-normal">optional</span></label>
            <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="e.g. total chit value" min="0" className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${cls} resize-y`} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5">
              <X className="w-4 h-4" />Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
              {saving ? "Saving..." : <><Check className="w-4 h-4" />{inv ? "Update" : "Add"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Investment Detail Modal ──────────────────────────────────────────────────
function InvestmentDetailModal({ inv, onClose, onUpdated, onEdit }: {
  inv: InvestmentDetail; onClose: () => void; onUpdated: () => void; onEdit: () => void;
}) {
  const [entries, setEntries] = useState<Entry[]>(inv.entries);
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [entryNotes, setEntryNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/investments/${inv.id}/entries`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, amount: parseFloat(amount), notes: entryNotes.trim() || null }),
    });
    if (res.ok) {
      const entry = await res.json();
      setEntries(prev => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setAmount(""); setEntryNotes(""); setShowAdd(false);
      onUpdated();
    }
    setSaving(false);
  }

  async function deleteEntry(id: number) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/investments/${inv.id}/entries/${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
    onUpdated();
  }

  async function toggleActive() {
    await fetch(`/api/investments/${inv.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: inv.name, type: inv.type, targetAmount: inv.targetAmount, isActive: !inv.isActive, notes: inv.notes }),
    });
    onUpdated(); onClose();
  }

  async function deleteInvestment() {
    if (!confirm("Permanently delete this investment and all entries?")) return;
    await fetch(`/api/investments/${inv.id}`, { method: "DELETE" });
    onUpdated(); onClose();
  }

  const totalInvested = entries.reduce((s, e) => s + e.amount, 0);
  const prog = inv.targetAmount ? Math.min(100, Math.round(totalInvested / inv.targetAmount * 100)) : null;

  const cls = "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{inv.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge(inv.type)}`}>{typeLabel(inv.type)}</span>
              {!inv.isActive && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
            </div>
            {inv.notes && <p className="text-sm text-gray-400 mt-0.5">{inv.notes}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-4"><X className="w-5 h-5" /></button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total Invested</p>
            <p className="font-bold text-green-600">{fmt(totalInvested)}</p>
          </div>
          {inv.targetAmount && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Target</p>
              <p className="font-bold text-gray-800 dark:text-gray-100">{fmt(inv.targetAmount)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Entries</p>
            <p className="font-bold text-gray-800 dark:text-gray-100">{entries.length}</p>
          </div>
        </div>

        {/* Progress bar (only if target set) */}
        {prog !== null && (
          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span className="font-medium text-indigo-600">{prog}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${prog}%` }} />
            </div>
          </div>
        )}

        {/* Entry list header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
            Entries <span className="text-gray-400 font-normal">({entries.length})</span>
          </h3>
          <button onClick={() => setShowAdd(v => !v)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Entry
          </button>
        </div>

        {/* Add entry form */}
        {showAdd && (
          <form onSubmit={addEntry} className="mx-6 mb-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 flex flex-wrap gap-3 items-end border border-indigo-100 dark:border-indigo-800">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${cls} w-36`} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className={`${cls} w-36`} required min="0" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Notes</label>
              <input type="text" value={entryNotes} onChange={e => setEntryNotes(e.target.value)} placeholder="optional" className={`${cls} w-48`} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "…" : "Save"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            </div>
          </form>
        )}

        {/* Entries table */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {entries.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No entries yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-800">
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2 font-medium pr-3">#</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium">Notes</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {entries.map((e, i) => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2 text-gray-400 text-xs pr-3">{i + 1}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">{fmtDate(e.date)}</td>
                    <td className="py-2 text-right font-medium text-green-600">{fmt(e.amount)}</td>
                    <td className="py-2 text-gray-400 text-xs">{e.notes || "—"}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteEntry(e.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td colSpan={2} className="pt-3 text-xs text-gray-400 font-medium">Total</td>
                  <td className="pt-3 text-right font-bold text-green-600">{fmt(totalInvested)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Pencil className="w-3.5 h-3.5" />Edit
          </button>
          <button onClick={toggleActive} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            {inv.isActive ? "Mark Inactive" : "Mark Active"}
          </button>
          <div className="flex-1" />
          <button onClick={deleteInvestment} className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm">
            <Trash className="w-3.5 h-3.5" />Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Investment Card ──────────────────────────────────────────────────────────
function InvestmentCard({ inv, onClick }: { inv: Investment; onClick: () => void }) {
  const prog = inv.targetAmount ? Math.min(100, Math.round(inv.totalInvested / inv.targetAmount * 100)) : null;

  return (
    <button onClick={onClick} className="text-left w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">{inv.name}</h3>
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge(inv.type)}`}>{typeLabel(inv.type)}</span>
        </div>
        {!inv.isActive && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Total Invested</p>
          <p className="font-semibold text-sm text-green-600">{fmt(inv.totalInvested)}</p>
        </div>
        {inv.targetAmount && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Target</p>
            <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">{fmt(inv.targetAmount)}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Entries</p>
          <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">{inv.entryCount}</p>
        </div>
        {inv.lastEntryDate && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Last Entry</p>
            <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">{fmtDate(inv.lastEntryDate)}</p>
          </div>
        )}
      </div>

      {prog !== null && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span className="font-medium text-indigo-600">{prog}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${prog}%` }} />
          </div>
        </div>
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvestmentsPage() {
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);
  const [inactiveInvestments, setInactiveInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editInv, setEditInv] = useState<Investment | null>(null);
  const [detailInv, setDetailInv] = useState<InvestmentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/investments?active=true").then(r => r.json()),
      fetch("/api/investments?active=false").then(r => r.json()),
    ]).then(([active, inactive]) => {
      setActiveInvestments(active);
      setInactiveInvestments(inactive);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function openDetail(inv: Investment) {
    setLoadingDetail(true);
    const detail = await fetch(`/api/investments/${inv.id}`).then(r => r.json());
    setDetailInv(detail);
    setLoadingDetail(false);
  }

  const totalInvested = activeInvestments.reduce((s, i) => s + i.totalInvested, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Investments</h1>
        <button onClick={() => setShowAddForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
          <Plus className="w-4 h-4" />Add Investment
        </button>
      </div>

      {/* Summary strip */}
      {activeInvestments.length > 0 && (
        <div className="flex flex-wrap gap-6 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Active Investments</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{activeInvestments.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total Invested</p>
            <p className="text-2xl font-bold text-green-600">{fmt(totalInvested)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Closed</p>
            <p className="text-2xl font-bold text-gray-400">{inactiveInvestments.length}</p>
          </div>
        </div>
      )}

      {/* Active grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : activeInvestments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No active investments</p>
          <button onClick={() => setShowAddForm(true)} className="text-indigo-600 hover:underline text-sm">Add your first investment →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {activeInvestments.map(inv => <InvestmentCard key={inv.id} inv={inv} onClick={() => openDetail(inv)} />)}
        </div>
      )}

      {/* Inactive section */}
      {inactiveInvestments.length > 0 && (
        <div>
          <button onClick={() => setShowInactive(v => !v)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 font-medium">
            {showInactive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Closed / Inactive ({inactiveInvestments.length})
          </button>
          {showInactive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-65">
              {inactiveInvestments.map(inv => <InvestmentCard key={inv.id} inv={inv} onClick={() => openDetail(inv)} />)}
            </div>
          )}
        </div>
      )}

      {loadingDetail && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      )}

      {detailInv && (
        <InvestmentDetailModal
          inv={detailInv}
          onClose={() => setDetailInv(null)}
          onUpdated={loadAll}
          onEdit={() => { setEditInv(detailInv); setDetailInv(null); }}
        />
      )}

      {(showAddForm || editInv) && (
        <InvestmentFormModal
          inv={editInv}
          onClose={() => { setShowAddForm(false); setEditInv(null); }}
          onSaved={() => { setShowAddForm(false); setEditInv(null); loadAll(); }}
        />
      )}
    </div>
  );
}
