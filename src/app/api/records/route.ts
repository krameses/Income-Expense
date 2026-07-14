import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const records = await prisma.record.findMany({
    orderBy: { category: "asc" },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const { title, category, provider, accountNo, amount, advance, maintenance, dueDate, expiryDate, notes } = await request.json();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const record = await prisma.record.create({
    data: {
      title, category: category || "other", provider: provider || null,
      accountNo: accountNo || null, amount: amount ? Number(amount) : null,
      advance: advance ? Number(advance) : null,
      maintenance: maintenance ? Number(maintenance) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      notes: notes || null,
    },
  });
  return NextResponse.json(record, { status: 201 });
}
