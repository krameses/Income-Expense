import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function nextOccurrence(date: Date, isRecurring: boolean): Date {
  if (!isRecurring) return date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (candidate < today) candidate.setFullYear(today.getFullYear() + 1);
  return candidate;
}

function daysUntil(target: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / 86_400_000);
}

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  const result = events.map(e => {
    const next = nextOccurrence(e.date, e.isRecurring);
    return { ...e, nextOccurrence: next.toISOString(), daysUntil: daysUntil(next) };
  });
  result.sort((a, b) => a.daysUntil - b.daysUntil);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { name, date, category, isRecurring, notes } = await request.json();
  if (!name || !date) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const event = await prisma.event.create({
    data: { name, date: new Date(date), category: category || "other", isRecurring: isRecurring ?? true, notes: notes || null },
  });
  return NextResponse.json(event, { status: 201 });
}
