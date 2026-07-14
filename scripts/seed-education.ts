import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── PRADEEP ─────────────────────────────────────────────────────────────────
  const pradeep = await prisma.student.create({
    data: { name: "Pradeep", notes: "School Roll: 32009083 | B.Tech Roll: 241001165" },
  });

  // 2018-19
  const p1819 = await prisma.academicYear.create({ data: { studentId: pradeep.id, year: "2018-19", class: "VIII", school: "Pon Vidhyashram", rollNo: "32009083" } });
  for (const f of [
    { description: "Term 1", amount: 24950, status: "paid", paidDate: "2019-04-04" },
    { description: "Term 2", amount: 24950, status: "paid", paidDate: "2019-07-02" },
    { description: "Uniform Material", amount: 1000, status: "paid", paidDate: null },
    { description: "Uniform Stitching", amount: 1300, status: "paid", paidDate: null },
    { description: "Books", amount: 6500, status: "paid", paidDate: null },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: p1819.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null } });
  }

  // 2019-20
  const p1920 = await prisma.academicYear.create({ data: { studentId: pradeep.id, year: "2019-20", class: "IX", school: "Pon Vidhyashram", rollNo: "32009083" } });
  for (const f of [
    { description: "Term 1", amount: 24000, status: "paid", paidDate: "2020-07-23", notes: null },
    { description: "Term 2", amount: 16517, status: "paid", paidDate: "2021-02-22", notes: "Paid ₹16,517 after concession (original ₹30,000)" },
    { description: "Uniform Material", amount: 1200, status: "paid", paidDate: null, notes: null },
    { description: "Uniform Stitching", amount: 1450, status: "paid", paidDate: null, notes: "Private stitching" },
    { description: "Books", amount: 6500, status: "paid", paidDate: null, notes: null },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: p1920.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null, notes: f.notes } });
  }

  // 2020-21
  const p2021 = await prisma.academicYear.create({ data: { studentId: pradeep.id, year: "2020-21", class: "X", school: "Pon Vidhyashram", rollNo: "32009083" } });
  for (const f of [
    { description: "Term 1", amount: 35413, status: "paid", paidDate: "2021-07-07", notes: null },
    { description: "Term 2", amount: 11985, status: "paid", paidDate: "2022-03-18", notes: null },
    { description: "Books", amount: 2700, status: "paid", paidDate: "2021-07-07", notes: null },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: p2021.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null, notes: f.notes } });
  }

  // 2021-22
  const p2122 = await prisma.academicYear.create({ data: { studentId: pradeep.id, year: "2021-22", class: "XI", school: "Pon Vidhyashram", rollNo: "32009083", notes: "Allen coaching enrolled; fee ₹1,15,000 financed via Bajaj Finserv (23-07-2022)" } });
  for (const f of [
    { description: "Allen Coaching Fee", amount: 115000, status: "paid", paidDate: "2022-07-23", notes: "Bajaj Finserv finance" },
    { description: "Term 1 (Part 1)", amount: 10000, status: "paid", paidDate: null, notes: null },
    { description: "Term 1 (Part 2)", amount: 30000, status: "paid", paidDate: "2022-06-07", notes: null },
    { description: "Term 2 Balance", amount: 30000, status: "paid", paidDate: "2022-10-14", notes: null },
    { description: "Books", amount: 3050, status: "paid", paidDate: "2022-06-08", notes: null },
    { description: "Sports Dress", amount: 620, status: "paid", paidDate: "2022-08-26", notes: null },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: p2122.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null, notes: f.notes } });
  }

  // 2022-23
  const p2223 = await prisma.academicYear.create({ data: { studentId: pradeep.id, year: "2022-23", class: "XII", school: "Pon Vidhyashram", rollNo: "32009083" } });
  for (const f of [
    { description: "Term 1", amount: 40000, status: "paid", paidDate: "2023-03-24", notes: null },
    { description: "Term 2", amount: 25000, status: "paid", paidDate: "2023-08-31", notes: null },
    { description: "Term 3", amount: 20000, status: "paid", paidDate: "2023-11-28", notes: null },
    { description: "Books", amount: 5800, status: "paid", paidDate: null, notes: null },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: p2223.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null, notes: f.notes } });
  }

  // 2023-24 (B.Tech I Year)
  const p2324 = await prisma.academicYear.create({ data: { studentId: pradeep.id, year: "2023-24", class: "B.Tech I Year", school: "Rajalakshmi Engineering College", rollNo: "241001165", notes: "B.Tech – Information Technology" } });
  for (const f of [
    { description: "Donation", amount: 600000, status: "paid", paidDate: "2024-01-01", notes: "Year 2024" },
    { description: "Fee & Transport", amount: 245000, status: "paid", paidDate: "2024-01-01", notes: "Year 2024" },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: p2324.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null, notes: f.notes } });
  }

  // 2024-25 (B.Tech II Year)
  const p2425 = await prisma.academicYear.create({ data: { studentId: pradeep.id, year: "2024-25", class: "B.Tech II Year", school: "Rajalakshmi Engineering College", rollNo: "241001165", notes: "B.Tech – Information Technology" } });
  await prisma.feeEntry.create({ data: { academicYearId: p2425.id, description: "Fee & Transport", amount: 245000, status: "pending", paidDate: null } });

  // ─── SANJANA ─────────────────────────────────────────────────────────────────
  const sanjana = await prisma.student.create({
    data: { name: "Sanjana", notes: "School Roll: 32002099" },
  });

  // 2018-19
  const s1819 = await prisma.academicYear.create({ data: { studentId: sanjana.id, year: "2018-19", class: "I", school: "Pon Vidhyashram", rollNo: "32002099" } });
  for (const f of [
    { description: "Term 1", amount: 25000, status: "paid", paidDate: "2019-01-30" },
    { description: "Term 2", amount: 26500, status: "paid", paidDate: "2019-04-04" },
    { description: "Term 3", amount: 21500, status: "paid", paidDate: "2019-07-02" },
    { description: "Uniform Material", amount: 1500, status: "paid", paidDate: null },
    { description: "Uniform Stitching", amount: 2700, status: "paid", paidDate: null },
    { description: "Books", amount: 4700, status: "paid", paidDate: null },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: s1819.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null } });
  }

  // 2019-20
  const s1920 = await prisma.academicYear.create({ data: { studentId: sanjana.id, year: "2019-20", class: "II", school: "Pon Vidhyashram", rollNo: "32002099" } });
  for (const f of [
    { description: "Term 1", amount: 23000, status: "paid", paidDate: "2020-07-23", notes: null },
    { description: "Term 2", amount: 24267, status: "paid", paidDate: "2021-03-09", notes: "Paid ₹24,267 after concession (original ₹40,000)" },
    { description: "Uniform Material", amount: 1200, status: "paid", paidDate: null, notes: null },
    { description: "Books", amount: 4900, status: "paid", paidDate: null, notes: null },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: s1920.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null, notes: f.notes } });
  }

  // 2020-21
  const s2021 = await prisma.academicYear.create({ data: { studentId: sanjana.id, year: "2020-21", class: "III", school: "Pon Vidhyashram", rollNo: "32002099" } });
  for (const f of [
    { description: "Term 1", amount: 33000, status: "paid", paidDate: "2021-06-26" },
    { description: "Term 2", amount: 20961, status: "paid", paidDate: "2022-03-18" },
    { description: "Books", amount: 3200, status: "paid", paidDate: "2021-06-26" },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: s2021.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null } });
  }

  // 2021-22
  const s2122 = await prisma.academicYear.create({ data: { studentId: sanjana.id, year: "2021-22", class: "IV", school: "Pon Vidhyashram", rollNo: "32002099" } });
  for (const f of [
    { description: "Term 1", amount: 31500, status: "paid", paidDate: "2022-06-07" },
    { description: "Term 2", amount: 31500, status: "paid", paidDate: "2022-10-14" },
    { description: "Books", amount: 4950, status: "paid", paidDate: "2022-06-10" },
    { description: "Sports Dress", amount: 510, status: "paid", paidDate: "2022-08-26" },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: s2122.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null } });
  }

  // 2022-23
  const s2223 = await prisma.academicYear.create({ data: { studentId: sanjana.id, year: "2022-23", class: "V", school: "Pon Vidhyashram", rollNo: "32002099" } });
  for (const f of [
    { description: "Term 1", amount: 32000, status: "paid", paidDate: "2023-04-03" },
    { description: "Term 2", amount: 32000, status: "paid", paidDate: "2023-09-30" },
    { description: "Books", amount: 7900, status: "paid", paidDate: "2023-04-03" },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: s2223.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null } });
  }

  // 2023-24
  const s2324 = await prisma.academicYear.create({ data: { studentId: sanjana.id, year: "2023-24", class: "VI B", school: "Pon Vidhyashram", rollNo: "32002099" } });
  for (const f of [
    { description: "Term 1", amount: 32000, status: "paid", paidDate: "2024-04-05" },
    { description: "Term 2", amount: 32000, status: "paid", paidDate: "2024-08-08" },
    { description: "Uniform", amount: 1480, status: "paid", paidDate: "2024-04-08" },
    { description: "Books", amount: 7600, status: "paid", paidDate: "2024-04-08" },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: s2324.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null } });
  }

  // 2024-25
  const s2425 = await prisma.academicYear.create({ data: { studentId: sanjana.id, year: "2024-25", class: "VII B", school: "Pon Vidhyashram", rollNo: "32002099" } });
  for (const f of [
    { description: "Term 1", amount: 37000, status: "paid", paidDate: "2025-04-05" },
    { description: "Term 2", amount: 30000, status: "paid", paidDate: "2025-08-08", notes: "Date from Excel: 38th August 2025 — please verify" },
    { description: "Books & Uniform", amount: 10400, status: "paid", paidDate: "2025-04-09" },
  ]) {
    await prisma.feeEntry.create({ data: { academicYearId: s2425.id, description: f.description, amount: f.amount, status: f.status, paidDate: f.paidDate ? new Date(f.paidDate) : null, notes: (f as { notes?: string }).notes ?? null } });
  }

  // ─── BHUVANA ─────────────────────────────────────────────────────────────────
  const bhuvana = await prisma.student.create({ data: { name: "Bhuvana" } });
  const b1819 = await prisma.academicYear.create({ data: { studentId: bhuvana.id, year: "2018-19" } });
  await prisma.feeEntry.create({ data: { academicYearId: b1819.id, description: "Class Fee", amount: 10000, status: "paid", paidDate: new Date("2019-06-15"), notes: "Class from 20th June 2019" } });

  console.log("Education seed complete (real data from fee.xlsx).");
}

main().catch(console.error).finally(() => prisma.$disconnect());
