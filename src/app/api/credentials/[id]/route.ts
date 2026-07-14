import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { appName, category, username, email, password, url, notes } = await request.json();
  const credential = await prisma.credential.update({
    where: { id: Number(id) },
    data: { appName, category, username: username || null, email: email || null, password: password || null, url: url || null, notes: notes || null },
  });
  return NextResponse.json(credential);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.credential.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
