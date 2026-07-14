import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { date, amount, notes } = body;
  if (!date || !amount) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const entry = await prisma.investmentEntry.create({
    data: {
      investmentId: Number(id),
      date: new Date(date),
      amount: Number(amount),
      notes: notes || null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
