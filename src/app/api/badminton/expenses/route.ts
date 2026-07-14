import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { periodId, category, description, paidBy, week, amount } = await request.json();
  if (!periodId || !category || !paidBy || !week || amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const expense = await prisma.badmintonExpense.create({
    data: {
      periodId: Number(periodId),
      category,
      description: description?.trim() || "",
      paidBy,
      week: Number(week),
      amount: Number(amount),
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
