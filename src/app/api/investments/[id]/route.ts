import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const investment = await prisma.investment.findUnique({
    where: { id: Number(id) },
    include: { entries: { orderBy: { date: "asc" } } },
  });
  if (!investment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalInvested = investment.entries.reduce((s, e) => s + e.amount, 0);
  return NextResponse.json({ ...investment, totalInvested });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, type, targetAmount, isActive, notes } = body;
  const investment = await prisma.investment.update({
    where: { id: Number(id) },
    data: {
      name,
      type,
      targetAmount: targetAmount ? Number(targetAmount) : null,
      isActive: isActive ?? true,
      notes: notes || null,
    },
  });
  return NextResponse.json(investment);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.investment.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
