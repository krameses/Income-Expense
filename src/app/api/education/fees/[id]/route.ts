import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { description, amount, status, paidDate, notes } = await request.json();
  const fee = await prisma.feeEntry.update({
    where: { id: Number(id) },
    data: { description, amount: Number(amount), status, paidDate: paidDate ? new Date(paidDate) : null, notes: notes || null },
  });
  return NextResponse.json(fee);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.feeEntry.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
