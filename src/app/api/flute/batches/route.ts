import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const batches = await prisma.fluteBatch.findMany({
    orderBy: { feePaidDate: "desc" },
    include: { classes: { orderBy: { classNumber: "asc" } } },
  });
  return NextResponse.json(batches);
}

export async function POST(request: NextRequest) {
  const { feeAmount, feePaidDate, notes } = await request.json();
  if (!feeAmount) {
    return NextResponse.json({ error: "feeAmount required" }, { status: 400 });
  }
  const batch = await prisma.fluteBatch.create({
    data: {
      feeAmount: Number(feeAmount),
      feePaidDate: feePaidDate ? new Date(feePaidDate) : null,
      notes: notes?.trim() || null,
      classes: {
        create: Array.from({ length: 12 }, (_, i) => ({ classNumber: i + 1 })),
      },
    },
    include: { classes: { orderBy: { classNumber: "asc" } } },
  });
  return NextResponse.json(batch, { status: 201 });
}
