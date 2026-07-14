import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { studentId, year, class: cls, school, rollNo, notes } = await request.json();
  if (!studentId || !year) return NextResponse.json({ error: "studentId and year required" }, { status: 400 });
  const ay = await prisma.academicYear.create({
    data: { studentId: Number(studentId), year, class: cls || null, school: school || null, rollNo: rollNo || null, notes: notes || null },
    include: { fees: true },
  });
  return NextResponse.json(ay, { status: 201 });
}
