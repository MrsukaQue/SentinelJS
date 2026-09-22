CREATE TYPE "ScanStatus" AS ENUM ('QUEUED', 'RESOLVING', 'CONNECTING', 'SCANNING', 'ANALYZING', 'COMPLETED', 'FAILED');
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL');

CREATE TABLE "User" ("id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "passwordHash" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Target" ("id" TEXT PRIMARY KEY, "url" TEXT NOT NULL, "hostname" TEXT NOT NULL, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Scan" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "targetId" TEXT NOT NULL REFERENCES "Target"("id") ON DELETE CASCADE, "status" "ScanStatus" NOT NULL DEFAULT 'QUEUED', "score" INTEGER, "scannerVersion" TEXT NOT NULL, "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "errorMessage" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Finding" ("id" TEXT PRIMARY KEY, "scanId" TEXT NOT NULL REFERENCES "Scan"("id") ON DELETE CASCADE, "checkId" TEXT NOT NULL, "name" TEXT NOT NULL, "severity" "Severity" NOT NULL, "category" TEXT NOT NULL, "evidence" TEXT NOT NULL, "description" TEXT NOT NULL, "impact" TEXT NOT NULL, "component" TEXT NOT NULL, "recommendation" TEXT NOT NULL, "reference" TEXT, "deduction" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "ScanJob" ("id" TEXT PRIMARY KEY, "scanId" TEXT NOT NULL UNIQUE REFERENCES "Scan"("id") ON DELETE CASCADE, "queueId" TEXT UNIQUE, "attempts" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);

CREATE UNIQUE INDEX "Target_userId_url_key" ON "Target"("userId", "url");
CREATE INDEX "Target_userId_createdAt_idx" ON "Target"("userId", "createdAt");
CREATE INDEX "Scan_userId_createdAt_idx" ON "Scan"("userId", "createdAt");
CREATE INDEX "Finding_scanId_severity_idx" ON "Finding"("scanId", "severity");
