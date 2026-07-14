import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, date, category, isRecurring, notes } = await request.json();
  const event = await prisma.event.update({
    where: { id: Number(id) },
    data: { name, date: new Date(date), category, isRecurring: isRecurring ?? true, notes: notes || null },
  });
  return NextResponse.json(event);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.event.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
