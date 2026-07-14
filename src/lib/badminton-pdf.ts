import jsPDF from "jspdf";

interface Expense {
  id: number;
  category: string;
  paidBy: string;
  description: string;
  week: number;
  amount: number;
}

interface Contribution {
  id: number;
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

// ─── Colours ─────────────────────────────────────────────────────────────────
const NAVY   = [31,  56, 100] as const;
const CAT_BG = [217, 217, 217] as const;
const LIGHT  = [189, 215, 238] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function prevMonthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 2).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-IN");
}

// ─── Row-building: merge same payer into one row, overflow to next row ───────
interface ExpRow {
  label: string;
  weeks: Record<number, number>;
}

function buildRows(expenses: Expense[]): ExpRow[] {
  const rows: ExpRow[] = [];
  for (const e of expenses) {
    const label = e.description ? `${e.paidBy} - ${e.description}` : e.paidBy;
    const existing = rows.find(r => r.label === label && !(e.week in r.weeks));
    if (existing) {
      existing.weeks[e.week] = e.amount;
    } else {
      rows.push({ label, weeks: { [e.week]: e.amount } });
    }
  }
  return rows;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function generateBadmintonPDF(period: Period, allMemberNames: string[]) {
  const CATEGORIES = ["Court", "Snacks/Breakfast/Lunch/Dinner", "Other"];

  // Determine week columns (1 … max_week)
  const usedWeeks = period.expenses.map(e => e.week);
  const maxWeek = usedWeeks.length ? Math.max(...usedWeeks) : 5;
  const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1);

  // Page setup
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PAGE_W = 297;

  // Expense table geometry
  const LM  = 10;          // left margin
  const TM  = 12;          // top margin
  const TH  = 8;           // title row height
  const RH  = 6.5;         // data / category row height
  const TWC = 46;          // "Towards" column width
  const WKC = 18;          // each week column width
  const TBW = TWC + weeks.length * WKC; // total expense table width

  // Contribution table geometry
  const MBR_W = 22;        // per-member column width
  const CONT_W = allMemberNames.length * MBR_W;
  const CONT_X = PAGE_W - 10 - CONT_W; // flush right with 10mm margin

  // Totals (used for the expense-table total row and the balance summary)
  const totalContrib  = period.contributions.reduce((s, c) => s + c.amount, 0);
  const totalExpenses = period.expenses.reduce((s, e) => s + e.amount, 0);
  const openingBal    = period.openingBalance;
  const totalFund      = openingBal + totalContrib;
  const closingBal     = totalFund   - totalExpenses;

  // ── Helper: draw a filled + stroked rectangle ──────────────────────────────
  function cell(
    x: number, y: number, w: number, h: number,
    fillRGB: readonly [number, number, number] | null,
    strokeRGB: readonly [number, number, number] = [180, 180, 180]
  ) {
    if (fillRGB) {
      doc.setFillColor(fillRGB[0], fillRGB[1], fillRGB[2]);
      doc.rect(x, y, w, h, "F");
    }
    doc.setDrawColor(strokeRGB[0], strokeRGB[1], strokeRGB[2]);
    doc.rect(x, y, w, h, "S");
  }

  // ── Helper: centred text in a cell ────────────────────────────────────────
  function cellText(
    text: string, x: number, y: number, w: number, h: number,
    rgb: readonly [number, number, number], bold: boolean, size: number,
    align: "left" | "center" | "right" = "center"
  ) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const tx = align === "left" ? x + 2 : align === "right" ? x + w - 2 : x + w / 2;
    doc.text(text, tx, y + h / 2, { align, baseline: "middle" });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LEFT — Expense table
  // ════════════════════════════════════════════════════════════════════════════
  let ey = TM;

  // Title row
  cell(LM, ey, TBW, TH, NAVY);
  cellText(`Badminton - Expenses - ${monthLabel(period.month)}`, LM, ey, TBW, TH, [255, 255, 255], true, 10);
  ey += TH;

  // Column header row
  cell(LM, ey, TWC, RH, NAVY);
  cellText("Towards", LM, ey, TWC, RH, [255, 255, 255], true, 9, "left");
  for (let i = 0; i < weeks.length; i++) {
    const wx = LM + TWC + i * WKC;
    cell(wx, ey, WKC, RH, NAVY);
    cellText(`Week ${weeks[i]}`, wx, ey, WKC, RH, [255, 255, 255], true, 8);
  }
  ey += RH;

  // Category sections
  for (const cat of CATEGORIES) {
    // Category header
    cell(LM, ey, TBW, RH, CAT_BG);
    cellText(cat, LM, ey, TBW, RH, [0, 0, 0], true, 9, "left");
    ey += RH;

    const rows = buildRows(period.expenses.filter(e => e.category === cat));

    // Always at least one blank row so the table looks like the Excel
    const displayRows = rows.length > 0 ? rows : [{ label: "", weeks: {} }];

    for (const row of displayRows) {
      // Towards cell
      cell(LM, ey, TWC, RH, [255, 255, 255]);
      cellText(row.label, LM, ey, TWC, RH, [0, 0, 0], false, 9, "left");
      // Week cells
      for (let i = 0; i < weeks.length; i++) {
        const wx = LM + TWC + i * WKC;
        const amt = row.weeks[weeks[i]];
        cell(wx, ey, WKC, RH, [255, 255, 255]);
        if (amt !== undefined) {
          cellText(fmtNum(amt), wx, ey, WKC, RH, [0, 0, 0], false, 9, "right");
        }
      }
      ey += RH;
    }
  }

  // Total row
  cell(LM, ey, TWC, RH, CAT_BG);
  cellText("Total", LM, ey, TWC, RH, [0, 0, 0], true, 9, "left");
  cell(LM + TWC, ey, TBW - TWC, RH, [255, 255, 255]);
  cellText(fmtNum(totalExpenses), LM + TWC, ey, TBW - TWC, RH, [0, 0, 0], true, 9, "right");
  ey += RH;

  // ════════════════════════════════════════════════════════════════════════════
  // RIGHT — Contribution table
  // ════════════════════════════════════════════════════════════════════════════
  let cy = TM;

  // "Contribution" header
  cell(CONT_X, cy, CONT_W, TH, LIGHT);
  cellText("Contribution", CONT_X, cy, CONT_W, TH, [0, 0, 0], true, 10);
  cy += TH;

  // Member name row
  for (let i = 0; i < allMemberNames.length; i++) {
    const mx = CONT_X + i * MBR_W;
    cell(mx, cy, MBR_W, RH, NAVY);
    cellText(allMemberNames[i], mx, cy, MBR_W, RH, [255, 255, 255], true, 9);
  }
  cy += RH;

  // Contribution amounts row
  for (let i = 0; i < allMemberNames.length; i++) {
    const mx = CONT_X + i * MBR_W;
    const total = period.contributions
      .filter(c => c.memberName === allMemberNames[i])
      .reduce((s, c) => s + c.amount, 0);
    cell(mx, cy, MBR_W, RH, [255, 255, 255]);
    if (total > 0) cellText(fmtNum(total), mx, cy, MBR_W, RH, [0, 0, 0], false, 9);
  }
  cy += RH;

  // ════════════════════════════════════════════════════════════════════════════
  // RIGHT — Balance summary (below expense table, right-aligned with contrib)
  // ════════════════════════════════════════════════════════════════════════════

  // Start balance block below expense table + gap
  let by = ey + 8;

  const LABEL_X  = CONT_X - 40;  // label starts left of contribution table
  const LABEL_W  = 38;
  const AMT_X    = CONT_X;
  const AMT_W    = CONT_W;
  const BROW_H   = 12;           // taller rows for wrapped labels

  doc.setDrawColor(180, 180, 180);

  // Row: Opening Balance
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Opening Balance\n(From ${prevMonthLabel(period.month)})`, LABEL_X, by + 3, { baseline: "top" });
  doc.setFont("helvetica", "bold");
  doc.text(fmtNum(openingBal), AMT_X + AMT_W / 2, by + BROW_H / 2, { align: "center", baseline: "middle" });
  by += BROW_H + 2;

  // Row: Total Contribution – Opening Balance
  doc.setFont("helvetica", "normal");
  doc.text("Total Contribution -\nOpening Balance", LABEL_X, by + 3, { baseline: "top" });
  doc.setFont("helvetica", "bold");
  doc.text(fmtNum(totalFund), AMT_X + AMT_W / 2, by + BROW_H / 2, { align: "center", baseline: "middle" });
  by += BROW_H + 6;

  // Row: Closing Balance (bold + slightly larger)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Closing Balance", LABEL_X, by + 4, { baseline: "top" });
  doc.text(fmtNum(closingBal), AMT_X + AMT_W / 2, by + 4, { align: "center", baseline: "top" });

  doc.save(`Badminton-${period.month}.pdf`);
}
