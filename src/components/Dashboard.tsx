"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "./Icons";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

interface Transaction {
  id: number;
  type: string;
  date: string;
  description: string;
  amount: number;
}

interface FluteClass { date: string | null; }
interface FluteBatch {
  id: number;
  feeAmount: number;
  feePaidDate: string | null;
  classes: FluteClass[];
}

interface BadmintonPeriod {
  id: number;
  month: string;
  openingBalance: number;
  expenses: { amount: number }[];
  contributions: { amount: number }[];
}

interface LoanSummary {
  id: number;
  name: string;
  lender: string | null;
  loanAmount: number;
  emiAmount: number | null;
  outstandingBalance: number | null;
  totalPaid: number;
  pendingCount: number;
}

interface InvestmentSummary {
  id: number;
  name: string;
  type: string;
  totalInvested: number;
  entryCount: number;
  lastEntryDate: string | null;
}

interface UpcomingEvent {
  id: number;
  name: string;
  category: string;
  nextOccurrence: string;
  daysUntil: number;
  isRecurring: boolean;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function monthLabel(month: string) {
  const [year, mon] = month.split("-");
  return new Date(Number(year), Number(mon) - 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function yearsAndDays(start: Date) {
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const ann = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  if (ann > now) years--;
  const last = new Date(now.getFullYear() - (ann > now ? 1 : 0), start.getMonth(), start.getDate());
  const days = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
  return { years, days };
}

export default function Dashboard() {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [fluteBatches, setFluteBatches] = useState<FluteBatch[]>([]);
  const [badmintonPeriods, setBadmintonPeriods] = useState<BadmintonPeriod[]>([]);
  const [activeLoans, setActiveLoans] = useState<LoanSummary[]>([]);
  const [activeInvestments, setActiveInvestments] = useState<InvestmentSummary[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/months").then(r => r.json()),
      fetch("/api/flute/batches").then(r => r.json()),
      fetch("/api/badminton/periods").then(r => r.json()),
      fetch("/api/loans?archived=false").then(r => r.json()),
      fetch("/api/investments?active=true").then(r => r.json()),
      fetch("/api/events").then(r => r.json()),
    ]).then(([m, f, b, loans, investments, events]) => {
      setMonths(m);
      if (m.length > 0) setSelectedMonth(m[0]);
      else setLoading(false);
      setFluteBatches(f);
      setBadmintonPeriods(b);
      setActiveLoans(loans);
      setActiveInvestments(investments);
      setUpcomingEvents(events.filter((e: UpcomingEvent) => e.daysUntil >= 0 && e.daysUntil <= 7));
    });
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/summary?month=${selectedMonth}`).then(r => r.json()),
      fetch(`/api/transactions?month=${selectedMonth}`).then(r => r.json()),
    ]).then(([s, t]) => {
      setSummary(s);
      setRecent(t.slice(0, 10));
      setLoading(false);
    });
  }, [selectedMonth]);

  const allClassDates = fluteBatches
    .flatMap(b => b.classes.map(c => c.date))
    .filter(Boolean)
    .map(d => new Date(d!).getTime());
  const fluteStartDate  = allClassDates.length ? new Date(Math.min(...allClassDates)) : null;
  const fluteAttended   = fluteBatches.reduce((s, b) => s + b.classes.filter(c => c.date).length, 0);
  const fluteTotalFees  = fluteBatches.reduce((s, b) => s + b.feeAmount, 0);
  const fluteCurrentBatch = fluteBatches[0] ?? null;
  const fluteCurrentAttended = fluteCurrentBatch?.classes.filter(c => c.date).length ?? 0;
  const fluteDuration   = fluteStartDate ? yearsAndDays(fluteStartDate) : null;

  const totalOutstanding = activeLoans.reduce((s, l) => s + (l.outstandingBalance ?? Math.max(0, l.loanAmount - l.totalPaid)), 0);
  const totalMonthlyEmi = activeLoans.filter(l => l.emiAmount).reduce((s, l) => s + (l.emiAmount ?? 0), 0);
  const totalInvested = activeInvestments.reduce((s, i) => s + i.totalInvested, 0);

  const INVESTMENT_TYPE_LABEL: Record<string, string> = {
    chit: "Chit", mutual_fund: "Mutual Fund", stocks: "Stocks", fd: "FD", rd: "RD", gold: "Gold", other: "Other",
  };
  const INVESTMENT_TYPE_COLOR: Record<string, string> = {
    chit: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    mutual_fund: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    stocks: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    fd: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    rd: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  };

  const EVENT_ICONS: Record<string, string> = {
    birthday: "🎂", wedding_anniversary: "💍", death_anniversary: "🕯️",
    license: "📋", insurance: "🛡️", medical: "🏥", holiday: "🎉", other: "📌",
  };

  function eventDaysLabel(days: number) {
    if (days === 0) return { text: "Today!", cls: "text-red-600 font-bold" };
    if (days === 1) return { text: "Tomorrow", cls: "text-orange-500 font-semibold" };
    return { text: `In ${days} days`, cls: "text-amber-600 font-medium" };
  }

  const latestPeriod = badmintonPeriods[0] ?? null;
  const latestContrib   = latestPeriod?.contributions.reduce((s, c) => s + c.amount, 0) ?? 0;
  const latestExpenses  = latestPeriod?.expenses.reduce((s, e) => s + e.amount, 0) ?? 0;
  const latestClosing   = latestPeriod
    ? latestPeriod.openingBalance + latestContrib - latestExpenses
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {months.length === 0 && <option value="">No data yet</option>}
          {months.map(m => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-8">

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Upcoming Events</h2>
                <Link href="/events" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl overflow-hidden">
                <div className="divide-y divide-amber-100 dark:divide-amber-800/50">
                  {upcomingEvents.map(e => {
                    const { text, cls } = eventDaysLabel(e.daysUntil);
                    return (
                      <Link key={e.id} href="/events" className="flex items-center gap-3 px-5 py-3 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-colors">
                        <span className="text-xl shrink-0">{EVENT_ICONS[e.category] ?? "📌"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{e.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(e.nextOccurrence).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            {e.isRecurring && " · yearly"}
                          </p>
                        </div>
                        <span className={`text-sm shrink-0 ${cls}`}>{text}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Income & Expense */}
          {summary && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Income &amp; Expense — {monthLabel(selectedMonth)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href={`/transactions?month=${selectedMonth}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">{fmt(summary.totalIncome)}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{summary.incomeCount} entries</p>
                </Link>
                <Link href={`/transactions?month=${selectedMonth}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expense</p>
                  <p className="text-2xl font-bold text-red-500">{fmt(summary.totalExpense)}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{summary.expenseCount} entries</p>
                </Link>
                <div className={`rounded-xl border p-5 shadow-sm ${summary.balance >= 0 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Balance</p>
                  <p className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {fmt(summary.balance)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{summary.balance >= 0 ? "Surplus" : "Deficit"}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mt-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                    Recent — {monthLabel(selectedMonth)}
                  </h2>
                  <Link
                    href={`/transactions?month=${selectedMonth}`}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                {recent.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">No transactions this month</p>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {recent.map(t => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-block w-2 h-2 rounded-full ${t.type === "income" ? "bg-green-500" : "bg-red-400"}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.description}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                          {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {!summary && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions yet.</p>
              <Link
                href="/transactions"
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" /> Add your first transaction
              </Link>
            </div>
          )}

          {/* Loans */}
          {activeLoans.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Loans</h2>
                <Link href="/loans" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Active Loans</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{activeLoans.length}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Total Outstanding</p>
                    <p className="text-xl font-bold text-red-500">{fmt(totalOutstanding)}</p>
                  </div>
                  {totalMonthlyEmi > 0 && (
                    <div className="p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Monthly EMI</p>
                      <p className="text-xl font-bold text-indigo-600">{fmt(totalMonthlyEmi)}</p>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {activeLoans.map(loan => {
                    const outstanding = loan.outstandingBalance ?? Math.max(0, loan.loanAmount - loan.totalPaid);
                    const prog = Math.min(100, Math.round((loan.loanAmount - outstanding) / loan.loanAmount * 100));
                    return (
                      <Link key={loan.id} href="/loans" className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{loan.name}</p>
                            <p className="text-sm font-semibold text-red-500 ml-3 shrink-0">{fmt(outstanding)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${prog}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">{prog}%</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Investments */}
          {activeInvestments.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Investments</h2>
                <Link href="/investments" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Active Investments</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{activeInvestments.length}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Total Invested</p>
                    <p className="text-xl font-bold text-emerald-600">{fmt(totalInvested)}</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {activeInvestments.map(inv => (
                    <Link key={inv.id} href="/investments" className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INVESTMENT_TYPE_COLOR[inv.type] ?? INVESTMENT_TYPE_COLOR.other}`}>
                          {INVESTMENT_TYPE_LABEL[inv.type] ?? inv.type}
                        </span>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{inv.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">{fmt(inv.totalInvested)}</p>
                        <p className="text-xs text-gray-400">{inv.entryCount} {inv.entryCount === 1 ? "entry" : "entries"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Flute & Badminton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Flute Class */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Flute Class</h2>
                <Link href="/music-notes/schedule" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-indigo-600 px-5 py-3 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">Swaralayam</span>
                  {fluteDuration && (
                    <span className="text-indigo-100 text-xs">
                      {fluteDuration.years} years &amp; {fluteDuration.days} Days
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Batches</p>
                    <p className="text-xl font-bold text-indigo-600">{fluteBatches.length}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Classes</p>
                    <p className="text-xl font-bold text-green-600">{fluteAttended}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Fees Paid</p>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-200">₹{(fluteTotalFees / 1000).toFixed(0)}k</p>
                  </div>
                </div>
                {fluteCurrentBatch && (
                  <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Current batch — Batch {fluteBatches.length}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      fluteCurrentAttended === fluteCurrentBatch.classes.length
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {fluteCurrentAttended}/{fluteCurrentBatch.classes.length} classes
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Badminton */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Badminton</h2>
                <Link href="/badminton" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-emerald-600 px-5 py-3 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">
                    {latestPeriod ? monthLabel(latestPeriod.month) : "No data"}
                  </span>
                  <span className="text-emerald-100 text-xs">Latest month</span>
                </div>
                {latestPeriod ? (
                  <>
                    <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
                      <div className="p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Opening</p>
                        <p className="text-base font-bold text-gray-600 dark:text-gray-300">
                          ₹{(latestPeriod.openingBalance / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Expenses</p>
                        <p className="text-base font-bold text-red-500">
                          {fmt(latestExpenses)}
                        </p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Closing</p>
                        <p className="text-base font-bold text-emerald-600">
                          {fmt(latestClosing)}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {badmintonPeriods.length} months tracked
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {latestPeriod.contributions.length} members · {latestPeriod.expenses.length} expenses
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-gray-400 text-sm">No badminton data yet</p>
                )}
              </div>
            </section>

          </div>
        </div>
      )}
    </div>
  );
}
