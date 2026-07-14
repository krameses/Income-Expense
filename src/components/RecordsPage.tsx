"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Check, Pencil, Trash } from "./Icons";

type RecordFile = {
  id: number;
  fileName: string;
  origName: string;
  mimeType: string;
  size: number;
};

type Record_ = {
  id: number;
  title: string;
  category: string;
  provider: string | null;
  accountNo: string | null;
  amount: number | null;
  advance: number | null;
  maintenance: number | null;
  dueDate: string | null;
  expiryDate: string | null;
  notes: string | null;
  files: RecordFile[];
};

const CATEGORIES = [
  { value: "lic",          label: "LIC Policy",      icon: "🛡️", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "property_tax", label: "Property Tax",    icon: "🏠", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "water_tax",    label: "Water Tax",        icon: "💧", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { value: "eb",           label: "Electricity (EB)", icon: "⚡", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  { value: "tenant",       label: "Tenant",           icon: "🏘️", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { value: "vehicle",      label: "Vehicle",          icon: "🚗", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { value: "bank",         label: "Bank Account",     icon: "🏦", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { value: "other",        label: "Other",            icon: "📄", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
];

function catInfo(v: string) { return CATEGORIES.find(c => c.value === v) ?? CATEGORIES[CATEGORIES.length - 1]; }

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntilLabel(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days < 0)    return { text: `${Math.abs(days)}d overdue`, cls: "text-red-500 font-semibold" };
  if (days === 0)  return { text: "Due today!", cls: "text-red-600 font-bold" };
  if (days <= 30)  return { text: `Due in ${days}d`, cls: "text-amber-600 font-medium" };
  return { text: `Due in ${days}d`, cls: "text-gray-400" };
}

const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

function fileIcon(mimeType: string) {
  if (mimeType.includes("pdf"))   return "📄";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("word") || mimeType.includes("officedocument.wordprocessing")) return "📝";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
  return "📎";
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RecordFormModal({ record, onClose, onSaved }: { record: Record_ | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(record?.title ?? "");
  const [category, setCategory] = useState(record?.category ?? "lic");
  const [provider, setProvider] = useState(record?.provider ?? "");
  const [accountNo, setAccountNo] = useState(record?.accountNo ?? "");
  const [amount, setAmount] = useState(record?.amount?.toString() ?? "");
  const [advance, setAdvance] = useState(record?.advance?.toString() ?? "");
  const [maintenance, setMaintenance] = useState(record?.maintenance?.toString() ?? "");
  const [dueDate, setDueDate] = useState(record?.dueDate?.slice(0, 10) ?? "");
  const [expiryDate, setExpiryDate] = useState(record?.expiryDate?.slice(0, 10) ?? "");
  const [notes, setNotes] = useState(record?.notes ?? "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<RecordFile[]>(record?.files ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setSelectedFiles(prev => [...prev, ...Array.from(fileList)]);
  }

  async function removeExistingFile(fileId: number) {
    if (!record) return;
    await fetch(`/api/records/${record.id}/files/${fileId}`, { method: "DELETE" });
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError("");

    const url = record ? `/api/records/${record.id}` : "/api/records";
    const res = await fetch(url, {
      method: record ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), category, provider: provider.trim() || null, accountNo: accountNo.trim() || null, amount: amount ? parseFloat(amount) : null, advance: advance ? parseFloat(advance) : null, maintenance: maintenance ? parseFloat(maintenance) : null, dueDate: dueDate || null, expiryDate: expiryDate || null, notes: notes.trim() || null }),
    });
    if (!res.ok) { setError("Failed to save."); setSaving(false); return; }

    const saved = await res.json();
    if (selectedFiles.length > 0) {
      const fd = new FormData();
      selectedFiles.forEach(f => fd.append("files", f));
      await fetch(`/api/records/${saved.id}/files`, { method: "POST", body: fd });
    }
    onSaved();
  }

  const cat = catInfo(category);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{record ? "Edit Record" : "Add Record"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={`e.g. ${cat.icon} ${cat.label}`} className={inputCls} required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>
          {category === "tenant" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent (₹)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="monthly rent" min="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advance (₹)</label>
                  <input type="number" value={advance} onChange={e => setAdvance(e.target.value)} placeholder="optional" min="0" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance (₹)</label>
                  <input type="number" value={maintenance} onChange={e => setMaintenance(e.target.value)} placeholder="optional" min="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupancy Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider / Office</label>
                  <input type="text" value={provider} onChange={e => setProvider(e.target.value)} placeholder="e.g. LIC, TNEB, Corp." className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy / Account No.</label>
                  <input type="text" value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder="optional" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount / Premium (₹)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="optional" min="0" className={inputCls} />
                </div>
                <div />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due / Renewal Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry / Maturity Date</label>
                  <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={inputCls} />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Policy details, nominee, consumer number, address, etc." className={`${inputCls} resize-y`} />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</label>

            {/* Drop zone */}
            <label
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer transition-colors ${dragOver ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/40"}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            >
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                <span className="text-indigo-600 font-medium">Click to browse</span> or drag & drop
              </p>
              <p className="text-xs text-gray-400">PDF, JPG, PNG, Word, Excel and more</p>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={e => addFiles(e.target.files)} />
            </label>

            {/* Existing files (edit mode) */}
            {existingFiles.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {existingFiles.map(f => (
                  <div key={f.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                    <span className="text-base">{fileIcon(f.mimeType)}</span>
                    <a href={`/uploads/records/${f.fileName}`} target="_blank" rel="noreferrer" className="flex-1 text-sm text-indigo-600 hover:underline truncate">{f.origName}</a>
                    <span className="text-xs text-gray-400 shrink-0">{fmtSize(f.size)}</span>
                    <button type="button" onClick={() => removeExistingFile(f.id)} className="text-gray-300 hover:text-red-400 shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Newly selected files */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-2">
                    <span className="text-base">{fileIcon(f.type)}</span>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{fmtSize(f.size)}</span>
                    <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5">
              <X className="w-4 h-4" />Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
              {saving ? "Saving..." : <><Check className="w-4 h-4" />{record ? "Update" : "Add Record"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordCard({ record, onEdit, onDelete }: { record: Record_; onEdit: () => void; onDelete: () => void }) {
  const cat = catInfo(record.category);
  const dueStat = record.dueDate ? daysUntilLabel(record.dueDate) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cat.icon}</span>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">{record.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 ml-2">
          <button onClick={onEdit} className="text-gray-300 hover:text-indigo-500 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors"><Trash className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        {record.category === "tenant" ? (
          <>
            {record.amount      && <div className="flex justify-between"><span className="text-gray-400">Rent</span><span className="font-semibold text-indigo-600">{fmt(record.amount)}</span></div>}
            {record.advance     && <div className="flex justify-between"><span className="text-gray-400">Advance</span><span className="font-semibold text-gray-700 dark:text-gray-200">{fmt(record.advance)}</span></div>}
            {record.maintenance && <div className="flex justify-between"><span className="text-gray-400">Maintenance</span><span className="font-semibold text-gray-700 dark:text-gray-200">{fmt(record.maintenance)}</span></div>}
            {record.dueDate     && <div className="flex justify-between"><span className="text-gray-400">Occupancy Date</span><span className="text-gray-700 dark:text-gray-200">{fmtDate(record.dueDate)}</span></div>}
          </>
        ) : (
          <>
            {record.provider   && <div className="flex justify-between"><span className="text-gray-400">Provider</span><span className="text-gray-700 dark:text-gray-200 font-medium">{record.provider}</span></div>}
            {record.accountNo  && <div className="flex justify-between"><span className="text-gray-400">Acc / Policy No.</span><span className="text-gray-700 dark:text-gray-200 font-mono text-xs">{record.accountNo}</span></div>}
            {record.amount     && <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-semibold text-indigo-600">{fmt(record.amount)}</span></div>}
            {record.dueDate    && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Due / Renewal</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-200">{fmtDate(record.dueDate)}</span>
                  {dueStat && <span className={`text-xs ${dueStat.cls}`}>{dueStat.text}</span>}
                </div>
              </div>
            )}
            {record.expiryDate && <div className="flex justify-between"><span className="text-gray-400">Expiry / Maturity</span><span className="text-gray-700 dark:text-gray-200">{fmtDate(record.expiryDate)}</span></div>}
          </>
        )}
        {record.notes && <p className="text-xs text-gray-400 pt-2 border-t border-gray-50 dark:border-gray-700 mt-2">{record.notes}</p>}
        {record.files.length > 0 && (
          <div className="pt-2 border-t border-gray-50 dark:border-gray-700 mt-2 flex flex-col gap-1.5">
            {record.files.map(f => (
              <a key={f.id} href={`/uploads/records/${f.fileName}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 py-1 -mx-2 transition-colors group">
                <span className="text-sm">{fileIcon(f.mimeType)}</span>
                <span className="text-xs text-indigo-600 group-hover:underline truncate flex-1">{f.origName}</span>
                <span className="text-xs text-gray-400 shrink-0">{fmtSize(f.size)}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record_[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Record_ | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/records").then(r => r.json()).then(data => { setRecords(data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteRecord(id: number) {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    setRecords(prev => prev.filter(r => r.id !== id));
  }

  const q = search.trim().toLowerCase();
  const filtered = records
    .filter(r => filterCat === "all" || r.category === filterCat)
    .filter(r => !q || r.title.toLowerCase().includes(q) || (r.provider ?? "").toLowerCase().includes(q) || (r.accountNo ?? "").toLowerCase().includes(q) || (r.notes ?? "").toLowerCase().includes(q));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Records</h1>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />Add Record
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, provider or account no..." className="w-full pl-9 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button onClick={() => setFilterCat("all")} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
          All ({records.length})
        </button>
        {CATEGORIES.map(c => {
          const count = records.filter(r => r.category === c.value).length;
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
          <p className="text-gray-400 mb-2">{records.length === 0 ? "No records saved yet" : "No results found"}</p>
          {records.length === 0 && <button onClick={() => setShowForm(true)} className="text-indigo-600 hover:underline text-sm">Add your first record →</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <RecordCard key={r.id} record={r} onEdit={() => { setEditTarget(r); setShowForm(true); }} onDelete={() => deleteRecord(r.id)} />
          ))}
        </div>
      )}

      {showForm && (
        <RecordFormModal
          record={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { setShowForm(false); setEditTarget(null); load(); }}
        />
      )}
    </div>
  );
}
