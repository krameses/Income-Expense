"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ROOTS = ["C", "C# / Db", "D", "D# / Eb", "E", "F", "F# / Gb", "G", "G# / Ab", "A", "A# / Bb", "B"];

const SCALE_GROUPS: { label: string; scales: string[] }[] = [
  { label: "Major Scales", scales: ROOTS.map((r) => `${r} Major`) },
  { label: "Natural Minor Scales", scales: ROOTS.map((r) => `${r} Minor`) },
  { label: "Harmonic Minor Scales", scales: ROOTS.map((r) => `${r} Harmonic Minor`) },
  { label: "Melodic Minor Scales", scales: ROOTS.map((r) => `${r} Melodic Minor`) },
  { label: "Pentatonic Scales", scales: [...ROOTS.map((r) => `${r} Major Pentatonic`), ...ROOTS.map((r) => `${r} Minor Pentatonic`)] },
  { label: "Blues Scales", scales: ROOTS.map((r) => `${r} Blues`) },
  { label: "Modes", scales: [...ROOTS.map((r) => `${r} Dorian`), ...ROOTS.map((r) => `${r} Phrygian`), ...ROOTS.map((r) => `${r} Lydian`), ...ROOTS.map((r) => `${r} Mixolydian`), ...ROOTS.map((r) => `${r} Locrian`)] },
  { label: "Other Scales", scales: [...ROOTS.map((r) => `${r} Whole Tone`), ...ROOTS.map((r) => `${r} Diminished`), ...ROOTS.map((r) => `${r} Augmented`), "Chromatic"] },
];

interface SongSummary {
  id: number;
  songName: string;
  scale: string | null;
  createdAt: string;
}

interface Song {
  id: number;
  songName: string;
  scale: string | null;
  notes: string;
}

function computeColumns(lines: string[]): number {
  const nonEmpty = lines.filter((l) => l.trim()).length;
  if (nonEmpty <= 20) return 1;
  if (nonEmpty <= 40) return 2;
  return 3;
}

function splitIntoColumns(lines: string[], cols: number): string[][] {
  const result: string[][] = Array.from({ length: cols }, () => []);
  const perCol = Math.ceil(lines.length / cols);
  lines.forEach((line, i) => { result[Math.floor(i / perCol)].push(line); });
  return result;
}

