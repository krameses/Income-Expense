import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenants = [
    { title: "Saravanan / Poornakala", amount: 8500,  notes: "Maintenance: ₹500" },
    { title: "Rathimeena",             amount: 4000,  notes: null },
    { title: "Vimal",                  amount: 11000, notes: "Maintenance: ₹500" },
    { title: "Mahendra",               amount: 12500, notes: "Maintenance: ₹500" },
    { title: "Saravanan",              amount: 12000, notes: "Maintenance: ₹500" },
    { title: "Dhasara",                amount: 12000, notes: "Maintenance: ₹500" },
    { title: "Shushil",                amount: 12000, notes: "Maintenance: ₹500" },
  ];

  for (const t of tenants) {
    await prisma.record.create({ data: { title: t.title, category: "tenant", amount: t.amount, notes: t.notes } });
  }

  console.log(`Seeded ${tenants.length} tenant records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
