import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPreviousClosingBalance, resyncFollowingPeriods } from "@/lib/badminton-balance";

export async function GET() {
  const periods = await prisma.badmintonPeriod.findMany({
    orderBy: { month: "desc" },
    include: {
      expenses: true,
      contributions: true,
    },
  });
  return NextResponse.json(periods);
}

export async function POST(request: NextRequest) {
  const { month, openingBalance } = await request.json();
  if (!month) {
    return NextResponse.json({ error: "Month required" }, { status: 400 });
  }
  const prevClosing = await getPreviousClosingBalance(month);
  const period = await prisma.badmintonPeriod.create({
    data: {
      month,
      openingBalance: prevClosing ?? (Number(openingBalance) || 0),
    },
    include: { expenses: true, contributions: true },
  });
  await resyncFollowingPeriods(month);
  return NextResponse.json(period, { status: 201 });
}
