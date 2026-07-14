import { PrismaClient } from '../src/generated/prisma/client.js';
const prisma = new PrismaClient();
const rows = await prisma.transaction.findMany({
  where: { date: { gte: new Date('2025-04-01') } },
  orderBy: { date: 'asc' },
  select: { id: true, date: true, description: true, type: true, amount: true }
});
if (rows.length === 0) {
  console.log('No transactions found from April 2025 onwards');
} else {
  rows.forEach(r => console.log(
    r.date.toISOString().slice(0,10),
    r.type.padEnd(8),
    String(r.amount).padStart(8),
    r.description
  ));
}
await prisma.$disconnect();
