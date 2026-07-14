import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const records = await prisma.record.findMany();
  let count = 0;
  for (const r of records) {
    const cleaned = r.title
      .replace(/\s*[–-]\s*Water & Property Tax/gi, "")
      .replace(/\s*[–-]\s*Property Tax/gi, "")
      .replace(/\s*[–-]\s*EB\b/gi, "")
      .replace(/\s+EB\b/gi, "")
      .trim();
    if (cleaned !== r.title) {
      await prisma.record.update({ where: { id: r.id }, data: { title: cleaned } });
      console.log(`  "${r.title}" → "${cleaned}"`);
      count++;
    }
  }
  console.log(`\n${count} records updated.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
