import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const records = [
    // Water & Property Tax
    { title: "Rohith Flats – Water & Property Tax",   category: "property_tax", accountNo: "13-178-05549-000", notes: null },
    { title: "Babu House (F1) – Water & Property Tax", category: "property_tax", accountNo: "13-178-09192-000", notes: null },
    { title: "Babu House (F2) – Water & Property Tax", category: "property_tax", accountNo: "13-178-09195-000", notes: null },
    { title: "Appa House (G) – Water & Property Tax",  category: "property_tax", accountNo: "13-178-09193-000", notes: null },
    { title: "PWD",                                    category: "water_tax",    accountNo: null,               notes: "Password: Dp@123456" },

    // EB Consumer Numbers
    { title: "Rohith Flats – EB",  category: "eb", accountNo: "9210005240", notes: null },
    { title: "Babu House (F1) – EB", category: "eb", accountNo: "9210005660", notes: null },
    { title: "Babu House (F2) – EB", category: "eb", accountNo: "9210005658", notes: null },
    { title: "Common – EB",          category: "eb", accountNo: "921000556",  notes: null },
  ];

  for (const r of records) {
    await prisma.record.create({ data: r });
  }

  console.log(`Seeded ${records.length} records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
