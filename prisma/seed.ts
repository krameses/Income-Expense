import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

const expenses = [
  { date: "2026-04-01", description: "Appa", amount: 5000 },
  { date: "2026-04-01", description: "Appa - F2 Rent", amount: 15000 },
  { date: "2026-04-01", description: "Bhuvana - Cash", amount: 10000 },
  { date: "2026-04-01", description: "Amazon - Bhuvana", amount: 413 },
  { date: "2026-04-01", description: "Swiggy - Sanju Friends - Snacks", amount: 479 },
  { date: "2026-04-01", description: "Tamilnadu Supermarket", amount: 138 },
  { date: "2026-04-02", description: "Anjappar - Lunch", amount: 1870 },
  { date: "2026-04-02", description: "Chai Walle", amount: 210 },
  { date: "2026-04-02", description: "Mcrennett - Adambakkam", amount: 467 },
  { date: "2026-04-04", description: "Blinkit", amount: 597 },
  { date: "2026-04-04", description: "Jazz - Dates and Nuts", amount: 918 },
  { date: "2026-04-04", description: "Book my Show - Neelira Movie", amount: 872 },
  { date: "2026-04-04", description: "Yes Organics", amount: 515 },
  { date: "2026-04-04", description: "Car & Terrace Cleaning", amount: 1300 },
  { date: "2026-04-04", description: "Bike Petrol - Fascino", amount: 300 },
  { date: "2026-04-05", description: "Badminton", amount: 1500 },
  { date: "2026-04-05", description: "Blinkit", amount: 632 },
  { date: "2026-04-05", description: "ICICI Credit Card", amount: 11670 },
  { date: "2026-04-05", description: "Milk - Self", amount: 717 },
  { date: "2026-04-05", description: "Milk - Appa", amount: 695 },
  { date: "2026-04-05", description: "Car - EMI (25/36)", amount: 33249 },
  { date: "2026-04-05", description: "Phoenix Mall - Karaikkudi Restaurant", amount: 2919 },
  { date: "2026-04-05", description: "Auto - Home to Phoenix Mall", amount: 100 },
  { date: "2026-04-05", description: "Auto - Phoenix Mall to Home", amount: 130 },
  { date: "2026-04-05", description: "Cookieman", amount: 360 },
  { date: "2026-04-05", description: "Phoenix Mall - Beauty Products - Bhuvana", amount: 1044 },
  { date: "2026-04-05", description: "Phoenix Mall - PVR - Snacks", amount: 1290 },
  { date: "2026-04-06", description: "Pazhamudhir Cholai - Bhuvana Relatives - Fruits", amount: 1483 },
  { date: "2026-04-06", description: "Porur Cleaning - Valliyamma", amount: 1500 },
  { date: "2026-04-07", description: "Sanju - School Fee - First Term", amount: 35000 },
  { date: "2026-04-07", description: "Cable TV (MN2.003)", amount: 780 },
  { date: "2026-04-07", description: "Cable TV (MN2.014)", amount: 330 },
  { date: "2026-04-07", description: "Tamilnadu Supermarket", amount: 192 },
  { date: "2026-04-07", description: "NAC - Gold Chit New (10/11)", amount: 5000 },
  { date: "2026-04-07", description: "Blinkit", amount: 311 },
  { date: "2026-04-08", description: "Kamala Kannan babu", amount: 80 },
  { date: "2026-04-08", description: "Yes Organics", amount: 442 },
  { date: "2026-04-09", description: "Tender Coconut", amount: 320 },
  { date: "2026-04-10", description: "Poo", amount: 100 },
  { date: "2026-04-10", description: "Kovai Pazhamudhir Cholai", amount: 463 },
  { date: "2026-04-10", description: "Tamilnadu Supermarket", amount: 391 },
  { date: "2026-04-10", description: "Yes Organics", amount: 168 },
  { date: "2026-04-10", description: "Swiggy", amount: 186 },
  { date: "2026-04-11", description: "Geetham - Dinner", amount: 1540 },
  { date: "2026-04-11", description: "Chai Walle", amount: 230 },
  { date: "2026-04-11", description: "Sanju - Paattu Class", amount: 1500 },
  { date: "2026-04-11", description: "Yes Organics", amount: 687 },
  { date: "2026-04-12", description: "Venkateshwara Stores", amount: 227 },
  { date: "2026-04-12", description: "Hatsun - Icecream", amount: 450 },
  { date: "2026-04-12", description: "Newspaper", amount: 270 },
  { date: "2026-04-12", description: "Bathroom Cleaning (2 bathrooms)", amount: 800 },
  { date: "2026-04-13", description: "Bike Petrol - Fasino", amount: 300 },
  { date: "2026-04-13", description: "Pradeep - Movie with friends", amount: 500 },
  { date: "2026-04-13", description: "TNEB - SKG - F1", amount: 5138 },
  { date: "2026-04-13", description: "TNEB - SKG - F2", amount: 103 },
  { date: "2026-04-13", description: "TNEB - Common", amount: 14 },
  { date: "2026-04-13", description: "Property Tax - Rohit Flats", amount: 1075 },
  { date: "2026-04-13", description: "Property Tax - SKG - F1", amount: 1561 },
  { date: "2026-04-13", description: "Property Tax - Porur - Front Building", amount: 3065 },
  { date: "2026-04-13", description: "Property Tax - Porur - Back Building", amount: 2881 },
  { date: "2026-04-13", description: "Bhuvana - Sanju Maths Tuition", amount: 1300 },
  { date: "2026-04-13", description: "Chit - Latha - My Contribution", amount: 5632 },
  { date: "2026-04-13", description: "Airtel - Bill", amount: 2121 },
  { date: "2026-03-20", description: "Max Life Insurance", amount: 4189 },
  { date: "2026-03-30", description: "Repco Bank - Jewel Loan", amount: 15000 },
  { date: "2026-03-01", description: "Narsi - Kadan - Part 2 Payment", amount: 50000 },
];

