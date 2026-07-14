import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  });
  return NextResponse.json(contribution, { status: 201 });
}
