import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recordId = Number(id);

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  const uploaded = [];
  for (const file of files) {
    const ext = path.extname(file.name);
    const fileName = `record-${recordId}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "records");
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const record = await prisma.recordFile.create({
      data: {
        recordId,
        fileName,
        origName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      },
    });
    uploaded.push(record);
  }

  return NextResponse.json(uploaded, { status: 201 });
}