const incomes = [
  { date: "2026-04-01", description: "Appa - Milk and Cable expense", amount: 1000 },
  { date: "2026-04-02", description: "Bhuvana - Kadan", amount: 25000 },
  { date: "2026-04-04", description: "Bhuvana - Kadan", amount: 50000 },
  { date: "2026-04-04", description: "Mahendran - Porur Rent + Maintenance + CEB", amount: 13000 },
  { date: "2026-04-11", description: "Dhasara - Rent", amount: 12000 },
  { date: "2026-04-06", description: "Karthick - Rohit Flats", amount: 15000 },
  { date: "2026-04-07", description: "Saravanan - Porur Rent + Maintenance", amount: 12500 },
  { date: "2026-04-07", description: "Vimal - Porur Rent + Maintenance", amount: 11500 },
  { date: "2026-04-07", description: "Bhuvana - Kadan", amount: 25000 },
  { date: "2026-04-10", description: "Amal - Madras Tiger - Domain Renewal", amount: 2500 },
  { date: "2026-04-13", description: "Property Tax - Porur - Front Building - Bhuvana", amount: 3065 },
  { date: "2026-04-14", description: "Appa - Tamil New Year", amount: 1000 },
];

async function main() {
  console.log("Seeding database...");

  await prisma.transaction.deleteMany();

  const expenseData = expenses.map((e) => ({
    type: "expense",
    date: new Date(e.date),
    description: e.description,
    amount: e.amount,
  }));

  const incomeData = incomes.map((i) => ({
    type: "income",
    date: new Date(i.date),
    description: i.description,
    amount: i.amount,
  }));

  await prisma.transaction.createMany({ data: [...expenseData, ...incomeData] });

  console.log(`Seeded ${expenseData.length} expenses and ${incomeData.length} income entries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
