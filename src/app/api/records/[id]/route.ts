import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, category, provider, accountNo, amount, advance, maintenance, dueDate, expiryDate, notes } = await request.json();
  const record = await prisma.record.update({
    where: { id: Number(id) },
    data: {
      title, category, provider: provider || null,
      accountNo: accountNo || null, amount: amount ? Number(amount) : null,
      advance: advance ? Number(advance) : null,
      maintenance: maintenance ? Number(maintenance) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      notes: notes || null,
    },
    include: { files: true },
  });
  return NextResponse.json(record);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.record.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
