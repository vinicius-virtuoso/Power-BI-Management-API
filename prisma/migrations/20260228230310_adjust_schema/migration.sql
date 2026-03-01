-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "lastUpdate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "schedule_reports" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hoursCommon" TEXT[],
    "isClosingDays" BOOLEAN NOT NULL DEFAULT false,
    "closingDays" TEXT[],
    "hoursClosingDays" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_reports_reportId_key" ON "schedule_reports"("reportId");

-- AddForeignKey
ALTER TABLE "schedule_reports" ADD CONSTRAINT "schedule_reports_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
