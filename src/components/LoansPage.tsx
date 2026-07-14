"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Check, Pencil, Trash, Archive, ChevronDown, ChevronUp } from "./Icons";

type Loan = {
  id: number;
  name: string;
  lender: string | null;
  loanAmount: number;
  emiAmount: number | null;
  interestRate: number | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  isArchived: boolean;
  totalPaid: number;
  outstandingBalance: number | null;
  paymentCount: number;
  pendingCount: number;
};

type Payment = {
  id: number;
  loanId: number;
  date: string;
  amount: number;
  outstandingBalance: number | null;
  status: string;
  notes: string | null;
};

type LoanDetail = Loan & { payments: Payment[] };

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function calcProgress(loanAmount: number, totalPaid: number, outstandingBalance: number | null) {
  if (outstandingBalance !== null) return Math.min(100, Math.round((loanAmount - outstandingBalance) / loanAmount * 100));
  return Math.min(100, Math.round(totalPaid / loanAmount * 100));
}

// ─── Loan Form Modal ──────────────────────────────────────────────────────────
function LoanFormModal({ loan, onClose, onSaved }: { loan: Loan | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(loan?.name ?? "");
  const [lender, setLender] = useState(loan?.lender ?? "");
  const [loanAmount, setLoanAmount] = useState(loan?.loanAmount?.toString() ?? "");
  const [emiAmount, setEmiAmount] = useState(loan?.emiAmount?.toString() ?? "");
  const [interestRate, setInterestRate] = useState(loan?.interestRate?.toString() ?? "");
  const [startDate, setStartDate] = useState(loan?.startDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(loan?.endDate?.slice(0, 10) ?? "");
  const [notes, setNotes] = useState(loan?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !loanAmount || !startDate) { setError("Name, loan amount and start date are required."); return; }
    setSaving(true); setError("");
    const payload = {
      name: name.trim(), lender: lender.trim() || null,
      loanAmount: parseFloat(loanAmount),
      emiAmount: emiAmount ? parseFloat(emiAmount) : null,
      interestRate: interestRate ? parseFloat(interestRate) : null,
      startDate, endDate: endDate || null, notes: notes.trim() || null,
    };
    const url = loan ? `/api/loans/${loan.id}` : "/api/loans";
    const res = await fetch(url, { method: loan ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { setError("Failed to save."); setSaving(false); return; }
    onSaved();
  }

  const cls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{loan ? "Edit Loan" : "Add Loan"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ICICI Car Loan" className={cls} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lender / Person</label>
              <input type="text" value={lender} onChange={e => setLender(e.target.value)} placeholder="e.g. ICICI Bank" className={cls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate %</label>
              <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="e.g. 8.5" step="0.01" min="0" className={cls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Amount (₹) *</label>
              <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="0" min="0" className={cls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EMI Amount (₹)</label>
              <input type="number" value={emiAmount} onChange={e => setEmiAmount(e.target.value)} placeholder="0" min="0" className={cls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={cls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={cls} />
            </div>
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
              {saving ? "Saving..." : <><Check className="w-4 h-4" />{loan ? "Update" : "Add Loan"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Loan Detail Modal ────────────────────────────────────────────────────────
function LoanDetailModal({ loan, onClose, onUpdated, onEdit }: {
  loan: LoanDetail; onClose: () => void; onUpdated: () => void; onEdit: () => void;
}) {
  const [payments, setPayments] = useState<Payment[]>(loan.payments);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(loan.emiAmount?.toString() ?? "");
  const [outstanding, setOutstanding] = useState("");
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [payNotes, setPayNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{ date: string; amount: string; outstanding: string; status: "paid" | "pending"; notes: string }>({ date: "", amount: "", outstanding: "", status: "paid", notes: "" });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/loans/${loan.id}/payments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, amount: parseFloat(amount), outstandingBalance: outstanding ? parseFloat(outstanding) : null, status, notes: payNotes.trim() || null }),
    });
    if (res.ok) {
      const p = await res.json();
      setPayments(prev => [...prev, p].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setAmount(loan.emiAmount?.toString() ?? ""); setOutstanding(""); setPayNotes(""); setShowAddPayment(false);
      onUpdated();
    }
    setSaving(false);
  }

  async function deletePayment(id: number) {
    if (!confirm("Delete this payment?")) return;
    await fetch(`/api/loans/${loan.id}/payments/${id}`, { method: "DELETE" });
    setPayments(prev => prev.filter(p => p.id !== id));
    onUpdated();
  }

  function startEdit(p: Payment) {
    setEditPaymentId(p.id);
    setEditFields({
      date: p.date.slice(0, 10),
      amount: p.amount.toString(),
      outstanding: p.outstandingBalance?.toString() ?? "",
      status: p.status as "paid" | "pending",
      notes: p.notes ?? "",
    });
    setShowAddPayment(false);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editPaymentId) return;
    setSaving(true);
    const res = await fetch(`/api/loans/${loan.id}/payments/${editPaymentId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: editFields.date,
        amount: parseFloat(editFields.amount),
        outstandingBalance: editFields.outstanding ? parseFloat(editFields.outstanding) : null,
        status: editFields.status,
        notes: editFields.notes.trim() || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPayments(prev => prev.map(p => p.id === editPaymentId ? updated : p));
      setEditPaymentId(null);
      onUpdated();
    }
    setSaving(false);
  }

  async function toggleArchive() {
    if (!confirm(loan.isArchived ? "Restore this loan to active?" : "Archive this loan?")) return;
    await fetch(`/api/loans/${loan.id}/archive`, { method: "POST" });
    onUpdated(); onClose();
  }

  async function deleteLoan() {
    if (!confirm("Permanently delete this loan and all payment history? This cannot be undone.")) return;
    await fetch(`/api/loans/${loan.id}`, { method: "DELETE" });
    onUpdated(); onClose();
  }

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const latestBalance = [...payments].filter(p => p.status === "paid").reverse().find(p => p.outstandingBalance !== null)?.outstandingBalance ?? null;
  const prog = calcProgress(loan.loanAmount, totalPaid, latestBalance);

  const cls = "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{loan.name}</h2>
              {loan.isArchived && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">Archived</span>}
            </div>
            {loan.lender && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{loan.lender}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-4 mt-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Loan Amount</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{fmt(loan.loanAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total Paid</p>
            <p className="font-semibold text-green-600">{fmt(totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Outstanding</p>
            <p className="font-semibold text-red-500">{latestBalance !== null ? fmt(latestBalance) : fmt(Math.max(0, loan.loanAmount - totalPaid))}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Repaid</p>
            <p className="font-semibold text-indigo-600">{prog}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-2 bg-indigo-500 rounded-full transition-all" style={{ width: `${prog}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Started {fmtDate(loan.startDate)}</span>
            {loan.endDate && <span>Ends {fmtDate(loan.endDate)}</span>}
            {loan.emiAmount && <span>EMI {fmt(loan.emiAmount)}/mo</span>}
          </div>
        </div>

        {/* Payment history header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
            Payment History <span className="text-gray-400 font-normal">({payments.length})</span>
          </h3>
          <button onClick={() => setShowAddPayment(v => !v)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Payment
          </button>
        </div>

        {/* Add payment form */}
        {showAddPayment && (
          <form onSubmit={addPayment} className="mx-6 mb-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 flex flex-wrap gap-3 items-end border border-indigo-100 dark:border-indigo-800">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${cls} w-36`} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className={`${cls} w-32`} required min="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Outstanding (₹)</label>
              <input type="number" value={outstanding} onChange={e => setOutstanding(e.target.value)} placeholder="optional" className={`${cls} w-36`} min="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as "paid" | "pending")} className={`${cls} w-28`}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Notes</label>
              <input type="text" value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="optional" className={`${cls} w-40`} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "…" : "Save"}
              </button>
              <button type="button" onClick={() => setShowAddPayment(false)} className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            </div>
          </form>
        )}

        {/* Payments table */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {payments.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No payments recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-800">
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2 font-medium pr-3">#</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium text-right">Outstanding</th>
                  <th className="pb-2 font-medium pl-3">Status</th>
                  <th className="pb-2 font-medium">Notes</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {payments.map((p, i) => editPaymentId === p.id ? (
                  <tr key={p.id} className="bg-indigo-50 dark:bg-indigo-900/20">
                    <td colSpan={7} className="py-2 px-1">
                      <form onSubmit={saveEdit} className="flex flex-wrap gap-2 items-end">
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Date</label>
                          <input type="date" value={editFields.date} onChange={e => setEditFields(f => ({ ...f, date: e.target.value }))} className={`${cls} w-36`} required />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Amount (₹)</label>
                          <input type="number" value={editFields.amount} onChange={e => setEditFields(f => ({ ...f, amount: e.target.value }))} className={`${cls} w-32`} required min="0" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Outstanding (₹)</label>
                          <input type="number" value={editFields.outstanding} onChange={e => setEditFields(f => ({ ...f, outstanding: e.target.value }))} placeholder="optional" className={`${cls} w-36`} min="0" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Status</label>
                          <select value={editFields.status} onChange={e => setEditFields(f => ({ ...f, status: e.target.value as "paid" | "pending" }))} className={`${cls} w-28`}>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Notes</label>
                          <input type="text" value={editFields.notes} onChange={e => setEditFields(f => ({ ...f, notes: e.target.value }))} placeholder="optional" className={`${cls} w-40`} />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                            {saving ? "…" : "Update"}
                          </button>
                          <button type="button" onClick={() => setEditPaymentId(null)} className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${p.status === "pending" ? "opacity-55" : ""}`}>
                    <td className="py-2 text-gray-400 text-xs pr-3">{i + 1}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">{fmtDate(p.date)}</td>
                    <td className="py-2 text-right font-medium text-gray-800 dark:text-gray-100">{fmt(p.amount)}</td>
                    <td className="py-2 text-right text-gray-500 dark:text-gray-400">{p.outstandingBalance !== null ? fmt(p.outstandingBalance) : "—"}</td>
                    <td className="py-2 pl-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-400 text-xs max-w-[120px] truncate">{p.notes || "—"}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(p)} className="text-gray-300 hover:text-indigo-500 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deletePayment(p.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Pencil className="w-3.5 h-3.5" />Edit
          </button>
          <button onClick={toggleArchive} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Archive className="w-3.5 h-3.5" />{loan.isArchived ? "Restore" : "Archive"}
          </button>
          <div className="flex-1" />
          <button onClick={deleteLoan} className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm">
            <Trash className="w-3.5 h-3.5" />Delete Loan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loan Card ────────────────────────────────────────────────────────────────
function LoanCard({ loan, onClick }: { loan: Loan; onClick: () => void }) {
  const outstanding = loan.outstandingBalance ?? Math.max(0, loan.loanAmount - loan.totalPaid);
  const prog = calcProgress(loan.loanAmount, loan.totalPaid, loan.outstandingBalance);

  return (
    <button onClick={onClick} className="text-left w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">{loan.name}</h3>
      </div>
      {loan.lender && <p className="text-xs text-gray-400 mb-4">{loan.lender}</p>}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Loan Amount</p>
          <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">{fmt(loan.loanAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Outstanding</p>
          <p className="font-semibold text-sm text-red-500">{fmt(outstanding)}</p>
        </div>
        {loan.emiAmount && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">EMI / month</p>
            <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">{fmt(loan.emiAmount)}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Payments</p>
          <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">
            {loan.paymentCount - loan.pendingCount} paid
            {loan.pendingCount > 0 && <span className="text-yellow-500 ml-1 font-normal">({loan.pendingCount} pending)</span>}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Repaid</span>
          <span className="font-medium text-indigo-600">{prog}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${prog}%` }} />
        </div>
      </div>

      {loan.endDate && (
        <p className="text-xs text-gray-400 mt-2">Ends {fmtDate(loan.endDate)}</p>
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [archivedLoans, setArchivedLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editLoan, setEditLoan] = useState<Loan | null>(null);
  const [detailLoan, setDetailLoan] = useState<LoanDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadLoans = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/loans?archived=false").then(r => r.json()),
      fetch("/api/loans?archived=true").then(r => r.json()),
    ]).then(([active, archived]) => {
      setLoans(active);
      setArchivedLoans(archived);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadLoans(); }, [loadLoans]);

  async function openDetail(loan: Loan) {
    setLoadingDetail(true);
    const detail = await fetch(`/api/loans/${loan.id}`).then(r => r.json());
    setDetailLoan(detail);
    setLoadingDetail(false);
  }

  const totalOutstanding = loans.reduce((s, l) => s + (l.outstandingBalance ?? Math.max(0, l.loanAmount - l.totalPaid)), 0);
  const totalMonthlyEmi = loans.filter(l => l.emiAmount).reduce((s, l) => s + (l.emiAmount ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Loans</h1>
        <button onClick={() => setShowAddForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
          <Plus className="w-4 h-4" />Add Loan
        </button>
      </div>

      {/* Summary strip */}
      {loans.length > 0 && (
        <div className="flex flex-wrap gap-6 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Active Loans</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{loans.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-500">{fmt(totalOutstanding)}</p>
          </div>
          {totalMonthlyEmi > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Monthly EMI</p>
              <p className="text-2xl font-bold text-indigo-600">{fmt(totalMonthlyEmi)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Archived</p>
            <p className="text-2xl font-bold text-gray-400">{archivedLoans.length}</p>
          </div>
        </div>
      )}

      {/* Active loans grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No active loans</p>
          <button onClick={() => setShowAddForm(true)} className="text-indigo-600 hover:underline text-sm">Add your first loan →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {loans.map(loan => <LoanCard key={loan.id} loan={loan} onClick={() => openDetail(loan)} />)}
        </div>
      )}

      {/* Archived section */}
      {archivedLoans.length > 0 && (
        <div>
          <button onClick={() => setShowArchived(v => !v)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 font-medium">
            {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Archived Loans ({archivedLoans.length})
          </button>
          {showArchived && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-65">
              {archivedLoans.map(loan => <LoanCard key={loan.id} loan={loan} onClick={() => openDetail(loan)} />)}
            </div>
          )}
        </div>
      )}

      {/* Loading overlay for detail */}
      {loadingDetail && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      )}

      {/* Detail modal */}
      {detailLoan && (
        <LoanDetailModal
          loan={detailLoan}
          onClose={() => setDetailLoan(null)}
          onUpdated={loadLoans}
          onEdit={() => { setEditLoan(detailLoan); setDetailLoan(null); }}
        />
      )}

      {/* Add / Edit modal */}
      {(showAddForm || editLoan) && (
        <LoanFormModal
          loan={editLoan}
          onClose={() => { setShowAddForm(false); setEditLoan(null); }}
          onSaved={() => { setShowAddForm(false); setEditLoan(null); loadLoans(); }}
        />
      )}
    </div>
  );
}
