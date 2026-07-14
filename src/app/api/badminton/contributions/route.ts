import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resyncFollowingPeriods } from "@/lib/badminton-balance";

export async function POST(request: NextRequest) {
  const { periodId, memberName, amount } = await request.json();
  if (!periodId || !memberName || amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const contribution = await prisma.badmintonContribution.create({
    data: {
      periodId: Number(periodId),
      memberName,
      amount: Number(amount),
    },
    include: { period: true },
  });
  await resyncFollowingPeriods(contribution.period.month);
  return NextResponse.json(contribution, { status: 201 });
}
