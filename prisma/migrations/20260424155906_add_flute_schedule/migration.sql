-- CreateTable
CREATE TABLE "FluteBatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "feeAmount" REAL NOT NULL,
    "feePaidDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FluteClass" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" INTEGER NOT NULL,
    "classNumber" INTEGER NOT NULL,
    "date" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FluteClass_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "FluteBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
