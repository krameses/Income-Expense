import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, notes } = await request.json();
  const student = await prisma.student.update({ where: { id: Number(id) }, data: { name, notes: notes || null } });
  return NextResponse.json(student);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.student.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
