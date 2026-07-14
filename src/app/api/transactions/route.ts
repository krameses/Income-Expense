import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");   // "2026-04"
  const type = searchParams.get("type");     // "income" | "expense"
  const search = searchParams.get("search"); // keyword
  const from = searchParams.get("from");     // "2026-04-01"
  const to = searchParams.get("to");         // "2026-04-30"

  const where: Record<string, unknown> = {};

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    where.date = { gte: start, lt: end };
  } else if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1); // inclusive
      dateFilter.lt = toDate;
    }
    where.date = dateFilter;
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.description = { contains: search };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, date, description, details, amount } = body;

  if (!type || !date || !description || amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      type,
      date: new Date(date),
      description,
      details: details?.trim() || null,
      amount: Number(amount),
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
