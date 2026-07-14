"""
Parse Flute - Music Notes.docx and import songs into the SQLite database.
Run from the project root: python scripts/import_music_notes.py
"""

import zipfile, re, sqlite3, sys
from datetime import datetime, timezone
from pathlib import Path

DOCX_PATH = r"C:\Users\krame\Downloads\Flute - Music Notes.docx"
DB_PATH   = Path(__file__).resolve().parent.parent / "dev.db"

# ── Scale data ────────────────────────────────────────────────────────────────

SCALE_MAP = {
    # Minor (check before single-letter majors — sorted longest-first below)
    "C#m": "C# Minor",       "F#m": "F# / Gb Minor",  "G#m": "G# / Ab Minor",
    "Bbm": "A# / Bb Minor",  "Ebm": "D# / Eb Minor",  "Abm": "G# / Ab Minor",
    "Em":  "E Minor",        "Dm":  "D Minor",         "Gm":  "G Minor",
    "Am":  "A Minor",        "Cm":  "C Minor",         "Fm":  "F Minor",
    "Bm":  "B Minor",
    # Major
    "C#":  "C# Major",       "F#":  "F# / Gb Major",  "G#":  "G# / Ab Major",
    "Bb":  "A# / Bb Major",  "Eb":  "D# / Eb Major",  "Ab":  "G# / Ab Major",
    "C":   "C Major",        "D":   "D Major",         "E":   "E Major",
    "F":   "F Major",        "G":   "G Major",         "A":   "A Major",
    "B":   "B Major",
}
SCALE_KEYS_DESC = sorted(SCALE_MAP, key=len, reverse=True)

# Non-musical tokens that appear after a dot (composer names, tags, etc.)
NON_SONG_TOKENS = {
    "ARR", "Arr", "arr", "TM", "BJ", "VTV", "Harris", "harris",
    "banumathi", "raja", "yuvan", "chinmayee", "anirudh", "Anirudh",
    "Boys", "bus", "full", "Full", "song", "Song", "pushpa", "pallavi",
    "vaaru", "psycho", "jawan", "GVP", "Duet",
}

# ── Heading parser ────────────────────────────────────────────────────────────

def _first_token(text: str) -> str:
    """Return the first whitespace/punctuation-delimited token."""
    return re.split(r"[\s.,();\-/]+", text.strip())[0] if text.strip() else ""

def _starts_with_scale(token: str) -> bool:
    """True when token starts with a recognised scale key."""
    for key in SCALE_KEYS_DESC:
        if token == key:
            return True
        # Allow trailing non-alpha chars: "Dm." "Em-"
        if token.startswith(key) and not token[len(key):len(key)+1].isalpha():
            return True
    return False

def clean_song_name(heading: str) -> str:
    """Return just the song title, stripping scale / metadata suffixes."""
    # Drop parenthetical sub-notes like "(F = F#)" or "(B = Bb)"
    name = re.sub(r"\s*\([^)]*\)", "", heading).strip()

    # Split on the FIRST dot (the separator between title and metadata)
    dot_pos = name.find(".")
    if dot_pos > 0:
        before = name[:dot_pos].strip()
        after  = name[dot_pos + 1:].strip()
        tok    = _first_token(after)
        if tok and (_starts_with_scale(tok) or tok in NON_SONG_TOKENS
                    or tok.upper() in {t.upper() for t in NON_SONG_TOKENS}):
            name = before

    return name.strip().rstrip(".").strip() or heading.strip(".")

def extract_scale(heading: str) -> str | None:
    """Find the first recognised scale token anywhere in the heading."""
    # Tokenise on common separators
    tokens = re.split(r"[\s.,;()\-/]+", heading)
    for tok in tokens:
        for key in SCALE_KEYS_DESC:
            if tok == key:
                return SCALE_MAP[key]
            # Also match "EmFull" → still Em
            if tok.startswith(key) and not tok[len(key):len(key)+1].isalpha():
                return SCALE_MAP[key]
    return None

# ── Document parser ───────────────────────────────────────────────────────────

def parse_docx(path: str) -> list[dict]:
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8")

    para_re  = re.compile(r"<w:p[ >].*?</w:p>", re.DOTALL)
    style_re = re.compile(r'<w:pStyle w:val="([^"]+)"')
    text_re  = re.compile(r"<w:t[^>]*>([^<]*)</w:t>")

    songs: list[dict] = []
    current_lines: list[str] = []
    current_heading: str | None = None

    def flush():
        if current_heading is None:
            return
        # Remove consecutive duplicate lines (table-layout artefacts)
        deduped: list[str] = []
        for line in current_lines:
            if not deduped or line != deduped[-1]:
                deduped.append(line)
        notes = "\n".join(deduped).strip()
        songs.append({
            "songName": clean_song_name(current_heading),
            "scale":    extract_scale(current_heading),
            "notes":    notes,
        })

    for para in para_re.findall(xml):
        sm    = style_re.search(para)
        style = sm.group(1) if sm else "Normal"
        text  = "".join(text_re.findall(para)).strip()

        if style.startswith("Heading"):
            flush()
            current_heading = text or current_heading
            current_lines   = []
        elif current_heading is not None:
            current_lines.append(text)

    flush()
    return songs

# ── Database import ───────────────────────────────────────────────────────────

def import_songs(songs: list[dict], db_path: Path):
    now  = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    conn = sqlite3.connect(str(db_path))
    cur  = conn.cursor()

    cur.execute("SELECT songName FROM MusicNote")
    existing = {row[0] for row in cur.fetchall()}

    inserted = skipped = 0
    for s in songs:
        if not s["notes"]:
            skipped += 1
            continue
        if s["songName"] in existing:
            print(f"  SKIP (exists): {s['songName']}")
            skipped += 1
            continue
        cur.execute(
            "INSERT INTO MusicNote (songName, scale, notes, createdAt, updatedAt) VALUES (?,?,?,?,?)",
            (s["songName"], s["scale"], s["notes"], now, now),
        )
        print(f"  + {s['songName']!r:50s}  [{s['scale'] or '—'}]")
        inserted += 1

    conn.commit()
    conn.close()
    return inserted, skipped

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"Parsing {DOCX_PATH} …\n")
    songs = parse_docx(DOCX_PATH)
    print(f"Found {len(songs)} songs.\n")

    # Preview name/scale extraction
    for s in songs:
        print(f"  {s['songName']!r:50s}  [{s['scale'] or '—'}]")

    print(f"\nInsert into {DB_PATH}? (y/n) ", end="", flush=True)
    if input().strip().lower() != "y":
        print("Aborted.")
        sys.exit(0)

    print()
    inserted, skipped = import_songs(songs, DB_PATH)
    print(f"\nDone. Inserted: {inserted}  Skipped/empty: {skipped}")
