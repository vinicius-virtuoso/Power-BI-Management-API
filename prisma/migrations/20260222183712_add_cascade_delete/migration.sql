-- DropForeignKey
ALTER TABLE "user_reports" DROP CONSTRAINT "user_reports_reportId_fkey";

-- DropForeignKey
ALTER TABLE "user_reports" DROP CONSTRAINT "user_reports_userId_fkey";

-- AddForeignKey
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
