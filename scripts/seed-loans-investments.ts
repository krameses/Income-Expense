import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding loans and investments...");

  // Clear existing data
  await prisma.loanPayment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.investmentEntry.deleteMany();
  await prisma.investment.deleteMany();

  // ─── ACTIVE LOANS ────────────────────────────────────────────────

  // 1. Appa Loan
  const appaLoan = await prisma.loan.create({
    data: {
      name: "Appa Loan",
      lender: "Appa",
      loanAmount: 1300000,
      startDate: new Date("2024-08-01"),
      notes: "Personal loan from Appa",
      isArchived: false,
    },
  });
  const appaPayments = [
    { date: "2024-08-01", amount: 10000 },
    { date: "2024-09-01", amount: 10000 },
    { date: "2024-10-01", amount: 10000 },
    { date: "2024-11-01", amount: 10000 },
    { date: "2024-12-01", amount: 10000 },
    { date: "2025-01-01", amount: 10000 },
    { date: "2025-02-01", amount: 20000 },
    { date: "2025-03-01", amount: 10000 },
    { date: "2025-04-01", amount: 10000 },
    { date: "2025-05-01", amount: 10000 },
    { date: "2025-06-01", amount: 10000 },
    { date: "2025-07-01", amount: 10000 },
    { date: "2025-08-01", amount: 10000 },
    { date: "2025-09-01", amount: 10000 },
    { date: "2025-10-01", amount: 10000 },
    { date: "2025-11-01", amount: 10000 },
    { date: "2025-12-01", amount: 10000 },
    { date: "2026-01-01", amount: 10000 },
    { date: "2026-02-01", amount: 50000 },
    { date: "2026-03-01", amount: 10000 },
  ];
  let appaBalance = 1300000;
  for (const p of appaPayments) {
    appaBalance -= p.amount;
    await prisma.loanPayment.create({
      data: {
        loanId: appaLoan.id,
        date: new Date(p.date),
        amount: p.amount,
        outstandingBalance: appaBalance,
        status: "paid",
      },
    });
  }

  // 2. ICICI Car Loan
  const iciciCar = await prisma.loan.create({
    data: {
      name: "ICICI Car Loan",
      lender: "ICICI Bank",
      loanAmount: 1036073,
      emiAmount: 33249,
      startDate: new Date("2024-04-01"),
      endDate: new Date("2027-03-01"),
      notes: "Car loan - 36 EMIs",
      isArchived: false,
    },
  });
  // 25 paid EMIs: Apr 2024 – Apr 2026
  let iciciBalance = 1036073;
  const iciciPaidMonths: string[] = [];
  // Generate Apr 2024 to Apr 2026 (25 months)
  let d = new Date("2024-04-01");
  for (let i = 0; i < 25; i++) {
    iciciPaidMonths.push(d.toISOString().slice(0, 10));
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  for (const dateStr of iciciPaidMonths) {
    iciciBalance = Math.max(0, iciciBalance - 33249);
    await prisma.loanPayment.create({
      data: {
        loanId: iciciCar.id,
        date: new Date(dateStr),
        amount: 33249,
        outstandingBalance: Math.round(iciciBalance),
        status: "paid",
      },
    });
  }
  // 11 pending EMIs: May 2026 – Mar 2027
  const iciciPendingMonths: string[] = [];
  d = new Date("2026-05-01");
  for (let i = 0; i < 11; i++) {
    iciciPendingMonths.push(d.toISOString().slice(0, 10));
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  for (const dateStr of iciciPendingMonths) {
    iciciBalance = Math.max(0, iciciBalance - 33249);
    await prisma.loanPayment.create({
      data: {
        loanId: iciciCar.id,
        date: new Date(dateStr),
        amount: 33249,
        outstandingBalance: Math.round(iciciBalance),
        status: "pending",
      },
    });
  }

  // 3. Repco Bank Jewel Loan (Active)
  const repcoActive = await prisma.loan.create({
    data: {
      name: "Repco Bank Jewel Loan",
      lender: "Repco Bank",
      loanAmount: 315000,
      startDate: new Date("2025-12-01"),
      notes: "Jewel loan - active",
      isArchived: false,
    },
  });
  const repcoActivePayments = [
    { date: "2025-12-01", amount: 17000, balance: 298000 },
    { date: "2026-01-01", amount: 20000, balance: 278000 },
    { date: "2026-02-01", amount: 30000, balance: 248000 },
    { date: "2026-03-01", amount: 24204, balance: 223796 },
  ];
  for (const p of repcoActivePayments) {
    await prisma.loanPayment.create({
      data: {
        loanId: repcoActive.id,
        date: new Date(p.date),
        amount: p.amount,
        outstandingBalance: p.balance,
        status: "paid",
      },
    });
  }

  // ─── ARCHIVED LOANS ──────────────────────────────────────────────

  // Bajaj Finance Personal Loan
  const bajajPL = await prisma.loan.create({
    data: {
      name: "Bajaj Finance PL",
      lender: "Bajaj Finance",
      loanAmount: 200000,
      emiAmount: 6000,
      startDate: new Date("2021-01-01"),
      endDate: new Date("2024-06-01"),
      notes: "Closed personal loan",
      isArchived: true,
      archivedAt: new Date("2024-06-01"),
    },
  });
  // Sample payments for closed loan
  let bajajBal = 200000;
  d = new Date("2021-01-01");
  for (let i = 0; i < 42; i++) {
    bajajBal = Math.max(0, bajajBal - 6000);
    await prisma.loanPayment.create({
      data: {
        loanId: bajajPL.id,
        date: new Date(d),
        amount: 6000,
        outstandingBalance: Math.round(bajajBal),
        status: "paid",
      },
    });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  // ICICI Personal Loan
  const iciciPL = await prisma.loan.create({
    data: {
      name: "ICICI Personal Loan",
      lender: "ICICI Bank",
      loanAmount: 300000,
      emiAmount: 9500,
      startDate: new Date("2020-06-01"),
      endDate: new Date("2023-05-01"),
      notes: "Closed personal loan",
      isArchived: true,
      archivedAt: new Date("2023-05-01"),
    },
  });
  let iciciPlBal = 300000;
  d = new Date("2020-06-01");
  for (let i = 0; i < 36; i++) {
    iciciPlBal = Math.max(0, iciciPlBal - 9500);
    await prisma.loanPayment.create({
      data: {
        loanId: iciciPL.id,
        date: new Date(d),
        amount: 9500,
        outstandingBalance: Math.round(iciciPlBal),
        status: "paid",
      },
    });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  // LIC Loan
  const licLoan = await prisma.loan.create({
    data: {
      name: "LIC Loan",
      lender: "LIC",
      loanAmount: 50000,
      startDate: new Date("2022-01-01"),
      endDate: new Date("2023-12-01"),
      notes: "Loan against LIC policy - closed",
      isArchived: true,
      archivedAt: new Date("2023-12-01"),
    },
  });
  await prisma.loanPayment.create({
    data: {
      loanId: licLoan.id,
      date: new Date("2023-12-01"),
      amount: 50000,
      outstandingBalance: 0,
      status: "paid",
      notes: "Full settlement",
    },
  });

  // Repco Bank Jewel Loan 1st (closed)
  const repco1st = await prisma.loan.create({
    data: {
      name: "Repco Bank Jewel Loan (1st)",
      lender: "Repco Bank",
      loanAmount: 200000,
      startDate: new Date("2023-06-01"),
      endDate: new Date("2025-11-01"),
      notes: "First jewel loan - closed",
      isArchived: true,
      archivedAt: new Date("2025-11-01"),
    },
  });
  let repcoBal = 200000;
  d = new Date("2023-06-01");
  for (let i = 0; i < 18; i++) {
    const amt = 12000;
    repcoBal = Math.max(0, repcoBal - amt);
    await prisma.loanPayment.create({
      data: {
        loanId: repco1st.id,
        date: new Date(d),
        amount: amt,
        outstandingBalance: Math.round(repcoBal),
        status: "paid",
      },
    });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  // Kotak Bike Loan
  const kotakBike = await prisma.loan.create({
    data: {
      name: "Kotak Bike Loan",
      lender: "Kotak Mahindra Bank",
      loanAmount: 80000,
      emiAmount: 2800,
      startDate: new Date("2021-03-01"),
      endDate: new Date("2024-02-01"),
      notes: "Bike loan - closed",
      isArchived: true,
      archivedAt: new Date("2024-02-01"),
    },
  });
  let kotakBal = 80000;
  d = new Date("2021-03-01");
  for (let i = 0; i < 36; i++) {
    kotakBal = Math.max(0, kotakBal - 2800);
    await prisma.loanPayment.create({
      data: {
        loanId: kotakBike.id,
        date: new Date(d),
        amount: 2800,
        outstandingBalance: Math.round(kotakBal),
        status: "paid",
      },
    });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  // ICICI Gold Personal Loan
  const iciciGoldPL = await prisma.loan.create({
    data: {
      name: "ICICI Gold PL",
      lender: "ICICI Bank",
      loanAmount: 150000,
      emiAmount: 5000,
      startDate: new Date("2022-08-01"),
      endDate: new Date("2025-07-01"),
      notes: "Gold personal loan - closed",
      isArchived: true,
      archivedAt: new Date("2025-07-01"),
    },
  });
  let iciciGoldBal = 150000;
  d = new Date("2022-08-01");
  for (let i = 0; i < 36; i++) {
    iciciGoldBal = Math.max(0, iciciGoldBal - 5000);
    await prisma.loanPayment.create({
      data: {
        loanId: iciciGoldPL.id,
        date: new Date(d),
        amount: 5000,
        outstandingBalance: Math.round(iciciGoldBal),
        status: "paid",
      },
    });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  // Chandra AC Loan
  const chandraAC = await prisma.loan.create({
    data: {
      name: "Chandra AC",
      lender: "Chandra",
      loanAmount: 45000,
      emiAmount: 4500,
      startDate: new Date("2023-04-01"),
      endDate: new Date("2024-03-01"),
      notes: "AC purchase loan - closed",
      isArchived: true,
      archivedAt: new Date("2024-03-01"),
    },
  });
  let chandraAcBal = 45000;
  d = new Date("2023-04-01");
  for (let i = 0; i < 10; i++) {
    chandraAcBal = Math.max(0, chandraAcBal - 4500);
    await prisma.loanPayment.create({
      data: {
        loanId: chandraAC.id,
        date: new Date(d),
        amount: 4500,
        outstandingBalance: Math.round(chandraAcBal),
        status: "paid",
      },
    });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  // Visual Point Camera Loan
  const vpCamera = await prisma.loan.create({
    data: {
      name: "Visual Point Camera",
      lender: "Visual Point",
      loanAmount: 60000,
      emiAmount: 5000,
      startDate: new Date("2022-12-01"),
      endDate: new Date("2024-11-01"),
      notes: "Camera purchase - closed",
      isArchived: true,
      archivedAt: new Date("2024-11-01"),
    },
  });
  let vpBal = 60000;
  d = new Date("2022-12-01");
  for (let i = 0; i < 12; i++) {
    vpBal = Math.max(0, vpBal - 5000);
    await prisma.loanPayment.create({
      data: {
        loanId: vpCamera.id,
        date: new Date(d),
        amount: 5000,
        outstandingBalance: Math.round(vpBal),
        status: "paid",
      },
    });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  // ─── ACTIVE INVESTMENTS ───────────────────────────────────────────

  // Gold Chit NAC (current series)
  const goldChitNAC = await prisma.investment.create({
    data: {
      name: "Gold Chit - NAC",
      type: "chit",
      targetAmount: 60000,
      notes: "NAC chit fund - current series, ₹5000/month",
      isActive: true,
    },
  });
  const goldChitEntries = [
    "2025-07-01",
    "2025-08-01",
    "2025-09-01",
    "2025-10-01",
    "2025-11-01",
    "2025-12-01",
    "2026-01-01",
    "2026-02-01",
    "2026-03-01",
    "2026-04-01",
  ];
  for (const dateStr of goldChitEntries) {
    await prisma.investmentEntry.create({
      data: {
        investmentId: goldChitNAC.id,
        date: new Date(dateStr),
        amount: 5000,
        notes: "Monthly chit payment",
      },
    });
  }

  // Latha Chit
  const lathaChit = await prisma.investment.create({
    data: {
      name: "Latha Chit",
      type: "chit",
      targetAmount: 48000,
      notes: "Chit fund through Latha",
      isActive: true,
    },
  });
  const lathaChitEntries = [
    "2025-09-01",
    "2025-10-01",
    "2025-11-01",
    "2025-12-01",
    "2026-01-01",
    "2026-02-01",
    "2026-03-01",
    "2026-04-01",
  ];
  for (const dateStr of lathaChitEntries) {
    await prisma.investmentEntry.create({
      data: {
        investmentId: lathaChit.id,
        date: new Date(dateStr),
        amount: 6000,
        notes: "Monthly chit payment",
      },
    });
  }

  // Mutual Fund
  const mf = await prisma.investment.create({
    data: {
      name: "Mutual Fund",
      type: "mutual_fund",
      notes: "SIP / Lumpsum mutual fund investment",
      isActive: true,
    },
  });
  await prisma.investmentEntry.create({
    data: {
      investmentId: mf.id,
      date: new Date("2026-01-01"),
      amount: 40000,
      notes: "Investment",
    },
  });

  // Stocks
  const stocks = await prisma.investment.create({
    data: {
      name: "Stocks",
      type: "stocks",
      notes: "Direct equity investments",
      isActive: true,
    },
  });
  await prisma.investmentEntry.create({
    data: {
      investmentId: stocks.id,
      date: new Date("2026-01-01"),
      amount: 15454,
      notes: "Equity portfolio value",
    },
  });

  // ─── INACTIVE INVESTMENTS ─────────────────────────────────────────

  // Gold Chit NAC 1st series (closed Jul 2024)
  const goldChit1st = await prisma.investment.create({
    data: {
      name: "Gold Chit NAC (1st Series)",
      type: "chit",
      targetAmount: 60000,
      notes: "NAC chit fund - 1st series, closed Jul 2024",
      isActive: false,
    },
  });
  const goldChit1stEntries: string[] = [];
  d = new Date("2023-08-01");
  for (let i = 0; i < 12; i++) {
    goldChit1stEntries.push(d.toISOString().slice(0, 10));
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  for (const dateStr of goldChit1stEntries) {
    await prisma.investmentEntry.create({
      data: {
        investmentId: goldChit1st.id,
        date: new Date(dateStr),
        amount: 5000,
        notes: "Monthly chit payment",
      },
    });
  }

  // Gold Chit NAC 2nd series (closed May 2025)
  const goldChit2nd = await prisma.investment.create({
    data: {
      name: "Gold Chit NAC (2nd Series)",
      type: "chit",
      targetAmount: 60000,
      notes: "NAC chit fund - 2nd series, closed May 2025",
      isActive: false,
    },
  });
  const goldChit2ndEntries: string[] = [];
  d = new Date("2024-06-01");
  for (let i = 0; i < 12; i++) {
    goldChit2ndEntries.push(d.toISOString().slice(0, 10));
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  for (const dateStr of goldChit2ndEntries) {
    await prisma.investmentEntry.create({
      data: {
        investmentId: goldChit2nd.id,
        date: new Date(dateStr),
        amount: 5000,
        notes: "Monthly chit payment",
      },
    });
  }

  console.log("Done! Loans and investments seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
