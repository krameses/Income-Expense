"use client";

import { useEffect, useState, useCallback } from "react";
import { generateBadmintonPDF } from "@/lib/badminton-pdf";

const CATEGORIES = ["Court", "Snacks/Breakfast/Lunch/Dinner", "Other"] as const;
type Category = (typeof CATEGORIES)[number];

const WEEKS = [1, 2, 3, 4, 5] as const;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface Member {
  id: number;
  name: string;
  isActive: boolean;
}

interface Expense {
  id: number;
  periodId: number;
  category: string;
  description: string;
  paidBy: string;
  week: number;
  amount: number;
}

interface Contribution {
  id: number;
  periodId: number;
  memberName: string;
  amount: number;
}

interface Period {
  id: number;
  month: string;
  openingBalance: number;
  expenses: Expense[];
  contributions: Contribution[];
}

interface ExpenseFormData {
  category: Category;
  description: string;
  paidBy: string;
  week: number;
  amount: string;
}

interface ContribFormData {
  memberName: string;
  amount: string;
}

const defaultExpenseForm = (): ExpenseFormData => ({
  category: "Court",
  description: "",
  paidBy: "",
  week: 1,
  amount: "",
});

const defaultContribForm = (): ContribFormData => ({
  memberName: "",
  amount: "1500",
});

