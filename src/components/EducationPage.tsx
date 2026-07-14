"use client";

import { useState, useEffect, useCallback } from "react";

interface FeeEntry {
  id: number;
  academicYearId: number;
  description: string;
  amount: number;
  status: string;
  paidDate: string | null;
  notes: string | null;
}

interface AcademicYear {
  id: number;
  studentId: number;
  year: string;
  class: string | null;
  school: string | null;
  rollNo: string | null;
  notes: string | null;
  fees: FeeEntry[];
}

interface Student {
  id: number;
  name: string;
  notes: string | null;
  academicYears: AcademicYear[];
}

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  partial: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  waived: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

// ─── Fee Form Modal ──────────────────────────────────────────────────────────

function FeeFormModal({
  academicYearId,
  fee,
  onClose,
  onSaved,
}: {
  academicYearId: number;
  fee: FeeEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [description, setDescription] = useState(fee?.description ?? "");
  const [amount, setAmount] = useState(fee ? String(fee.amount) : "");
  const [status, setStatus] = useState(fee?.status ?? "pending");
  const [paidDate, setPaidDate] = useState(fee?.paidDate ? fee.paidDate.slice(0, 10) : "");
  const [notes, setNotes] = useState(fee?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { description, amount: Number(amount), status, paidDate: paidDate || null, notes: notes || null };
    if (fee) {
      await fetch(`/api/education/fees/${fee.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/education/fees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ academicYearId, ...body }) });
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {fee ? "Edit Fee" : "Add Fee"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <input
              required value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Term 1 Fee, Books, Transport"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label>
              <input
                required type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="waived">Waived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Date</label>
            <input
              type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Year Form Modal ─────────────────────────────────────────────────────────

function YearFormModal({
  studentId,
  ay,
  onClose,
  onSaved,
}: {
  studentId: number;
  ay: AcademicYear | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [year, setYear] = useState(ay?.year ?? "");
  const [cls, setCls] = useState(ay?.class ?? "");
  const [school, setSchool] = useState(ay?.school ?? "");
  const [rollNo, setRollNo] = useState(ay?.rollNo ?? "");
  const [notes, setNotes] = useState(ay?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { year, class: cls || null, school: school || null, rollNo: rollNo || null, notes: notes || null };
    if (ay) {
      await fetch(`/api/education/years/${ay.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/education/years", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, ...body }) });
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {ay ? "Edit Academic Year" : "Add Academic Year"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
              <input
                required value={year} onChange={e => setYear(e.target.value)}
                placeholder="2024-25"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class / Semester</label>
              <input
                value={cls} onChange={e => setCls(e.target.value)}
                placeholder="e.g. X, II Sem"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School / College</label>
            <input
              value={school} onChange={e => setSchool(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll No.</label>
            <input
              value={rollNo} onChange={e => setRollNo(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Student Form Modal ──────────────────────────────────────────────────────

function StudentFormModal({
  student,
  onClose,
  onSaved,
}: {
  student: Student | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(student?.name ?? "");
  const [notes, setNotes] = useState(student?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { name, notes: notes || null };
    if (student) {
      await fetch(`/api/education/students/${student.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/education/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {student ? "Edit Student" : "Add Student"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              required value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <input
              value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Academic Year Card ──────────────────────────────────────────────────────

function AcademicYearCard({
  ay,
  onRefresh,
}: {
  ay: AcademicYear;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [feeModal, setFeeModal] = useState<{ open: boolean; fee: FeeEntry | null }>({ open: false, fee: null });
  const [editYear, setEditYear] = useState(false);

  const totalFees = ay.fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = ay.fees.filter(f => f.status === "paid" || f.status === "waived").reduce((s, f) => s + f.amount, 0);
  const pendingFees = ay.fees.filter(f => f.status === "pending" || f.status === "partial").reduce((s, f) => s + f.amount, 0);

  async function deleteFee(id: number) {
    if (!confirm("Delete this fee entry?")) return;
    await fetch(`/api/education/fees/${id}`, { method: "DELETE" });
    onRefresh();
  }

  async function deleteYear() {
    if (!confirm(`Delete academic year ${ay.year} and all its fee entries?`)) return;
    await fetch(`/api/education/years/${ay.id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Year header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{ay.year}</span>
            {ay.class && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Class {ay.class}</span>}
            {ay.school && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">· {ay.school}</span>}
            {ay.rollNo && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">· Roll: {ay.rollNo}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total: <span className="font-medium text-gray-700 dark:text-gray-300">{fmt(totalFees)}</span></div>
            {pendingFees > 0 && <div className="text-xs text-amber-600 dark:text-amber-400">Pending: {fmt(pendingFees)}</div>}
          </div>
          <button
            onClick={() => setEditYear(true)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Edit year"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button
            onClick={deleteYear}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete year"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4">
          {ay.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">{ay.notes}</p>}

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(totalFees)}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Paid</div>
              <div className="text-sm font-semibold text-green-700 dark:text-green-400">{fmt(paidFees)}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
              <div className="text-sm font-semibold text-amber-700 dark:text-amber-400">{fmt(pendingFees)}</div>
            </div>
          </div>

          {/* Fee table */}
          {ay.fees.length > 0 ? (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-3">Description</th>
                    <th className="text-right py-2 pr-3">Amount</th>
                    <th className="text-center py-2 pr-3">Status</th>
                    <th className="text-left py-2 pr-3">Paid Date</th>
                    <th className="text-left py-2 pr-3">Notes</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {ay.fees.map(fee => (
                    <tr key={fee.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="py-2 pr-3 text-gray-900 dark:text-white">{fee.description}</td>
                      <td className="py-2 pr-3 text-right font-medium text-gray-900 dark:text-white">{fmt(fee.amount)}</td>
                      <td className="py-2 pr-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[fee.status] ?? STATUS_COLORS.pending}`}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-gray-600 dark:text-gray-400 text-xs">
                        {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="py-2 pr-3 text-gray-500 dark:text-gray-400 text-xs max-w-[160px] truncate">{fee.notes ?? "—"}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button onClick={() => setFeeModal({ open: true, fee })} className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => deleteFee(fee.id)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic mb-3">No fee entries yet.</p>
          )}

          <button
            onClick={() => setFeeModal({ open: true, fee: null })}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Fee Entry
          </button>
        </div>
      )}

      {feeModal.open && (
        <FeeFormModal
          academicYearId={ay.id}
          fee={feeModal.fee}
          onClose={() => setFeeModal({ open: false, fee: null })}
          onSaved={onRefresh}
        />
      )}
      {editYear && (
        <YearFormModal
          studentId={ay.studentId}
          ay={ay}
          onClose={() => setEditYear(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

// ─── Student Panel ───────────────────────────────────────────────────────────

function StudentPanel({ student, onRefresh }: { student: Student; onRefresh: () => void }) {
  const [addYear, setAddYear] = useState(false);
  const [editStudent, setEditStudent] = useState(false);

  const allFees = student.academicYears.flatMap(ay => ay.fees);
  const grandTotal = allFees.reduce((s, f) => s + f.amount, 0);
  const totalPaid = allFees.filter(f => f.status === "paid" || f.status === "waived").reduce((s, f) => s + f.amount, 0);
  const totalPending = allFees.filter(f => f.status === "pending" || f.status === "partial").reduce((s, f) => s + f.amount, 0);

  async function deleteStudent() {
    if (!confirm(`Delete student "${student.name}" and all their data?`)) return;
    await fetch(`/api/education/students/${student.id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="space-y-4">
      {/* Student summary bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{student.name}</h3>
            {student.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{student.notes}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditStudent(true)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="Edit student">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={deleteStudent} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete student">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Grand Total</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{fmt(grandTotal)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Paid</div>
            <div className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(totalPaid)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pending</div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{fmt(totalPending)}</div>
          </div>
        </div>
      </div>

      {/* Academic years */}
      <div className="space-y-2">
        {student.academicYears.map(ay => (
          <AcademicYearCard key={ay.id} ay={ay} onRefresh={onRefresh} />
        ))}
      </div>

      <button
        onClick={() => setAddYear(true)}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Academic Year
      </button>

      {addYear && (
        <YearFormModal
          studentId={student.id}
          ay={null}
          onClose={() => setAddYear(false)}
          onSaved={onRefresh}
        />
      )}
      {editStudent && (
        <StudentFormModal
          student={student}
          onClose={() => setEditStudent(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EducationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [addStudent, setAddStudent] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/education");
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const allFees = students.flatMap(s => s.academicYears.flatMap(ay => ay.fees));
  const grandTotal = allFees.reduce((s, f) => s + f.amount, 0);
  const totalPaid = allFees.filter(f => f.status === "paid" || f.status === "waived").reduce((s, f) => s + f.amount, 0);
  const totalPending = allFees.filter(f => f.status === "pending" || f.status === "partial").reduce((s, f) => s + f.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Education</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track school & college fees for family members</p>
        </div>
        <button
          onClick={() => setAddStudent(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Student
        </button>
      </div>

      {/* Overall summary */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Fees</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{fmt(grandTotal)}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Paid</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(totalPaid)}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Pending</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{fmt(totalPending)}</div>
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <p>No students added yet.</p>
          <button onClick={() => setAddStudent(true)} className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Add first student</button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {students.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === i
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {s.name}
                {s.academicYears.flatMap(ay => ay.fees).filter(f => f.status === "pending" || f.status === "partial").length > 0 && (
                  <span className="ml-1.5 inline-block w-2 h-2 bg-amber-400 rounded-full align-middle" />
                )}
              </button>
            ))}
          </div>

          {/* Active student panel */}
          {students[activeTab] && (
            <StudentPanel student={students[activeTab]} onRefresh={fetchData} />
          )}
        </>
      )}

      {addStudent && (
        <StudentFormModal
          student={null}
          onClose={() => setAddStudent(false)}
          onSaved={() => { fetchData(); setActiveTab(students.length); }}
        />
      )}
    </div>
  );
}
