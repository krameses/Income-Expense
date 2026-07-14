import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({ where: { id: Number(id) } });
  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.loan.update({
    where: { id: Number(id) },
    data: {
      isArchived: !loan.isArchived,
      archivedAt: !loan.isArchived ? new Date() : null,
    },
  });
  return NextResponse.json(updated);
}
