import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

// Each batch: feeAmount, feePaidDate, classes array (index = classNumber-1, null = not attended)
const BATCHES: {
  feeAmount: number;
  feePaidDate: string;
  notes?: string;
  classes: (string | null)[];
  classNotes?: Record<number, string>; // classNumber -> note
}[] = [
  // Batch 16 — newest (current, incomplete)
  {
    feeAmount: 4000,
    feePaidDate: "2026-04-24",
    classes: [
      "2026-04-24", null, null, null, null,
      null, null, null, null, null, null, null,
    ],
  },
  // Batch 15
  {
    feeAmount: 4000,
    feePaidDate: "2026-02-06",
    classes: [
      "2026-02-06", "2026-02-12", "2026-02-22", "2026-03-01", "2026-03-08",
      "2026-03-16", "2026-03-24", "2026-04-05", "2026-04-10", "2026-04-11",
      "2026-04-16", "2026-04-20",
    ],
  },
  // Batch 14
  {
    feeAmount: 4000,
    feePaidDate: "2025-11-04",
    classes: [
      "2025-11-04", "2025-11-09", "2025-11-17", "2025-11-28", "2025-12-08",
      "2025-12-14", "2025-12-20", "2025-12-28", "2026-01-03", "2026-01-13",
      "2026-01-22", "2026-01-29",
    ],
  },
  // Batch 13
  {
    feeAmount: 4000,
    feePaidDate: "2025-08-20",
    classes: [
      "2025-08-22", "2025-08-28", "2025-09-01", "2025-09-06", "2025-09-10",
      "2025-09-16", "2025-09-23", "2025-09-27", "2025-10-06", "2025-10-17",
      "2025-10-25", "2025-10-30",
    ],
  },
  // Batch 12
  {
    feeAmount: 4000,
    feePaidDate: "2025-06-18",
    classes: [
      "2025-06-18", "2025-06-23", "2025-06-29", "2025-07-03", "2025-07-07",
      "2025-07-12", "2025-07-17", "2025-07-22", "2025-07-29", "2025-08-01",
      "2025-08-08", "2025-08-15",
    ],
  },
  // Batch 11
  {
    feeAmount: 4000,
    feePaidDate: "2025-04-17",
    classes: [
      "2025-04-17", "2025-04-24", "2025-05-02", "2025-05-05", "2025-05-13",
      "2025-05-18", "2025-05-23", "2025-05-29", "2025-06-01", "2025-06-05",
      "2025-06-11", "2025-06-16",
    ],
  },
  // Batch 10
  {
    feeAmount: 4000,
    feePaidDate: "2025-02-08",
    classes: [
      "2025-02-08", "2025-02-11", "2025-02-16", "2025-02-21", "2025-02-25",
      "2025-03-02", "2025-03-09", "2025-03-13", "2025-03-18", "2025-03-27",
      "2025-04-04", "2025-04-12",
    ],
  },
  // Batch 9
  {
    feeAmount: 4000,
    feePaidDate: "2024-12-08",
    classes: [
      "2024-12-12", "2024-12-17", "2024-12-22", "2024-12-29", "2024-12-30",
      "2025-01-06", "2025-01-13", "2025-01-18", "2025-01-23", "2025-01-28",
      "2025-01-30", "2025-02-04",
    ],
  },
  // Batch 8
  {
    feeAmount: 4000,
    feePaidDate: "2024-09-16",
    classes: [
      "2024-09-17", "2024-09-22", "2024-09-28", "2024-10-03", "2024-10-10",
      "2024-10-21", "2024-10-28", "2024-11-02", "2024-11-09", "2024-11-16",
      "2024-11-30", "2024-12-06",
    ],
    classNotes: {
      1: "Western Song Notes to be given",
      3: "Tamil Song Notes to be given",
    },
  },
  // Batch 7
  {
    feeAmount: 4000,
    feePaidDate: "2024-06-21",
    classes: [
      "2024-06-23", "2024-07-07", "2024-07-14", "2024-07-18", "2024-07-26",
      "2024-07-28", "2024-08-04", "2024-08-15", "2024-08-24", "2024-08-26",
      "2024-09-04", "2024-09-14",
    ],
  },
  // Batch 6
  {
    feeAmount: 4000,
    feePaidDate: "2024-04-21",
    classes: [
      "2024-04-24", "2024-05-02", "2024-05-05", "2024-05-09", "2024-05-12",
      "2024-05-16", "2024-05-21", "2024-05-28", "2024-06-01", "2024-06-08",
      "2024-06-13", "2024-06-21",
    ],
  },
  // Batch 5
  {
    feeAmount: 4000,
    feePaidDate: "2024-02-23",
    classes: [
      "2024-03-02", "2024-03-06", "2024-03-09", "2024-03-15", "2024-03-20",
      "2024-03-26", "2024-03-31", "2024-04-04", "2024-04-10", "2024-04-13",
      "2024-04-18", "2024-04-21",
    ],
  },
  // Batch 4
  {
    feeAmount: 4000,
    feePaidDate: "2024-01-03",
    classes: [
      "2024-01-07", "2024-01-10", "2024-01-14", "2024-01-17", "2024-01-24",
      "2024-01-27", "2024-01-31", "2024-02-04", "2024-02-08", "2024-02-11",
      "2024-02-18", "2024-02-21",
    ],
  },
  // Batch 3
  {
    feeAmount: 4000,
    feePaidDate: "2023-11-09",
    classes: [
      "2023-10-11", "2023-11-13", "2023-11-18", "2023-11-22", "2023-11-25",
      "2023-11-29", "2023-12-03", "2023-12-13", "2023-12-16", "2023-12-24",
      "2023-12-29", "2024-01-03",
    ],
  },
  // Batch 2
  {
    feeAmount: 4000,
    feePaidDate: "2023-09-23",
    classes: [
      "2023-09-27", "2023-09-30", "2023-10-04", "2023-10-07", "2023-10-11",
      "2023-10-14", "2023-10-18", "2023-10-21", "2023-10-24", "2023-10-28",
      "2023-11-04", "2023-11-07",
    ],
  },
  // Batch 1 — oldest (only 8 classes recorded)
  {
    feeAmount: 3000,
    feePaidDate: "2023-08-19",
    classes: [
      "2023-08-20", "2023-08-23", "2023-08-29", "2023-09-06", "2023-09-13",
      "2023-09-16", "2023-09-20", "2023-09-23", null, null, null, null,
    ],
  },
];

async function main() {
  await prisma.fluteClass.deleteMany();
  await prisma.fluteBatch.deleteMany();

  // Insert oldest-first so auto-increment IDs are chronological,
  // but the API returns them newest-first by feePaidDate.
  for (const b of [...BATCHES].reverse()) {
    const classData = b.classes.map((date, i) => ({
      classNumber: i + 1,
      date: date ? new Date(date) : null,
      notes: b.classNotes?.[i + 1] ?? null,
    }));

    const batch = await prisma.fluteBatch.create({
      data: {
        feeAmount: b.feeAmount,
        feePaidDate: new Date(b.feePaidDate),
        notes: b.notes ?? null,
        classes: { create: classData },
      },
    });
    console.log(`Created batch ${batch.id} — ${b.feePaidDate} — ₹${b.feeAmount}`);
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
