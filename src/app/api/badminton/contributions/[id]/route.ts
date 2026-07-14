import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resyncFollowingPeriods } from "@/lib/badminton-balance";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { memberName, amount } = await request.json();
  const contribution = await prisma.badmintonContribution.update({
    where: { id: Number(id) },
    data: {
      ...(memberName !== undefined && { memberName }),
      ...(amount !== undefined && { amount: Number(amount) }),
    },
    include: { period: true },
  });
  await resyncFollowingPeriods(contribution.period.month);
  return NextResponse.json(contribution);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contribution = await prisma.badmintonContribution.delete({
    where: { id: Number(id) },
    include: { period: true },
  });
  await resyncFollowingPeriods(contribution.period.month);
  return NextResponse.json({ ok: true });
}
