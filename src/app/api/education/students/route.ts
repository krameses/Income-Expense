import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { name, notes } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const student = await prisma.student.create({ data: { name, notes: notes || null } });
  return NextResponse.json(student, { status: 201 });
}
