import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const period = await prisma.badmintonPeriod.create({
    data: {
      month,
      openingBalance: Number(openingBalance) || 0,
    },
    include: { expenses: true, contributions: true },
  });
  return NextResponse.json(period, { status: 201 });
}
