import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { date, notes } = await request.json();
  const cls = await prisma.fluteClass.update({
    where: { id: Number(id) },
    data: {
      ...(date !== undefined && { date: date ? new Date(date) : null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  });
  return NextResponse.json(cls);
}
