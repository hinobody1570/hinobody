-- CreateEnum
CREATE TYPE "BoardVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'RESTRICTED');

-- AlterTable
ALTER TABLE "boards" ADD COLUMN "visibilityAccess" "BoardVisibility" NOT NULL DEFAULT 'PUBLIC';