function NotesDisplay({ notes }: { notes: string }) {
  const lines = notes.split("\n");
  const cols = computeColumns(lines);
  const columns = splitIntoColumns(lines, cols);

  return (
    <div className="grid gap-6 mt-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {columns.map((col, ci) => (
        <div key={ci} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          {col.map((line, li) => {
            const isSection =
              /^(Pallavi|Charanam|pallavi|charanam)/i.test(line.trim()) ||
              /^\d+ lines? repeat/i.test(line.trim()) ||
              /^Go to/i.test(line.trim()) ||
              /^Again/i.test(line.trim());
            const isLabel =
              line.trim() &&
              !/^[A-G#b,.\s\d*^()]+$/.test(line.trim()) &&
              line.trim().length < 25;
            return (
              <div
                key={li}
                className={`font-mono text-sm leading-relaxed whitespace-pre ${
                  isSection
                    ? "text-indigo-700 dark:text-indigo-300 font-bold mt-3 mb-1"
                    : isLabel
                    ? "text-gray-700 dark:text-gray-200 font-semibold mt-2"
                    : line.trim()
                    ? "text-gray-900 dark:text-gray-100"
                    : "h-3"
                }`}
              >
                {line || "\u00a0"}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const inputCls = "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400";

export default function MusicNotesPage() {
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [search, setSearch] = useState("");
  const [filterScale, setFilterScale] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [mode, setMode] = useState<"list" | "view" | "edit" | "new">("list");
  const [form, setForm] = useState({ songName: "", scale: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSongs = useCallback(async (q: string, scale: string) => {
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (scale) params.set("scale", scale);
    const res = await fetch(`/api/music-notes?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) { console.error("fetchSongs error:", data); return; }
    setSongs(data);
  }, []);

  useEffect(() => { fetchSongs("", ""); }, [fetchSongs]);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => fetchSongs(val, filterScale), 300);
  };

  const handleFilterScale = (val: string) => {
    setFilterScale(val);
    fetchSongs(search, val);
  };

  const currentIndex = selectedSong ? songs.findIndex((s) => s.id === selectedSong.id) : -1;

  const openSong = async (id: number) => {
    const res = await fetch(`/api/music-notes/${id}`);
    const song = await res.json();
    setSelectedSong(song);
    setMode("view");
  };

  const startEdit = () => {
    if (!selectedSong) return;
    setForm({ songName: selectedSong.songName, scale: selectedSong.scale ?? "", notes: selectedSong.notes });
    setMode("edit");
    setError("");
  };

  const startNew = () => {
    setForm({ songName: "", scale: "", notes: "" });
    setSelectedSong(null);
    setMode("new");
    setError("");
  };

  const cancel = () => { if (selectedSong) setMode("view"); else setMode("list"); };

  const save = async () => {
    if (!form.songName.trim() || !form.notes.trim()) { setError("Both song name and notes are required."); return; }
    setSaving(true);
    setError("");
    try {
      let res: Response;
      if (mode === "edit" && selectedSong) {
        res = await fetch(`/api/music-notes/${selectedSong.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      } else {
        res = await fetch("/api/music-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      if (!res.ok) { setError("Failed to save."); return; }
      const saved: Song = await res.json();
      setSelectedSong(saved);
      setMode("view");
      fetchSongs(search, filterScale);
    } finally {
      setSaving(false);
    }
  };

  const deleteSong = async () => {
    if (!selectedSong || !confirm(`Delete "${selectedSong.songName}"?`)) return;
    await fetch(`/api/music-notes/${selectedSong.id}`, { method: "DELETE" });
    setSelectedSong(null);
    setMode("list");
    fetchSongs(search, filterScale);
  };

  const lines = form.notes.split("\n");
  const previewCols = computeColumns(lines);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Music Notes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Store and view flute song notes</p>
        </div>
        {mode === "list" && (
          <button onClick={startNew} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            + Add Song
          </button>
        )}
        {mode === "view" && (
          <div className="flex items-center gap-2">
            <button onClick={() => currentIndex > 0 && openSong(songs[currentIndex - 1].id)} disabled={currentIndex <= 0} className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Previous song">← Prev</button>
            <span className="text-xs text-gray-400 tabular-nums min-w-[3rem] text-center">
              {currentIndex >= 0 ? `${currentIndex + 1} / ${songs.length}` : ""}
            </span>
            <button onClick={() => currentIndex < songs.length - 1 && openSong(songs[currentIndex + 1].id)} disabled={currentIndex >= songs.length - 1} className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Next song">Next →</button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button onClick={startEdit} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Edit</button>
            <button onClick={deleteSong} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
            <button onClick={() => { setMode("list"); setSelectedSong(null); }} className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">← Back</button>
          </div>
        )}
      </div>

      {/* Song form */}
      {(mode === "new" || mode === "edit") && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {mode === "new" ? "Add New Song" : "Edit Song"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Song Name</label>
              <input type="text" value={form.songName} onChange={(e) => setForm((f) => ({ ...f, songName: e.target.value }))} placeholder="e.g. Naan pesa ninaipa" className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scale / Key</label>
              <select value={form.scale} onChange={(e) => setForm((f) => ({ ...f, scale: e.target.value }))} className={`w-full ${inputCls}`}>
                <option value="">— Select scale —</option>
                {SCALE_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.scales.map((s) => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
              {form.notes && (
                <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 font-normal">
                  {lines.filter((l) => l.trim()).length} lines → {previewCols} column{previewCols > 1 ? "s" : ""}
                </span>
              )}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={16}
              placeholder={`Paste notes here, one line per row.\n\nExample:\nPallavi.\nG G G\nFG GG G\nNee pesa\nFG G G`}
              className={`w-full ${inputCls} font-mono resize-y`}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={cancel} className="border border-gray-300 dark:border-gray-600 px-5 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Song view */}
      {mode === "view" && selectedSong && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedSong.songName}</h2>
            {selectedSong.scale && (
              <span className="shrink-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">
                {selectedSong.scale}
              </span>
            )}
          </div>
          <NotesDisplay notes={selectedSong.notes} />
        </div>
      )}

      {/* Song list */}
      {mode === "list" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div className="flex gap-3">
            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by song name…" className={`flex-1 ${inputCls}`} />
            <select value={filterScale} onChange={(e) => handleFilterScale(e.target.value)} className={`w-56 ${inputCls}`}>
              <option value="">All scales</option>
              {SCALE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.scales.map((s) => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          {songs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              {search ? "No songs match your search." : 'No songs yet. Click "+ Add Song" to get started.'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {songs.map((s, idx) => (
                <li key={s.id}>
                  <button
                    onClick={() => openSong(s.id)}
                    className="w-full text-left px-3 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center justify-between gap-4 group"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 truncate flex items-center gap-2">
                      <span className="shrink-0 text-xs text-gray-400 w-7 text-right">{idx + 1}.</span>
                      {s.songName}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.scale && (
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full">
                          {s.scale}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
