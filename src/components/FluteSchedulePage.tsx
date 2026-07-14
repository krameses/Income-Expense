"use client";

import { useEffect, useState } from "react";
import { generateBatchPDF } from "@/lib/flute-pdf";

interface FluteClass {
  id: number;
  classNumber: number;
  date: string | null;
  notes: string | null;
}

interface FluteBatch {
  id: number;
  feeAmount: number;
  feePaidDate: string | null;
  notes: string | null;
  classes: FluteClass[];
}

const fmt = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

const toInputDate = (d: string | null) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

export default function FluteSchedulePage() {
  const [batches, setBatches] = useState<FluteBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showNewBatch, setShowNewBatch] = useState(false);
  const [newFee, setNewFee] = useState("4000");
  const [newFeePaid, setNewFeePaid] = useState("");
  const [newBatchNotes, setNewBatchNotes] = useState("");

  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [classDraft, setClassDraft] = useState({ date: "", notes: "" });

  const [editingBatch, setEditingBatch] = useState<FluteBatch | null>(null);
  const [editFee, setEditFee] = useState("");
  const [editFeePaid, setEditFeePaid] = useState("");
  const [editBatchNotes, setEditBatchNotes] = useState("");

  useEffect(() => {
    fetch("/api/flute/batches")
      .then((r) => r.json())
      .then((data) => {
        setBatches(data);
        if (data.length > 0) setExpandedId(data[0].id);
        setLoading(false);
      });
  }, []);

  async function createBatch() {
    const res = await fetch("/api/flute/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feeAmount: Number(newFee),
        feePaidDate: newFeePaid || null,
        notes: newBatchNotes || null,
      }),
    });
    const created: FluteBatch = await res.json();
    setBatches((prev) => [created, ...prev]);
    setExpandedId(created.id);
    setShowNewBatch(false);
    setNewFee("4000");
    setNewFeePaid("");
    setNewBatchNotes("");
  }

  async function saveBatch() {
    if (!editingBatch) return;
    const res = await fetch(`/api/flute/batches/${editingBatch.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feeAmount: Number(editFee),
        feePaidDate: editFeePaid || null,
        notes: editBatchNotes || null,
      }),
    });
    const updated: FluteBatch = await res.json();
    setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setEditingBatch(null);
  }

  async function deleteBatch(id: number) {
    if (!confirm("Delete this batch and all its class records?")) return;
    await fetch(`/api/flute/batches/${id}`, { method: "DELETE" });
    setBatches((prev) => prev.filter((b) => b.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  const today = new Date().toISOString().slice(0, 10);

  function startEditClass(cls: FluteClass) {
    setEditingClassId(cls.id);
    setClassDraft({ date: toInputDate(cls.date) || today, notes: cls.notes ?? "" });
  }

  async function saveClass(batchId: number, classId: number) {
    const res = await fetch(`/api/flute/classes/${classId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: classDraft.date || null, notes: classDraft.notes || null }),
    });
    const updated: FluteClass = await res.json();
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, classes: b.classes.map((c) => (c.id === classId ? updated : c)) }
          : b
      )
    );
    setEditingClassId(null);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const totalFees = batches.reduce((s, b) => s + b.feeAmount, 0);
  const totalClasses = batches.reduce(
    (s, b) => s + b.classes.filter((c) => c.date).length,
    0
  );

  const allDates = batches
    .flatMap((b) => b.classes.map((c) => c.date))
    .filter(Boolean)
    .map((d) => new Date(d!).getTime());
  const startDate = allDates.length ? new Date(Math.min(...allDates)) : null;

  function yearsAndDays(start: Date): { years: number; days: number } {
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    const anniversary = new Date(now.getFullYear(), start.getMonth(), start.getDate());
    if (anniversary > now) years--;
    const lastAnniversary = new Date(now.getFullYear() - (anniversary > now ? 1 : 0), start.getMonth(), start.getDate());
    const days = Math.floor((now.getTime() - lastAnniversary.getTime()) / 86_400_000);
    return { years, days };
  }

  const inputCls = "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Flute Class Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Swaralayam</p>
        </div>
        <button
          onClick={() => setShowNewBatch(true)}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + New Batch
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Batches</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{batches.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Learning Since</p>
          {startDate ? (
            (() => {
              const { years, days } = yearsAndDays(startDate);
              return (
                <>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {years} years & {days} Days
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    since {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </>
              );
            })()
          ) : (
            <p className="text-2xl font-bold text-gray-300 mt-1">—</p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Classes Attended</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalClasses}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Fees Paid</p>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">
            ₹{totalFees.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Batch list */}
      {batches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No batches yet.</p>
          <button
            onClick={() => setShowNewBatch(true)}
            className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add first batch
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch, idx) => {
            const attended = batch.classes.filter((c) => c.date).length;
            const total = batch.classes.length;
            const isOpen = expandedId === batch.id;
            const batchNum = batches.length - idx;

            return (
              <div key={batch.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Batch header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setExpandedId(isOpen ? null : batch.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-bold shrink-0">
                      {batchNum}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          ₹{batch.feeAmount.toLocaleString("en-IN")}
                        </span>
                        {batch.feePaidDate && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            paid {fmt(batch.feePaidDate)}
                          </span>
                        )}
                      </div>
                      {batch.notes && (
                        <p className="text-xs text-gray-400 mt-0.5">{batch.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        attended === total
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : attended === 0
                          ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {attended}/{total} classes
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateBatchPDF(batch, batchNum);
                      }}
                      className="text-gray-400 hover:text-emerald-600 px-1"
                      title="Download PDF"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBatch(batch);
                        setEditFee(String(batch.feeAmount));
                        setEditFeePaid(toInputDate(batch.feePaidDate));
                        setEditBatchNotes(batch.notes ?? "");
                      }}
                      className="text-gray-400 hover:text-indigo-600 text-sm px-1"
                      title="Edit batch"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBatch(batch.id);
                      }}
                      className="text-gray-400 hover:text-red-500 text-sm px-1"
                      title="Delete batch"
                    >
                      ✕
                    </button>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Class rows */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                          <th className="text-left px-5 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium w-16">#</th>
                          <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Date</th>
                          <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Notes</th>
                          <th className="px-4 py-2 w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {batch.classes.map((cls) => (
                          <tr key={cls.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-5 py-2.5">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                                {cls.classNumber}
                              </span>
                            </td>

                            {editingClassId === cls.id ? (
                              <>
                                <td className="px-4 py-2">
                                  <input
                                    type="date"
                                    value={classDraft.date}
                                    onChange={(e) =>
                                      setClassDraft((d) => ({ ...d, date: e.target.value }))
                                    }
                                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-36 bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={classDraft.notes}
                                    onChange={(e) =>
                                      setClassDraft((d) => ({ ...d, notes: e.target.value }))
                                    }
                                    placeholder="Notes..."
                                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="px-4 py-2 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => saveClass(batch.id, cls.id)}
                                    className="text-xs px-2 py-1 bg-indigo-600 text-white rounded mr-1 hover:bg-indigo-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingClassId(null)}
                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                                  >
                                    Cancel
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-2">
                                  {cls.date ? (
                                    <span className="text-gray-700 dark:text-gray-200">{fmt(cls.date)}</span>
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-600 italic text-xs">Not attended</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-gray-500 dark:text-gray-400 text-xs">
                                  {cls.notes || ""}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() => startEditClass(cls)}
                                    className="text-xs text-gray-400 hover:text-indigo-600 px-1"
                                    title="Edit"
                                  >
                                    ✎
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Batch Modal */}
      {showNewBatch && (
        <Modal title="New Batch" onClose={() => setShowNewBatch(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Amount (₹)</label>
              <input type="number" value={newFee} onChange={(e) => setNewFee(e.target.value)} className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Paid Date</label>
              <input type="date" value={newFeePaid} onChange={(e) => setNewFeePaid(e.target.value)} className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
              <input type="text" value={newBatchNotes} onChange={(e) => setNewBatchNotes(e.target.value)} placeholder="e.g. Started new raaga" className={`w-full ${inputCls}`} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNewBatch(false)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={createBatch} disabled={!newFee} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <Modal title="Edit Batch" onClose={() => setEditingBatch(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Amount (₹)</label>
              <input type="number" value={editFee} onChange={(e) => setEditFee(e.target.value)} className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Paid Date</label>
              <input type="date" value={editFeePaid} onChange={(e) => setEditFeePaid(e.target.value)} className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <input type="text" value={editBatchNotes} onChange={(e) => setEditBatchNotes(e.target.value)} className={`w-full ${inputCls}`} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingBatch(null)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={saveBatch} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
