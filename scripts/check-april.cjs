const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();
prisma.transaction.findMany({
  where: { date: { gte: new Date('2025-04-01') } },
  orderBy: { date: 'asc' },
  select: { id: true, date: true, description: true, type: true, amount: true }
}).then(rows => {
  if (rows.length === 0) {
    console.log('No transactions found from April 2025 onwards');
  } else {
    console.log('Date       | Type     | Amount   | Description');
    console.log('-----------|----------|----------|------------');
    rows.forEach(r => console.log(
      r.date.toISOString().slice(0,10) + ' | ' +
      r.type.padEnd(8) + ' | ' +
      String(r.amount).padStart(8) + ' | ' +
      r.description
    ));
    console.log('\nTotal rows:', rows.length);
  }
  return prisma.$disconnect();
}).catch(e => { console.error(e.message); return prisma.$disconnect(); });
