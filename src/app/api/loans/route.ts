import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const archived = request.nextUrl.searchParams.get("archived") === "true";

  const loans = await prisma.loan.findMany({
    where: { isArchived: archived },
    include: { payments: { orderBy: { date: "asc" } } },
    orderBy: { startDate: "asc" },
  });

  const result = loans.map(({ payments, ...loan }) => {
    const paid = payments.filter((p) => p.status === "paid");
    const totalPaid = paid.reduce((s, p) => s + p.amount, 0);
    const latestWithBalance = [...paid].reverse().find((p) => p.outstandingBalance !== null);
    return {
      ...loan,
      totalPaid,
      outstandingBalance: latestWithBalance?.outstandingBalance ?? null,
      paymentCount: payments.length,
      pendingCount: payments.filter((p) => p.status === "pending").length,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, lender, loanAmount, emiAmount, interestRate, startDate, endDate, notes } = body;
  if (!name || !loanAmount || !startDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const loan = await prisma.loan.create({
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
  return NextResponse.json(loan, { status: 201 });
}
