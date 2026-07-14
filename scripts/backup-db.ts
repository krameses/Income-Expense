import fs from "fs";
import path from "path";

const src = path.resolve(process.cwd(), "dev.db");
const backupDir = path.resolve(process.cwd(), "backups");

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dest = path.join(backupDir, `dev-${ts}.db`);

fs.copyFileSync(src, dest);
console.log(`Backup saved: ${dest}`);

// Keep only last 30 backups
const files = fs.readdirSync(backupDir)
  .filter(f => f.endsWith(".db"))
  .sort()
  .reverse();

for (const old of files.slice(30)) {
  fs.unlinkSync(path.join(backupDir, old));
  console.log(`Deleted old backup: ${old}`);
}
