import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { type, date, description, details, amount } = body;

  const transaction = await prisma.transaction.update({
    where: { id: Number(id) },
    data: {
      type,
      date: new Date(date),
      description,
      details: details?.trim() || null,
      amount: Number(amount),
    },
  });

  return NextResponse.json(transaction);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.transaction.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
