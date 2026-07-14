import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const records = [
    // Property Tax
    { title: "Rohith Flats – Front Building – Property Tax", category: "property_tax", accountNo: "11-150-07405-000", notes: "Front Building" },
    { title: "Rohith Flats – Back Building – Property Tax",  category: "property_tax", accountNo: "11-150-00071-000", notes: "Back Building" },

    // EB – Front Building
    { title: "Rohith Flats – Front Building – Common EB",            category: "eb", accountNo: "09310005852",  notes: "Front Building – Common" },
    { title: "Rohith Flats – G1 [Front Portion] EB",                 category: "eb", accountNo: "09310051630",  notes: "Tenant: Bhuvana" },
    { title: "Rohith Flats – G2 [Back Portion] EB",                  category: "eb", accountNo: "09310005641",  notes: "Tenant: Harish" },
    { title: "Rohith Flats – F1 [Front Portion] EB",                 category: "eb", accountNo: "09310005648",  notes: "Tenant: Saravanan" },
    { title: "Rohith Flats – F2 [Back Portion] EB",                  category: "eb", accountNo: "09310000569",  notes: "Tenant: Baskar" },
    { title: "Rohith Flats – S1 EB",                                  category: "eb", accountNo: "09310051629",  notes: "Tenant: Manikandan" },

    // EB – Back Building
    { title: "Rohith Flats – F2 [Right Portion] EB",                 category: "eb", accountNo: "09310005874",  notes: "Tenant: Dasara" },
    { title: "Rohith Flats – G2 [Right Portion] EB",                 category: "eb", accountNo: "09310005875",  notes: "Tenant: Mahendran" },
    { title: "Rohith Flats – G1 [Left Portion] EB",                  category: "eb", accountNo: "09310005876",  notes: "Tenant: Vimal" },
    { title: "Rohith Flats – F1 [Left Portion] EB",                  category: "eb", accountNo: "09310005877",  notes: "Tenant: Saravanan" },
  ];

  for (const r of records) {
    await prisma.record.create({ data: r });
  }

  console.log(`Seeded ${records.length} records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
