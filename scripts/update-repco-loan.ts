import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

const payments = [
  {
    date: "2025-07-31",
    babu: 20000, bhuvana: 20000,
    outstandingBalance: 279382,
  },
  {
    date: "2025-10-06",
    babu: 20000, bhuvana: 10000,
    outstandingBalance: 255186,
  },
  {
    // Date not recorded in Excel — please correct via Edit if needed
    date: "2025-10-06",
    babu: 0, bhuvana: 20000,
    outstandingBalance: null,
    dateUnknown: true,
  },
  {
    date: "2026-01-13",
    babu: 10000, bhuvana: 10000,
    outstandingBalance: 243059,
  },
  {
    date: "2026-03-30",
    babu: 10000, bhuvana: 15000,
    outstandingBalance: 223796,
  },
];

async function main() {
  const loan = await prisma.loan.findFirst({ where: { name: "Repco Bank Jewel Loan" } });
  if (!loan) { console.error("Repco Bank Jewel Loan not found"); process.exit(1); }

  await prisma.loanPayment.deleteMany({ where: { loanId: loan.id } });
  console.log("Cleared existing payments.");

  await prisma.loan.update({
    where: { id: loan.id },
    data: { loanAmount: 315000, startDate: new Date("2025-07-31") },
  });

  for (const p of payments) {
    const total = p.babu + p.bhuvana;
    const parts: string[] = [];
    if (p.babu > 0)   parts.push(`Babu: ₹${p.babu.toLocaleString("en-IN")}`);
    if (p.bhuvana > 0) parts.push(`Bhuvana: ₹${p.bhuvana.toLocaleString("en-IN")}`);
    const notes = parts.join(", ") + (p.dateUnknown ? " (date not recorded — please update)" : "");

    await prisma.loanPayment.create({
      data: {
        loanId: loan.id,
        date: new Date(p.date),
        amount: total,
        outstandingBalance: p.outstandingBalance ?? null,
        status: "paid",
        notes,
      },
    });
    console.log(`  ${p.date}  ₹${total.toLocaleString("en-IN")}  →  outstanding: ${p.outstandingBalance ?? "—"}  | ${notes}`);
  }

  console.log("\nDone. ⚠️  Payment 3 (Bhuvana ₹20,000) has no date in the Excel — it was saved as 2025-10-06. Please edit it to the correct date.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
