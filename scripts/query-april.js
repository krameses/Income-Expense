const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('dev.db');

// First peek at raw date format
const sample = db.prepare('SELECT date, type, amount, description FROM "Transaction" LIMIT 3').all();
console.log('Sample rows (raw):', JSON.stringify(sample, null, 2));

// All rows from April 2025
const rows = db.prepare(
  "SELECT date, type, amount, description FROM \"Transaction\" WHERE date >= '2025-04-01' ORDER BY date ASC"
).all();
console.log('\nFrom April 2025 onwards:');
if (!rows.length) {
  console.log('No transactions found');
} else {
  console.log('Date       | Type     |   Amount | Description');
  console.log('-----------|----------|----------|----------------------------');
  rows.forEach(r => {
    const d = String(r.date).slice(0, 10);
    console.log(`${d} | ${String(r.type).padEnd(8)} | ${String(r.amount).padStart(8)} | ${r.description}`);
  });
  console.log('\nTotal:', rows.length, 'transactions');
}
