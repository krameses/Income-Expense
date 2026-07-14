"use client";

import { useState } from "react";
import { BarChart, Calendar } from "./Icons";

interface Transaction {
  id: number;
  type: string;
  date: string;
  description: string;
  amount: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function today() { return new Date().toISOString().slice(0, 10); }
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

export default function ReportPage() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [ranLabel, setRanLabel] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "description" | "type" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  async function runReport() {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (search.trim()) params.set("search", search.trim());
    const data: Transaction[] = await fetch(`/api/transactions?${params}`).then((r) => r.json());
    setResults(data);
    setLoading(false);
    setRanLabel(buildLabel());
  }

  function buildLabel() {
    const parts: string[] = [];
    if (from && to) parts.push(`${fmtDate(from)} – ${fmtDate(to)}`);
    else if (from) parts.push(`From ${fmtDate(from)}`);
    else if (to) parts.push(`Up to ${fmtDate(to)}`);
    if (typeFilter !== "all") parts.push(typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1));
    if (search.trim()) parts.push(`"${search.trim()}"`);
    return parts.join(" · ");
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  const income = results?.filter((t) => t.type === "income") ?? [];
  const expense = results?.filter((t) => t.type === "expense") ?? [];
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const displayed = typeFilter === "income" ? income : typeFilter === "expense" ? expense : results ?? [];

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
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Report</h1>

      {/* Filter panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "all" | "income" | "expense")} className={inputCls}>
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search Description</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runReport()} placeholder="e.g. Rent, Swiggy..." className={inputCls} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs text-gray-400 self-center">Quick:</span>
          {[
            { label: "This month", fn: () => { setFrom(firstOfMonth()); setTo(today()); } },
            { label: "Last 7 days", fn: () => { const d = new Date(); d.setDate(d.getDate() - 6); setFrom(d.toISOString().slice(0, 10)); setTo(today()); } },
            { label: "Last 30 days", fn: () => { const d = new Date(); d.setDate(d.getDate() - 29); setFrom(d.toISOString().slice(0, 10)); setTo(today()); } },
            { label: "This year", fn: () => { setFrom(`${new Date().getFullYear()}-01-01`); setTo(today()); } },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn} className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={runReport} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading ? "Running..." : <><BarChart className="w-4 h-4" />Generate Report</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {results !== null && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Results</h2>
              {ranLabel && <p className="text-xs text-gray-400 mt-0.5">{ranLabel}</p>}
            </div>
            <span className="text-sm text-gray-400">{displayed.length} records</span>
          </div>

          {results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Income</p>
                <p className="text-xl font-bold text-green-600">{fmt(totalIncome)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{income.length} entries</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Expense</p>
                <p className="text-xl font-bold text-red-500">{fmt(totalExpense)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{expense.length} entries</p>
              </div>
              <div className={`rounded-xl border p-4 ${balance >= 0 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Balance</p>
                <p className={`text-xl font-bold ${balance >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(balance)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{balance >= 0 ? "Surplus" : "Deficit"}</p>
              </div>
            </div>
          )}

          {displayed.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              No transactions found for the selected filters.
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    {(["date", "description", "type"] as const).map((col) => (
                      <th key={col} className="px-4 py-3 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort(col)}>
                        <span className="inline-flex items-center gap-1">
                          {col.charAt(0).toUpperCase() + col.slice(1)}
                          <SortIndicator active={sortKey === col} dir={sortDir} />
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort("amount")}>
                      <span className="inline-flex items-center justify-end gap-1 w-full">Amount <SortIndicator active={sortKey === "amount"} dir={sortDir} /></span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sortedDisplayed.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {search.trim() ? <Highlight text={t.description} keyword={search.trim()} /> : t.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.type === "income" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-200 dark:border-gray-600">
                    <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Total ({displayed.length} records)
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-gray-100">
                      {typeFilter === "income" ? fmt(totalIncome) : typeFilter === "expense" ? fmt(totalExpense) : fmt(totalIncome - totalExpense)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SortIndicator({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="text-gray-300 dark:text-gray-600">⇅</span>;
  return <span className="text-indigo-500">{dir === "asc" ? "↑" : "↓"}</span>;
}

function Highlight({ text, keyword }: { text: string; keyword: string }) {
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
