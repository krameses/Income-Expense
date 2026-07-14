import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function getClient() {
  const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
  const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
  return new PrismaClient({ adapter });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = getClient();
  try {
    const { id } = await params;
    const song = await client.musicNote.findUnique({ where: { id: Number(id) } });
    if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(song);
  } catch (e) {
    console.error("[music-notes/:id GET]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await client.$disconnect();
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = getClient();
  try {
    const { id } = await params;
    const { songName, scale, notes } = await req.json();
    if (!songName?.trim() || !notes?.trim()) {
      return NextResponse.json({ error: "Song name and notes are required" }, { status: 400 });
    }
    const song = await client.musicNote.update({
      where: { id: Number(id) },
      data: { songName: songName.trim(), scale: scale?.trim() || null, notes: notes.trim() },
    });
    return NextResponse.json(song);
  } catch (e) {
    console.error("[music-notes/:id PUT]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await client.$disconnect();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = getClient();
  try {
    const { id } = await params;
    await client.musicNote.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[music-notes/:id DELETE]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await client.$disconnect();
  }
}
