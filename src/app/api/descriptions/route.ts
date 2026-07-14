import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type"); // "income" | "expense" | null

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (q) where.description = { contains: q };

  const rows = await prisma.transaction.findMany({
    where,
    select: { description: true },
    orderBy: { description: "asc" },
  });

  // Deduplicate, preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const r of rows) {
    const key = r.description.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r.description);
    }
  }

  return NextResponse.json(unique.slice(0, 20));
}
