import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { feeAmount, feePaidDate, notes } = await request.json();
  const batch = await prisma.fluteBatch.update({
    where: { id: Number(id) },
    data: {
      ...(feeAmount !== undefined && { feeAmount: Number(feeAmount) }),
      ...(feePaidDate !== undefined && { feePaidDate: feePaidDate ? new Date(feePaidDate) : null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
    include: { classes: { orderBy: { classNumber: "asc" } } },
  });
  return NextResponse.json(batch);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.fluteBatch.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
