-- CreateEnum
CREATE TYPE "TypeOfCandidate" AS ENUM ('DIR', 'INS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "categoryRank" JSONB,
ADD COLUMN     "typeOfCandidate" "TypeOfCandidate" DEFAULT 'DIR';
