-- CreateEnum
CREATE TYPE "SupportLevel" AS ENUM ('L1', 'L2', 'L3');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "supportLevel" "SupportLevel" NOT NULL DEFAULT 'L1';
