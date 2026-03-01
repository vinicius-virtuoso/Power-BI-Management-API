/*
  Warnings:

  - You are about to drop the column `erros` on the `reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reports" DROP COLUMN "erros",
ADD COLUMN     "errors" TEXT;
