import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payments = await prisma.loanPayment.findMany({
    where: { loanId: Number(id) },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(payments);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { date, amount, outstandingBalance, status, notes } = body;
  if (!date || !amount) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const payment = await prisma.loanPayment.create({
    data: {
      loanId: Number(id),
      date: new Date(date),
      amount: Number(amount),
      outstandingBalance: outstandingBalance != null ? Number(outstandingBalance) : null,
      status: status || "paid",
      notes: notes || null,
    },
  });
  return NextResponse.json(payment, { status: 201 });
}
