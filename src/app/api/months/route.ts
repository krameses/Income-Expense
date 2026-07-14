import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    select: { date: true },
    orderBy: { date: "asc" },
  });

  const monthSet = new Set<string>();
  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthSet.add(key);
  }

  return NextResponse.json(Array.from(monthSet).sort().reverse());
}
