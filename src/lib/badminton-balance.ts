import { prisma } from "@/lib/prisma";

function computeClosingBalance(period: { openingBalance: number; expenses: { amount: number }[]; contributions: { amount: number }[] }) {
  const totalContributions = period.contributions.reduce((s, c) => s + c.amount, 0);
  const totalExpenses = period.expenses.reduce((s, e) => s + e.amount, 0);
  return period.openingBalance + totalContributions - totalExpenses;
}

export async function getPreviousClosingBalance(month: string): Promise<number | null> {
  const prev = await prisma.badmintonPeriod.findFirst({
    where: { month: { lt: month } },
    orderBy: { month: "desc" },
    include: { expenses: true, contributions: true },
  });
  if (!prev) return null;
  return computeClosingBalance(prev);
}

/**
 * After a period's own data (opening balance, expenses, contributions) changes,
 * push its new closing balance into the following period's opening balance,
 * then keep cascading forward through the rest of the chain.
 */
export async function resyncFollowingPeriods(month: string): Promise<void> {
  const next = await prisma.badmintonPeriod.findFirst({
    where: { month: { gt: month } },
    orderBy: { month: "asc" },
  });
  if (!next) return;

  const prevClosing = await getPreviousClosingBalance(next.month);
  if (prevClosing !== null && next.openingBalance !== prevClosing) {
    await prisma.badmintonPeriod.update({
      where: { id: next.id },
      data: { openingBalance: prevClosing },
    });
  }

  await resyncFollowingPeriods(next.month);
}
