import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Move maintenance values from notes into the dedicated maintenance field
  const tenants = await prisma.record.findMany({ where: { category: "tenant" } });
  for (const t of tenants) {
    const match = t.notes?.match(/Maintenance:\s*₹([\d,]+)/);
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ""));
      await prisma.record.update({
        where: { id: t.id },
        data: { maintenance: val, notes: null },
      });
      console.log(`Updated "${t.title}": maintenance = ${val}`);
    }
  }
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
