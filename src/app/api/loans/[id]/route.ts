import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id: Number(id) },
    include: { payments: { orderBy: { date: "asc" } } },
  });
  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const paid = loan.payments.filter((p) => p.status === "paid");
  const totalPaid = paid.reduce((s, p) => s + p.amount, 0);
  const latestWithBalance = [...paid].reverse().find((p) => p.outstandingBalance !== null);

  return NextResponse.json({
    ...loan,
    totalPaid,
    outstandingBalance: latestWithBalance?.outstandingBalance ?? null,
    paymentCount: loan.payments.length,
    pendingCount: loan.payments.filter((p) => p.status === "pending").length,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, lender, loanAmount, emiAmount, interestRate, startDate, endDate, notes } = body;
  const loan = await prisma.loan.update({
    where: { id: Number(id) },
    data: {
      name,
      lender: lender || null,
      loanAmount: Number(loanAmount),
      emiAmount: emiAmount ? Number(emiAmount) : null,
      interestRate: interestRate ? Number(interestRate) : null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || null,
    },
  });
  return NextResponse.json(loan);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.loan.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
