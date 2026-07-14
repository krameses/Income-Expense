import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function getClient() {
  const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
  const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
  return new PrismaClient({ adapter });
}

export async function GET(req: NextRequest) {
  const client = getClient();
  try {
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const scale = req.nextUrl.searchParams.get("scale") ?? "";
    const where: Record<string, unknown> = {};
    if (search) where.songName = { contains: search };
    if (scale) where.scale = { contains: scale };
    const songs = await client.musicNote.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: "desc" },
      select: { id: true, songName: true, scale: true, createdAt: true },
    });
    return NextResponse.json(songs);
  } catch (e) {
    console.error("[music-notes GET]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await client.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const client = getClient();
  try {
    const { songName, scale, notes } = await req.json();
    if (!songName?.trim() || !notes?.trim()) {
      return NextResponse.json({ error: "Song name and notes are required" }, { status: 400 });
    }
    const song = await client.musicNote.create({
      data: { songName: songName.trim(), scale: scale?.trim() || null, notes: notes.trim() },
    });
    return NextResponse.json(song, { status: 201 });
  } catch (e) {
    console.error("[music-notes POST]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await client.$disconnect();
  }
}
