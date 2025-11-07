-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "stateAppNo" TEXT NOT NULL,
    "neetRollNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "incentivePercent" DOUBLE PRECISION NOT NULL,
    "stateSpecificPercentile" DOUBLE PRECISION NOT NULL,
    "neetAIR" INTEGER NOT NULL,
    "courseAppliedFor" TEXT NOT NULL,
    "neetAppID" TEXT NOT NULL,
    "stateSpecificRank" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
