"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, TrendingUp, TrendingDown, Check } from "./Icons";

interface Transaction {
  id: number;
  type: string;
  date: string;
  description: string;
  details: string | null;
  amount: number;
}

interface Props {
  transaction: Transaction | null;
  defaultMonth: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function TransactionForm({ transaction, defaultMonth, onClose, onSaved }: Props) {
  const isEdit = !!transaction;

  function defaultDate() {
    if (transaction) return transaction.date.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  }

  const [type, setType] = useState(transaction?.type ?? "expense");
  const [date, setDate] = useState(defaultDate);
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [details, setDetails] = useState(transaction?.details ?? "");
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fetchSuggestions = useCallback(
    (value: string) => {
      if (!value.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const params = new URLSearchParams({ q: value, type });
        const data: string[] = await fetch(`/api/descriptions?${params}`).then((r) => r.json());
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setActiveIndex(-1);
      }, 200);
    },
    [type]
  );

  function handleDescriptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setDescription(val);
    fetchSuggestions(val);
  }

  function pickSuggestion(s: string) {
    setDescription(s);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    const amountInput = document.getElementById("amount-input");
    if (amountInput) (amountInput as HTMLInputElement).focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); pickSuggestion(suggestions[activeIndex]); }
    else if (e.key === "Tab" && activeIndex >= 0) { e.preventDefault(); pickSuggestion(suggestions[activeIndex]); }
    else if (e.key === "Escape") { setShowSuggestions(false); }
  }

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (description.trim()) fetchSuggestions(description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount || !date) { setError("All fields are required."); return; }
    setSaving(true);
    setError("");
    const payload = { type, date, description: description.trim(), details: details.trim() || null, amount: parseFloat(amount) };
    const url = isEdit ? `/api/transactions/${transaction!.id}` : "/api/transactions";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { setError("Failed to save. Please try again."); setSaving(false); return; }
    if (!isEdit) {
      setDescription("");
      setDetails("");
      setAmount("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setSaving(false);
    }
    onSaved();
  }

  function highlight(text: string, query: string) {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-200 text-gray-900 not-italic font-medium">{part}</mark>
        : part
    );
  }

  const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Type toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${type === "expense" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
            >
              <TrendingDown className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${type === "income" ? "bg-green-500 text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
            >
              <TrendingUp className="w-4 h-4" />
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payee</label>
            <input
              ref={inputRef}
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              onKeyDown={handleKeyDown}
              onFocus={() => description.trim() && suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="e.g. Swiggy, Amazon, Employer..."
              className={inputCls}
              required
              autoFocus
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul ref={listRef} className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={s}
                    onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`px-3 py-2 text-sm cursor-pointer ${
                      i === activeIndex
                        ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    {highlight(s, description)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={"e.g. Lunch for Appa\nLine 2..."}
              rows={3}
              className={`${inputCls} resize-y`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
            <input id="amount-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="0" step="0.01" className={inputCls} required />
          </div>

          {saved && <p className="text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">Transaction added successfully.</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5">
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
              {saving ? "Saving..." : <><Check className="w-4 h-4" />{isEdit ? "Update" : "Add"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
