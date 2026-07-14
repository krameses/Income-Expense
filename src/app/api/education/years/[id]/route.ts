import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { year, class: cls, school, rollNo, notes } = await request.json();
  const ay = await prisma.academicYear.update({
    where: { id: Number(id) },
    data: { year, class: cls || null, school: school || null, rollNo: rollNo || null, notes: notes || null },
    include: { fees: true },
  });
  return NextResponse.json(ay);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.academicYear.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
