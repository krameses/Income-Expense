"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

type PlainLink = { href: string; label: string; submenu?: never };
type DropdownLink = { href?: never; label: string; submenu: { href: string; label: string }[] };
type NavItem = PlainLink | DropdownLink;

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard" },
  {
    label: "Income & Expense",
    submenu: [
      { href: "/transactions", label: "Transactions" },
      { href: "/loans", label: "Loans" },
      { href: "/investments", label: "Investments" },
      { href: "/report", label: "Reports" },
    ],
  },
  {
    label: "Flute Class",
    submenu: [
      { href: "/music-notes", label: "Music Notes" },
      { href: "/music-notes/schedule", label: "Schedule" },
    ],
  },
  { href: "/badminton", label: "Badminton" },
  {
    label: "My Vault",
    submenu: [
      { href: "/events", label: "Events" },
      { href: "/credentials", label: "Credentials" },
      { href: "/records", label: "Records" },
    ],
  },
  { href: "/education", label: "Education" },
];

function DropdownMenu({ item }: { item: DropdownLink }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = item.submenu.some((s) => pathname === s.href);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {item.label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
          {item.submenu.map((sub) => (
            <Link
              key={sub.href}
              href={sub.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm transition-colors ${
                pathname === sub.href
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SunIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
          <svg viewBox="0 0 512 512" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
            <path d="M256 413.12L98.88 255.988 256 98.879l52.378 52.369-104.757 104.74 52.374 52.376 157.122-157.108L276.244 14.388c-11.175-11.187-29.303-11.187-40.49 0L14.382 235.76c-11.176 11.175-11.176 29.304 0 40.488l221.372 221.367c11.187 11.182 29.315 11.182 40.49 0l221.374-221.367c11.176-11.184 11.176-29.313 0-40.488l-32.136-32.127L256 413.12z" fill="#ff2020" fillRule="nonzero"/>
          </svg>
          Ramesh's Portal
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) =>
            item.submenu ? (
              <DropdownMenu key={item.label} item={item} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <button
            onClick={toggle}
            className="ml-2 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}
