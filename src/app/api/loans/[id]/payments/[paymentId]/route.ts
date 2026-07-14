import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  const { paymentId } = await params;
  const { date, amount, outstandingBalance, status, notes } = await request.json();
  const payment = await prisma.loanPayment.update({
    where: { id: Number(paymentId) },
    data: {
      date: new Date(date),
      amount: Number(amount),
      outstandingBalance: outstandingBalance != null ? Number(outstandingBalance) : null,
      status,
      notes: notes || null,
    },
  });
  return NextResponse.json(payment);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  const { paymentId } = await params;
  await prisma.loanPayment.delete({ where: { id: Number(paymentId) } });
  return NextResponse.json({ ok: true });
}
