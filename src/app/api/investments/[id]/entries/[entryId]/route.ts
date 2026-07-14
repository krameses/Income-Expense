import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  const { entryId } = await params;
  await prisma.investmentEntry.delete({ where: { id: Number(entryId) } });
  return NextResponse.json({ ok: true });
}
