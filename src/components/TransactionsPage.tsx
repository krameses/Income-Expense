"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import TransactionForm from "./TransactionForm";
import { Plus, Search, Pencil, Trash, TrendingUp, TrendingDown, List } from "./Icons";

interface Transaction {
  id: number;
  type: string;
  date: string;
  description: string;
  details: string | null;
  amount: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function monthLabel(month: string) {
  const [year, mon] = month.split("-");
  return new Date(Number(year), Number(mon) - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const urlMonth = searchParams.get("month") ?? "";

  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(urlMonth);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [sortKey, setSortKey] = useState<"date" | "description" | "type" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  useEffect(() => {
    fetch("/api/months").then((r) => r.json()).then((data: string[]) => {
      setMonths(data);
      if (!urlMonth && data.length > 0) setSelectedMonth(data[0]);
    });
  }, [urlMonth]);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedMonth) params.set("month", selectedMonth);
    if (filter !== "all") params.set("type", filter);
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/transactions?${params}`).then((r) => r.json()).then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, [selectedMonth, filter, search]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  async function deleteTransaction(id: number) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadTransactions();
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    if (searchInput.trim()) setSelectedMonth("");
  }

  function clearSearch() { setSearchInput(""); setSearch(""); }

  const income = transactions.filter((t) => t.type === "income");
  const expense = transactions.filter((t) => t.type === "expense");
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0);
  const displayed = filter === "income" ? income : filter === "expense" ? expense : transactions;

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sortedDisplayed = [...displayed].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    else if (sortKey === "description") cmp = a.description.localeCompare(b.description);
    else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
    else if (sortKey === "amount") cmp = a.amount - b.amount;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Transactions</h1>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search description..."
            className="w-full pl-8 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {searchInput && (
            <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5">
          <Search className="w-4 h-4" />
          Search
        </button>
      </form>

      {search && (
        <div className="flex items-center gap-2 mb-4 text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg w-fit">
          <span>Showing results for &ldquo;<strong>{search}</strong>&rdquo;</span>
          <button onClick={clearSearch} className="text-indigo-400 hover:text-indigo-700 font-bold">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={selectedMonth}
          onChange={(e) => { setSelectedMonth(e.target.value); setSearch(""); setSearchInput(""); }}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All months</option>
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>

        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {f === "income" ? <TrendingUp className="w-3.5 h-3.5" /> : f === "expense" ? <TrendingDown className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Totals bar */}
      {displayed.length > 0 && (
        <div className="flex gap-4 mb-5 text-sm">
          <span className="text-green-600 font-semibold">Income: {fmt(totalIncome)}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-red-500 font-semibold">Expense: {fmt(totalExpense)}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className={`font-semibold ${totalIncome - totalExpense >= 0 ? "text-green-700" : "text-red-600"}`}>
            Balance: {fmt(totalIncome - totalExpense)}
          </span>
          <span className="text-gray-400">({displayed.length} records)</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No transactions found.</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort("date")}>
                  <span className="inline-flex items-center gap-1">Date <SortIndicator active={sortKey === "date"} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort("description")}>
                  <span className="inline-flex items-center gap-1">Payee<SortIndicator active={sortKey === "description"} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort("type")}>
                  <span className="inline-flex items-center gap-1">Type <SortIndicator active={sortKey === "type"} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 text-right cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort("amount")}>
                  <span className="inline-flex items-center justify-end gap-1 w-full">Amount <SortIndicator active={sortKey === "amount"} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortedDisplayed.map((t) => {
                const isExpanded = expandedIds.has(t.id);
                return (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors align-top">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-xs">
                      {search ? <Highlight text={t.description} keyword={search} /> : t.description}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
                      {t.details ? (
                        <div>
                          <button onClick={() => toggleExpand(t.id)} className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium">
                            <span className="transition-transform duration-150" style={{ display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                            {isExpanded ? "Hide" : "Show"}
                          </button>
                          {isExpanded && <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{t.details}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.type === "income" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => { setEditTarget(t); setShowForm(true); }} className="text-indigo-500 hover:text-indigo-700 mr-3 text-xs font-medium inline-flex items-center gap-1">
                        <Pencil className="w-3.5 h-3.5" />Edit
                      </button>
                      <button onClick={() => deleteTransaction(t.id)} className="text-red-400 hover:text-red-600 text-xs font-medium inline-flex items-center gap-1">
                        <Trash className="w-3.5 h-3.5" />Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <TransactionForm
          transaction={editTarget}
          defaultMonth={selectedMonth}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            if (editTarget) setShowForm(false);
            fetch("/api/months").then(r => r.json()).then((data: string[]) => {
              setMonths(data);
              if (!selectedMonth && data.length > 0) setSelectedMonth(data[0]);
            });
            loadTransactions();
          }}
        />
      )}
    </div>
  );
}

function SortIndicator({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="text-gray-300 dark:text-gray-600">⇅</span>;
  return <span className="text-indigo-500">{dir === "asc" ? "↑" : "↓"}</span>;
}

function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <>{text}</>;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}
