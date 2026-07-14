import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const records = await prisma.record.findMany({ where: { title: { contains: "Rohith Flats" } } });
  let count = 0;
  for (const r of records) {
    if (/Portion|[FGS]\d/.test(r.title)) {
      const updated = r.title.replace("Rohith Flats –", "Porur -");
      await prisma.record.update({ where: { id: r.id }, data: { title: updated } });
      console.log(`  "${r.title}" → "${updated}"`);
      count++;
    }
  }
  console.log(`\n${count} records updated.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
