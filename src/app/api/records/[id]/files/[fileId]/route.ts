import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { fileId } = await params;
  const file = await prisma.recordFile.findUnique({ where: { id: Number(fileId) } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filePath = path.join(process.cwd(), "public", "uploads", "records", file.fileName);
  await unlink(filePath).catch(() => {}); // ignore if already deleted

  await prisma.recordFile.delete({ where: { id: Number(fileId) } });
  return NextResponse.json({ ok: true });
}
