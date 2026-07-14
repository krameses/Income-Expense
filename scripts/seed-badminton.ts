import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

const MEMBERS = ["Narsi", "Israr", "Arun", "Babu"];

const PERIODS = [
  {
    month: "2025-11",
    openingBalance: 37755,
    contributions: MEMBERS.map((m) => ({ memberName: m, amount: 1500 })),
    expenses: [
      { category: "Court", paidBy: "Narsi", description: "", week: 1, amount: 614 },
      { category: "Court", paidBy: "Narsi", description: "", week: 2, amount: 614 },
      { category: "Court", paidBy: "Narsi", description: "", week: 3, amount: 614 },
      { category: "Court", paidBy: "Narsi", description: "", week: 4, amount: 614 },
      { category: "Court", paidBy: "Narsi", description: "", week: 5, amount: 584 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 2, amount: 1335 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 3, amount: 670 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 5, amount: 970 },
    ],
  },
  {
    month: "2025-12",
    openingBalance: 37740,
    contributions: MEMBERS.map((m) => ({ memberName: m, amount: 1500 })),
    expenses: [
      { category: "Court", paidBy: "Narsi", description: "", week: 1, amount: 584 },
      { category: "Court", paidBy: "Narsi", description: "", week: 3, amount: 584 },
      { category: "Court", paidBy: "Narsi", description: "", week: 4, amount: 265 },
      { category: "Court", paidBy: "Narsi", description: "", week: 5, amount: 742 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 3, amount: 599 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 4, amount: 842 },
      { category: "Other", paidBy: "Narsi", description: "Shuttlecock Box", week: 3, amount: 2040 },
    ],
  },
  {
    month: "2026-01",
    openingBalance: 39584,
    contributions: MEMBERS.map((m) => ({ memberName: m, amount: 1500 })),
    expenses: [
      { category: "Court", paidBy: "Narsi", description: "", week: 1, amount: 681 },
      { category: "Court", paidBy: "Narsi", description: "", week: 2, amount: 681 },
      { category: "Court", paidBy: "Narsi", description: "", week: 3, amount: 681 },
      { category: "Court", paidBy: "Narsi", description: "", week: 4, amount: 681 },
      { category: "Court", paidBy: "Narsi", description: "", week: 5, amount: 614 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 2, amount: 770 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 3, amount: 910 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 5, amount: 1060 },
    ],
  },
  {
    month: "2026-02",
    openingBalance: 39584,
    contributions: MEMBERS.map((m) => ({ memberName: m, amount: 1500 })),
    expenses: [
      { category: "Court", paidBy: "Narsi", description: "", week: 1, amount: 681 },
      { category: "Court", paidBy: "Narsi", description: "", week: 3, amount: 681 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Narsi", description: "", week: 1, amount: 260 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Narsi", description: "", week: 3, amount: 1320 },
    ],
  },
  {
    month: "2026-03",
    openingBalance: 42642,
    contributions: MEMBERS.map((m) => ({ memberName: m, amount: 1500 })),
    expenses: [
      { category: "Court", paidBy: "Narsi", description: "", week: 2, amount: 667 },
      { category: "Court", paidBy: "Narsi", description: "", week: 3, amount: 667 },
      { category: "Court", paidBy: "Narsi", description: "", week: 4, amount: 739 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 2, amount: 230 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 3, amount: 290 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 4, amount: 1080 },
      { category: "Other", paidBy: "Narsi", description: "Shuttlecock", week: 3, amount: 2400 },
    ],
  },
  {
    month: "2026-04",
    openingBalance: 42569,
    contributions: MEMBERS.map((m) => ({ memberName: m, amount: 1500 })),
    expenses: [
      { category: "Court", paidBy: "Narsi", description: "", week: 1, amount: 682 },
      { category: "Court", paidBy: "Narsi", description: "", week: 2, amount: 600 },
      { category: "Court", paidBy: "Narsi", description: "", week: 4, amount: 951 },
      { category: "Court", paidBy: "Narsi", description: "", week: 6, amount: 317 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 1, amount: 1080 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 4, amount: 445 },
      { category: "Snacks/Breakfast/Lunch/Dinner", paidBy: "Babu", description: "", week: 4, amount: 750 },
    ],
  },
];

async function main() {
  // Wipe existing badminton data (keep members)
  await prisma.badmintonExpense.deleteMany();
  await prisma.badmintonContribution.deleteMany();
  await prisma.badmintonPeriod.deleteMany();

  // Ensure members exist
  for (const name of MEMBERS) {
    await prisma.badmintonMember.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed periods
  for (const p of PERIODS) {
    const period = await prisma.badmintonPeriod.create({
      data: {
        month: p.month,
        openingBalance: p.openingBalance,
        contributions: { create: p.contributions },
        expenses: { create: p.expenses },
      },
    });
    console.log(`Created period ${period.month}`);
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
