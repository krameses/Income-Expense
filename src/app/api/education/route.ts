import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const students = await prisma.student.findMany({
    orderBy: { id: "asc" },
    include: {
      academicYears: {
        orderBy: { year: "desc" },
        include: { fees: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  return NextResponse.json(students);
}