const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function BadmintonPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [newPeriodMonth, setNewPeriodMonth] = useState("");
  const [newPeriodOpening, setNewPeriodOpening] = useState("");

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>(defaultExpenseForm());
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [showContribModal, setShowContribModal] = useState(false);
  const [contribForm, setContribForm] = useState<ContribFormData>(defaultContribForm());
  const [editingContrib, setEditingContrib] = useState<Contribution | null>(null);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  const [editingOpening, setEditingOpening] = useState(false);
  const [openingDraft, setOpeningDraft] = useState("");

  const loadData = useCallback(async () => {
    const [mRes, pRes] = await Promise.all([
      fetch("/api/badminton/members"),
      fetch("/api/badminton/periods"),
    ]);
    const [m, p] = await Promise.all([mRes.json(), pRes.json()]);
    setMembers(m);
    setPeriods(p);
    if (p.length > 0 && selectedPeriodId === null) {
      setSelectedPeriodId(p[0].id);
    }
    setLoading(false);
  }, [selectedPeriodId]);

  useEffect(() => {
    loadData();
  }, []);

  const period = periods.find((p) => p.id === selectedPeriodId) ?? null;

  const totalContributions = period?.contributions.reduce((s, c) => s + c.amount, 0) ?? 0;
  const totalExpenses = period?.expenses.reduce((s, e) => s + e.amount, 0) ?? 0;
  const openingBalance = period?.openingBalance ?? 0;
  const totalWithContrib = openingBalance + totalContributions;
  const closingBalance = totalWithContrib - totalExpenses;

  async function createPeriod() {
    if (!newPeriodMonth) return;
    const res = await fetch("/api/badminton/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: newPeriodMonth, openingBalance: Number(newPeriodOpening) || 0 }),
    });
    const created: Period = await res.json();
    setPeriods((prev) => [created, ...prev]);
    setSelectedPeriodId(created.id);
    setShowNewPeriod(false);
    setNewPeriodMonth("");
    setNewPeriodOpening("");
  }

  async function deletePeriod() {
    if (!period || !confirm(`Delete ${formatMonth(period.month)}? This removes all expenses and contributions.`)) return;
    await fetch(`/api/badminton/periods/${period.id}`, { method: "DELETE" });
    setPeriods((prev) => prev.filter((p) => p.id !== period.id));
    setSelectedPeriodId(null);
  }

  async function saveOpeningBalance() {
    if (!period) return;
    const res = await fetch(`/api/badminton/periods/${period.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openingBalance: Number(openingDraft) }),
    });
    const updated: Period = await res.json();
    setPeriods((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingOpening(false);
  }

  function openAddExpense() {
    setEditingExpense(null);
    setExpenseForm(defaultExpenseForm());
    setShowExpenseModal(true);
  }

  function openEditExpense(e: Expense) {
    setEditingExpense(e);
    setExpenseForm({ category: e.category as Category, description: e.description, paidBy: e.paidBy, week: e.week, amount: String(e.amount) });
    setShowExpenseModal(true);
  }

  async function saveExpense() {
    if (!period || !expenseForm.paidBy || !expenseForm.amount) return;
    const body = { periodId: period.id, category: expenseForm.category, description: expenseForm.description, paidBy: expenseForm.paidBy, week: expenseForm.week, amount: Number(expenseForm.amount) };
    if (editingExpense) {
      const res = await fetch(`/api/badminton/expenses/${editingExpense.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const updated: Expense = await res.json();
      setPeriods((prev) => prev.map((p) => p.id === period.id ? { ...p, expenses: p.expenses.map((e) => (e.id === updated.id ? updated : e)) } : p));
    } else {
      const res = await fetch("/api/badminton/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const created: Expense = await res.json();
      setPeriods((prev) => prev.map((p) => (p.id === period.id ? { ...p, expenses: [...p.expenses, created] } : p)));
    }
    setShowExpenseModal(false);
  }

  async function deleteExpense(id: number) {
    if (!period) return;
    await fetch(`/api/badminton/expenses/${id}`, { method: "DELETE" });
    setPeriods((prev) => prev.map((p) => p.id === period.id ? { ...p, expenses: p.expenses.filter((e) => e.id !== id) } : p));
  }

  function openAddContrib() {
    setEditingContrib(null);
    setContribForm(defaultContribForm());
    setShowContribModal(true);
  }

  function openEditContrib(c: Contribution) {
    setEditingContrib(c);
    setContribForm({ memberName: c.memberName, amount: String(c.amount) });
    setShowContribModal(true);
  }

  async function saveContrib() {
    if (!period || !contribForm.memberName || !contribForm.amount) return;
    const body = { periodId: period.id, memberName: contribForm.memberName, amount: Number(contribForm.amount) };
    if (editingContrib) {
      const res = await fetch(`/api/badminton/contributions/${editingContrib.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const updated: Contribution = await res.json();
      setPeriods((prev) => prev.map((p) => p.id === period.id ? { ...p, contributions: p.contributions.map((c) => (c.id === updated.id ? updated : c)) } : p));
    } else {
      const res = await fetch("/api/badminton/contributions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const created: Contribution = await res.json();
      setPeriods((prev) => prev.map((p) => (p.id === period.id ? { ...p, contributions: [...p.contributions, created] } : p)));
    }
    setShowContribModal(false);
  }

  async function deleteContrib(id: number) {
    if (!period) return;
    await fetch(`/api/badminton/contributions/${id}`, { method: "DELETE" });
    setPeriods((prev) => prev.map((p) => p.id === period.id ? { ...p, contributions: p.contributions.filter((c) => c.id !== id) } : p));
  }

  async function addMember() {
    if (!newMemberName.trim()) return;
    const res = await fetch("/api/badminton/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newMemberName.trim() }) });
    const m: Member = await res.json();
    setMembers((prev) => [...prev, m]);
    setNewMemberName("");
  }

  async function toggleMember(m: Member) {
    const res = await fetch(`/api/badminton/members/${m.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !m.isActive }) });
    const updated: Member = await res.json();
    setMembers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  function formatMonth(m: string) {
    const [year, mon] = m.split("-");
    return new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const activeMembers = members.filter((m) => m.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Badminton Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track court fees, snacks, and group fund per month</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowMemberModal(true)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Manage Members
          </button>
          {period && (
            <button
              onClick={() => generateBadmintonPDF(period, members.filter((m) => m.isActive).map((m) => m.name))}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Download PDF
            </button>
          )}
          <button onClick={() => setShowNewPeriod(true)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            + New Month
          </button>
        </div>
      </div>

      {/* Period selector */}
      {periods.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriodId(p.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                p.id === selectedPeriodId
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {formatMonth(p.month)}
            </button>
          ))}
        </div>
      )}

      {!period && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No months yet.</p>
          <button onClick={() => setShowNewPeriod(true)} className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Add your first month
          </button>
        </div>
      )}

      {period && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Opening Balance</p>
              {editingOpening ? (
                <div className="mt-2 flex gap-1">
                  <input type="number" value={openingDraft} onChange={(e) => setOpeningDraft(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" autoFocus />
                  <button onClick={saveOpeningBalance} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">✓</button>
                  <button onClick={() => setEditingOpening(false)} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs dark:text-gray-300">✕</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{fmt(openingBalance)}</p>
                  <button onClick={() => { setOpeningDraft(String(openingBalance)); setEditingOpening(true); }} className="text-gray-400 hover:text-gray-600 text-xs" title="Edit opening balance">✎</button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Contributions</p>
              <p className="text-xl font-bold text-green-600 mt-1">{fmt(totalContributions)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Fund: {fmt(totalWithContrib)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Expenses</p>
              <p className="text-xl font-bold text-red-500 mt-1">{fmt(totalExpenses)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Closing Balance</p>
              <p className={`text-xl font-bold mt-1 ${closingBalance >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                {fmt(closingBalance)}
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expenses */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Expenses</h2>
                <button onClick={openAddExpense} className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                  + Add Expense
                </button>
              </div>

              {CATEGORIES.map((cat) => {
                const catExpenses = period.expenses.filter((e) => e.category === cat);
                return (
                  <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{cat}</h3>
                    </div>
                    {catExpenses.length === 0 ? (
                      <p className="text-xs text-gray-400 px-4 py-3">No entries</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-700">
                            <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Paid By</th>
                            <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Description</th>
                            <th className="text-center px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Week</th>
                            <th className="text-right px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Amount</th>
                            <th className="px-2 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {catExpenses.slice().sort((a, b) => a.week - b.week).map((e) => (
                            <tr key={e.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">{e.paidBy}</td>
                              <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{e.description || "—"}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="inline-block bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full">W{e.week}</span>
                              </td>
                              <td className="px-4 py-2 text-right font-medium text-red-600">{fmt(e.amount)}</td>
                              <td className="px-2 py-2 text-right whitespace-nowrap">
                                <button onClick={() => openEditExpense(e)} className="text-gray-400 hover:text-indigo-600 mr-2 text-xs" title="Edit">✎</button>
                                <button onClick={() => deleteExpense(e.id)} className="text-gray-400 hover:text-red-500 text-xs" title="Delete">✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <td colSpan={3} className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Subtotal</td>
                            <td className="px-4 py-2 text-right text-sm font-semibold text-red-600">{fmt(catExpenses.reduce((s, e) => s + e.amount, 0))}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contributions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Contributions</h2>
                <button onClick={openAddContrib} className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40">
                  + Add
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {period.contributions.length === 0 ? (
                  <p className="text-xs text-gray-400 px-4 py-6 text-center">No contributions yet</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Member</th>
                        <th className="text-right px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Amount</th>
                        <th className="px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {period.contributions.slice().sort((a, b) => a.memberName.localeCompare(b.memberName)).map((c) => (
                        <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">{c.memberName}</td>
                          <td className="px-4 py-2 text-right font-medium text-green-600">{fmt(c.amount)}</td>
                          <td className="px-2 py-2 text-right whitespace-nowrap">
                            <button onClick={() => openEditContrib(c)} className="text-gray-400 hover:text-indigo-600 mr-1 text-xs" title="Edit">✎</button>
                            <button onClick={() => deleteContrib(c.id)} className="text-gray-400 hover:text-red-500 text-xs" title="Delete">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Total</td>
                        <td className="px-4 py-2 text-right text-sm font-semibold text-green-600">{fmt(totalContributions)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              {activeMembers.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">Quick-add all members</p>
                  <div className="flex gap-2 flex-wrap">
                    {activeMembers.map((m) => {
                      const already = period.contributions.some((c) => c.memberName === m.name);
                      return (
                        <button
                          key={m.id}
                          disabled={already}
                          onClick={async () => {
                            if (already) return;
                            const res = await fetch("/api/badminton/contributions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ periodId: period.id, memberName: m.name, amount: 1500 }) });
                            const created: Contribution = await res.json();
                            setPeriods((prev) => prev.map((p) => p.id === period.id ? { ...p, contributions: [...p.contributions, created] } : p));
                          }}
                          className={`px-2 py-1 text-xs rounded-md border ${
                            already
                              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-400 cursor-default"
                              : "border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                          }`}
                        >
                          {already ? "✓ " : "+ "}{m.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-indigo-400 mt-2">Default ₹1,500 each</p>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Weekly Expense Summary</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Week</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKS.map((w) => {
                      const total = period.expenses.filter((e) => e.week === w).reduce((s, e) => s + e.amount, 0);
                      if (total === 0) return null;
                      return (
                        <tr key={w} className="border-b border-gray-50 dark:border-gray-700">
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-300">Week {w}</td>
                          <td className="px-4 py-2 text-right font-medium text-red-500">{fmt(total)}</td>
                        </tr>
                      );
                    })}
                    {period.expenses.length === 0 && (
                      <tr><td colSpan={2} className="px-4 py-3 text-xs text-gray-400 text-center">No expenses yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button onClick={deletePeriod} className="w-full text-xs text-red-400 hover:text-red-600 py-2 border border-red-100 dark:border-red-900 rounded-lg hover:border-red-300 dark:hover:border-red-700">
                Delete {formatMonth(period.month)}
              </button>
            </div>
          </div>
        </>
      )}

      {/* New Period Modal */}
      {showNewPeriod && (
        <Modal title="New Month" onClose={() => setShowNewPeriod(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
              <input type="month" value={newPeriodMonth} onChange={(e) => setNewPeriodMonth(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Balance (₹)</label>
              <input type="number" value={newPeriodOpening} onChange={(e) => setNewPeriodOpening(e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNewPeriod(false)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={createPeriod} disabled={!newPeriodMonth} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <Modal title={editingExpense ? "Edit Expense" : "Add Expense"} onClose={() => setShowExpenseModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={expenseForm.category} onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value as Category }))} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid By</label>
              <select value={expenseForm.paidBy} onChange={(e) => setExpenseForm((f) => ({ ...f, paidBy: e.target.value }))} className={inputCls}>
                <option value="">— Select member —</option>
                {members.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
              <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Narsi - Shuttlecock" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Week</label>
                <select value={expenseForm.week} onChange={(e) => setExpenseForm((f) => ({ ...f, week: Number(e.target.value) }))} className={inputCls}>
                  {WEEKS.map((w) => <option key={w} value={w}>Week {w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                <input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={saveExpense} disabled={!expenseForm.paidBy || !expenseForm.amount} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{editingExpense ? "Save" : "Add"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Contribution Modal */}
      {showContribModal && (
        <Modal title={editingContrib ? "Edit Contribution" : "Add Contribution"} onClose={() => setShowContribModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member</label>
              <select value={contribForm.memberName} onChange={(e) => setContribForm((f) => ({ ...f, memberName: e.target.value }))} className={inputCls}>
                <option value="">— Select member —</option>
                {members.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
              <input type="number" value={contribForm.amount} onChange={(e) => setContribForm((f) => ({ ...f, amount: e.target.value }))} className={inputCls} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowContribModal(false)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={saveContrib} disabled={!contribForm.memberName || !contribForm.amount} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{editingContrib ? "Save" : "Add"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Member Management Modal */}
      {showMemberModal && (
        <Modal title="Manage Members" onClose={() => setShowMemberModal(false)}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMember()} placeholder="Member name" className={`flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500`} />
              <button onClick={addMember} disabled={!newMemberName.trim()} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Add</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${m.isActive ? "text-gray-800 dark:text-gray-100" : "text-gray-400 line-through"}`}>{m.name}</span>
                  <button onClick={() => toggleMember(m)} className={`text-xs px-2 py-1 rounded-md border ${m.isActive ? "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" : "border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"}`}>
                    {m.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
              {members.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No members yet</p>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">✕</button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
