import jsPDF from "jspdf";

interface FluteClass {
  classNumber: number;
  date: string | null;
  notes: string | null;
}

export interface FluteBatchForPDF {
  feeAmount: number;
  feePaidDate: string | null;
  notes: string | null;
  classes: FluteClass[];
}

// ── colours ───────────────────────────────────────────────────────────────────
const INDIGO  = [67,  56, 202] as const;
const INDIGO9 = [30,  27,  75] as const;
const INDIGO1 = [224,231, 255] as const;
const SLATE5  = [100,116, 139] as const;
const SLATE2  = [226,232, 240] as const;
const SLATE1  = [241,245, 249] as const;
const GREEN6  = [22, 163,  74] as const;
const WHITE   = [255,255, 255] as const;
const INK     = [15,  23,  42] as const;

// ── helpers ───────────────────────────────────────────────────────────────────
function longDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function tableDate(s: string | null): string {
  if (!s) return "";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "2-digit",
  });
}

// ── main export ───────────────────────────────────────────────────────────────
export function generateBatchPDF(batch: FluteBatchForPDF, batchNumber: number) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PW = 210;
  const PH = 297;
  const LM = 20;
  const RM = 20;
  const UW = PW - LM - RM;           // 170 mm

  const attended  = batch.classes.filter(c => c.date).length;
  const total     = batch.classes.length;
  const complete  = attended === total;

  // ── 1. HEADER BAND ─────────────────────────────────────────────────────────
  doc.setFillColor(INDIGO9[0], INDIGO9[1], INDIGO9[2]);
  doc.rect(0, 0, PW, 36, "F");

  // left accent bar
  doc.setFillColor(INDIGO[0], INDIGO[1], INDIGO[2]);
  doc.rect(0, 0, 6, 36, "F");

  // Title
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Flute Class Schedule", LM + 2, 14, { baseline: "middle" });

  // School + batch subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INDIGO1[0], INDIGO1[1], INDIGO1[2]);
  doc.text("Swaralayam", LM + 2, 22, { baseline: "middle" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Batch ${batchNumber}`, LM + 2, 30, { baseline: "middle" });

  // Fee pill (top-right)
  const feeLabel = `₹${batch.feeAmount.toLocaleString("en-IN")}`;
  const paidLabel = batch.feePaidDate ? `Paid: ${longDate(batch.feePaidDate)}` : "";
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text(feeLabel, PW - RM, 20, { align: "right", baseline: "middle" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(INDIGO1[0], INDIGO1[1], INDIGO1[2]);
  doc.text(paidLabel, PW - RM, 28, { align: "right", baseline: "middle" });

  // ── 2. STATUS BAR ──────────────────────────────────────────────────────────
  const statusY = 36;
  const statusH = 10;
  const statusCol = complete ? GREEN6 : attended > 0 ? [217, 119, 6] as const : SLATE5;
  doc.setFillColor(statusCol[0], statusCol[1], statusCol[2]);
  doc.rect(0, statusY, PW, statusH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  const statusText = complete
    ? `✓  All ${total} classes completed`
    : `${attended} of ${total} classes attended  •  ${total - attended} remaining`;
  doc.text(statusText, PW / 2, statusY + statusH / 2, { align: "center", baseline: "middle" });

  // ── 3. TABLE ───────────────────────────────────────────────────────────────
  const tableY    = statusY + statusH + 8;
  const colNumW   = 18;
  const colDateW  = 55;
  const colDayW   = 40;
  const colNotesW = UW - colNumW - colDateW - colDayW;
  const rowH      = 10;
  const hdrH      = 8;

  // Column header row
  doc.setFillColor(INDIGO[0], INDIGO[1], INDIGO[2]);
  doc.rect(LM, tableY, UW, hdrH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text("#",       LM + colNumW / 2,                                   tableY + hdrH / 2, { align: "center", baseline: "middle" });
  doc.text("Date",    LM + colNumW + colDateW / 2,                        tableY + hdrH / 2, { align: "center", baseline: "middle" });
  doc.text("Day",     LM + colNumW + colDateW + colDayW / 2,              tableY + hdrH / 2, { align: "center", baseline: "middle" });
  doc.text("Notes",   LM + colNumW + colDateW + colDayW + colNotesW / 2,  tableY + hdrH / 2, { align: "center", baseline: "middle" });

  // Data rows
  batch.classes.forEach((cls, i) => {
    const ry     = tableY + hdrH + i * rowH;
    const even   = i % 2 === 0;
    const hasDate = !!cls.date;

    // Row background
    doc.setFillColor(
      even ? SLATE1[0] : WHITE[0],
      even ? SLATE1[1] : WHITE[1],
      even ? SLATE1[2] : WHITE[2]
    );
    doc.rect(LM, ry, UW, rowH, "F");

    // Row bottom border
    doc.setDrawColor(SLATE2[0], SLATE2[1], SLATE2[2]);
    doc.setLineWidth(0.2);
    doc.line(LM, ry + rowH, LM + UW, ry + rowH);

    // Class number circle
    if (hasDate) {
      doc.setFillColor(INDIGO[0], INDIGO[1], INDIGO[2]);
    } else {
      doc.setFillColor(SLATE2[0], SLATE2[1], SLATE2[2]);
    }
    doc.circle(LM + colNumW / 2, ry + rowH / 2, 3.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(hasDate ? WHITE[0] : SLATE5[0], hasDate ? WHITE[1] : SLATE5[1], hasDate ? WHITE[2] : SLATE5[2]);
    doc.text(String(cls.classNumber), LM + colNumW / 2, ry + rowH / 2, { align: "center", baseline: "middle" });

    // Date
    if (hasDate) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      doc.text(
        longDate(cls.date),
        LM + colNumW + 3, ry + rowH / 2,
        { baseline: "middle" }
      );

      // Day of week
      const dayName = new Date(cls.date!).toLocaleDateString("en-IN", { weekday: "long" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(SLATE5[0], SLATE5[1], SLATE5[2]);
      doc.text(dayName, LM + colNumW + colDateW + 3, ry + rowH / 2, { baseline: "middle" });
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(SLATE2[0], SLATE2[1], SLATE2[2]);
      doc.text("Not yet scheduled", LM + colNumW + 3, ry + rowH / 2, { baseline: "middle" });
    }

    // Notes
    if (cls.notes) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(SLATE5[0], SLATE5[1], SLATE5[2]);
      doc.text(
        cls.notes,
        LM + colNumW + colDateW + colDayW + 3, ry + rowH / 2,
        { baseline: "middle" }
      );
    }

    // Vertical column separators
    doc.setDrawColor(SLATE2[0], SLATE2[1], SLATE2[2]);
    doc.setLineWidth(0.15);
    [colNumW, colNumW + colDateW, colNumW + colDateW + colDayW].forEach(offset => {
      doc.line(LM + offset, ry, LM + offset, ry + rowH);
    });
  });

  // Table outer border
  const tableH = hdrH + total * rowH;
  doc.setDrawColor(SLATE5[0], SLATE5[1], SLATE5[2]);
  doc.setLineWidth(0.4);
  doc.rect(LM, tableY, UW, tableH, "S");

  // ── 4. SUMMARY BOX ─────────────────────────────────────────────────────────
  const sumY = tableY + tableH + 10;
  const sumW = 80;

  doc.setFillColor(SLATE1[0], SLATE1[1], SLATE1[2]);
  doc.setDrawColor(SLATE2[0], SLATE2[1], SLATE2[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(LM, sumY, sumW, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(SLATE5[0], SLATE5[1], SLATE5[2]);
  doc.text("SUMMARY", LM + 4, sumY + 6, { baseline: "middle" });

  doc.setDrawColor(SLATE2[0], SLATE2[1], SLATE2[2]);
  doc.setLineWidth(0.2);
  doc.line(LM + 4, sumY + 9, LM + sumW - 4, sumY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text(`Classes attended:`, LM + 4, sumY + 15, { baseline: "middle" });
  doc.setFont("helvetica", "bold");
  doc.text(`${attended} / ${total}`, LM + sumW - 4, sumY + 15, { align: "right", baseline: "middle" });

  doc.setFont("helvetica", "normal");
  doc.text(`Fee paid:`, LM + 4, sumY + 21, { baseline: "middle" });
  doc.setFont("helvetica", "bold");
  doc.text(`₹${batch.feeAmount.toLocaleString("en-IN")}`, LM + sumW - 4, sumY + 21, { align: "right", baseline: "middle" });

  // ── 5. FOOTER ──────────────────────────────────────────────────────────────
  doc.setDrawColor(SLATE2[0], SLATE2[1], SLATE2[2]);
  doc.setLineWidth(0.3);
  doc.line(LM, PH - 16, PW - RM, PH - 16);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(SLATE5[0], SLATE5[1], SLATE5[2]);
  doc.text("Swaralayam  •  Flute Class Schedule", LM, PH - 10, { baseline: "middle" });
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    PW - RM, PH - 10,
    { align: "right", baseline: "middle" }
  );

  const monthYear = batch.feePaidDate
    ? new Date(batch.feePaidDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : `Batch-${batchNumber}`;
  doc.save(`Flute-Batch-${batchNumber}-${monthYear}.pdf`);
}
