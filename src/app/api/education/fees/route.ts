import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { academicYearId, description, amount, status, paidDate, notes } = await request.json();
  if (!academicYearId || !description || !amount) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const fee = await prisma.feeEntry.create({
    data: { academicYearId: Number(academicYearId), description, amount: Number(amount), status: status || "pending", paidDate: paidDate ? new Date(paidDate) : null, notes: notes || null },
  });
  return NextResponse.json(fee, { status: 201 });
}
