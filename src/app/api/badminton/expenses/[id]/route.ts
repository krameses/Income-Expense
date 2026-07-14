import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resyncFollowingPeriods } from "@/lib/badminton-balance";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { category, description, paidBy, week, amount } = await request.json();
  const expense = await prisma.badmintonExpense.update({
    where: { id: Number(id) },
    data: {
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description: description.trim() }),
      ...(paidBy !== undefined && { paidBy }),
      ...(week !== undefined && { week: Number(week) }),
      ...(amount !== undefined && { amount: Number(amount) }),
    },
    include: { period: true },
  });
  await resyncFollowingPeriods(expense.period.month);
  return NextResponse.json(expense);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await prisma.badmintonExpense.delete({
    where: { id: Number(id) },
    include: { period: true },
  });
  await resyncFollowingPeriods(expense.period.month);
  return NextResponse.json({ ok: true });
}
