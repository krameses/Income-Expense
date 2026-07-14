import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const period = await prisma.badmintonPeriod.findUnique({
    where: { id: Number(id) },
    include: { expenses: true, contributions: true },
  });
  if (!period) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(period);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { openingBalance } = await request.json();
  const period = await prisma.badmintonPeriod.update({
    where: { id: Number(id) },
    data: { openingBalance: Number(openingBalance) },
    include: { expenses: true, contributions: true },
  });
  return NextResponse.json(period);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.badmintonPeriod.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
