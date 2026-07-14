import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const active = request.nextUrl.searchParams.get("active");

  const where = active !== null ? { isActive: active === "true" } : {};

  const investments = await prisma.investment.findMany({
    where,
    include: { entries: { orderBy: { date: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  const result = investments.map(({ entries, ...inv }) => {
    const totalInvested = entries.reduce((s, e) => s + e.amount, 0);
    const lastEntry = entries[entries.length - 1] ?? null;
    return {
      ...inv,
      totalInvested,
      entryCount: entries.length,
      lastEntryDate: lastEntry?.date ?? null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, type, targetAmount, notes } = body;
  if (!name || !type) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const investment = await prisma.investment.create({
    data: {
      name,
      type,
      targetAmount: targetAmount ? Number(targetAmount) : null,
      notes: notes || null,
    },
  });
  return NextResponse.json(investment, { status: 201 });
}
