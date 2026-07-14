import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const credentials = await prisma.credential.findMany({ orderBy: { appName: "asc" } });
  return NextResponse.json(credentials);
}

export async function POST(request: NextRequest) {
  const { appName, category, username, email, password, url, notes } = await request.json();
  if (!appName) return NextResponse.json({ error: "App name is required" }, { status: 400 });
  const credential = await prisma.credential.create({
    data: { appName, category: category || "other", username: username || null, email: email || null, password: password || null, url: url || null, notes: notes || null },
  });
  return NextResponse.json(credential, { status: 201 });
}
