import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

// Full amortization schedule from ICICI PDF (LACHE00049561193)
// Installments 1-25 = paid (up to 05/04/2026), 26-36 = pending
const schedule = [
  { no: 1,  date: "2024-04-05", installment: 33249, closing: 1017969 },
  { no: 2,  date: "2024-05-05", installment: 33249, closing: 992482  },
  { no: 3,  date: "2024-06-05", installment: 33249, closing: 966801  },
  { no: 4,  date: "2024-07-05", installment: 33249, closing: 940924  },
  { no: 5,  date: "2024-08-05", installment: 33249, closing: 914850  },
  { no: 6,  date: "2024-09-05", installment: 33249, closing: 888577  },
  { no: 7,  date: "2024-10-05", installment: 33249, closing: 862103  },
  { no: 8,  date: "2024-11-05", installment: 33249, closing: 835428  },
  { no: 9,  date: "2024-12-05", installment: 33249, closing: 808549  },
  { no: 10, date: "2025-01-05", installment: 33249, closing: 781465  },
  { no: 11, date: "2025-02-05", installment: 33249, closing: 754175  },
  { no: 12, date: "2025-03-05", installment: 33249, closing: 726677  },
  { no: 13, date: "2025-04-05", installment: 33249, closing: 698969  },
  { no: 14, date: "2025-05-05", installment: 33249, closing: 671050  },
  { no: 15, date: "2025-06-05", installment: 33249, closing: 642918  },
  { no: 16, date: "2025-07-05", installment: 33249, closing: 614571  },
  { no: 17, date: "2025-08-05", installment: 33249, closing: 586008  },
  { no: 18, date: "2025-09-05", installment: 33249, closing: 557227  },
  { no: 19, date: "2025-10-05", installment: 33249, closing: 528227  },
  { no: 20, date: "2025-11-05", installment: 33249, closing: 499006  },
  { no: 21, date: "2025-12-05", installment: 33249, closing: 469562  },
  { no: 22, date: "2026-01-05", installment: 33249, closing: 439893  },
  { no: 23, date: "2026-02-05", installment: 33249, closing: 409998  },
  { no: 24, date: "2026-03-05", installment: 33249, closing: 379875  },
  { no: 25, date: "2026-04-05", installment: 33249, closing: 349523  },
  { no: 26, date: "2026-05-05", installment: 33249, closing: 318939  },
  { no: 27, date: "2026-06-05", installment: 33249, closing: 288122  },
  { no: 28, date: "2026-07-05", installment: 33249, closing: 257070  },
  { no: 29, date: "2026-08-05", installment: 33249, closing: 225781  },
  { no: 30, date: "2026-09-05", installment: 33249, closing: 194254  },
  { no: 31, date: "2026-10-05", installment: 33249, closing: 162486  },
  { no: 32, date: "2026-11-05", installment: 33249, closing: 130476  },
  { no: 33, date: "2026-12-05", installment: 33249, closing: 98222   },
  { no: 34, date: "2027-01-05", installment: 33249, closing: 65722   },
  { no: 35, date: "2027-02-05", installment: 33249, closing: 32974   },
  { no: 36, date: "2027-03-05", installment: 33225, closing: 0       },
];

async function main() {
  // Find the loan
  const loan = await prisma.loan.findFirst({ where: { name: "ICICI Car Loan" } });
  if (!loan) { console.error("ICICI Car Loan not found"); process.exit(1); }

  // Delete all existing payments
  await prisma.loanPayment.deleteMany({ where: { loanId: loan.id } });
  console.log("Cleared existing payments.");

  // Update loan amount to match PDF opening liability
  await prisma.loan.update({
    where: { id: loan.id },
    data: {
      loanAmount: 1043000,
      emiAmount: 33249,
      startDate: new Date("2024-04-05"),
      endDate: new Date("2027-03-05"),
      notes: "ICICI Car Loan | Acc: LACHE00049561193 | 36 EMIs @ ₹33,249",
    },
  });
  console.log("Updated loan details (amount: ₹10,43,000).");

  // Insert all 36 payments from the amortization schedule
  for (const row of schedule) {
    const status = row.no <= 25 ? "paid" : "pending";
    await prisma.loanPayment.create({
      data: {
        loanId: loan.id,
        date: new Date(row.date),
        amount: row.installment,
        outstandingBalance: row.closing,
        status,
        notes: `EMI ${row.no}/36`,
      },
    });
  }
  console.log(`Inserted 36 payments (25 paid, 11 pending).`);
  console.log("Outstanding after last paid EMI (25): ₹3,49,523");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
